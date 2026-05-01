/**
 * useDataSync - Hook para sincronizar dados do localStorage com banco de dados
 * Permite migração automática de dados locais para servidor
 */

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface SyncStatus {
  isLoading: boolean;
  isComplete: boolean;
  progress: number;
  totalItems: number;
  syncedItems: number;
  errors: string[];
  lastSyncedAt?: string;
}

export const useDataSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    isComplete: false,
    progress: 0,
    totalItems: 0,
    syncedItems: 0,
    errors: [],
  });

  const syncLaunchesMutation = trpc.sync.syncLaunches.useMutation();
  const syncBankAccountsMutation = trpc.sync.syncBankAccounts.useMutation();
  const syncBudgetsMutation = trpc.sync.syncBudgets.useMutation();
  const syncGoalsMutation = trpc.sync.syncFinancialGoals.useMutation();

  /**
   * Sincronizar todos os dados do localStorage para BD
   */
  const syncAllData = async () => {
    setSyncStatus((prev) => ({
      ...prev,
      isLoading: true,
      errors: [],
    }));

    try {
      const launches = JSON.parse(localStorage.getItem("lume_launches") || "[]");
      const bankAccounts = JSON.parse(localStorage.getItem("lume_bankAccounts") || "[]");
      const budgets = JSON.parse(localStorage.getItem("lume_budgets") || "[]");
      const goals = JSON.parse(localStorage.getItem("lume_goals") || "[]");

      const totalItems = launches.length + bankAccounts.length + budgets.length + goals.length;
      let syncedItems = 0;
      const errors: string[] = [];

      // Sincronizar lançamentos
      if (launches.length > 0) {
        try {
          const result = await syncLaunchesMutation.mutateAsync(launches);
          syncedItems += result.success;
          if (result.errors.length > 0) {
            errors.push(...result.errors);
          }
          setSyncStatus((prev) => ({
            ...prev,
            syncedItems,
            progress: Math.round((syncedItems / totalItems) * 100),
          }));
        } catch (error) {
          errors.push(`Erro ao sincronizar lançamentos: ${String(error)}`);
        }
      }

      // Sincronizar contas bancárias
      if (bankAccounts.length > 0) {
        try {
          const result = await syncBankAccountsMutation.mutateAsync(bankAccounts);
          syncedItems += result.success;
          if (result.errors.length > 0) {
            errors.push(...result.errors);
          }
          setSyncStatus((prev) => ({
            ...prev,
            syncedItems,
            progress: Math.round((syncedItems / totalItems) * 100),
          }));
        } catch (error) {
          errors.push(`Erro ao sincronizar contas: ${String(error)}`);
        }
      }

      // Sincronizar orçamentos
      if (budgets.length > 0) {
        try {
          const result = await syncBudgetsMutation.mutateAsync(budgets);
          syncedItems += result.success;
          if (result.errors.length > 0) {
            errors.push(...result.errors);
          }
          setSyncStatus((prev) => ({
            ...prev,
            syncedItems,
            progress: Math.round((syncedItems / totalItems) * 100),
          }));
        } catch (error) {
          errors.push(`Erro ao sincronizar orçamentos: ${String(error)}`);
        }
      }

      // Sincronizar metas
      if (goals.length > 0) {
        try {
          const result = await syncGoalsMutation.mutateAsync(goals);
          syncedItems += result.success;
          if (result.errors.length > 0) {
            errors.push(...result.errors);
          }
          setSyncStatus((prev) => ({
            ...prev,
            syncedItems,
            progress: Math.round((syncedItems / totalItems) * 100),
          }));
        } catch (error) {
          errors.push(`Erro ao sincronizar metas: ${String(error)}`);
        }
      }

      // Marcar como completo
      setSyncStatus((prev) => ({
        ...prev,
        isLoading: false,
        isComplete: true,
        errors,
        lastSyncedAt: new Date().toISOString(),
        progress: 100,
      }));

      // Limpar localStorage após sincronização bem-sucedida
      if (errors.length === 0) {
        localStorage.removeItem("lume_launches");
        localStorage.removeItem("lume_bankAccounts");
        localStorage.removeItem("lume_budgets");
        localStorage.removeItem("lume_goals");
        localStorage.setItem("lume_dataSynced", "true");
      }
    } catch (error) {
      setSyncStatus((prev) => ({
        ...prev,
        isLoading: false,
        errors: [String(error)],
      }));
    }
  };

  /**
   * Resetar status de sincronização
   */
  const resetSync = () => {
    setSyncStatus({
      isLoading: false,
      isComplete: false,
      progress: 0,
      totalItems: 0,
      syncedItems: 0,
      errors: [],
    });
  };

  /**
   * Verificar se há dados para sincronizar
   */
  const hasDataToSync = () => {
    const launches = localStorage.getItem("lume_launches");
    const bankAccounts = localStorage.getItem("lume_bankAccounts");
    const budgets = localStorage.getItem("lume_budgets");
    const goals = localStorage.getItem("lume_goals");

    return !!(launches || bankAccounts || budgets || goals);
  };

  /**
   * Obter quantidade de dados para sincronizar
   */
  const getDataToSyncCount = () => {
    const launches = JSON.parse(localStorage.getItem("lume_launches") || "[]").length;
    const bankAccounts = JSON.parse(localStorage.getItem("lume_bankAccounts") || "[]").length;
    const budgets = JSON.parse(localStorage.getItem("lume_budgets") || "[]").length;
    const goals = JSON.parse(localStorage.getItem("lume_goals") || "[]").length;

    return launches + bankAccounts + budgets + goals;
  };

  return {
    syncStatus,
    syncAllData,
    resetSync,
    hasDataToSync,
    getDataToSyncCount,
  };
};
