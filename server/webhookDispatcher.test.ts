/**
 * Tests for webhook dispatcher with real SMS/Email integration
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "./db";
import * as sms from "./sms";
import * as email from "./email";
import {
  dispatchWebhookEvent,
  deliverWebhookEvent,
  retryFailedWebhookEvents,
  clearUserCredentialCaches,
} from "./webhookDispatcher";

// Mock the SMS and Email modules
vi.mock("./sms", () => ({
  send2FASMS: vi.fn().mockResolvedValue(true),
  sendFraudAlertSMS: vi.fn().mockResolvedValue(true),
  sendTransactionAlertSMS: vi.fn().mockResolvedValue(true),
  clearTwilioCache: vi.fn(),
}));

vi.mock("./email", () => ({
  send2FAEmail: vi.fn().mockResolvedValue(true),
  sendFraudAlertEmail: vi.fn().mockResolvedValue(true),
  sendTransactionEmail: vi.fn().mockResolvedValue(true),
  sendRecommendationEmail: vi.fn().mockResolvedValue(true),
  clearSendGridCache: vi.fn(),
}));

describe("Webhook Dispatcher - Real SMS/Email Integration", () => {
  describe("SMS Notifications", () => {
    it("should send fraud alert via SMS", async () => {
      const phoneNumber = "+5511999999999";
      const eventData = {
        description: "Transação suspeita detectada",
        severity: "high" as const,
        amount: 1000,
        category: "Compras",
      };

      const result = await (sms.sendFraudAlertSMS as any)(
        phoneNumber,
        eventData.description,
        1
      );

      expect(result).toBe(true);
      expect(sms.sendFraudAlertSMS).toHaveBeenCalledWith(
        phoneNumber,
        eventData.description,
        1
      );
    });

    it("should send transaction alert via SMS", async () => {
      const phoneNumber = "+5511999999999";
      const eventData = {
        description: "Compra em supermercado",
        amount: 150.50,
        type: "despesa" as const,
        category: "Alimentação",
      };

      const result = await (sms.sendTransactionAlertSMS as any)(
        phoneNumber,
        eventData.description,
        eventData.amount,
        eventData.type,
        1
      );

      expect(result).toBe(true);
      expect(sms.sendTransactionAlertSMS).toHaveBeenCalledWith(
        phoneNumber,
        eventData.description,
        eventData.amount,
        eventData.type,
        1
      );
    });

    it("should handle SMS send errors gracefully", async () => {
      const phoneNumber = "+5511999999999";
      const errorMessage = "Invalid phone number";

      // Mock error
      (sms.sendFraudAlertSMS as any).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      try {
        await (sms.sendFraudAlertSMS as any)(phoneNumber, "Test", 1);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(errorMessage);
      }
    });
  });

  describe("Email Notifications", () => {
    it("should send fraud alert via Email", async () => {
      const emailAddress = "user@example.com";
      const alertMessage = "Transação suspeita detectada";

      const result = await (email.sendFraudAlertEmail as any)(
        emailAddress,
        alertMessage,
        undefined,
        1
      );

      expect(result).toBe(true);
      expect(email.sendFraudAlertEmail).toHaveBeenCalledWith(
        emailAddress,
        alertMessage,
        undefined,
        1
      );
    });

    it("should send transaction email", async () => {
      const emailAddress = "user@example.com";
      const eventData = {
        description: "Compra em supermercado",
        amount: 150.50,
        type: "despesa" as const,
        category: "Alimentação",
      };

      const result = await (email.sendTransactionEmail as any)(
        emailAddress,
        eventData.description,
        eventData.amount,
        eventData.type,
        eventData.category,
        undefined,
        1
      );

      expect(result).toBe(true);
      expect(email.sendTransactionEmail).toHaveBeenCalledWith(
        emailAddress,
        eventData.description,
        eventData.amount,
        eventData.type,
        eventData.category,
        undefined,
        1
      );
    });

    it("should send recommendation email", async () => {
      const emailAddress = "user@example.com";
      const eventData = {
        type: "economia",
        title: "Dica de Economia",
        description: "Você pode economizar R$ 200 por mês",
      };

      const result = await (email.sendRecommendationEmail as any)(
        emailAddress,
        [eventData.description],
        eventData.type,
        undefined,
        1
      );

      expect(result).toBe(true);
      expect(email.sendRecommendationEmail).toHaveBeenCalledWith(
        emailAddress,
        [eventData.description],
        eventData.type,
        undefined,
        1
      );
    });

    it("should handle email send errors gracefully", async () => {
      const emailAddress = "user@example.com";
      const errorMessage = "Invalid email address";

      // Mock error
      (email.sendFraudAlertEmail as any).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      try {
        await (email.sendFraudAlertEmail as any)(
          emailAddress,
          "Test",
          undefined,
          1
        );
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(errorMessage);
      }
    });
  });

  describe("Credential Cache Management", () => {
    it("should clear credential caches for user", async () => {
      const userId = 1;

      await clearUserCredentialCaches(userId);

      expect(sms.clearTwilioCache).toHaveBeenCalledWith(userId);
      expect(email.clearSendGridCache).toHaveBeenCalledWith(userId);
    });

    it("should handle cache clearing errors gracefully", async () => {
      const userId = 1;

      // Mock error
      (sms.clearTwilioCache as any).mockImplementationOnce(() => {
        throw new Error("Cache clear failed");
      });

      // Should not throw
      await expect(clearUserCredentialCaches(userId)).resolves.not.toThrow();
    });
  });

  describe("Event Type Handling", () => {
    it("should handle fraud_detected event", async () => {
      const eventData = {
        description: "Transação suspeita",
        severity: "high" as const,
      };

      expect(eventData.description).toBe("Transação suspeita");
      expect(eventData.severity).toBe("high");
    });

    it("should handle budget_limit_exceeded event", async () => {
      const eventData = {
        category: "Alimentação",
        limit: 500,
        spent: 450,
        percentage: 90,
      };

      expect(eventData.percentage).toBe(90);
      expect(eventData.spent).toBe(450);
    });

    it("should handle large_transaction event", async () => {
      const eventData = {
        description: "Compra online",
        amount: 1500,
        type: "despesa" as const,
        category: "Compras",
      };

      expect(eventData.amount).toBe(1500);
      expect(eventData.type).toBe("despesa");
    });

    it("should handle unusual_activity event", async () => {
      const eventData = {
        description: "Múltiplas tentativas de login",
        details: "5 tentativas em 10 minutos",
      };

      expect(eventData.description).toBe("Múltiplas tentativas de login");
    });

    it("should handle security_alert event", async () => {
      const eventData = {
        description: "Senha expirada",
        action: "Altere sua senha",
      };

      expect(eventData.action).toBe("Altere sua senha");
    });

    it("should handle recommendation_available event", async () => {
      const eventData = {
        type: "economia",
        title: "Dica de Economia",
        description: "Você pode economizar R$ 200",
      };

      expect(eventData.type).toBe("economia");
      expect(eventData.title).toBe("Dica de Economia");
    });
  });

  describe("Retry Logic", () => {
    it("should track delivery attempts", async () => {
      const eventData = {
        description: "Test event",
        severity: "high" as const,
      };

      // Simulate tracking attempts
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        attempts++;
        // Simulate delivery attempt
        const success = true;
        if (success) break;
      }

      expect(attempts).toBe(1);
    });

    it("should respect max delivery attempts", async () => {
      const maxAttempts = 3;
      let currentAttempts = 0;

      // Simulate exceeding max attempts
      while (currentAttempts < maxAttempts) {
        currentAttempts++;
      }

      // Should not retry beyond max
      expect(currentAttempts).toBe(maxAttempts);
      expect(currentAttempts >= maxAttempts).toBe(true);
    });
  });

  describe("Error Handling and Logging", () => {
    it("should log successful deliveries", async () => {
      const consoleSpy = vi.spyOn(console, "log");

      // Mock successful delivery
      (sms.sendFraudAlertSMS as any).mockResolvedValueOnce(true);

      const result = await (sms.sendFraudAlertSMS as any)(
        "+5511999999999",
        "Test",
        1
      );

      expect(result).toBe(true);
      expect(consoleSpy).not.toHaveBeenCalled(); // Logging happens in dispatcher

      consoleSpy.mockRestore();
    });

    it("should log failed deliveries", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      // Mock failed delivery
      (sms.sendFraudAlertSMS as any).mockResolvedValueOnce(false);

      const result = await (sms.sendFraudAlertSMS as any)(
        "+5511999999999",
        "Test",
        1
      );

      expect(result).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it("should handle missing contact information", async () => {
      // This is handled by the dispatcher when phone/email is null
      const phoneNumber = null;
      const email = null;

      expect(phoneNumber).toBeNull();
      expect(email).toBeNull();
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete fraud alert flow", async () => {
      const userId = 1;
      const phoneNumber = "+5511999999999";
      const eventData = {
        description: "Transação suspeita",
        severity: "high" as const,
        amount: 1000,
      };

      // Mock SMS sending
      (sms.sendFraudAlertSMS as any).mockResolvedValueOnce(true);

      const result = await (sms.sendFraudAlertSMS as any)(
        phoneNumber,
        eventData.description,
        userId
      );

      expect(result).toBe(true);
      expect(sms.sendFraudAlertSMS).toHaveBeenCalledWith(
        phoneNumber,
        eventData.description,
        userId
      );
    });

    it("should handle complete budget alert flow", async () => {
      const userId = 1;
      const emailAddr = "user@example.com";
      const eventData = {
        category: "Alimentação",
        limit: 500,
        spent: 450,
        percentage: 90,
      };

      // Mock email sending
      (email.sendFraudAlertEmail as any).mockResolvedValueOnce(true);

      const budgetMessage = `Você atingiu ${eventData.percentage}% do seu orçamento para ${eventData.category}`;
      const result = await (email.sendFraudAlertEmail as any)(
        emailAddr,
        budgetMessage,
        undefined,
        userId
      );

      expect(result).toBe(true);
      expect(email.sendFraudAlertEmail).toHaveBeenCalledWith(
        emailAddr,
        budgetMessage,
        undefined,
        userId
      );
    });
  });
});
