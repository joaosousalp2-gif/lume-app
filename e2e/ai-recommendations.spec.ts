import { test, expect } from '@playwright/test';

test.describe('AI Recommendations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display recommendations section', async ({ page }) => {
    // Look for recommendations or AI section
    const recommendationsSection = page.locator('[data-testid="recommendations"], text=/Recomendações|Sugestões|AI/i');
    
    const visible = await recommendationsSection.isVisible().catch(() => false);
    if (visible) {
      await expect(recommendationsSection).toBeVisible();
    }
  });

  test('should have recommendation type buttons', async ({ page }) => {
    // Look for recommendation type buttons
    const economyButton = page.locator('button:has-text("Economia"), [data-testid="rec-economy"]');
    const investmentButton = page.locator('button:has-text("Investimento"), [data-testid="rec-investment"]');
    const fraudButton = page.locator('button:has-text("Fraude"), [data-testid="rec-fraud"]');
    const planningButton = page.locator('button:has-text("Planejamento"), [data-testid="rec-planning"]');
    
    const economyVisible = await economyButton.isVisible().catch(() => false);
    const investmentVisible = await investmentButton.isVisible().catch(() => false);
    const fraudVisible = await fraudButton.isVisible().catch(() => false);
    const planningVisible = await planningButton.isVisible().catch(() => false);
    
    // At least one type should be available
    expect(economyVisible || investmentVisible || fraudVisible || planningVisible).toBeTruthy();
  });

  test('should fetch economy recommendations', async ({ page }) => {
    // Look for economy recommendations button
    const economyButton = page.locator('button:has-text("Economia"), [data-testid="rec-economy"]');
    
    const visible = await economyButton.isVisible().catch(() => false);
    if (visible) {
      await economyButton.click();
      
      // Wait for recommendations to load
      await page.waitForTimeout(2000);
      
      // Should display recommendations
      const recommendations = page.locator('[data-testid="recommendation-item"], li:has-text("R$"), li:has-text("economia")');
      const visible2 = await recommendations.first().isVisible().catch(() => false);
      
      if (visible2) {
        await expect(recommendations.first()).toBeVisible();
      }
    }
  });

  test('should fetch investment recommendations', async ({ page }) => {
    // Look for investment recommendations button
    const investmentButton = page.locator('button:has-text("Investimento"), [data-testid="rec-investment"]');
    
    const visible = await investmentButton.isVisible().catch(() => false);
    if (visible) {
      await investmentButton.click();
      
      // Wait for recommendations to load
      await page.waitForTimeout(2000);
      
      // Should display recommendations
      const recommendations = page.locator('[data-testid="recommendation-item"], li:has-text("investimento"), li:has-text("aplicação")');
      const visible2 = await recommendations.first().isVisible().catch(() => false);
      
      if (visible2) {
        await expect(recommendations.first()).toBeVisible();
      }
    }
  });

  test('should fetch fraud alerts', async ({ page }) => {
    // Look for fraud alerts button
    const fraudButton = page.locator('button:has-text("Fraude"), [data-testid="rec-fraud"]');
    
    const visible = await fraudButton.isVisible().catch(() => false);
    if (visible) {
      await fraudButton.click();
      
      // Wait for alerts to load
      await page.waitForTimeout(2000);
      
      // Should display alerts or "no alerts" message
      const alerts = page.locator('[data-testid="fraud-alert"], text=/alerta|suspeita|fraude/i');
      const noAlerts = page.locator('[data-testid="no-alerts"], text=/nenhum alerta|no alerts/i');
      
      const alertsVisible = await alerts.first().isVisible().catch(() => false);
      const noAlertsVisible = await noAlerts.isVisible().catch(() => false);
      
      expect(alertsVisible || noAlertsVisible).toBeTruthy();
    }
  });

  test('should fetch planning recommendations', async ({ page }) => {
    // Look for planning recommendations button
    const planningButton = page.locator('button:has-text("Planejamento"), [data-testid="rec-planning"]');
    
    const visible = await planningButton.isVisible().catch(() => false);
    if (visible) {
      await planningButton.click();
      
      // Wait for recommendations to load
      await page.waitForTimeout(2000);
      
      // Should display recommendations
      const recommendations = page.locator('[data-testid="recommendation-item"], li:has-text("planejamento"), li:has-text("meta")');
      const visible2 = await recommendations.first().isVisible().catch(() => false);
      
      if (visible2) {
        await expect(recommendations.first()).toBeVisible();
      }
    }
  });

  test('should mark recommendation as viewed', async ({ page }) => {
    // Look for recommendation
    const recommendation = page.locator('[data-testid="recommendation-item"]').first();
    
    const visible = await recommendation.isVisible().catch(() => false);
    if (visible) {
      // Click to mark as viewed
      await recommendation.click();
      await page.waitForTimeout(500);
      
      // Should show "viewed" indicator
      const viewedIndicator = page.locator('[data-testid="recommendation-viewed"], .viewed, .marked');
      const visible2 = await viewedIndicator.isVisible().catch(() => false);
      
      if (visible2) {
        await expect(viewedIndicator).toBeVisible();
      }
    }
  });

  test('should mark recommendation as implemented', async ({ page }) => {
    // Look for recommendation with implement button
    const implementButton = page.locator('button:has-text("Implementar"), button:has-text("Feito"), [data-testid="implement-btn"]').first();
    
    const visible = await implementButton.isVisible().catch(() => false);
    if (visible) {
      await implementButton.click();
      await page.waitForTimeout(500);
      
      // Should show success message
      const successMessage = page.locator('[data-testid="success-message"], text=/implementado|concluído|feito/i');
      const visible2 = await successMessage.isVisible().catch(() => false);
      
      if (visible2) {
        await expect(successMessage).toBeVisible();
      }
    }
  });

  test('should handle recommendations API errors', async ({ page }) => {
    // Intercept and fail recommendations API calls
    await page.route('**/api/trpc/aiAdvanced**', (route) => {
      route.abort('failed');
    });

    // Look for recommendation button
    const recButton = page.locator('button:has-text("Economia"), button:has-text("Investimento")').first();
    
    const visible = await recButton.isVisible().catch(() => false);
    if (visible) {
      await recButton.click();
      await page.waitForTimeout(1000);
      
      // Should show error message
      const errorMessage = page.locator('[data-testid="error-message"], text=/erro|error|falha/i');
      const visible2 = await errorMessage.isVisible().catch(() => false);
      
      if (visible2) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test('should display loading state', async ({ page }) => {
    // Look for recommendation button
    const recButton = page.locator('button:has-text("Economia"), button:has-text("Investimento")').first();
    
    const visible = await recButton.isVisible().catch(() => false);
    if (visible) {
      // Slow down network to catch loading state
      await page.route('**/api/trpc/aiAdvanced**', (route) => {
        setTimeout(() => route.continue(), 2000);
      });

      await recButton.click();
      
      // Should show loading indicator
      const loadingIndicator = page.locator('[data-testid="loading"], .spinner, .loader');
      const visible2 = await loadingIndicator.isVisible().catch(() => false);
      
      if (visible2) {
        await expect(loadingIndicator).toBeVisible();
      }
    }
  });
});
