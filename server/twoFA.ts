/**
 * 2FA (Two-Factor Authentication) helper
 * Supports: Email, SMS, Authenticator (TOTP)
 */

import { encryptData, decryptData, generateToken, generateTOTPSecret } from "./encryption";
import { getDb } from "./db";
import { twoFAMethods, auditLogs } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

const TOTP_WINDOW = 30; // seconds
const TOTP_DIGITS = 6;

/**
 * Generate TOTP code (for authenticator apps)
 * Based on RFC 6238
 */
export function generateTOTPCode(secret: string, timestamp: number = Date.now()): string {
  // Simplified version - for production use 'speakeasy' package
  const crypto = require("crypto");
  const time = Math.floor(timestamp / 1000 / TOTP_WINDOW);
  const hmac = crypto.createHmac("sha1", Buffer.from(secret, "base64"));
  hmac.update(Buffer.alloc(8));
  const digest = hmac.digest();
  const offset = digest[digest.length - 1] & 0xf;
  const code =
    (digest.readUInt32BE(offset) & 0x7fffffff) % Math.pow(10, TOTP_DIGITS);
  return code.toString().padStart(TOTP_DIGITS, "0");
}

/**
 * Verify TOTP code with time window tolerance
 */
export function verifyTOTPCode(secret: string, code: string, window: number = 1): boolean {
  const now = Date.now();
  for (let i = -window; i <= window; i++) {
    const timestamp = now + i * TOTP_WINDOW * 1000;
    if (generateTOTPCode(secret, timestamp) === code) {
      return true;
    }
  }
  return false;
}

/**
 * Generate backup codes for 2FA recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateToken(8).toUpperCase());
  }
  return codes;
}

/**
 * Enable 2FA method for user
 */
export async function enable2FAMethod(
  userId: number,
  method: "email" | "sms" | "authenticator",
  phoneNumber?: string
): Promise<{ secret?: string; backupCodes?: string[] }> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const secret = method === "authenticator" ? generateTOTPSecret() : undefined;
    const backupCodes = generateBackupCodes(10);
    const encryptedBackupCodes = encryptData(backupCodes.join(","));

    // Check if method already exists
    const existing = await db
      .select()
      .from(twoFAMethods)
      .where(and(eq(twoFAMethods.userId, userId), eq(twoFAMethods.method, method)))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(twoFAMethods)
        .set({
          isEnabled: 1,
          secret: secret ? encryptData(secret) : undefined,
          phoneNumber: phoneNumber ? encryptData(phoneNumber) : undefined,
          backupCodes: encryptedBackupCodes,
          backupCodesRemaining: 10,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(twoFAMethods.userId, userId),
            eq(twoFAMethods.method, method)
          )
        );
    } else {
      // Create new
      await db.insert(twoFAMethods).values({
        userId,
        method,
        isEnabled: 1,
        secret: secret ? encryptData(secret) : undefined,
        phoneNumber: phoneNumber ? encryptData(phoneNumber) : undefined,
        backupCodes: encryptedBackupCodes,
        backupCodesRemaining: 10,
      });
    }

    // Log audit
    await logAudit(userId, "2fa_enabled", "success", { method });

    return {
      secret: secret,
      backupCodes: backupCodes,
    };
  } catch (error) {
    console.error("[2FA Enable Error]", error);
    throw error;
  }
}

/**
 * Disable 2FA method for user
 */
export async function disable2FAMethod(
  userId: number,
  method: "email" | "sms" | "authenticator"
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(twoFAMethods)
      .set({ isEnabled: 0, updatedAt: new Date() })
      .where(
        and(
          eq(twoFAMethods.userId, userId),
          eq(twoFAMethods.method, method)
        )
      );

    // Log audit
    await logAudit(userId, "2fa_disabled", "success", { method });
  } catch (error) {
    console.error("[2FA Disable Error]", error);
    throw error;
  }
}

/**
 * Get enabled 2FA methods for user
 */
export async function getEnabled2FAMethods(userId: number): Promise<string[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const methods = await db
      .select()
      .from(twoFAMethods)
      .where(
        and(eq(twoFAMethods.userId, userId), eq(twoFAMethods.isEnabled, 1))
      );

    return methods.map((m: any) => m.method);
  } catch (error) {
    console.error("[Get 2FA Methods Error]", error);
    return [];
  }
}

/**
 * Verify 2FA code (works for all methods)
 */
export async function verify2FACode(
  userId: number,
  method: "email" | "sms" | "authenticator",
  code: string
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const twoFARecord = await db
      .select()
      .from(twoFAMethods)
      .where(
        and(
          eq(twoFAMethods.userId, userId),
          eq(twoFAMethods.method, method),
          eq(twoFAMethods.isEnabled, 1)
        )
      )
      .limit(1);

    if (!twoFARecord.length) {
      return false;
    }

    const record = twoFARecord[0];

    // For authenticator: verify TOTP code
    if (method === "authenticator" && record.secret) {
      const decryptedSecret = decryptData(record.secret);
      return verifyTOTPCode(decryptedSecret, code);
    }

    // For email/SMS: verify backup codes
    if (record.backupCodes) {
      const decryptedCodes = decryptData(record.backupCodes).split(",");
      if (decryptedCodes.includes(code)) {
        // Remove used backup code
        const remainingCodes = decryptedCodes.filter((c) => c !== code);
        await db
          .update(twoFAMethods)
          .set({
            backupCodes: encryptData(remainingCodes.join(",")),
            backupCodesRemaining: remainingCodes.length,
          })
          .where(
            and(
              eq(twoFAMethods.userId, userId),
              eq(twoFAMethods.method, method)
            )
          );
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("[Verify 2FA Error]", error);
    return false;
  }
}

/**
 * Log audit event
 */
export async function logAudit(
  userId: number,
  action: string,
  status: "success" | "failed" = "success",
  details?: Record<string, any>
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(auditLogs).values({
      userId,
      action: action as any,
      status,
      details: details ? JSON.stringify(details) : undefined,
      ipAddress: undefined,
      userAgent: undefined,
    });
  } catch (error) {
    console.error("[Audit Log Error]", error);
  }
}
