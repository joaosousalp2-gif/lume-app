/**
 * Email helper using SendGrid with user-specific credentials
 */

import sgMail from '@sendgrid/mail';
import * as db from './db';
import { decryptData } from './encryption';

// Cache for SendGrid API keys (userId -> apiKey)
const sendgridKeys = new Map<number, string>();

/**
 * Get SendGrid API key for a specific user
 * Falls back to environment variables if no user integration found
 */
async function getSendGridApiKey(userId?: number): Promise<string | null> {
  try {
    // If userId provided, try to get user's SendGrid integration
    if (userId) {
      // Check cache first
      if (sendgridKeys.has(userId)) {
        return sendgridKeys.get(userId)!;
      }

      const integrations = await db.getUserIntegrations(userId);
      const sendgridIntegration = integrations.find(i => i.provider === 'sendgrid');

      if (sendgridIntegration) {
        // Decrypt credentials
        const credentials = JSON.parse(decryptData(sendgridIntegration.credentials));
        const apiKey = credentials.apiKey;

        // Cache the key
        sendgridKeys.set(userId, apiKey);
        return apiKey;
      }
    }

    // Fallback to environment variables
    return process.env.SENDGRID_API_KEY || null;
  } catch (error) {
    console.error('[Email] Error getting SendGrid API key:', error);
    return null;
  }
}

/**
 * Get SendGrid from email and name for a user
 */
async function getSendGridFromEmail(userId?: number): Promise<{ email: string; name: string }> {
  try {
    if (userId) {
      const integrations = await db.getUserIntegrations(userId);
      const sendgridIntegration = integrations.find(i => i.provider === 'sendgrid');

      if (sendgridIntegration) {
        const credentials = JSON.parse(decryptData(sendgridIntegration.credentials));
        return {
          email: credentials.fromEmail || 'noreply@lume-app.com',
          name: credentials.fromName || 'Lume App',
        };
      }
    }

    return {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@lume-app.com',
      name: 'Lume App',
    };
  } catch (error) {
    console.error('[Email] Error getting SendGrid from email:', error);
    return {
      email: 'noreply@lume-app.com',
      name: 'Lume App',
    };
  }
}

/**
 * Send 2FA email with code
 */
export async function send2FAEmail(
  toEmail: string,
  code: string,
  userName?: string,
  userId?: number
): Promise<boolean> {
  try {
    const apiKey = await getSendGridApiKey(userId);
    if (!apiKey) {
      console.warn('[Email] SendGrid not configured');
      return false;
    }

    sgMail.setApiKey(apiKey);
    const fromEmail = await getSendGridFromEmail(userId);

    const msg = {
      to: toEmail,
      from: { email: fromEmail.email, name: fromEmail.name },
      subject: 'Seu código de verificação Lume',
      html: `
        <h2>Verificação de Segurança</h2>
        <p>Olá ${userName || 'usuário'},</p>
        <p>Seu código de verificação é:</p>
        <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 2px;">${code}</h1>
        <p>Este código é válido por 10 minutos.</p>
        <p style="color: #999; font-size: 12px;">Se você não solicitou este código, ignore este email.</p>
      `,
    };

    await sgMail.send(msg);
    console.log(`[Email] 2FA email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Error sending 2FA email:', error);
    return false;
  }
}

/**
 * Send backup codes email
 */
export async function sendBackupCodesEmail(
  toEmail: string,
  codes: string[],
  userName?: string,
  userId?: number
): Promise<boolean> {
  try {
    const apiKey = await getSendGridApiKey(userId);
    if (!apiKey) {
      console.warn('[Email] SendGrid not configured');
      return false;
    }

    sgMail.setApiKey(apiKey);
    const fromEmail = await getSendGridFromEmail(userId);

    const codesHtml = codes
      .map((code) => `<li style="font-family: monospace; font-size: 14px;">${code}</li>`)
      .join('');

    const msg = {
      to: toEmail,
      from: { email: fromEmail.email, name: fromEmail.name },
      subject: 'Seus códigos de backup Lume',
      html: `
        <h2>Códigos de Backup</h2>
        <p>Olá ${userName || 'usuário'},</p>
        <p>Aqui estão seus 10 códigos de backup. Guarde-os em um local seguro.</p>
        <ul>
          ${codesHtml}
        </ul>
        <p style="color: #d9534f; font-weight: bold;">⚠️ Importante: Cada código pode ser usado apenas uma vez para recuperar acesso à sua conta.</p>
        <p style="color: #999; font-size: 12px;">Nunca compartilhe estes códigos com ninguém.</p>
      `,
    };

    await sgMail.send(msg);
    console.log(`[Email] Backup codes email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Error sending backup codes email:', error);
    return false;
  }
}

/**
 * Send transaction notification email
 */
export async function sendTransactionEmail(
  toEmail: string,
  description: string,
  amount: number,
  type: 'receita' | 'despesa',
  category: string,
  userName?: string,
  userId?: number
): Promise<boolean> {
  try {
    const apiKey = await getSendGridApiKey(userId);
    if (!apiKey) {
      console.warn('[Email] SendGrid not configured');
      return false;
    }

    sgMail.setApiKey(apiKey);
    const fromEmail = await getSendGridFromEmail(userId);

    const typeText = type === 'receita' ? 'Entrada' : 'Saída';
    const typeColor = type === 'receita' ? '#28a745' : '#dc3545';

    const msg = {
      to: toEmail,
      from: { email: fromEmail.email, name: fromEmail.name },
      subject: `Lume: ${typeText} de R$ ${amount.toFixed(2)}`,
      html: `
        <h2>Transação Registrada</h2>
        <p>Olá ${userName || 'usuário'},</p>
        <p>Uma transação foi registrada em sua conta:</p>
        <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid ${typeColor};">
          <p><strong>Tipo:</strong> ${typeText}</p>
          <p><strong>Valor:</strong> <span style="color: ${typeColor}; font-size: 18px;">R$ ${amount.toFixed(2)}</span></p>
          <p><strong>Descrição:</strong> ${description}</p>
          <p><strong>Categoria:</strong> ${category}</p>
        </div>
        <p style="color: #999; font-size: 12px;">Se você não reconhece esta transação, entre em contato conosco imediatamente.</p>
      `,
    };

    await sgMail.send(msg);
    console.log(`[Email] Transaction email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Error sending transaction email:', error);
    return false;
  }
}

/**
 * Send fraud alert email
 */
export async function sendFraudAlertEmail(
  toEmail: string,
  alertMessage: string,
  userName?: string,
  userId?: number
): Promise<boolean> {
  try {
    const apiKey = await getSendGridApiKey(userId);
    if (!apiKey) {
      console.warn('[Email] SendGrid not configured');
      return false;
    }

    sgMail.setApiKey(apiKey);
    const fromEmail = await getSendGridFromEmail(userId);

    const msg = {
      to: toEmail,
      from: { email: fromEmail.email, name: fromEmail.name },
      subject: '⚠️ Alerta de Segurança - Lume',
      html: `
        <h2 style="color: #d9534f;">⚠️ Alerta de Segurança</h2>
        <p>Olá ${userName || 'usuário'},</p>
        <p style="color: #d9534f; font-weight: bold;">Detectamos uma atividade suspeita em sua conta:</p>
        <p>${alertMessage}</p>
        <p><strong>Ações recomendadas:</strong></p>
        <ul>
          <li>Acesse o aplicativo Lume para mais detalhes</li>
          <li>Verifique suas transações recentes</li>
          <li>Altere sua senha se necessário</li>
          <li>Ative 2FA se ainda não estiver ativo</li>
        </ul>
        <p style="color: #999; font-size: 12px;">Se você não reconhece esta atividade, entre em contato conosco imediatamente.</p>
      `,
    };

    await sgMail.send(msg);
    console.log(`[Email] Fraud alert email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Error sending fraud alert email:', error);
    return false;
  }
}

/**
 * Send recommendation email
 */
export async function sendRecommendationEmail(
  toEmail: string,
  recommendations: string[],
  type: 'economia' | 'investimento' | 'fraude' | 'planejamento',
  userName?: string,
  userId?: number
): Promise<boolean> {
  try {
    const apiKey = await getSendGridApiKey(userId);
    if (!apiKey) {
      console.warn('[Email] SendGrid not configured');
      return false;
    }

    sgMail.setApiKey(apiKey);
    const fromEmail = await getSendGridFromEmail(userId);

    const typeText = {
      economia: 'Economia',
      investimento: 'Investimento',
      fraude: 'Segurança',
      planejamento: 'Planejamento',
    }[type];

    const recommendationsHtml = recommendations
      .map((rec) => `<li>${rec}</li>`)
      .join('');

    const msg = {
      to: toEmail,
      from: { email: fromEmail.email, name: fromEmail.name },
      subject: `Lume: Recomendações de ${typeText}`,
      html: `
        <h2>Recomendações Personalizadas</h2>
        <p>Olá ${userName || 'usuário'},</p>
        <p>Com base em sua análise financeira, temos as seguintes recomendações de <strong>${typeText}</strong>:</p>
        <ul>
          ${recommendationsHtml}
        </ul>
        <p><a href="https://lume-app.com/recommendations" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Ver Detalhes</a></p>
        <p style="color: #999; font-size: 12px;">Você recebeu este email porque ativou notificações de recomendações.</p>
      `,
    };

    await sgMail.send(msg);
    console.log(`[Email] Recommendation email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Error sending recommendation email:', error);
    return false;
  }
}

/**
 * Clear SendGrid API key cache for a user (useful after credential update)
 */
export function clearSendGridCache(userId: number) {
  sendgridKeys.delete(userId);
  console.log(`[Email] SendGrid cache cleared for user ${userId}`);
}
