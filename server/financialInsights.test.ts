import { describe, expect, it } from "vitest";
import { buildFinancialInsights, detectRecurringExpenses, simulateMonthlySaving } from "./financialInsights";

const recurring = [
  { id: 1, type: "despesa" as const, date: "2026-06-01", category: "Contas", value: "100.00", description: "Internet" },
  { id: 2, type: "despesa" as const, date: "2026-07-01", category: "Contas", value: "105.00", description: "Internet" },
  { id: 3, type: "despesa" as const, date: "2026-08-01", category: "Contas", value: "110.00", description: "Internet" },
];

describe("financial insights", () => {
  it("detects monthly recurring expenses", () => {
    const result = detectRecurringExpenses(recurring);
    expect(result).toHaveLength(1);
    expect(result[0].averageValue).toBe(105);
    expect(result[0].nextDate).toBe("2026-09-01");
  });

  it("builds a balance projection and calendar", () => {
    const result = buildFinancialInsights([
      ...recurring,
      { id: 4, type: "receita" as const, date: "2026-08-13", category: "Salário", value: "1000.00", description: "Salário" },
    ], "2026-08-13");
    expect(result.currentBalance).toBe(685);
    expect(result.projectedBalance30Days).toBe(580);
    expect(result.calendar.length).toBeGreaterThan(0);
  });

  it("simulates savings without mutating source data", () => {
    expect(simulateMonthlySaving(500, 100, 12)).toBe(1700);
    expect(simulateMonthlySaving(500, -100, 12)).toBe(500);
  });
});
