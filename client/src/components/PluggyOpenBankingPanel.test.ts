import { describe, expect, it } from "vitest";
import { formatPluggyImportSummary } from "@/lib/pluggyFeedback";

describe("Pluggy import feedback", () => {
  it("explains when new transactions were imported", () => {
    expect(formatPluggyImportSummary({ imported: 4, skipped: 2, accounts: 1 })).toContain("4 novas transações");
  });

  it("explains when the account was already synchronized", () => {
    expect(formatPluggyImportSummary({ imported: 0, skipped: 8, accounts: 2 })).toBe(
      "Tudo já estava sincronizado: não foram encontradas transações novas. 8 transações existentes e 2 contas foram verificadas."
    );
  });
});
