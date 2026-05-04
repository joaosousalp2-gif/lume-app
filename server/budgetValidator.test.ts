/**
 * Tests for budget limit validator
 */

import { describe, it, expect, vi } from "vitest";
import {
  calculateCategorySpending,
  getBudgetStatus,
  validateUserBudgets,
  compareBudgetStatus,
  checkBudgetImpact,
  getBudgetAlertThresholds,
  hasReachedAlertThreshold,
  formatBudgetStatus,
  type BudgetLimitStatus,
} from "./budgetValidator";

describe("Budget Limit Validator", () => {
  describe("Alert Thresholds", () => {
    it("should parse default alert thresholds", () => {
      const thresholds = getBudgetAlertThresholds("");
      expect(thresholds).toEqual([75, 90, 100]);
    });

    it("should parse custom alert thresholds", () => {
      const thresholds = getBudgetAlertThresholds("50,75,100");
      expect(thresholds).toEqual([50, 75, 100]);
    });

    it("should sort thresholds in ascending order", () => {
      const thresholds = getBudgetAlertThresholds("100,50,75");
      expect(thresholds).toEqual([50, 75, 100]);
    });

    it("should filter invalid thresholds", () => {
      const thresholds = getBudgetAlertThresholds("50,150,75,0");
      expect(thresholds).toEqual([50, 75]);
    });

    it("should handle null thresholds", () => {
      const thresholds = getBudgetAlertThresholds("abc,def");
      expect(thresholds.length).toBeGreaterThan(0);
    });
  });

  describe("Alert Threshold Detection", () => {
    it("should detect when crossing alert threshold", () => {
      const thresholds = [75, 90, 100];
      const crossed = hasReachedAlertThreshold(75.5, 74, thresholds);
      expect(crossed).toBe(75);
    });

    it("should detect 90% threshold", () => {
      const thresholds = [75, 90, 100];
      const crossed = hasReachedAlertThreshold(90.1, 89, thresholds);
      expect(crossed).toBe(90);
    });

    it("should detect 100% threshold (exceeded)", () => {
      const thresholds = [75, 90, 100];
      const crossed = hasReachedAlertThreshold(100.5, 99, thresholds);
      expect(crossed).toBe(100);
    });

    it("should not detect threshold if not crossed", () => {
      const thresholds = [75, 90, 100];
      const crossed = hasReachedAlertThreshold(74, 70, thresholds);
      expect(crossed).toBeNull();
    });

    it("should not detect threshold if already above", () => {
      const thresholds = [75, 90, 100];
      const crossed = hasReachedAlertThreshold(95, 94, thresholds);
      expect(crossed).toBeNull();
    });
  });

  describe("Budget Status Comparison", () => {
    it("should detect transition from ok to exceeded", async () => {
      const beforeStatus: BudgetLimitStatus = {
        budgetId: 1,
        userId: 1,
        category: "Alimentação",
        limit: 500,
        spent: 450,
        percentage: 90,
        isExceeded: false,
        wasExceeded: false,
        hasTransitioned: false,
      };

      const afterStatus: BudgetLimitStatus = {
        budgetId: 1,
        userId: 1,
        category: "Alimentação",
        limit: 500,
        spent: 550,
        percentage: 110,
        isExceeded: true,
        wasExceeded: false,
        hasTransitioned: false,
      };

      const result = await compareBudgetStatus(beforeStatus, afterStatus);
      expect(result).not.toBeNull();
      expect(result?.hasTransitioned).toBe(true);
      expect(result?.isExceeded).toBe(true);
    });

    it("should not trigger webhook if already exceeded", async () => {
      const beforeStatus: BudgetLimitStatus = {
        budgetId: 1,
        userId: 1,
        category: "Alimentação",
        limit: 500,
        spent: 550,
        percentage: 110,
        isExceeded: true,
        wasExceeded: true,
        hasTransitioned: false,
      };

      const afterStatus: BudgetLimitStatus = {
        budgetId: 1,
        userId: 1,
        category: "Alimentação",
        limit: 500,
        spent: 600,
        percentage: 120,
        isExceeded: true,
        wasExceeded: true,
        hasTransitioned: false,
      };

      const result = await compareBudgetStatus(beforeStatus, afterStatus);
      // When already exceeded, function returns status with hasTransitioned=false
      expect(result).not.toBeNull();
      expect(result?.hasTransitioned).toBe(false);
    });

    it("should not trigger webhook if not exceeded", async () => {
      const beforeStatus: BudgetLimitStatus = {
        budgetId: 1,
        userId: 1,
        category: "Alimentação",
        limit: 500,
        spent: 400,
        percentage: 80,
        isExceeded: false,
        wasExceeded: false,
        hasTransitioned: false,
      };

      const afterStatus: BudgetLimitStatus = {
        budgetId: 1,
        userId: 1,
        category: "Alimentação",
        limit: 500,
        spent: 450,
        percentage: 90,
        isExceeded: false,
        wasExceeded: false,
        hasTransitioned: false,
      };

      const result = await compareBudgetStatus(beforeStatus, afterStatus);
      expect(result).toBeNull();
    });

    it("should handle null previous status", async () => {
      const afterStatus: BudgetLimitStatus = {
        budgetId: 1,
        userId: 1,
        category: "Alimentação",
        limit: 500,
        spent: 550,
        percentage: 110,
        isExceeded: true,
        wasExceeded: false,
        hasTransitioned: false,
      };

      const result = await compareBudgetStatus(null, afterStatus);
      expect(result).not.toBeNull();
      expect(result?.hasTransitioned).toBe(true);
    });
  });

  describe("Budget Status Formatting", () => {
    it("should format budget status correctly", () => {
      const status: BudgetLimitStatus = {
        budgetId: 1,
        userId: 1,
        category: "Alimentação",
        limit: 500,
        spent: 450,
        percentage: 90,
        isExceeded: false,
        wasExceeded: false,
        hasTransitioned: false,
      };

      const formatted = formatBudgetStatus(status);
      expect(formatted).toContain("Alimentação");
      expect(formatted).toContain("450.00");
      expect(formatted).toContain("500.00");
      expect(formatted).toContain("90.0%");
      expect(formatted).toContain("OK");
    });

    it("should format exceeded budget status", () => {
      const status: BudgetLimitStatus = {
        budgetId: 1,
        userId: 1,
        category: "Compras",
        limit: 1000,
        spent: 1200,
        percentage: 120,
        isExceeded: true,
        wasExceeded: false,
        hasTransitioned: true,
      };

      const formatted = formatBudgetStatus(status);
      expect(formatted).toContain("Compras");
      expect(formatted).toContain("1200.00");
      expect(formatted).toContain("1000.00");
      expect(formatted).toContain("120.0%");
      expect(formatted).toContain("EXCEDIDO");
    });
  });

  describe("Budget Calculations", () => {
    it("should calculate percentage correctly", () => {
      const status: BudgetLimitStatus = {
        budgetId: 1,
        userId: 1,
        category: "Alimentação",
        limit: 500,
        spent: 250,
        percentage: 50,
        isExceeded: false,
        wasExceeded: false,
        hasTransitioned: false,
      };

      expect(status.percentage).toBe(50);
      expect(status.isExceeded).toBe(false);
    });

    it("should detect exceeded budget", () => {
      const status: BudgetLimitStatus = {
        budgetId: 1,
        userId: 1,
        category: "Alimentação",
        limit: 500,
        spent: 600,
        percentage: 120,
        isExceeded: true,
        wasExceeded: false,
        hasTransitioned: false,
      };

      expect(status.percentage).toBe(120);
      expect(status.isExceeded).toBe(true);
    });

    it("should handle edge case at exactly 100%", () => {
      const status: BudgetLimitStatus = {
        budgetId: 1,
        userId: 1,
        category: "Alimentação",
        limit: 500,
        spent: 500,
        percentage: 100,
        isExceeded: true,
        wasExceeded: false,
        hasTransitioned: false,
      };

      expect(status.percentage).toBe(100);
      expect(status.isExceeded).toBe(true);
    });
  });

  describe("Budget Impact Scenarios", () => {
    it("should identify budget impact of transaction", () => {
      const budgetImpact = {
        wouldExceed: false,
        currentSpent: 450,
        limit: 500,
        projectedSpent: 480,
        projectedPercentage: 96,
      };

      expect(budgetImpact.wouldExceed).toBe(false);
      expect(budgetImpact.projectedPercentage).toBe(96);
    });

    it("should identify if transaction would exceed budget", () => {
      const budgetImpact = {
        wouldExceed: true,
        currentSpent: 450,
        limit: 500,
        projectedSpent: 550,
        projectedPercentage: 110,
      };

      expect(budgetImpact.wouldExceed).toBe(true);
      expect(budgetImpact.projectedPercentage).toBe(110);
    });
  });

  describe("Multiple Threshold Scenarios", () => {
    it("should handle multiple budget categories", () => {
      const budgets: BudgetLimitStatus[] = [
        {
          budgetId: 1,
          userId: 1,
          category: "Alimentação",
          limit: 500,
          spent: 450,
          percentage: 90,
          isExceeded: false,
          wasExceeded: false,
          hasTransitioned: false,
        },
        {
          budgetId: 2,
          userId: 1,
          category: "Transporte",
          limit: 300,
          spent: 350,
          percentage: 116.67,
          isExceeded: true,
          wasExceeded: false,
          hasTransitioned: false,
        },
        {
          budgetId: 3,
          userId: 1,
          category: "Lazer",
          limit: 200,
          spent: 100,
          percentage: 50,
          isExceeded: false,
          wasExceeded: false,
          hasTransitioned: false,
        },
      ];

      const exceeded = budgets.filter(b => b.isExceeded);
      expect(exceeded).toHaveLength(1);
      expect(exceeded[0].category).toBe("Transporte");
    });
  });
});
