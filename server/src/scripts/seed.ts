import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { DoctorModel } from '../models/doctor.model.js';
import { PatientModel } from '../models/patient.model.js';
import { UserModel } from '../models/user.model.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

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

/**
 * server/.env is the source of truth for the admin login: creates the account, or, when the
 * email already exists, makes sure its password matches SEED_ADMIN_PASSWORD. Changing the
 * password signs the account out everywhere.
 */
const seedAdmin = async (email: string, password: string): Promise<void> => {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await UserModel.findOne({ email: normalizedEmail }).select('+password');

  if (!existing) {
    await UserModel.create({
      name: ADMIN_NAME,
      email: normalizedEmail,
      password: await hashPassword(password),
      role: 'admin',
    });
    console.info(`[seed] Admin ${normalizedEmail} created`);
    return;
  }

  if (await verifyPassword(password, existing.password)) {
    console.info(`[seed] Admin ${normalizedEmail} is already up to date`);
    return;
  }

  existing.password = await hashPassword(password);
  existing.refreshTokenHash = null;
  await existing.save();
  console.info(`[seed] Admin ${normalizedEmail} updated to match SEED_ADMIN_PASSWORD`);
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
