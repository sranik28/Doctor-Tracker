import { faker } from '@faker-js/faker';
import type { Types } from 'mongoose';

import { connectDB, disconnectDB } from '../config/db.js';
import { DoctorModel } from '../models/doctor.model.js';
import { PATIENT_GENDERS, PatientModel } from '../models/patient.model.js';

/** Demo doctors are the only ones on this domain, which is how --reset finds them. */
const DEMO_EMAIL_DOMAIN = 'demo.doctortracker.dev';
const DOCTOR_COUNT = 30;
const PATIENT_COUNT = 1500;
const MONTHS = 12;
const FAKER_SEED = 20260101;

const SPECIALIZATIONS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Oncology',
  'Gynecology',
  'Psychiatry',
] as const;

const HOSPITALS = [
  'Square Hospital',
  'United Hospital',
  'Evercare Hospital',
  'Labaid Hospital',
  'Popular Medical Centre',
] as const;

// Weighted so the condition chart has a shape; the long tail feeds the "Other" bucket.
const CONDITIONS: readonly (readonly [string, number])[] = [
  ['Hypertension', 22],
  ['Diabetes', 18],
  ['Asthma', 12],
  ['Migraine', 9],
  ['Arthritis', 8],
  ['Bronchitis', 7],
  ['Anemia', 5],
  ['Kidney stones', 4],
  ['Thyroid disorder', 4],
  ['Gastritis', 4],
  ['Fracture', 3],
  ['Allergic rhinitis', 4],
];

const isReset = process.argv.includes('--reset');

const demoDoctorFilter = { email: { $regex: `@${DEMO_EMAIL_DOMAIN.replace(/\./g, '\\.')}$` } };

/** Bangladeshi mobile-style number: "+880 1711-123456". */
const phone = (): string =>
  `+880 1${faker.helpers.arrayElement(['3', '5', '7', '8', '9'])}${faker.string.numeric(2)}-${faker.string.numeric(6)}`;

/** More admissions in recent months, with some day-to-day noise: a believable growth curve. */
const randomAdmissionDate = (now: Date): Date => {
  const monthsAgo = Math.floor(MONTHS * (1 - Math.sqrt(Math.random())));
  const date = new Date(now);
  date.setUTCMonth(date.getUTCMonth() - monthsAgo);
  date.setUTCDate(faker.number.int({ min: 1, max: 28 }));
  date.setUTCHours(faker.number.int({ min: 2, max: 14 }), faker.number.int({ min: 0, max: 59 }));
  return date > now
    ? new Date(now.getTime() - faker.number.int({ min: 1, max: 6 }) * 3_600_000)
    : date;
};

const resetDemoData = async (): Promise<void> => {
  const demoDoctors = await DoctorModel.find(demoDoctorFilter, { _id: 1 }).lean();
  const ids = demoDoctors.map((doctor) => doctor._id);
  const patients = await PatientModel.deleteMany({ doctorId: { $in: ids } });
  const doctors = await DoctorModel.deleteMany({ _id: { $in: ids } });
  console.info(
    `[seed:demo] Removed ${doctors.deletedCount} doctors, ${patients.deletedCount} patients`,
  );
};

const createDoctors = async (): Promise<Types.ObjectId[]> => {
  const docs = Array.from({ length: DOCTOR_COUNT }, (_, index) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      name: `Dr. ${firstName} ${lastName}`,
      // Round-robin first so all 8 specializations are present, uneven afterwards.
      specialization: SPECIALIZATIONS[index % SPECIALIZATIONS.length] ?? SPECIALIZATIONS[0],
      hospital: faker.helpers.arrayElement(HOSPITALS),
      phone: phone(),
      email:
        `${firstName}.${lastName}.${index}`.toLowerCase().replace(/[^a-z0-9.]/g, '') +
        `@${DEMO_EMAIL_DOMAIN}`,
    };
  });
  const created = await DoctorModel.insertMany(docs);
  return created.map((doctor) => doctor._id);
};

const createPatients = async (doctorIds: Types.ObjectId[], now: Date): Promise<number> => {
  // Skewed workload: a few busy doctors, a long tail of quieter ones.
  const doctorWeights = doctorIds.map((_, index) => 1 / (index + 2));
  const patients = Array.from({ length: PATIENT_COUNT }, () => {
    const admittedAt = randomAdmissionDate(now);
    const doctorId = faker.helpers.weightedArrayElement(
      doctorIds.map((value, i) => ({ value, weight: doctorWeights[i] ?? 1 })),
    );
    return {
      name: faker.person.fullName(),
      age: faker.number.int({ min: 1, max: 95 }),
      gender: faker.helpers.arrayElement(PATIENT_GENDERS),
      phone: phone(),
      condition: faker.helpers.weightedArrayElement(
        CONDITIONS.map(([value, weight]) => ({ value, weight })),
      ),
      doctorId,
      admittedAt,
      notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : '',
      // insertMany keeps explicit timestamps, so list pages sort realistically too.
      createdAt: admittedAt,
      updatedAt: admittedAt,
    };
  });
  const inserted = await PatientModel.insertMany(patients, { timestamps: false });
  return inserted.length;
};

const run = async (): Promise<void> => {
  faker.seed(FAKER_SEED);
  await connectDB();

  try {
    await Promise.all([DoctorModel.syncIndexes(), PatientModel.syncIndexes()]);

    if (isReset) {
      await resetDemoData();
    } else if (await DoctorModel.exists(demoDoctorFilter)) {
      console.info('[seed:demo] Demo data already exists. Use --reset to recreate it.');
      return;
    }

    const now = new Date();
    const doctorIds = await createDoctors();
    const patientCount = await createPatients(doctorIds, now);
    console.info(`[seed:demo] Created ${doctorIds.length} doctors and ${patientCount} patients`);
  } finally {
    await disconnectDB();
  }
};

run().catch((error: unknown) => {
  console.error('[seed:demo] Failed:', error);
  process.exit(1);
});
