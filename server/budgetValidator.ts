/**
 * Budget Limit Validator - Validates budget limits and triggers webhooks only when exceeded
 * Compares actual spending against budget limits and tracks state changes
 */

import * as db from "./db";
import { dispatchWebhookEvent } from "./webhookDispatcher";

export interface BudgetLimitStatus {
  budgetId: number;
  userId: number;
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  isExceeded: boolean;
  wasExceeded: boolean;
  hasTransitioned: boolean;
}

export interface BudgetValidationResult {
  budgets: BudgetLimitStatus[];
  exceedingBudgets: BudgetLimitStatus[];
  newlyExceededBudgets: BudgetLimitStatus[];
}

/**
 * Calculate total spending for a category in a given month
 */
export async function calculateCategorySpending(
  userId: number,
  category: string,
  month: string
): Promise<number> {
  try {
    const launches = await db.getLaunchesByUserCategoryMonth(userId, category, month);
    
    // Sum up all despesa (expenses) for this category
    const totalSpent = launches
      .filter(launch => launch.type === "despesa")
      .reduce((sum: number, launch: any) => {
        const value = parseFloat(launch.value);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);

    return totalSpent;
  } catch (error) {
    console.error(
      `[BudgetValidator] Error calculating spending for ${category}/${month}:`,
      error
    );
    return 0;
  }
}

/**
 * Get current budget status for a category
 */
export async function getBudgetStatus(
  userId: number,
  category: string,
  month: string
): Promise<BudgetLimitStatus | null> {
  try {
    const budget = await db.getBudgetForCategory(userId, category, month);
    if (!budget) {
      return null;
    }

    const limit = parseFloat(budget.limit);
    const spent = await calculateCategorySpending(userId, category, month);
    const percentage = (spent / limit) * 100;
    const isExceeded = spent > limit;

    return {
      budgetId: budget.id,
      userId,
      category,
      limit,
      spent,
      percentage,
      isExceeded,
      wasExceeded: false,
      hasTransitioned: false,
    };
  } catch (error) {
    console.error(
      `[BudgetValidator] Error getting budget status for ${category}/${month}:`,
      error
    );
    return null;
  }
}

/**
 * Get all budgets for a user in a month and validate them
 */
export async function validateUserBudgets(
  userId: number,
  month: string
): Promise<BudgetValidationResult> {
  try {
    const budgets = await db.getBudgetsByUserAndMonth(userId, month);
    const budgetStatuses: BudgetLimitStatus[] = [];
    const exceedingBudgets: BudgetLimitStatus[] = [];

    // Calculate status for each budget
    for (const budget of budgets) {
      const status = await getBudgetStatus(userId, budget.category, month);
      if (status) {
        budgetStatuses.push(status);
        if (status.isExceeded) {
          exceedingBudgets.push(status);
        }
      }
    }

    return {
      budgets: budgetStatuses,
      exceedingBudgets,
      newlyExceededBudgets: [],
    };
  } catch (error) {
    console.error(
      `[BudgetValidator] Error validating budgets for user ${userId}:`,
      error
    );
    return {
      budgets: [],
      exceedingBudgets: [],
      newlyExceededBudgets: [],
    };
  }
}

/**
 * Compare budget status before and after a transaction
 * Returns only newly exceeded budgets to avoid duplicate webhooks
 */
export async function compareBudgetStatus(
  beforeStatus: BudgetLimitStatus | null,
  afterStatus: BudgetLimitStatus
): Promise<BudgetLimitStatus | null> {
  try {
    const wasExceeded = beforeStatus?.isExceeded ?? false;
    const isNowExceeded = afterStatus.isExceeded;

    if (!wasExceeded && isNowExceeded) {
      return {
        ...afterStatus,
        wasExceeded,
        hasTransitioned: true,
      };
    }

    if (wasExceeded && isNowExceeded) {
      return {
        ...afterStatus,
        wasExceeded,
        hasTransitioned: false,
      };
    }

    return null;
  } catch (error) {
    console.error("[BudgetValidator] Error comparing budget status:", error);
    return null;
  }
}

/**
 * Check if a transaction would exceed any budget
 */
export async function checkBudgetImpact(
  userId: number,
  category: string,
  amount: number,
  month: string
): Promise<{
  wouldExceed: boolean;
  currentSpent: number;
  limit: number;
  projectedSpent: number;
  projectedPercentage: number;
} | null> {
  try {
    const budget = await db.getBudgetForCategory(userId, category, month);
    if (!budget) {
      return null;
    }

    const limit = parseFloat(budget.limit);
    const currentSpent = await calculateCategorySpending(userId, category, month);
    const projectedSpent = currentSpent + amount;
    const projectedPercentage = (projectedSpent / limit) * 100;
    const wouldExceed = projectedSpent > limit;

    return {
      wouldExceed,
      currentSpent,
      limit,
      projectedSpent,
      projectedPercentage,
    };
  } catch (error) {
    console.error(
      `[BudgetValidator] Error checking budget impact for ${category}/${month}:`,
      error
    );
    return null;
  }
}

/**
 * Validate and dispatch webhook for budget limit exceeded
 * Only dispatches if limit was just exceeded (transition from ok to exceeded)
 * Uses database to track notification state and prevent duplicates
 */
export async function validateAndDispatchBudgetWebhook(
  userId: number,
  category: string,
  month: string
): Promise<boolean> {
  try {
    // Get current budget status
    const currentStatus = await getBudgetStatus(userId, category, month);
    if (!currentStatus) {
      console.log(
        `[BudgetValidator] No budget found for ${category}/${month}`
      );
      return false;
    }

    // Check if budget is exceeded
    if (!currentStatus.isExceeded) {
      console.log(
        `[BudgetValidator] Budget for ${category} not exceeded (${currentStatus.percentage.toFixed(1)}%)`
      );
      return false;
    }

    // Check if we already notified for this budget in this month
    const previousNotification = await db.getBudgetLimitExceededNotification(
      userId,
      currentStatus.budgetId,
      month
    );

    // If already notified and webhook was dispatched, skip
    if (previousNotification && previousNotification.webhookDispatched) {
      console.log(
        `[BudgetValidator] Budget for ${category} already notified (${currentStatus.percentage.toFixed(1)}%)`
      );
      return false;
    }

    // Dispatch webhook for newly exceeded budget
    console.log(
      `[BudgetValidator] Budget for ${category} exceeded (${currentStatus.percentage.toFixed(1)}%), dispatching webhook`
    );

    await dispatchWebhookEvent(userId, "budget_limit_exceeded", {
      category,
      limit: currentStatus.limit,
      spent: currentStatus.spent,
      percentage: Math.round(currentStatus.percentage),
    }).catch(err => {
      console.error("[BudgetValidator] Error dispatching webhook:", err);
    });

    // Record notification in database
    if (previousNotification) {
      // Update existing notification
      await db.updateBudgetLimitExceededNotification(previousNotification.id, {
        webhookDispatched: true,
        dispatchedAt: new Date(),
        spentAmount: currentStatus.spent.toString(),
        percentage: Math.round(currentStatus.percentage),
      });
    } else {
      // Create new notification record
      await db.createBudgetLimitExceededNotification({
        userId,
        budgetId: currentStatus.budgetId,
        category,
        month,
        spentAmount: currentStatus.spent.toString(),
        limitAmount: currentStatus.limit.toString(),
        percentage: Math.round(currentStatus.percentage),
        webhookDispatched: true,
        dispatchedAt: new Date(),
      });
    }

    return true;
  } catch (error) {
    console.error(
      "[BudgetValidator] Error validating and dispatching budget webhook:",
      error
    );
    return false;
  }
}

/**
 * Get budget alert thresholds for a budget
 * Returns array of percentages at which to alert user
 */
export function getBudgetAlertThresholds(alertThresholdsStr: string): number[] {
  try {
    if (!alertThresholdsStr) {
      return [75, 90, 100];
    }

    const parsed = alertThresholdsStr
      .split(",")
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0 && n <= 100)
      .sort((a, b) => a - b);

    return parsed.length > 0 ? parsed : [75, 90, 100];
  } catch (error) {
    console.error("[BudgetValidator] Error parsing alert thresholds:", error);
    return [75, 90, 100];
  }
}

/**
 * Check if current percentage crosses any alert threshold
 */
export function hasReachedAlertThreshold(
  currentPercentage: number,
  previousPercentage: number,
  thresholds: number[]
): number | null {
  try {
    for (const threshold of thresholds) {
      if (previousPercentage < threshold && currentPercentage >= threshold) {
        return threshold;
      }
    }
    return null;
  } catch (error) {
    console.error("[BudgetValidator] Error checking alert threshold:", error);
    return null;
  }
}

/**
 * Format budget status for display
 */
export function formatBudgetStatus(status: BudgetLimitStatus): string {
  const percentageText = status.percentage.toFixed(1);
  const statusText = status.isExceeded ? "EXCEDIDO" : "OK";
  return `${status.category}: R$ ${status.spent.toFixed(2)} / R$ ${status.limit.toFixed(2)} (${percentageText}%) - ${statusText}`;
}
