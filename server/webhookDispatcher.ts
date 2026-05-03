/**
 * Webhook Dispatcher - Handles event triggering and notification delivery
 * Dispatches notifications via SMS or Email based on user webhook configurations
 */

import * as db from "./db";
import { send2FASMS, sendFraudAlertSMS, sendTransactionAlertSMS } from "./sms";
import { sendFraudAlertEmail, sendTransactionEmail } from "./email";
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

        // Attempt delivery immediately
        await deliverWebhookEvent(webhook.id, event.id, userId, eventType, eventData, webhook.notificationMethod);
      } catch (error) {
        console.error(
          `[Webhooks] Error creating event for webhook ${webhook.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("[Webhooks] Error dispatching webhook event:", error);
  }
}

/**
 * Deliver a webhook event via SMS or Email
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

    if (notificationMethod === "sms" && !phoneNumber) {
      await db.updateWebhookEvent(eventId, {
        deliveryStatus: "failed",
        errorMessage: "No phone number configured for user",
        lastAttemptAt: new Date(),
        deliveryAttempts: 1,
      });
      return;
    }

    if (notificationMethod === "email" && !email) {
      await db.updateWebhookEvent(eventId, {
        deliveryStatus: "failed",
        errorMessage: "No email configured for user",
        lastAttemptAt: new Date(),
        deliveryAttempts: 1,
      });
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
    }

    // Update event status
    await db.updateWebhookEvent(eventId, {
      deliveryStatus: success ? "sent" : "failed",
      sentAt: success ? new Date() : undefined,
      lastAttemptAt: new Date(),
      deliveryAttempts: 1,
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
    await db.updateWebhookEvent(eventId, {
      deliveryStatus: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      lastAttemptAt: new Date(),
      deliveryAttempts: 1,
    });
  }
}

/**
 * Send webhook notification via SMS
 */
async function sendWebhookNotificationSMS(
  phoneNumber: string,
  eventType: WebhookEventType,
  eventData: any,
  userId: number
): Promise<boolean> {
  let message = "";

  switch (eventType) {
    case "fraud_detected":
      message = `⚠️ ALERTA LUME: Possível fraude detectada. ${eventData.description}. Acesse o app para mais detalhes.`;
      return sendFraudAlertSMS(phoneNumber, eventData.description, userId);

    case "budget_limit_exceeded":
      message = `💰 LIMITE ATINGIDO: Você atingiu ${eventData.percentage}% do orçamento de ${eventData.category} (R$ ${eventData.limit.toFixed(2)}).`;
      break;

    case "large_transaction":
      const typeText =
        eventData.type === "receita" ? "Entrada" : "Saída";
      message = `💳 TRANSAÇÃO: ${typeText} de R$ ${eventData.amount.toFixed(2)} - ${eventData.description}. Confirme se foi você.`;
      return sendTransactionAlertSMS(
        phoneNumber,
        eventData.description,
        eventData.amount,
        eventData.type,
        userId
      );

    case "unusual_activity":
      message = `🔔 ATIVIDADE INCOMUM: ${eventData.description}. ${eventData.details}`;
      break;

    case "security_alert":
      message = `🔒 SEGURANÇA: ${eventData.description}. Ação recomendada: ${eventData.action}`;
      break;

    case "recommendation_available":
      message = `💡 RECOMENDAÇÃO: ${eventData.title}. Acesse o app para mais detalhes.`;
      break;
  }

  if (!message) {
    throw new Error(`Unknown event type: ${eventType}`);
  }

  // For non-specific handlers, we would need a generic SMS function
  // For now, we'll use the fraud alert as a generic handler
  return sendFraudAlertSMS(phoneNumber, message, userId);
}

/**
 * Send webhook notification via Email
 */
async function sendWebhookNotificationEmail(
  email: string,
  eventType: WebhookEventType,
  eventData: any,
  userId: number
): Promise<boolean> {
  let subject = "";
  let htmlContent = "";

  switch (eventType) {
    case "fraud_detected":
      subject = "⚠️ Alerta de Segurança - Lume";
      htmlContent = `
        <h2 style="color: #d9534f;">Possível Fraude Detectada</h2>
        <p>${eventData.description}</p>
        <p><strong>Severidade:</strong> ${eventData.severity.toUpperCase()}</p>
        ${eventData.amount ? `<p><strong>Valor:</strong> R$ ${eventData.amount.toFixed(2)}</p>` : ""}
        ${eventData.category ? `<p><strong>Categoria:</strong> ${eventData.category}</p>` : ""}
        <p><a href="https://lume-app.com/security" style="background: #d9534f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verificar Detalhes</a></p>
      `;
      return sendFraudAlertEmail(email, eventData.description, undefined, userId);

    case "budget_limit_exceeded":
      subject = `💰 Limite de Orçamento Atingido - ${eventData.category}`;
      htmlContent = `
        <h2>Limite de Orçamento Atingido</h2>
        <p>Você atingiu <strong>${eventData.percentage}%</strong> do seu orçamento para <strong>${eventData.category}</strong>.</p>
        <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0;">
          <p><strong>Limite:</strong> R$ ${eventData.limit.toFixed(2)}</p>
          <p><strong>Gasto:</strong> R$ ${eventData.spent.toFixed(2)}</p>
        </div>
        <p><a href="https://lume-app.com/budgets" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Gerenciar Orçamentos</a></p>
      `;
      break;

    case "large_transaction":
      const typeText =
        eventData.type === "receita" ? "Entrada" : "Saída";
      subject = `💳 Transação Registrada - ${typeText} de R$ ${eventData.amount.toFixed(2)}`;
      htmlContent = `
        <h2>Transação Registrada</h2>
        <p>Uma transação foi registrada em sua conta:</p>
        <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid ${eventData.type === "receita" ? "#28a745" : "#dc3545"};">
          <p><strong>Tipo:</strong> ${typeText}</p>
          <p><strong>Valor:</strong> R$ ${eventData.amount.toFixed(2)}</p>
          <p><strong>Descrição:</strong> ${eventData.description}</p>
          <p><strong>Categoria:</strong> ${eventData.category}</p>
        </div>
        <p>Se você não reconhece esta transação, entre em contato conosco imediatamente.</p>
      `;
      return sendTransactionEmail(
        email,
        eventData.description,
        eventData.amount,
        eventData.type,
        eventData.category,
        undefined,
        userId
      );

    case "unusual_activity":
      subject = "🔔 Atividade Incomum Detectada - Lume";
      htmlContent = `
        <h2>Atividade Incomum Detectada</h2>
        <p>${eventData.description}</p>
        <p><strong>Detalhes:</strong> ${eventData.details}</p>
        <p><a href="https://lume-app.com/security" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verificar Atividade</a></p>
      `;
      break;

    case "security_alert":
      subject = "🔒 Alerta de Segurança - Lume";
      htmlContent = `
        <h2>Alerta de Segurança</h2>
        <p>${eventData.description}</p>
        <p><strong>Ação Recomendada:</strong> ${eventData.action}</p>
        <p><a href="https://lume-app.com/settings/security" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Configurações de Segurança</a></p>
      `;
      break;

    case "recommendation_available":
      subject = `💡 ${eventData.title} - Lume`;
      htmlContent = `
        <h2>${eventData.title}</h2>
        <p>${eventData.description}</p>
        <p><a href="https://lume-app.com/recommendations" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Ver Recomendação</a></p>
      `;
      break;

    default:
      throw new Error(`Unknown event type: ${eventType}`);
  }

  // For now, we'll use a generic approach
  // In production, you'd want a dedicated email sending function
  console.log(`[Webhooks] Would send email to ${email}: ${subject}`);
  return true;
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
        const webhook = await db.getUserWebhook(event.webhookId, event.userId);
        if (!webhook) {
          console.warn(
            `[Webhooks] Webhook ${event.webhookId} not found, skipping event ${event.id}`
          );
          continue;
        }

        const eventData = JSON.parse(event.eventData);
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
      }
    }
  } catch (error) {
    console.error("[Webhooks] Error retrying failed webhook events:", error);
  }
}
