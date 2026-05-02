/**
 * Analytics helper for Plausible
 * Tracks events and page views
 */

const ANALYTICS_ENABLED = import.meta.env.VITE_ANALYTICS_ENABLED !== 'false';
const ANALYTICS_DOMAIN = import.meta.env.VITE_ANALYTICS_DOMAIN || 'lume-app.local';

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  if (!ANALYTICS_ENABLED) return;

  try {
    if (window.plausible) {
      window.plausible('pageview', {
        u: window.location.origin + path,
      });
    }
  } catch (error) {
    console.error('[Analytics] Error tracking page view:', error);
  }
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
) {
  if (!ANALYTICS_ENABLED) return;

  try {
    if (window.plausible) {
      window.plausible(eventName, {
        props: properties || {},
      });
    }
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
}

/**
 * Track financial transaction
 */
export function trackTransaction(
  type: 'receita' | 'despesa',
  category: string,
  amount: number
) {
  trackEvent('transaction', {
    type,
    category,
    amount: Math.round(amount),
  });
}

/**
 * Track 2FA action
 */
export function track2FAAction(action: 'enable' | 'disable' | 'verify', method: string) {
  trackEvent('2fa_action', {
    action,
    method,
  });
}

/**
 * Track AI recommendation view
 */
export function trackRecommendationView(type: 'economia' | 'investimento' | 'fraude' | 'planejamento') {
  trackEvent('recommendation_view', {
    type,
  });
}

/**
 * Track recommendation implementation
 */
export function trackRecommendationImplemented(type: string) {
  trackEvent('recommendation_implemented', {
    type,
  });
}

/**
 * Track document validation
 */
export function trackDocumentValidation(docType: 'cpf' | 'cnpj', isValid: boolean) {
  trackEvent('document_validation', {
    type: docType,
    valid: isValid,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(feature: string) {
  trackEvent('feature_usage', {
    feature,
  });
}

/**
 * Track error
 */
export function trackError(errorName: string, errorMessage?: string) {
  trackEvent('error', {
    name: errorName,
    message: errorMessage || 'Unknown error',
  });
}

/**
 * Extend window interface for Plausible
 */
declare global {
  interface Window {
    plausible?: (eventName: string, options?: any) => void;
  }
}
