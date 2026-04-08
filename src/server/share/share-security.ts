import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEYLEN = 64;

export const createSalt = () => randomBytes(16).toString("hex");

export const hashPassword = (password: string, salt: string) => {
  return scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
};

export const hashPasswordWithSalt = (password: string) => {
  const salt = createSalt();
  const hash = hashPassword(password, salt);
  return { salt, hash };
};

export const verifyPassword = (input: string, hash: string, salt: string) => {
  const inputHash = hashPassword(input, salt);
  const inputBuffer = Buffer.from(inputHash, "hex");
  const savedBuffer = Buffer.from(hash, "hex");

  if (inputBuffer.length !== savedBuffer.length) return false;
  return timingSafeEqual(inputBuffer, savedBuffer);
};
