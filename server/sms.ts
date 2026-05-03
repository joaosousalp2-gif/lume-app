/**
 * SMS helper using Twilio with user-specific credentials
 */

import twilio from 'twilio';
import * as db from './db';
import { decryptData } from './encryption';

// Cache for Twilio clients (userId -> client)
const twilioClients = new Map<number, ReturnType<typeof twilio>>();

/**
 * Get Twilio client for a specific user
 * Falls back to environment variables if no user integration found
 */
async function getTwilioClient(userId?: number) {
  try {
    // If userId provided, try to get user's Twilio integration
    if (userId) {
      const integrations = await db.getUserIntegrations(userId);
      const twilioIntegration = integrations.find(i => i.provider === 'twilio');

      if (twilioIntegration) {
        // Check cache first
        if (twilioClients.has(userId)) {
          return twilioClients.get(userId)!;
        }

        // Decrypt credentials
        const credentials = JSON.parse(decryptData(twilioIntegration.credentials));
        const client = twilio(credentials.accountSid, credentials.authToken);

        // Cache the client
        twilioClients.set(userId, client);
        return client;
      }
    }

    // Fallback to environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.warn('[SMS] Twilio credentials not configured');
      return null;
    }

    return twilio(accountSid, authToken);
  } catch (error) {
    console.error('[SMS] Error getting Twilio client:', error);
    return null;
  }
}

/**
 * Get Twilio phone number for a user
 */
async function getTwilioPhoneNumber(userId?: number): Promise<string | null> {
  try {
    if (userId) {
      const integrations = await db.getUserIntegrations(userId);
      const twilioIntegration = integrations.find(i => i.provider === 'twilio');

      if (twilioIntegration) {
        const credentials = JSON.parse(decryptData(twilioIntegration.credentials));
        return credentials.phoneNumber || null;
      }
    }

    return process.env.TWILIO_PHONE_NUMBER || null;
  } catch (error) {
    console.error('[SMS] Error getting Twilio phone number:', error);
    return null;
  }
}

/**
 * Send 2FA SMS code
 */
export async function send2FASMS(
  phoneNumber: string,
  code: string,
  userId?: number
): Promise<boolean> {
  try {
    const client = await getTwilioClient(userId);
    const fromNumber = await getTwilioPhoneNumber(userId);

    if (!client || !fromNumber) {
      console.warn('[SMS] Cannot send SMS: Twilio not configured');
      return false;
    }

    const message = await client.messages.create({
      body: `Seu código de verificação Lume é: ${code}. Válido por 10 minutos.`,
      from: fromNumber,
      to: phoneNumber,
    });

    console.log(`[SMS] 2FA SMS sent: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('[SMS] Error sending 2FA SMS:', error);
    return false;
  }
}

/**
 * Send backup codes SMS
 */
export async function sendBackupCodesSMS(
  phoneNumber: string,
  codes: string[],
  userId?: number
): Promise<boolean> {
  try {
    const client = await getTwilioClient(userId);
    const fromNumber = await getTwilioPhoneNumber(userId);

    if (!client || !fromNumber) {
      console.warn('[SMS] Cannot send SMS: Twilio not configured');
      return false;
    }

    const codesText = codes.slice(0, 3).join(', ');
    const message = await client.messages.create({
      body: `Seus códigos de backup Lume (primeiros 3): ${codesText}. Guarde em local seguro.`,
      from: fromNumber,
      to: phoneNumber,
    });

    console.log(`[SMS] Backup codes SMS sent: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('[SMS] Error sending backup codes SMS:', error);
    return false;
  }
}

/**
 * Send transaction alert SMS
 */
export async function sendTransactionAlertSMS(
  phoneNumber: string,
  description: string,
  amount: number,
  type: 'receita' | 'despesa',
  userId?: number
): Promise<boolean> {
  try {
    const client = await getTwilioClient(userId);
    const fromNumber = await getTwilioPhoneNumber(userId);

    if (!client || !fromNumber) {
      console.warn('[SMS] Cannot send SMS: Twilio not configured');
      return false;
    }

    const typeText = type === 'receita' ? 'Entrada' : 'Saída';
    const message = await client.messages.create({
      body: `Lume: ${typeText} de R$ ${amount.toFixed(2)} - ${description}. Confirme se foi você.`,
      from: fromNumber,
      to: phoneNumber,
    });

    console.log(`[SMS] Transaction alert SMS sent: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('[SMS] Error sending transaction alert SMS:', error);
    return false;
  }
}

/**
 * Send fraud alert SMS
 */
export async function sendFraudAlertSMS(
  phoneNumber: string,
  alertMessage: string,
  userId?: number
): Promise<boolean> {
  try {
    const client = await getTwilioClient(userId);
    const fromNumber = await getTwilioPhoneNumber(userId);

    if (!client || !fromNumber) {
      console.warn('[SMS] Cannot send SMS: Twilio not configured');
      return false;
    }

    const message = await client.messages.create({
      body: `⚠️ ALERTA LUME: ${alertMessage}. Acesse o app para mais detalhes.`,
      from: fromNumber,
      to: phoneNumber,
    });

    console.log(`[SMS] Fraud alert SMS sent: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('[SMS] Error sending fraud alert SMS:', error);
    return false;
  }
}

/**
 * Clear Twilio client cache for a user (useful after credential update)
 */
export function clearTwilioCache(userId: number) {
  twilioClients.delete(userId);
  console.log(`[SMS] Twilio cache cleared for user ${userId}`);
}
