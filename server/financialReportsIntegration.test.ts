import { describe, expect, it, vi } from "vitest";
import { financialReportsRouter } from "./routers/financialReportsRouter";

// Mock db functions
vi.mock("./db", () => ({
  getLaunchesByUserAndMonth: vi.fn(async () => [
    {
      id: 1,
      userId: 1,
      type: "receita",
      date: "2026-08-01",
      category: "Salário",
      value: "5000",
      description: "Salário mensal",
    },
    {
      id: 2,
      userId: 1,
      type: "despesa",
      date: "2026-08-05",
      category: "Moradia",
      value: "1500",
      description: "Aluguel",
    },
  ]),
  getBudgetsByUserAndMonth: vi.fn(async () => [
    {
      id: 1,
      userId: 1,
      category: "Moradia",
      limit: "1500",
      month: "2026-08",
    },
  ]),
}));

describe("Financial Reports Router Integration", () => {
  const mockCtx = {
    user: { id: 1, openId: "test-user", role: "user" },
  };

  it("gets monthly summary successfully", async () => {
    const caller = financialReportsRouter.createCaller(mockCtx as any);
    const result = await caller.getMonthlySummary({ month: 8, year: 2026 });

    expect(result.success).toBe(true);
    expect(result.hasData).toBe(true);
    expect(result.analysis).toBeDefined();
    expect(result.analysis?.totalIncome).toBe(5000);
    expect(result.analysis?.totalExpenses).toBe(1500);
    expect(result.analysis?.balance).toBe(3500);
  });

  it("exports PDF successfully", async () => {
    const caller = financialReportsRouter.createCaller(mockCtx as any);
    const result = await caller.exportPDF({ month: 8, year: 2026 });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.base64).toBeTypeOf("string");
    expect(result.data?.filename).toBe("lume-relatorio-financeiro-2026-08.pdf");
    expect(result.data?.size).toBeGreaterThan(0);
  });
});
