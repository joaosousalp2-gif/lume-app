import { z } from "zod";
import { getBankAccountsByUserId, getChatHistory, getDocumentVaultByUserId, getFinancialGoalsByUserId, getLaunchesByUserId, getTrustedContactsByUserId, getUserPreferences, recordAuditLog } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const privacyRouter = router({
  exportData: protectedProcedure.query(async ({ ctx }) => {
    const [launches, accounts, goals, chat, contacts, documents, preferences] = await Promise.all([
      getLaunchesByUserId(ctx.user.id),
      getBankAccountsByUserId(ctx.user.id),
      getFinancialGoalsByUserId(ctx.user.id),
      getChatHistory(ctx.user.id, 500),
      getTrustedContactsByUserId(ctx.user.id),
      getDocumentVaultByUserId(ctx.user.id),
      getUserPreferences(ctx.user.id),
    ]);
    await recordAuditLog({ userId: ctx.user.id, action: "data_accessed", details: JSON.stringify({ purpose: "export" }), status: "success" });
    return {
      exportedAt: new Date().toISOString(),
      profile: { id: ctx.user.id, name: ctx.user.name, email: ctx.user.email },
      launches,
      accounts,
      goals,
      chat,
      contacts,
      documents,
      preferences,
    };
  }),

  requestDeletion: protectedProcedure
    .input(z.object({ confirmation: z.literal("ELIMINAR A MINHA CONTA") }))
    .mutation(async ({ ctx }) => {
      await recordAuditLog({ userId: ctx.user.id, action: "data_accessed", details: JSON.stringify({ purpose: "deletion_request", status: "pending_manual_review" }), status: "success" });
      return { success: true, status: "pending_manual_review" as const, message: "O pedido foi registado para revisão. Nenhum dado foi apagado automaticamente." };
    }),
});
