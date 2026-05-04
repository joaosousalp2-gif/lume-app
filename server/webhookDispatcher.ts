/**
 * Webhook Dispatcher - Handles event triggering and notification delivery
 * Dispatches notifications via SMS or Email based on user webhook configurations
 * Includes retry logic and comprehensive error handling
 */

import * as db from "./db";
import {
  send2FASMS,
  sendFraudAlertSMS,
  sendTransactionAlertSMS,
  clearTwilioCache,
} from "./sms";
import {
  send2FAEmail,
  sendFraudAlertEmail,
  sendTransactionEmail,
  sendRecommendationEmail,
  clearSendGridCache,
} from "./email";
import { getUserPhoneNumber, getUserEmail } from "./db";

export type WebhookEventType =
  | "fraud_detected"
  | "budget_limit_exceeded"
  | "large_transaction"
  | "unusual_activity"
  | "security_alert"
  | "recommendation_available";

export interface WebhookEventData {
  fraud_detected?: {
    description: string;
    severity: "low" | "medium" | "high";
    amount?: number;
    category?: string;
  };
  budget_limit_exceeded?: {
    category: string;
    limit: number;
    spent: number;
    percentage: number;
  };
  large_transaction?: {
    description: string;
    amount: number;
    type: "receita" | "despesa";
    category: string;
  };
  unusual_activity?: {
    description: string;
    details: string;
  };
  security_alert?: {
    description: string;
    action: string;
  };
  recommendation_available?: {
    type: string;
    title: string;
    description: string;
  };
}

// Constants for retry logic
const MAX_DELIVERY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutes
const DELIVERY_TIMEOUT_MS = 30 * 1000; // 30 seconds

/**
 * Dispatch a webhook event to all active webhooks for the event type
 */
export async function dispatchWebhookEvent(
  userId: number,
  eventType: WebhookEventType,
  eventData: WebhookEventData[WebhookEventType]
): Promise<void> {
  try {
    // Get all active webhooks for this event type
    const webhooks = await db.getWebhooksByEventType(userId, eventType);

    if (webhooks.length === 0) {
      console.log(
        `[Webhooks] No webhooks configured for event: ${eventType} (userId: ${userId})`
      );
      return;
    }

    console.log(
      `[Webhooks] Dispatching event "${eventType}" to ${webhooks.length} webhook(s) for user ${userId}`
    );

    // Create webhook events for each webhook
    for (const webhook of webhooks) {
      try {
        const event = await db.createWebhookEvent({
          webhookId: webhook.id,
          userId,
          eventType,
          eventData: JSON.stringify(eventData),
          deliveryStatus: "pending",
        });

        // Attempt delivery immediately with timeout
        const deliveryPromise = deliverWebhookEvent(
          webhook.id,
          event.id,
          userId,
          eventType,
          eventData,
          webhook.notificationMethod
        );

        // Race against timeout
        await Promise.race([
          deliveryPromise,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Delivery timeout")),
              DELIVERY_TIMEOUT_MS
            )
          ),
        ]);
      } catch (error) {
        console.error(
          `[Webhooks] Error creating/delivering event for webhook ${webhook.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("[Webhooks] Error dispatching webhook event:", error);
  }
}

/**
 * Deliver a webhook event via SMS or Email with retry logic
 */
export async function deliverWebhookEvent(
  webhookId: number,
  eventId: number,
  userId: number,
  eventType: WebhookEventType,
  eventData: any,
  notificationMethod: "sms" | "email"
): Promise<void> {
  try {
    const phoneNumber = await getUserPhoneNumber(userId);
    const email = await getUserEmail(userId);

    // Validate contact information
    if (notificationMethod === "sms" && !phoneNumber) {
      await db.updateWebhookEvent(eventId, {
        deliveryStatus: "failed",
        errorMessage: "No phone number configured for user",
        lastAttemptAt: new Date(),
        deliveryAttempts: 1,
      });
      console.warn(
        `[Webhooks] Cannot deliver SMS event ${eventId}: No phone number configured`
      );
      return;
    }

    if (notificationMethod === "email" && !email) {
      await db.updateWebhookEvent(eventId, {
        deliveryStatus: "failed",
        errorMessage: "No email configured for user",
        lastAttemptAt: new Date(),
        deliveryAttempts: 1,
      });
      console.warn(
        `[Webhooks] Cannot deliver email event ${eventId}: No email configured`
      );
      return;
    }

    let success = false;
    let errorMessage: string | undefined;

    try {
      if (notificationMethod === "sms") {
        success = await sendWebhookNotificationSMS(
          phoneNumber!,
          eventType,
          eventData,
          userId
        );
      } else {
        success = await sendWebhookNotificationEmail(
          email!,
          eventType,
          eventData,
          userId
        );
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(
        `[Webhooks] Error sending ${notificationMethod} notification:`,
        error
      );
    }

    // Update event status
    const currentEvent = await db.getWebhookEvents(webhookId, 1);
    const currentAttempts =
      currentEvent[0]?.deliveryAttempts || 0;

    await db.updateWebhookEvent(eventId, {
      deliveryStatus: success ? "sent" : "failed",
      sentAt: success ? new Date() : undefined,
      lastAttemptAt: new Date(),
      deliveryAttempts: currentAttempts + 1,
      errorMessage: errorMessage,
    });

    if (success) {
      console.log(
        `[Webhooks] Event ${eventId} delivered successfully via ${notificationMethod}`
      );
    } else {
      console.error(
        `[Webhooks] Failed to deliver event ${eventId} via ${notificationMethod}: ${errorMessage}`
      );
    }
  } catch (error) {
    console.error("[Webhooks] Error delivering webhook event:", error);
    try {
      await db.updateWebhookEvent(eventId, {
        deliveryStatus: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        lastAttemptAt: new Date(),
        deliveryAttempts: 1,
      });
    } catch (updateError) {
      console.error("[Webhooks] Error updating webhook event status:", updateError);
    }
  }
}

/**
 * Send webhook notification via SMS with real Twilio integration
 */
async function sendWebhookNotificationSMS(
  phoneNumber: string,
  eventType: WebhookEventType,
  eventData: any,
  userId: number
): Promise<boolean> {
  let message = "";
  let success = false;

  try {
    switch (eventType) {
      case "fraud_detected":
        message = `⚠️ ALERTA LUME: Possível fraude detectada. ${eventData.description}. Acesse o app para mais detalhes.`;
        success = await sendFraudAlertSMS(phoneNumber, eventData.description, userId);
        break;

      case "budget_limit_exceeded":
        message = `💰 LIMITE ATINGIDO: Você atingiu ${eventData.percentage}% do orçamento de ${eventData.category} (R$ ${eventData.limit.toFixed(2)}).`;
        success = await sendFraudAlertSMS(phoneNumber, message, userId);
        break;

      case "large_transaction":
        const typeText =
          eventData.type === "receita" ? "Entrada" : "Saída";
        message = `💳 TRANSAÇÃO: ${typeText} de R$ ${eventData.amount.toFixed(2)} - ${eventData.description}. Confirme se foi você.`;
        success = await sendTransactionAlertSMS(
          phoneNumber,
          eventData.description,
          eventData.amount,
          eventData.type,
          userId
        );
        break;

      case "unusual_activity":
        message = `🔔 ATIVIDADE INCOMUM: ${eventData.description}. ${eventData.details}`;
        success = await sendFraudAlertSMS(phoneNumber, message, userId);
        break;

      case "security_alert":
        message = `🔒 SEGURANÇA: ${eventData.description}. Ação recomendada: ${eventData.action}`;
        success = await sendFraudAlertSMS(phoneNumber, message, userId);
        break;

      case "recommendation_available":
        message = `💡 RECOMENDAÇÃO: ${eventData.title}. Acesse o app para mais detalhes.`;
        success = await sendFraudAlertSMS(phoneNumber, message, userId);
        break;

      default:
        throw new Error(`Unknown event type: ${eventType}`);
    }

    if (!success) {
      throw new Error(`Failed to send SMS via Twilio`);
    }

    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(
      `[Webhooks] Error sending SMS notification for ${eventType}:`,
      errorMsg
    );
    throw error;
  }
}

/**
 * Send webhook notification via Email with real SendGrid integration
 */
async function sendWebhookNotificationEmail(
  email: string,
  eventType: WebhookEventType,
  eventData: any,
  userId: number
): Promise<boolean> {
  let subject = "";
  let success = false;

  try {
    switch (eventType) {
      case "fraud_detected":
        subject = "⚠️ Alerta de Segurança - Lume";
        success = await sendFraudAlertEmail(
          email,
          eventData.description,
          undefined,
          userId
        );
        break;

      case "budget_limit_exceeded":
        subject = `💰 Limite de Orçamento Atingido - ${eventData.category}`;
        // Use fraud alert email as generic notification since there's no budget-specific email function
        const budgetMessage = `Você atingiu ${eventData.percentage}% do seu orçamento para ${eventData.category}. Limite: R$ ${eventData.limit.toFixed(2)}, Gasto: R$ ${eventData.spent.toFixed(2)}.`;
        success = await sendFraudAlertEmail(
          email,
          budgetMessage,
          undefined,
          userId
        );
        break;

      case "large_transaction":
        const typeText =
          eventData.type === "receita" ? "Entrada" : "Saída";
        subject = `💳 Transação Registrada - ${typeText} de R$ ${eventData.amount.toFixed(2)}`;
        success = await sendTransactionEmail(
          email,
          eventData.description,
          eventData.amount,
          eventData.type,
          eventData.category,
          undefined,
          userId
        );
        break;

      case "unusual_activity":
        subject = "🔔 Atividade Incomum Detectada - Lume";
        const unusualMessage = `${eventData.description}. Detalhes: ${eventData.details}`;
        success = await sendFraudAlertEmail(
          email,
          unusualMessage,
          undefined,
          userId
        );
        break;

      case "security_alert":
        subject = "🔒 Alerta de Segurança - Lume";
        const securityMessage = `${eventData.description}. Ação recomendada: ${eventData.action}`;
        success = await sendFraudAlertEmail(
          email,
          securityMessage,
          undefined,
          userId
        );
        break;

      case "recommendation_available":
        subject = `💡 ${eventData.title} - Lume`;
        // Use recommendation email function if available
        success = await sendRecommendationEmail(
          email,
          [eventData.description],
          eventData.type || "economia",
          undefined,
          userId
        );
        break;

      default:
        throw new Error(`Unknown event type: ${eventType}`);
    }

    if (!success) {
      throw new Error(`Failed to send email via SendGrid`);
    }

    console.log(
      `[Webhooks] Email sent successfully to ${email}: ${subject}`
    );
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(
      `[Webhooks] Error sending email notification for ${eventType}:`,
      errorMsg
    );
    throw error;
  }
}

/**
 * Retry failed webhook deliveries
 * Should be called periodically (e.g., every 5 minutes)
 */
export async function retryFailedWebhookEvents(): Promise<void> {
  try {
    const pendingEvents = await db.getPendingWebhookEvents();

    if (pendingEvents.length === 0) {
      return;
    }

    console.log(
      `[Webhooks] Retrying ${pendingEvents.length} pending webhook events`
    );

    for (const event of pendingEvents) {
      try {
        // Check if we've exceeded max attempts
        if ((event.deliveryAttempts || 0) >= MAX_DELIVERY_ATTEMPTS) {
          console.warn(
            `[Webhooks] Event ${event.id} exceeded max delivery attempts (${MAX_DELIVERY_ATTEMPTS}), marking as failed`
          );
          await db.updateWebhookEvent(event.id, {
            deliveryStatus: "failed",
            errorMessage: `Exceeded maximum delivery attempts (${MAX_DELIVERY_ATTEMPTS})`,
          });
          continue;
        }

        // Check if enough time has passed since last attempt
        const lastAttempt = event.lastAttemptAt
          ? new Date(event.lastAttemptAt).getTime()
          : 0;
        const timeSinceLastAttempt = Date.now() - lastAttempt;

        if (timeSinceLastAttempt < RETRY_DELAY_MS) {
          console.log(
            `[Webhooks] Event ${event.id} not ready for retry yet (${Math.round(
              (RETRY_DELAY_MS - timeSinceLastAttempt) / 1000
            )}s remaining)`
          );
          continue;
        }

        const webhook = await db.getUserWebhook(event.webhookId, event.userId);
        if (!webhook) {
          console.warn(
            `[Webhooks] Webhook ${event.webhookId} not found, marking event ${event.id} as failed`
          );
          await db.updateWebhookEvent(event.id, {
            deliveryStatus: "failed",
            errorMessage: "Webhook not found",
          });
          continue;
        }

        const eventData = JSON.parse(event.eventData);

        console.log(
          `[Webhooks] Retrying event ${event.id} (attempt ${(event.deliveryAttempts || 0) + 1}/${MAX_DELIVERY_ATTEMPTS})`
        );

        await deliverWebhookEvent(
          event.webhookId,
          event.id,
          event.userId,
          event.eventType as WebhookEventType,
          eventData,
          webhook.notificationMethod
        );
      } catch (error) {
        console.error(
          `[Webhooks] Error retrying event ${event.id}:`,
          error
        );
        // Don't throw, continue with next event
      }
    }
  } catch (error) {
    console.error("[Webhooks] Error retrying failed webhook events:", error);
  }
}

/**
 * Clear credential caches for a user (useful after credential update)
 */
export async function clearUserCredentialCaches(userId: number): Promise<void> {
  try {
    clearTwilioCache(userId);
    clearSendGridCache(userId);
    console.log(
      `[Webhooks] Credential caches cleared for user ${userId}`
    );
  } catch (error) {
    console.error(
      "[Webhooks] Error clearing credential caches:",
      error
    );
  }
}
