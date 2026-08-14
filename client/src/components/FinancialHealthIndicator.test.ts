import { describe, expect, it } from "vitest";
import { calculateFinancialHealth } from "./FinancialHealthIndicator";

describe("Financial health indicator", () => {
  it("returns green when income covers expenses with a safe margin", () => {
    const result = calculateFinancialHealth([
      { type: "receita", value: "3000", date: "2026-08-05" },
      { type: "despesa", value: "1500", date: "2026-08-06" },
    ], "2026-08");
    expect(result.status).toBe("green");
    expect(result.balance).toBe(1500);
  });

  it("returns yellow when expenses approach income", () => {
    const result = calculateFinancialHealth([
      { type: "receita", value: "3000", date: "2026-08-05" },
      { type: "despesa", value: "2700", date: "2026-08-06" },
    ], "2026-08");
    expect(result.status).toBe("yellow");
  });

  it("returns red when expenses exceed income", () => {
    const result = calculateFinancialHealth([
      { type: "receita", value: "1000", date: "2026-08-05" },
      { type: "despesa", value: "1400", date: "2026-08-06" },
    ], "2026-08");
    expect(result.status).toBe("red");
  });
});
