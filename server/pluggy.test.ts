import { describe, expect, it } from "vitest";
import { createPluggyConnectToken, createPluggyItem, getPluggyItem, listPluggyAccounts, listPluggyConnectors, listPluggyTransactions, mapPluggyTransaction } from "./pluggy";

describe("Pluggy integration", () => {
  it("lists connectors with the configured server credentials", async () => {
    const response = await listPluggyConnectors(true);
    expect(Array.isArray(response.results)).toBe(true);
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results.some((connector) => Number(connector.id) === 2)).toBe(true);
  }, 20_000);

  it("creates a Connect Token for the official widget", async () => {
    const response = await createPluggyConnectToken({ clientUserId: "lume-integration-test", avoidDuplicates: true });
    expect(response.accessToken).toBeTruthy();
  }, 20_000);

  it("creates a Sandbox Item and reads real Pluggy account data", async () => {
    const connectors = await listPluggyConnectors(true);
    const connector = connectors.results.find((entry) => Number(entry.id) === 2);
    expect(connector).toBeTruthy();
    const item = await createPluggyItem({ connectorId: 2, user: "user-ok", password: "password-ok" });
    expect(item.id).toBeTruthy();

    let itemData: Record<string, unknown> = item;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      itemData = await getPluggyItem(item.id);
      const status = String(itemData.executionStatus ?? itemData.status ?? "");
      if (["SUCCESS", "PARTIAL_SUCCESS"].includes(status)) break;
      if (["FAILED", "LOGIN_ERROR", "ACCOUNT_LOCKED"].includes(status)) throw new Error(`Sandbox Item failed with ${status}`);
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }

    const accounts = await listPluggyAccounts(item.id);
    expect(accounts.results.length).toBeGreaterThan(0);
    const firstAccountId = String(accounts.results[0].id);
    const transactions = await listPluggyTransactions(firstAccountId);
    expect(Array.isArray(transactions.results)).toBe(true);
  }, 45_000);

  it("maps a Pluggy transaction to the Lume launch contract", () => {
    expect(mapPluggyTransaction({
      id: "txn-1",
      amount: -35.9,
      type: "DEBIT",
      date: "2026-08-13T00:00:00.000Z",
      category: "Food",
      description: "Mercado",
    })).toMatchObject({
      type: "despesa",
      date: "2026-08-13",
      category: "Food",
      value: "35.90",
      externalId: "txn-1",
      source: "pluggy",
    });
  });
});
