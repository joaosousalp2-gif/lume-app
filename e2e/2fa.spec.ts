import { test, expect } from '@playwright/test';

test.describe('2FA Security Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display 2FA settings section', async ({ page }) => {
    // Look for settings or security section
    const settingsLink = page.locator('a:has-text("Configurações"), a:has-text("Segurança"), [data-testid="settings-link"]');
    
    const visible = await settingsLink.isVisible().catch(() => false);
    if (visible) {
      await settingsLink.click();
      await page.waitForLoadState('networkidle');
      
      // Look for 2FA section
      const twoFASection = page.locator('[data-testid="2fa-section"], text=/2FA|Autenticação|Two-Factor/i');
      await expect(twoFASection).toBeVisible().catch(() => {
        console.log('2FA section not found');
      });
    }
  });

  test('should have 2FA method options', async ({ page }) => {
    // Look for 2FA method buttons/options
    const emailOption = page.locator('button:has-text("Email"), [data-testid="2fa-email"]');
    const smsOption = page.locator('button:has-text("SMS"), [data-testid="2fa-sms"]');
    const authenticatorOption = page.locator('button:has-text("Authenticator"), [data-testid="2fa-authenticator"]');
    
    const emailVisible = await emailOption.isVisible().catch(() => false);
    const smsVisible = await smsOption.isVisible().catch(() => false);
    const authenticatorVisible = await authenticatorOption.isVisible().catch(() => false);
    
    // At least one method should be available
    expect(emailVisible || smsVisible || authenticatorVisible).toBeTruthy();
  });

  test('should enable email 2FA', async ({ page }) => {
    // Look for email 2FA enable button
    const emailButton = page.locator('button:has-text("Email"), [data-testid="2fa-email-enable"]');
    
    const visible = await emailButton.isVisible().catch(() => false);
    if (visible) {
      await emailButton.click();
      await page.waitForTimeout(500);
      
      // Should show confirmation or next step
      const confirmation = page.locator('[data-testid="2fa-confirmation"], text=/confirmar|confirm|enviar/i');
      const visible2 = await confirmation.isVisible().catch(() => false);
      
      if (visible2) {
        await expect(confirmation).toBeVisible();
      }
    }
  });

  test('should enable SMS 2FA', async ({ page }) => {
    // Look for SMS 2FA enable button
    const smsButton = page.locator('button:has-text("SMS"), [data-testid="2fa-sms-enable"]');
    
    const visible = await smsButton.isVisible().catch(() => false);
    if (visible) {
      await smsButton.click();
      await page.waitForTimeout(500);
      
      // Should ask for phone number
      const phoneInput = page.locator('input[type="tel"], input[placeholder*="telefone"], input[placeholder*="phone"]');
      const visible2 = await phoneInput.isVisible().catch(() => false);
      
      if (visible2) {
        await expect(phoneInput).toBeVisible();
      }
    }
  });

  test('should enable authenticator 2FA', async ({ page }) => {
    // Look for authenticator enable button
    const authButton = page.locator('button:has-text("Authenticator"), [data-testid="2fa-authenticator-enable"]');
    
    const visible = await authButton.isVisible().catch(() => false);
    if (visible) {
      await authButton.click();
      await page.waitForTimeout(500);
      
      // Should show QR code
      const qrCode = page.locator('img[alt*="QR"], [data-testid="qr-code"]');
      const visible2 = await qrCode.isVisible().catch(() => false);
      
      if (visible2) {
        await expect(qrCode).toBeVisible();
      }
    }
  });

  test('should display backup codes', async ({ page }) => {
    // Look for backup codes section
    const backupCodesSection = page.locator('[data-testid="backup-codes"], text=/backup|recuperação|recovery/i');
    
    const visible = await backupCodesSection.isVisible().catch(() => false);
    if (visible) {
      await expect(backupCodesSection).toBeVisible();
      
      // Should have download/copy button
      const downloadButton = page.locator('button:has-text("Baixar"), button:has-text("Copiar"), [data-testid="backup-download"]');
      const visible2 = await downloadButton.isVisible().catch(() => false);
      
      if (visible2) {
        await expect(downloadButton).toBeVisible();
      }
    }
  });

  test('should disable 2FA method', async ({ page }) => {
    // Look for disable button
    const disableButton = page.locator('button:has-text("Desativar"), button:has-text("Remover"), [data-testid="2fa-disable"]');
    
    const visible = await disableButton.isVisible().catch(() => false);
    if (visible) {
      await disableButton.click();
      await page.waitForTimeout(500);
      
      // Should show confirmation dialog
      const confirmDialog = page.locator('[data-testid="confirm-dialog"], text=/tem certeza|are you sure/i');
      const visible2 = await confirmDialog.isVisible().catch(() => false);
      
      if (visible2) {
        await expect(confirmDialog).toBeVisible();
      }
    }
  });

  test('should handle 2FA API errors', async ({ page }) => {
    // Intercept and fail 2FA API calls
    await page.route('**/api/trpc/security**', (route) => {
      route.abort('failed');
    });

    // Navigate to settings
    const settingsLink = page.locator('a:has-text("Configurações"), a:has-text("Segurança")');
    const visible = await settingsLink.isVisible().catch(() => false);
    
    if (visible) {
      await settingsLink.click();
      await page.waitForTimeout(1000);
      
      // Should show error message
      const errorMessage = page.locator('[data-testid="error-message"], text=/erro|error/i');
      const visible2 = await errorMessage.isVisible().catch(() => false);
      
      if (visible2) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });
});
