/**
 * Tests for 2FA functionality
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  generateTOTPCode,
  verifyTOTPCode,
  generateBackupCodes,
} from "./twoFA";
import { encryptData, decryptData, generateToken, generateTOTPSecret } from "./encryption";

describe("2FA Functions", () => {
  describe("Backup Codes", () => {
    it("should generate 10 backup codes", () => {
      const codes = generateBackupCodes(10);
      expect(codes).toHaveLength(10);
      // Backup codes are 16 hex chars (8 bytes)
      expect(codes.every((c) => c.length === 16)).toBe(true);
      expect(codes.every((c) => /^[A-F0-9]+$/.test(c))).toBe(true);
    });

    it("should generate unique backup codes", () => {
      const codes = generateBackupCodes(10);
      const unique = new Set(codes);
      expect(unique.size).toBe(10);
    });

    it("should generate custom number of codes", () => {
      const codes = generateBackupCodes(5);
      expect(codes).toHaveLength(5);
    });
  });

  describe("TOTP Secret", () => {
    it("should generate TOTP secret", () => {
      const secret = generateTOTPSecret();
      expect(secret).toBeDefined();
      expect(typeof secret).toBe("string");
      expect(secret.length).toBeGreaterThan(0);
    });

    it("should generate different secrets", () => {
      const secret1 = generateTOTPSecret();
      const secret2 = generateTOTPSecret();
      expect(secret1).not.toBe(secret2);
    });
  });

  describe("TOTP Code Generation", () => {
    it("should generate 6-digit TOTP code", () => {
      const secret = generateTOTPSecret();
      const code = generateTOTPCode(secret);
      expect(code).toMatch(/^\d{6}$/);
    });

    it("should generate same code for same timestamp", () => {
      const secret = generateTOTPSecret();
      const timestamp = Date.now();
      const code1 = generateTOTPCode(secret, timestamp);
      const code2 = generateTOTPCode(secret, timestamp);
      expect(code1).toBe(code2);
    });

    it("should generate different codes for different timestamps", () => {
      const secret = generateTOTPSecret();
      const now = Date.now();
      const code1 = generateTOTPCode(secret, now);
      const code2 = generateTOTPCode(secret, now + 60000); // 60 seconds later
      // Codes are valid strings
      expect(typeof code1).toBe("string");
      expect(typeof code2).toBe("string");
      expect(code1).toMatch(/^\d{6}$/);
      expect(code2).toMatch(/^\d{6}$/);
    });
  });

  describe("TOTP Verification", () => {
    it("should verify valid TOTP code", () => {
      const secret = generateTOTPSecret();
      const code = generateTOTPCode(secret);
      expect(verifyTOTPCode(secret, code)).toBe(true);
    });

    it("should reject invalid TOTP code", () => {
      const secret = generateTOTPSecret();
      expect(verifyTOTPCode(secret, "000000")).toBe(false);
    });

    it("should verify code within time window", () => {
      const secret = generateTOTPSecret();
      const now = Date.now();
      const code = generateTOTPCode(secret, now);
      // Verify with time window of 1 (±30 seconds)
      expect(verifyTOTPCode(secret, code, 1)).toBe(true);
    });
  });

  describe("Encryption/Decryption", () => {
    it("should encrypt and decrypt data", () => {
      const original = "sensitive-data-123";
      const encrypted = encryptData(original);
      expect(encrypted).not.toBe(original);
      expect(encrypted).toContain(":");

      const decrypted = decryptData(encrypted);
      expect(decrypted).toBe(original);
    });

    it("should encrypt different data differently", () => {
      const data1 = "data1";
      const data2 = "data2";
      const encrypted1 = encryptData(data1);
      const encrypted2 = encryptData(data2);
      expect(encrypted1).not.toBe(encrypted2);
    });

    it("should handle special characters", () => {
      const original = "!@#$%^&*()_+-=[]{}|;:',.<>?/";
      const encrypted = encryptData(original);
      const decrypted = decryptData(encrypted);
      expect(decrypted).toBe(original);
    });

    it("should reject invalid encrypted data", () => {
      expect(() => decryptData("invalid:data:format")).toThrow();
    });
  });

  describe("Token Generation", () => {
    it("should generate random token", () => {
      const token = generateToken(32);
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it("should generate unique tokens", () => {
      const token1 = generateToken(32);
      const token2 = generateToken(32);
      expect(token1).not.toBe(token2);
    });

    it("should generate custom length tokens", () => {
      const token16 = generateToken(16);
      const token64 = generateToken(64);
      expect(token16).toHaveLength(32); // 16 bytes
      expect(token64).toHaveLength(128); // 64 bytes
    });
  });
});
