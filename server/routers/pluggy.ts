import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createImportedLaunch, getLaunchesByUserId } from "../db";
import { createPluggyConnectToken, createPluggyItem, getPluggyItem, listPluggyAccounts, listPluggyConnectors, listPluggyTransactions, mapPluggyTransaction } from "../pluggy";

export const pluggyRouter = router({
  listConnectors: protectedProcedure.query(async () => {
    const response = await listPluggyConnectors(true);
    return (response.results ?? []).map((connector) => ({
      id: Number(connector.id),
      name: String(connector.name ?? (typeof connector.institution === "object" && connector.institution ? (connector.institution as Record<string, unknown>).name : undefined) ?? "Conector Pluggy"),
      institution: typeof connector.institution === "object" && connector.institution ? String((connector.institution as Record<string, unknown>).name ?? "") : "",
      type: String(connector.type ?? ""),
      status: String(connector.status ?? "ONLINE"),
    }));
  }),

  createConnectToken: protectedProcedure
    .input(z.object({
      itemId: z.string().uuid().optional(),
      oauthRedirectUri: z.string().url().optional(),
    }))
    .mutation(({ ctx, input }) => createPluggyConnectToken({
      itemId: input.itemId,
      clientUserId: String(ctx.user.id),
      oauthRedirectUri: input.oauthRedirectUri,
      avoidDuplicates: true,
    })),

  createSandboxItem: protectedProcedure
    .input(z.object({
      connectorId: z.number().int().positive(),
      user: z.string().min(1).max(128).default("user-ok"),
      password: z.string().min(1).max(128).default("password-ok"),
    }))
    .mutation(({ input }) => createPluggyItem(input)),

  getItem: protectedProcedure
    .input(z.object({ itemId: z.string().uuid() }))
    .query(({ input }) => getPluggyItem(input.itemId)),

  importTransactions: protectedProcedure
    .input(z.object({
      itemId: z.string().uuid(),
      accountId: z.string().uuid().optional(),
      from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const accounts = await listPluggyAccounts(input.itemId);
      const selectedAccounts = input.accountId ? accounts.results.filter((account) => account.id === input.accountId) : accounts.results;
      let imported = 0;
      let skipped = 0;
      let transactionCount = 0;

      for (const account of selectedAccounts) {
        if (typeof account.id !== "string") continue;
        const transactions = await listPluggyTransactions(account.id, input.from, input.to);
        for (const transaction of transactions.results ?? []) {
          transactionCount += 1;
          const mapped = mapPluggyTransaction(transaction);
          if (!mapped.externalId) continue;
          const result = await createImportedLaunch({
            userId: ctx.user.id,
            type: mapped.type,
            date: mapped.date,
            category: mapped.category,
            value: mapped.value,
            description: mapped.description,
            source: "pluggy",
            externalId: mapped.externalId,
            recurrence: "Única",
          });
          if (result.created) imported += 1;
          else skipped += 1;
        }
      }

      return { itemId: input.itemId, accounts: selectedAccounts.length, transactionCount, imported, skipped };
    }),

  importPreview: protectedProcedure
    .input(z.object({ itemId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const accounts = await listPluggyAccounts(input.itemId);
      const existingLaunches = await getLaunchesByUserId(ctx.user.id);
      return {
        accounts: accounts.results.map((account) => ({
          id: String(account.id),
          name: String(account.marketingName ?? account.name ?? "Conta Pluggy"),
          balance: Number(account.balance ?? 0),
          currencyCode: String(account.currencyCode ?? "BRL"),
        })),
        existingLaunchCount: existingLaunches.length,
      };
    }),
});
