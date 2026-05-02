/**
 * Encryption helper for sensitive data
 * Uses AES-256-GCM for authenticated encryption
 */

import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt sensitive data
 * Returns: iv:authTag:encryptedData (all base64 encoded)
 */
export function encryptData(plaintext: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, "utf-8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Return: iv:authTag:encrypted (all base64)
    return (
      iv.toString("base64") +
      ":" +
      authTag.toString("base64") +
      ":" +
      encrypted
    );
  } catch (error) {
    console.error("[Encryption Error]", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt sensitive data
 * Input format: iv:authTag:encryptedData (all base64 encoded)
 */
export function decryptData(encryptedData: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const parts = encryptedData.split(":");

    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(parts[0], "base64");
    const authTag = Buffer.from(parts[1], "base64");
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    return decrypted;
  } catch (error) {
    console.error("[Decryption Error]", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Hash password using bcrypt-like approach
 * For production, use bcrypt package
 */
export function hashPassword(password: string): string {
  return crypto
    .pbkdf2Sync(password, ENCRYPTION_KEY, 100000, 64, "sha512")
    .toString("hex");
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hash: string): boolean {
  const newHash = hashPassword(password);
  return crypto.timingSafeEqual(
    Buffer.from(newHash),
    Buffer.from(hash)
  );
}

/**
 * Generate random token for verification
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Generate TOTP secret for authenticator
 */
export function generateTOTPSecret(): string {
  return crypto.randomBytes(20).toString("base64");
}
