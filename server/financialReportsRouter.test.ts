import { describe, expect, it } from "vitest";
import { getPreviousPeriod } from "./routers/financialReportsRouter";

describe("Financial Reports Router Helpers", () => {
  it("calculates previous period correctly for standard months", () => {
    const prev = getPreviousPeriod(5, 2026);
    expect(prev).toEqual({ month: 4, year: 2026 });
  });

  it("calculates previous period correctly for January", () => {
    const prev = getPreviousPeriod(1, 2026);
    expect(prev).toEqual({ month: 12, year: 2025 });
  });
});
