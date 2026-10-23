import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, BCRYPT_ROUNDS);

export const verifyPassword = (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);

// Computed once at startup so even the first unknown-email login pays the full bcrypt cost.
const dummyHash = hashPassword('timing-attack-mitigation-placeholder');

/**
 * Runs a bcrypt comparison against a throwaway hash so a login for an unknown
 * email takes as long as one with a wrong password (no timing-based enumeration).
 */
export const simulatePasswordCheck = async (password: string): Promise<void> => {
  await bcrypt.compare(password, await dummyHash);
};
