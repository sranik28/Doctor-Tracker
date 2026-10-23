import mongoose from 'mongoose';

import { env, isProduction } from './env.js';

mongoose.set('strictQuery', true);

mongoose.connection.on('disconnected', () => {
  console.warn('[db] MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.info('[db] MongoDB reconnected');
});

mongoose.connection.on('error', (error: Error) => {
  console.error('[db] MongoDB error:', error.message);
});

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      autoIndex: !isProduction,
      serverSelectionTimeoutMS: 10_000,
    });
    console.info(`[db] MongoDB connected (${mongoose.connection.name})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[db] Failed to connect to MongoDB: ${message}`);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
  console.info('[db] MongoDB connection closed');
};