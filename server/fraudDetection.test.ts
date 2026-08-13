import { describe, expect, it } from "vitest";
import { detectSuspiciousTransactions } from "./fraudDetection";

describe("fraud detection", () => {
  it("detects a repeated transaction within 24 hours", () => {
    const alerts = detectSuspiciousTransactions([
      { id: 1, type: "despesa", date: "2026-08-10", category: "Supermercado", value: "35.00", description: "Compras" },
      { id: 2, type: "despesa", date: "2026-08-10", category: "Supermercado", value: "35.00", description: "Compras" },
    ]);
    expect(alerts.some((alert) => alert.severity === "high")).toBe(true);
  });

  it("detects a category value far above the user's own average", () => {
    const alerts = detectSuspiciousTransactions([
      { id: 1, type: "despesa", date: "2026-08-01", category: "Saúde", value: "20.00", description: "Farmácia" },
      { id: 2, type: "despesa", date: "2026-08-03", category: "Saúde", value: "25.00", description: "Farmácia" },
      { id: 3, type: "despesa", date: "2026-08-05", category: "Saúde", value: "30.00", description: "Farmácia" },
      { id: 4, type: "despesa", date: "2026-08-06", category: "Saúde", value: "1000.00", description: "Farmácia" },
    ]);
    expect(alerts.some((alert) => alert.title === "Valor fora do padrão")).toBe(true);
  });

  it("does not create alerts for income or isolated normal expenses", () => {
    const alerts = detectSuspiciousTransactions([
      { id: 1, type: "receita", date: "2026-08-01", category: "Salário", value: "1200.00", description: "Salário" },
      { id: 2, type: "despesa", date: "2026-08-02", category: "Transporte", value: "20.00", description: "Autocarro" },
    ]);
    expect(alerts).toHaveLength(0);
  });
});
