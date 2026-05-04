/**
 * SMS helper using Twilio
 */

import twilio from 'twilio';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: ReturnType<typeof twilio> | null = null;

/**
 * Initialize Twilio client
 */
function getTwilioClient() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn('[SMS] Twilio credentials not configured');
    return null;
  }

  if (!twilioClient) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }

  return twilioClient;
}

/**
 * Send 2FA SMS code
 */
export async function send2FASMS(
  phoneNumber: string,
  code: string
): Promise<boolean> {
  try {
    const client = getTwilioClient();
    if (!client || !TWILIO_PHONE_NUMBER) {
      console.warn('[SMS] Cannot send SMS: Twilio not configured');
      return false;
    }

    const message = await client.messages.create({
      body: `Seu código de verificação Lume é: ${code}. Válido por 10 minutos.`,
      from: TWILIO_PHONE_NUMBER,
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
  codes: string[]
): Promise<boolean> {
  try {
    const client = getTwilioClient();
    if (!client || !TWILIO_PHONE_NUMBER) {
      console.warn('[SMS] Cannot send SMS: Twilio not configured');
      return false;
    }

    const codesText = codes.slice(0, 3).join(', ');
    const message = await client.messages.create({
      body: `Seus códigos de backup Lume (primeiros 3): ${codesText}. Guarde em local seguro.`,
      from: TWILIO_PHONE_NUMBER,
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
  type: 'receita' | 'despesa'
): Promise<boolean> {
  try {
    const client = getTwilioClient();
    if (!client || !TWILIO_PHONE_NUMBER) {
      console.warn('[SMS] Cannot send SMS: Twilio not configured');
      return false;
    }

    const typeText = type === 'receita' ? 'Entrada' : 'Saída';
    const message = await client.messages.create({
      body: `Lume: ${typeText} de R$ ${amount.toFixed(2)} - ${description}. Confirme se foi você.`,
      from: TWILIO_PHONE_NUMBER,
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
  alertMessage: string
): Promise<boolean> {
  try {
    const client = getTwilioClient();
    if (!client || !TWILIO_PHONE_NUMBER) {
      console.warn('[SMS] Cannot send SMS: Twilio not configured');
      return false;
    }

    const message = await client.messages.create({
      body: `⚠️ ALERTA LUME: ${alertMessage}. Acesse o app para mais detalhes.`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log(`[SMS] Fraud alert SMS sent: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('[SMS] Error sending fraud alert SMS:', error);
    return false;
  }
}
