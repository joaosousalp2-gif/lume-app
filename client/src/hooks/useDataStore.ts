/*
 * useDataStore — Lume
 * Hook customizado para sincronização em tempo real com o DataStore centralizado
 */

import { useEffect, useState } from "react";
import { calculateDerivedData, onDataChange, type DerivedData } from "@/lib/dataStore";

/**
 * Hook que fornece dados derivados e sincroniza automaticamente com mudanças
 */
export function useDataStore() {
  const [data, setData] = useState<DerivedData>(() => calculateDerivedData());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Registrar listener para mudanças
    const unsubscribe = onDataChange((newData) => {
      setData(newData);
    });

    // Limpar listener ao desmontar
    return () => unsubscribe();
  }, []);

  return { data, isLoading };
}

/**
 * Hook que fornece apenas dados do mês atual
 */
export function useCurrentMonthData() {
  const { data } = useDataStore();

  return {
    totalReceitas: data.totalReceitas,
    totalDespesas: data.totalDespesas,
    saldo: data.saldo,
    receitas: data.receitas,
    despesas: data.despesas,
  };
}

/**
 * Hook que fornece dados agrupados por categoria
 */
export function useCategoryData() {
  const { data } = useDataStore();

  return data.byCategory;
}

/**
 * Hook que fornece dados de tendências mensais
 */
export function useMonthlyTrends() {
  const { data } = useDataStore();

  return data.byMonth;
}
