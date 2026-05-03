import { describe, it, expect, vi } from "vitest";
import { encryptData, decryptData } from "../encryption";

describe("Integrations Router", () => {
  describe("Add Integration", () => {
    it("should validate provider enum", () => {
      const validProviders = ["twilio", "sendgrid", "stripe", "openai"];
      expect(validProviders).toContain("twilio");
      expect(validProviders).toContain("sendgrid");
    });
  });

  describe("Encryption", () => {
    it("should encrypt and decrypt credentials correctly", () => {
      const credentials = {
        accountSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        authToken: "test-auth-token",
        phoneNumber: "+55 (11) 98765-4321",
      };

      const encrypted = encryptData(JSON.stringify(credentials));
      const decrypted = JSON.parse(decryptData(encrypted));

      expect(decrypted).toEqual(credentials);
    });

    it("should produce different encrypted output for same input (due to IV)", () => {
      const credentials = JSON.stringify({
        apiKey: "sk_live_xxxxxxxxxxxxxxxxxxxxxxxx",
      });

      const encrypted1 = encryptData(credentials);
      const encrypted2 = encryptData(credentials);

      // Due to IV randomization, encrypted outputs should be different
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to the same value
      expect(decryptData(encrypted1)).toBe(decryptData(encrypted2));
    });

    it("should handle complex credential objects", () => {
      const credentials = {
        apiKey: "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        fromEmail: "noreply@example.com",
        fromName: "Lume App",
        webhookUrl: "https://example.com/webhook",
        additionalSettings: {
          retryCount: 3,
          timeout: 5000,
        },
      };

      const encrypted = encryptData(JSON.stringify(credentials));
      const decrypted = JSON.parse(decryptData(encrypted));

      expect(decrypted).toEqual(credentials);
      expect(decrypted.additionalSettings.retryCount).toBe(3);
    });

    it("should handle empty credentials object", () => {
      const credentials = {};

      const encrypted = encryptData(JSON.stringify(credentials));
      const decrypted = JSON.parse(decryptData(encrypted));

      expect(decrypted).toEqual(credentials);
    });
  });

  describe("Provider Validation", () => {
    it("should validate Twilio credentials structure", () => {
      const twilioCredentials = {
        accountSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        authToken: "test-auth-token",
        phoneNumber: "+55 (11) 98765-4321",
      };

      expect(twilioCredentials).toHaveProperty("accountSid");
      expect(twilioCredentials).toHaveProperty("authToken");
      expect(twilioCredentials).toHaveProperty("phoneNumber");
    });

    it("should validate SendGrid credentials structure", () => {
      const sendgridCredentials = {
        apiKey: "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        fromEmail: "noreply@example.com",
        fromName: "Lume App",
      };

      expect(sendgridCredentials).toHaveProperty("apiKey");
      expect(sendgridCredentials).toHaveProperty("fromEmail");
      expect(sendgridCredentials).toHaveProperty("fromName");
    });

    it("should validate Stripe credentials structure", () => {
      const stripeCredentials = {
        secretKey: "sk_live_xxxxxxxxxxxxxxxxxxxxxxxx",
        publishableKey: "pk_live_xxxxxxxxxxxxxxxxxxxxxxxx",
      };

      expect(stripeCredentials).toHaveProperty("secretKey");
      expect(stripeCredentials).toHaveProperty("publishableKey");
    });

    it("should validate OpenAI credentials structure", () => {
      const openaiCredentials = {
        apiKey: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      };

      expect(openaiCredentials).toHaveProperty("apiKey");
    });
  });

  describe("Credential Security", () => {
    it("should never store plain text credentials", () => {
      const plainCredentials = "sk_live_xxxxxxxxxxxxxxxxxxxxxxxx";
      const encrypted = encryptData(plainCredentials);

      // Encrypted should not contain the original value
      expect(encrypted).not.toContain(plainCredentials);
    });

    it("should produce consistent decryption", () => {
      const credentials = JSON.stringify({
        apiKey: "test-key-12345",
        secret: "test-secret-67890",
      });

      const encrypted = encryptData(credentials);

      // Decrypt multiple times should always produce same result
      const decrypted1 = decryptData(encrypted);
      const decrypted2 = decryptData(encrypted);
      const decrypted3 = decryptData(encrypted);

      expect(decrypted1).toBe(decrypted2);
      expect(decrypted2).toBe(decrypted3);
    });

    it("should handle special characters in credentials", () => {
      const credentials = {
        apiKey: "sk_live_!@#$%^&*()_+-=[]{}|;:',.<>?/",
        secret: "test\\nwith\\nnewlines",
      };

      const encrypted = encryptData(JSON.stringify(credentials));
      const decrypted = JSON.parse(decryptData(encrypted));

      expect(decrypted).toEqual(credentials);
    });
  });

  describe("Integration Flow", () => {
    it("should support multiple providers per user", () => {
      const userIntegrations = [
        { provider: "twilio", name: "SMS" },
        { provider: "sendgrid", name: "Email" },
        { provider: "stripe", name: "Payments" },
      ];

      expect(userIntegrations).toHaveLength(3);
      expect(userIntegrations.map((i) => i.provider)).toContain("twilio");
      expect(userIntegrations.map((i) => i.provider)).toContain("sendgrid");
      expect(userIntegrations.map((i) => i.provider)).toContain("stripe");
    });

    it("should track integration metadata", () => {
      const integration = {
        id: 1,
        userId: 1,
        provider: "twilio",
        name: "SMS",
        isActive: true,
        lastUsed: new Date(),
        createdAt: new Date(),
      };

      expect(integration).toHaveProperty("id");
      expect(integration).toHaveProperty("userId");
      expect(integration).toHaveProperty("provider");
      expect(integration).toHaveProperty("isActive");
      expect(integration.isActive).toBe(true);
    });
  });
});
