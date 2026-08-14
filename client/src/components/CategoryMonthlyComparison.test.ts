import { describe, expect, it } from "vitest";
import { compareCategoriesAcrossMonths } from "./CategoryMonthlyComparison";

describe("CategoryMonthlyComparison logic", () => {
  it("computes category differences and percentage change correctly", () => {
    const current = [
      { type: "despesa", category: "Alimentação", value: "120.00", date: "2026-08-10" },
      { type: "despesa", category: "Saúde", value: "300.00", date: "2026-08-12" },
    ];
    const previous = [
      { type: "despesa", category: "Alimentação", value: "100.00", date: "2026-07-10" },
      { type: "despesa", category: "Transporte", value: "50.00", date: "2026-07-15" },
    ];

    const result = compareCategoriesAcrossMonths(current, previous);
    const saude = result.find(r => r.category === "Saúde");
    const alimentacao = result.find(r => r.category === "Alimentação");
    const transporte = result.find(r => r.category === "Transporte");

    expect(saude?.current).toBe(300);
    expect(saude?.previous).toBe(0);
    expect(alimentacao?.percentChange).toBe(20);
    expect(transporte?.current).toBe(0);
    expect(transporte?.previous).toBe(50);
  });
});
