import { describe, expect, it } from "vitest";
import { buildAnnualFinancialSummary } from "./annualFinancialSummary";

describe("annual financial summary", () => {
  it("aggregates only the requested year", () => {
    const result = buildAnnualFinancialSummary([
      { type: "receita", date: "2026-01-10", category: "Salário", value: "1000" },
      { type: "despesa", date: "2026-01-12", category: "Contas", value: "200" },
      { type: "despesa", date: "2025-12-12", category: "Contas", value: "999" },
    ], 2026);
    expect(result.hasData).toBe(true);
    expect(result.totalIncome).toBe(1000);
    expect(result.totalExpenses).toBe(200);
    expect(result.balance).toBe(800);
    expect(result.monthly[0].income).toBe(1000);
    expect(result.monthly[11].expenses).toBe(0);
  });
});
