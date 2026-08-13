import { describe, expect, it } from "vitest";
import {
  generateMonthlyRecommendations,
  generateMonthlyReportPDF,
} from "./financialReports";

describe("Monthly financial reports", () => {
  const analysis = {
    month: "agosto",
    year: 2026,
    totalIncome: 6000,
    totalExpenses: 4200,
    balance: 1800,
    categoryBreakdown: [
      { category: "Moradia", total: 1800, percentage: 43, transactionCount: 2 },
      { category: "Alimentação", total: 1200, percentage: 29, transactionCount: 8 },
      { category: "Transporte", total: 1200, percentage: 29, transactionCount: 4 },
    ],
    topExpenses: [
      {
        id: 1,
        description: "Aluguel",
        amount: 1800,
        type: "despesa" as const,
        category: "Moradia",
        date: new Date("2026-08-05"),
      },
    ],
    budgetComparison: [
      {
        category: "Alimentação",
        budgeted: 1000,
        spent: 1200,
        remaining: -200,
        percentage: 120,
      },
    ],
  };

  it("generates a valid PDF buffer with the monthly report", async () => {
    const recommendations = await generateMonthlyRecommendations(analysis);
    const buffer = await generateMonthlyReportPDF(analysis, recommendations);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("creates a high-priority recommendation for budget overages", async () => {
    const recommendations = await generateMonthlyRecommendations(analysis);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some((item) => item.priority === "high")).toBe(true);
    expect(recommendations.some((item) => item.estimatedSavings > 0)).toBe(true);
  });

  it("recognizes a positive monthly balance", async () => {
    const recommendations = await generateMonthlyRecommendations({
      ...analysis,
      budgetComparison: [],
      balance: 500,
    });

    expect(recommendations.some((item) => item.title.includes("superávit"))).toBe(true);
  });

  it("recognizes a monthly deficit", async () => {
    const recommendations = await generateMonthlyRecommendations({
      ...analysis,
      budgetComparison: [],
      balance: -250,
    });

    expect(recommendations.some((item) => item.title.includes("déficit"))).toBe(true);
  });

  it("generates a PDF without recommendations", async () => {
    const buffer = await generateMonthlyReportPDF(analysis, []);

    expect(buffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("handles previous analysis comparison correctly in PDF generation", async () => {
    const analysisWithPrev = {
      ...analysis,
      previousAnalysis: {
        totalIncome: 5500,
        totalExpenses: 4000,
        balance: 1500,
      },
    };
    const recommendations = await generateMonthlyRecommendations(analysisWithPrev);
    const buffer = await generateMonthlyReportPDF(analysisWithPrev, recommendations);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("handles long reports with multi-page pagination correctly", async () => {
    const manyCategories = Array.from({ length: 30 }, (_, index) => ({
      category: `Categoria ${index + 1}`,
      total: 100 + index * 10,
      percentage: 2,
      transactionCount: 2,
    }));
    const manyRecommendations = Array.from({ length: 15 }, (_, index) => ({
      title: `Recomendação ${index + 1}`,
      description: `Esta é uma descrição detalhada para a recomendação ${index + 1} para testar quebra de página automática no relatório PDF.`,
      priority: "medium" as const,
      estimatedSavings: 50,
    }));

    const longAnalysis = {
      ...analysis,
      categoryBreakdown: manyCategories,
    };

    const buffer = await generateMonthlyReportPDF(longAnalysis, manyRecommendations);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.toString("utf8", 0, 4)).toBe("%PDF");
  });
});
