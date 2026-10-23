import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { DoctorModel } from '../models/doctor.model.js';
import { PatientModel } from '../models/patient.model.js';
import { UserModel } from '../models/user.model.js';
import { hashPassword } from '../utils/password.js';

const ADMIN_NAME = 'Admin';

/** Builds every index declared in the schemas (autoIndex is off in production). */
const syncIndexes = async (): Promise<void> => {
  await Promise.all([
    UserModel.syncIndexes(),
    DoctorModel.syncIndexes(),
    PatientModel.syncIndexes(),
  ]);
  console.info('[seed] Indexes synced for users, doctors, patients');
};

const seedAdmin = async (email: string, password: string): Promise<void> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (await UserModel.exists({ email: normalizedEmail })) {
    console.info(`[seed] Admin ${normalizedEmail} already exists, skipping`);
    return;
  }

  await UserModel.create({
    name: ADMIN_NAME,
    email: normalizedEmail,
    password: await hashPassword(password),
    role: 'admin',
  });
  console.info(`[seed] Admin ${normalizedEmail} created`);
};

const run = async (): Promise<void> => {
  const { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = env;

  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    console.error('[seed] SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in server/.env');
    process.exit(1);
  }

  await connectDB();

  try {
    await syncIndexes();
    await seedAdmin(SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD);
  } finally {
    await disconnectDB();
  }
};

run().catch((error: unknown) => {
  console.error('[seed] Failed:', error);
  process.exit(1);
});
