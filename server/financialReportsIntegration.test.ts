import { describe, expect, it, vi } from "vitest";
import { financialReportsRouter } from "./routers/financialReportsRouter";
import { storagePut } from "./storage";

// Mock db functions
vi.mock("./storage", () => ({
  storagePut: vi.fn(async () => ({
    key: "users/1/financial-reports/lume-relatorio-financeiro-2026-08.pdf",
    url: "/manus-storage/users/1/financial-reports/lume-relatorio-financeiro-2026-08.pdf",
  })),
}));

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
    expect(result.data?.downloadUrl).toBe("/manus-storage/users/1/financial-reports/lume-relatorio-financeiro-2026-08.pdf");
    expect(result.data?.filename).toBe("lume-relatorio-financeiro-2026-08.pdf");
    expect(result.data?.size).toBeGreaterThan(0);
    expect(storagePut).toHaveBeenCalledWith(
      "users/1/financial-reports/lume-relatorio-financeiro-2026-08.pdf",
      expect.any(Buffer),
      "application/pdf"
    );
  });
});
