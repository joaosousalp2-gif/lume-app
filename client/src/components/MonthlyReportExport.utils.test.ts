import { describe, expect, it } from "vitest";
import {
  formatChange,
  formatCurrency,
  getCurrentPeriod,
  parsePeriod,
} from "./MonthlyReportExport.utils";

describe("MonthlyReportExport utilities", () => {
  it("parses a month input into the tRPC period shape", () => {
    expect(parsePeriod("2026-08")).toEqual({ year: 2026, month: 8 });
  });

  it("formats the current period without relying on mutable component state", () => {
    expect(getCurrentPeriod(new Date("2026-08-13T12:00:00Z"))).toBe("2026-08");
  });

  it("formats positive, negative and unavailable comparisons", () => {
    expect(formatChange(120, 100)).toBe("+20%");
    expect(formatChange(80, 100)).toBe("-20%");
    expect(formatChange(80, 0)).toBeNull();
  });

  it("formats Brazilian currency consistently", () => {
    expect(formatCurrency(1250.5)).toContain("1.250,50");
  });
});
