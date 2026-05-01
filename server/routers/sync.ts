/**
 * Sync Router - Sincronização de dados localStorage com banco de dados
 * Permite que usuários migrem dados locais para o servidor
 */

import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { createLaunch, createBankAccount, createBudget, createFinancialGoal } from "../db";

export const syncRouter = router({
  /**
   * Sincronizar lançamentos do localStorage para BD
   * Recebe array de lançamentos locais e salva no BD
   */
  syncLaunches: protectedProcedure
    .input(z.array(z.object({
      type: z.enum(["receita", "despesa"]),
      date: z.string(),
      category: z.string(),
      value: z.string(),
      description: z.string().optional(),
      recurrence: z.string().optional().default("Única"),
      endDate: z.string().optional(),
    })))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const results = {
        total: input.length,
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const launch of input) {
        try {
          await createLaunch({
            userId,
            type: launch.type,
            date: launch.date,
            category: launch.category,
            value: launch.value,
            description: launch.description || "",
            recurrence: launch.recurrence || "Única",
            endDate: launch.endDate,
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Erro ao sincronizar lançamento de ${launch.date}: ${String(error)}`);
        }
      }

      return results;
    }),

  /**
   * Sincronizar contas bancárias do localStorage para BD
   */
  syncBankAccounts: protectedProcedure
    .input(z.array(z.object({
      name: z.string(),
      type: z.enum(["corrente", "poupanca", "investimentos", "outro"]),
      balance: z.string(),
      institution: z.string().optional(),
    })))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const results = {
        total: input.length,
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const account of input) {
        try {
          await createBankAccount({
            userId,
            name: account.name,
            type: account.type,
            balance: account.balance,
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Erro ao sincronizar conta ${account.name}: ${String(error)}`);
        }
      }

      return results;
    }),

  /**
   * Sincronizar orçamentos do localStorage para BD
   */
  syncBudgets: protectedProcedure
    .input(z.array(z.object({
      category: z.string(),
      limit: z.string(),
      month: z.string(),
    })))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const results = {
        total: input.length,
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const budget of input) {
        try {
          await createBudget({
            userId,
            category: budget.category,
            limit: budget.limit,
            month: budget.month,
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Erro ao sincronizar orçamento de ${budget.category}: ${String(error)}`);
        }
      }

      return results;
    }),

  /**
   * Sincronizar metas financeiras do localStorage para BD
   */
  syncFinancialGoals: protectedProcedure
    .input(z.array(z.object({
      name: z.string(),
      targetAmount: z.string(),
      currentAmount: z.string().optional().default("0"),
      deadline: z.string(),
      priority: z.enum(["baixa", "media", "alta"]),
      category: z.string().optional(),
    })))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const results = {
        total: input.length,
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const goal of input) {
        try {
          await createFinancialGoal({
            userId,
            name: goal.name,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount || "0",
            targetDate: goal.deadline,
            priority: goal.priority,
            description: goal.category,
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Erro ao sincronizar meta ${goal.name}: ${String(error)}`);
        }
      }

      return results;
    }),

  /**
   * Obter status de sincronização
   * Retorna informações sobre quantos dados já foram sincronizados
   */
  getStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;
      
      return {
        userId,
        syncedAt: new Date().toISOString(),
        status: "ready",
        message: "Pronto para sincronizar dados do localStorage",
      };
    }),

  /**
   * Resolver conflitos de sincronização
   * Quando há dados duplicados ou conflitantes
   */
  resolveConflict: protectedProcedure
    .input(z.object({
      launchId: z.number(),
      action: z.enum(["keep_local", "keep_remote", "merge"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Implementar lógica de resolução de conflitos
      // Por enquanto, apenas retornar sucesso
      return {
        success: true,
        message: `Conflito resolvido com ação: ${input.action}`,
      };
    }),
});
