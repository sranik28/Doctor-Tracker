import type { Types } from 'mongoose';

import { connectDB, disconnectDB } from '../config/db.js';
import { DoctorModel } from '../models/doctor.model.js';
import { PatientModel } from '../models/patient.model.js';
import { PrescriptionModel } from '../models/prescription.model.js';
import {
  buildConditionsPipeline,
  buildPatientsPerDoctorPipeline,
  buildSpecializationsPipeline,
  buildStatsPipeline,
  buildTimelinePipeline,
  type PipelineQuery,
} from '../services/dashboard.queries.js';
import type { DoctorSort } from '../validations/doctor.validation.js';
import type { PublicDoctorSort } from '../validations/public-doctor.validation.js';
import type { PatientSort } from '../validations/patient.validation.js';
import {
  buildDoctorFilter,
  DOCTOR_PROJECTION,
  DOCTOR_SORT_STAGES,
} from '../services/doctor.service.js';
import { PRESCRIPTION_SORT } from '../services/prescription.service.js';
import { getHospitalDoctorIds } from '../services/hospital-scope.service.js';
import {
  PUBLIC_DOCTOR_PROJECTION,
  PUBLIC_DOCTOR_SORT_STAGES,
} from '../services/public-doctor.service.js';
import {
  buildPatientFilter,
  PATIENT_PROJECTION,
  PATIENT_SORT_STAGES,
} from '../services/patient.service.js';

/**
 * `bun run explain`: runs explain("executionStats") for the API's key queries and prints a
 * summary table. Exits non-zero if any KEY query falls back to a collection scan.
 * Run it against realistic data (`bun run seed:demo`); on an empty database every plan looks fine.
 */

const PAGE_SIZE = 10;

interface PlanNode {
  stage?: string;
  indexName?: string;
  inputStage?: PlanNode;
  inputStages?: PlanNode[];
  queryPlan?: PlanNode;
}

interface ExecutionStats {
  nReturned?: number;
  totalKeysExamined?: number;
  totalDocsExamined?: number;
  executionTimeMillis?: number;
}

interface ExplainOutput {
  queryPlanner?: { winningPlan?: PlanNode };
  executionStats?: ExecutionStats;
  stages?: {
    $cursor?: { queryPlanner?: { winningPlan?: PlanNode }; executionStats?: ExecutionStats };
  }[];
}

interface Row {
  query: string;
  plan: string;
  index: string;
  nReturned: number;
  docsExamined: number;
  ms: number;
  collscan: boolean;
  inMemorySort: boolean;
}

const collectStages = (node: PlanNode | undefined, out: string[] = []): string[] => {
  if (!node) return out;
  const inner = node.queryPlan ?? node;
  out.push(inner.stage ?? '?');
  if (inner.indexName) out.push(`@${inner.indexName}`);
  collectStages(inner.inputStage, out);
  inner.inputStages?.forEach((child) => collectStages(child, out));
  return out;
};

const summarize = (query: string, raw: unknown): Row => {
  const explain = (Array.isArray(raw) ? raw[0] : raw) as ExplainOutput;
  // Aggregations report their first (cursor) stage under stages[0].$cursor.
  const cursor = explain.stages?.[0]?.$cursor;
  const winningPlan = explain.queryPlanner?.winningPlan ?? cursor?.queryPlanner?.winningPlan;
  const stats = explain.executionStats ?? cursor?.executionStats ?? {};
  const parts = collectStages(winningPlan);
  const stages = parts.filter((part) => !part.startsWith('@'));
  const indexes = [...new Set(parts.filter((part) => part.startsWith('@')).map((p) => p.slice(1)))];

  return {
    query,
    plan: stages.join(' < '),
    index: indexes.join(', ') || '-',
    nReturned: stats.nReturned ?? 0,
    docsExamined: stats.totalDocsExamined ?? 0,
    ms: stats.executionTimeMillis ?? 0,
    collscan: stages.includes('COLLSCAN'),
    inMemorySort: stages.includes('SORT'),
  };
};

const explainFind = async (
  query: string,
  model: typeof DoctorModel | typeof PatientModel | typeof PrescriptionModel,
  filter: Record<string, unknown>,
  projection: Record<string, 1>,
  sort: Record<string, 1 | -1>,
): Promise<Row> =>
  summarize(
    query,
    await (model as typeof PatientModel)
      .find(filter, projection)
      .sort(sort)
      .limit(PAGE_SIZE)
      .explain('executionStats'),
  );

/** The driver's countDocuments() is $match + $group; explain that. */
const explainCount = async (
  query: string,
  model: typeof DoctorModel | typeof PatientModel,
  filter: Record<string, unknown>,
): Promise<Row> =>
  summarize(
    query,
    await (model as typeof PatientModel)
      .aggregate([{ $match: filter }, { $group: { _id: 1, n: { $sum: 1 } } }])
      .explain('executionStats'),
  );

const explainPipeline = async (
  query: string,
  model: typeof DoctorModel | typeof PatientModel,
  { pipeline, hint }: PipelineQuery,
): Promise<Row> =>
  summarize(
    query,
    await (model as typeof PatientModel)
      .aggregate(pipeline, hint ? { hint } : {})
      .explain('executionStats'),
  );

const printTable = (title: string, rows: readonly Row[]): void => {
  console.log(`\n### ${title}\n`);
  console.log('| Query | Plan | Index | nReturned | docsExamined | ms |');
  console.log('|---|---|---|---:|---:|---:|');
  for (const row of rows) {
    const flag = row.collscan ? ' ⚠ COLLSCAN' : row.inMemorySort ? ' (in-memory sort)' : '';
    console.log(
      `| ${row.query} | ${row.plan}${flag} | ${row.index} | ${row.nReturned} | ${row.docsExamined} | ${row.ms} |`,
    );
  }
};

const findBusyDoctorId = async (): Promise<Types.ObjectId | undefined> => {
  const [top] = await PatientModel.aggregate<{ _id: Types.ObjectId }>([
    { $group: { _id: '$doctorId', n: { $sum: 1 } } },
    { $sort: { n: -1 } },
    { $limit: 1 },
  ]);
  return top?._id;
};

/** A real word from existing names, so text-search plans are measured on a query that matches. */
const sampleSearchTerm = async (
  model: typeof DoctorModel | typeof PatientModel,
): Promise<string> => {
  const sample = await (model as typeof PatientModel)
    .findOne({}, { name: 1 })
    .lean<{ name: string }>();
  const words = (sample?.name ?? 'a').split(/\s+/).filter((word) => /^[a-z]{3,}$/i.test(word));
  return words.at(-1) ?? 'a';
};

const run = async (): Promise<void> => {
  await connectDB();

  try {
    const [doctorCount, patientCount, doctorId, doctorTerm, patientTerm] = await Promise.all([
      DoctorModel.estimatedDocumentCount(),
      PatientModel.estimatedDocumentCount(),
      findBusyDoctorId(),
      sampleSearchTerm(DoctorModel),
      sampleSearchTerm(PatientModel),
    ]);
    const now = new Date();
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    console.log(
      `# Query plans (${doctorCount} doctors, ${patientCount} patients, page size ${PAGE_SIZE})`,
    );

    type DoctorInput = Partial<Parameters<typeof buildDoctorFilter>[0]>;
    const doctorFilter = (input: DoctorInput) =>
      buildDoctorFilter({ from: undefined, to: undefined, ...input });
    const doctorFind = (query: string, input: DoctorInput, sort: DoctorSort = '-createdAt') =>
      explainFind(
        query,
        DoctorModel,
        doctorFilter(input),
        DOCTOR_PROJECTION,
        DOCTOR_SORT_STAGES[sort],
      );

    const doctorRows: Row[] = [
      await doctorFind('doctors: default list', {}),
      await doctorFind('doctors: sort by name', {}, 'name'),
      await doctorFind('doctors: specialization', { specialization: 'Cardiology' }),
      await doctorFind('doctors: hospital', { hospital: 'Square Hospital' }),
      await doctorFind('doctors: created date range', { from: yearAgo, to: now }),
      await doctorFind(`doctors: text search ("${doctorTerm}")`, { search: doctorTerm }),
      await explainCount(
        'doctors: count (specialization)',
        DoctorModel,
        doctorFilter({ specialization: 'Cardiology' }),
      ),
    ];

    const publicDoctorFind = (query: string, input: DoctorInput, sort: PublicDoctorSort = 'name') =>
      explainFind(
        query,
        DoctorModel,
        doctorFilter(input),
        PUBLIC_DOCTOR_PROJECTION,
        PUBLIC_DOCTOR_SORT_STAGES[sort],
      );

    const publicRows: Row[] = [
      await publicDoctorFind('public: default list (A-Z)', {}),
      await publicDoctorFind('public: specialization', { specialization: 'Cardiology' }),
      await publicDoctorFind('public: hospital', { hospital: 'Square Hospital' }),
      await publicDoctorFind('public: recently joined', {}, '-createdAt'),
      await publicDoctorFind(`public: text search ("${doctorTerm}")`, { search: doctorTerm }),
    ];

    type PatientInput = Partial<Parameters<typeof buildPatientFilter>[0]>;
    const patientFilter = (input: PatientInput) =>
      buildPatientFilter({ from: undefined, to: undefined, ...input });
    const patientFind = (query: string, input: PatientInput, sort: PatientSort = '-admittedAt') =>
      explainFind(
        query,
        PatientModel,
        patientFilter(input),
        PATIENT_PROJECTION,
        PATIENT_SORT_STAGES[sort],
      );

    const patientFilters = {
      doctor: doctorId ? { doctorId: doctorId.toString() } : {},
    };
    const patientRows: Row[] = [
      await patientFind('patients: default list', {}),
      await patientFind('patients: condition', { condition: 'Hypertension' }),
      await patientFind('patients: doctor', patientFilters.doctor),
      await patientFind('patients: admitted date range', { from: monthAgo, to: now }),
      await patientFind('patients: gender', { gender: 'female' }),
      await patientFind(`patients: text search ("${patientTerm}")`, { search: patientTerm }),
      await patientFind('patients: condition + date range', {
        condition: 'Diabetes',
        from: yearAgo,
        to: now,
      }),
      await patientFind('patients: sort by name', {}, 'name'),
      await explainCount(
        'patients: count (condition)',
        PatientModel,
        patientFilter({ condition: 'Hypertension' }),
      ),
      await explainFind(
        "doctor page: a doctor's patients (newest first)",
        PatientModel,
        doctorId ? { doctorId } : {},
        PATIENT_PROJECTION,
        { createdAt: -1 },
      ),
      await explainPipeline('list: patient counts for a page of doctors', PatientModel, {
        pipeline: [
          { $match: { doctorId: { $in: doctorId ? [doctorId] : [] } } },
          { $group: { _id: '$doctorId', count: { $sum: 1 } } },
        ],
      }),
    ];

    const dashboardRows: Row[] = [
      await explainPipeline(
        'dashboard: stats (month facets)',
        PatientModel,
        buildStatsPipeline(now),
      ),
      await explainPipeline(
        'dashboard: timeline 7d',
        PatientModel,
        buildTimelinePipeline('7d', now),
      ),
      await explainPipeline(
        'dashboard: timeline 30d',
        PatientModel,
        buildTimelinePipeline('30d', now),
      ),
      await explainPipeline(
        'dashboard: timeline 12m',
        PatientModel,
        buildTimelinePipeline('12m', now),
      ),
      await explainPipeline(
        'dashboard: patients per doctor',
        PatientModel,
        buildPatientsPerDoctorPipeline(10),
      ),
      await explainPipeline('dashboard: conditions', PatientModel, buildConditionsPipeline()),
      await explainPipeline(
        'dashboard: specializations',
        DoctorModel,
        buildSpecializationsPipeline(),
      ),
      await explainFind('dashboard: recent patients', PatientModel, {}, PATIENT_PROJECTION, {
        admittedAt: -1,
      }),
    ];

    // A patient's prescriptions on the profile page (uses a patient that has some).
    const prescribed = await PrescriptionModel.findOne({}, { patientId: 1 }).lean();
    const prescriptionRows: Row[] = [
      await explainFind(
        "prescriptions: a patient's list (newest first)",
        PrescriptionModel,
        prescribed ? { patientId: prescribed.patientId } : {},
        { medicine: 1, dosage: 1, duration: 1, instructions: 1, prescribedAt: 1, doctorId: 1 },
        PRESCRIPTION_SORT,
      ),
    ];

    // The hospital switcher: patients are scoped through that hospital's doctor ids.
    const hospital = 'Square Hospital';
    const hospitalDoctorIds = await getHospitalDoctorIds(hospital);
    const scopedPatients = buildPatientFilter(
      { from: undefined, to: undefined },
      hospitalDoctorIds,
    );
    const hospitalRows: Row[] = [
      await explainFind(
        `hospital: patients list (${hospital})`,
        PatientModel,
        scopedPatients,
        PATIENT_PROJECTION,
        PATIENT_SORT_STAGES['-admittedAt'],
      ),
      await explainCount('hospital: patients count', PatientModel, scopedPatients),
      await explainPipeline(
        'hospital: dashboard stats',
        PatientModel,
        buildStatsPipeline(now, hospitalDoctorIds),
      ),
      await explainPipeline(
        'hospital: timeline 30d',
        PatientModel,
        buildTimelinePipeline('30d', now, hospitalDoctorIds),
      ),
      await explainPipeline(
        'hospital: patients per doctor',
        PatientModel,
        buildPatientsPerDoctorPipeline(10, hospitalDoctorIds),
      ),
      await explainPipeline(
        'hospital: conditions',
        PatientModel,
        buildConditionsPipeline(hospitalDoctorIds),
      ),
      await explainPipeline(
        'hospital: specializations',
        DoctorModel,
        buildSpecializationsPipeline(hospital),
      ),
      await explainFind(
        'hospital: recent patients',
        PatientModel,
        scopedPatients,
        PATIENT_PROJECTION,
        { admittedAt: -1 },
      ),
    ];

    // Deliberately unindexed: each would cost write speed on every insert for a rarely-used sort.
    const tradeoffRows: Row[] = [
      await patientFind('patients: sort by age (no index)', {}, 'age'),
      await patientFind('patients: sort by created date (no index)', {}, '-createdAt'),
    ];

    printTable('Doctors', doctorRows);
    printTable('Public directory', publicRows);
    printTable('Patients', patientRows);
    printTable('Dashboard', dashboardRows);
    printTable('Hospital switcher (scoped to one hospital)', hospitalRows);
    printTable('Prescriptions', prescriptionRows);
    printTable('Documented trade-offs (intentionally not indexed)', tradeoffRows);

    const failures = [
      ...doctorRows,
      ...publicRows,
      ...patientRows,
      ...dashboardRows,
      ...hospitalRows,
      ...prescriptionRows,
    ].filter((row) => row.collscan);
    console.log('');
    if (failures.length > 0) {
      console.error(
        `FAIL: ${failures.length} key quer${failures.length === 1 ? 'y' : 'ies'} use COLLSCAN:`,
      );
      failures.forEach((row) => {
        console.error(`  - ${row.query}`);
      });
      process.exitCode = 1;
    } else {
      console.log(
        `OK: none of the ${doctorRows.length + publicRows.length + patientRows.length + dashboardRows.length + hospitalRows.length + prescriptionRows.length} key queries use COLLSCAN.`,
      );
    }
  } finally {
    await disconnectDB();
  }
};

run().catch((error: unknown) => {
  console.error('[explain] Failed:', error);
  process.exit(1);
});
