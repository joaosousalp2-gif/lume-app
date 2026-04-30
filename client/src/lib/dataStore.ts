/*
 * DataStore — Lume
 * Sistema centralizado de gestão de dados com Lançamentos como fonte central
 * Todos os componentes sincronizam com esta fonte de verdade
 */

export interface Launch {
  id: string;
  type: "receita" | "despesa";
  category: string;
  value: number;
  description: string;
  date: string;
  recurrence?: "unica" | "mensal" | "trimestral" | "anual";
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DerivedData {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  receitas: Launch[];
  despesas: Launch[];
  byCategory: Record<string, number>;
  byMonth: Record<string, { receitas: number; despesas: number }>;
}

// Listeners para sincronização em tempo real
type DataChangeListener = (data: DerivedData) => void;
const listeners: Set<DataChangeListener> = new Set();

/**
 * Carrega todos os lançamentos do localStorage
 */
export function getAllLaunches(): Launch[] {
  const stored = localStorage.getItem("lume_launches");
  return stored ? JSON.parse(stored) : [];
}

/**
 * Salva um novo lançamento e dispara atualização
 */
export function addLaunch(launch: Omit<Launch, "id" | "createdAt" | "updatedAt">): Launch {
  const launches = getAllLaunches();
  const newLaunch: Launch = {
    ...launch,
    id: `launch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  launches.push(newLaunch);
  localStorage.setItem("lume_launches", JSON.stringify(launches));
  notifyListeners();
  return newLaunch;
}

/**
 * Atualiza um lançamento existente
 */
export function updateLaunch(id: string, updates: Partial<Launch>): Launch | null {
  const launches = getAllLaunches();
  const index = launches.findIndex((l) => l.id === id);

  if (index === -1) return null;

  launches[index] = {
    ...launches[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem("lume_launches", JSON.stringify(launches));
  notifyListeners();
  return launches[index];
}

/**
 * Deleta um lançamento
 */
export function deleteLaunch(id: string): boolean {
  const launches = getAllLaunches();
  const filtered = launches.filter((l) => l.id !== id);

  if (filtered.length === launches.length) return false;

  localStorage.setItem("lume_launches", JSON.stringify(filtered));
  notifyListeners();
  return true;
}

/**
 * Calcula dados derivados a partir dos lançamentos
 * Esta é a função central que propaga dados para todos os componentes
 */
export function calculateDerivedData(): DerivedData {
  const launches = getAllLaunches();
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  // Filtrar lançamentos do mês atual
  const currentMonthLaunches = launches.filter((launch) => {
    const launchMonth = launch.date.substring(0, 7);
    return launchMonth === currentMonth;
  });

  // Separar receitas e despesas
  const receitas = currentMonthLaunches.filter((l) => l.type === "receita");
  const despesas = currentMonthLaunches.filter((l) => l.type === "despesa");

  // Calcular totais
  const totalReceitas = receitas.reduce((sum, l) => sum + l.value, 0);
  const totalDespesas = despesas.reduce((sum, l) => sum + l.value, 0);
  const saldo = totalReceitas - totalDespesas;

  // Agrupar por categoria
  const byCategory: Record<string, number> = {};
  currentMonthLaunches.forEach((launch) => {
    byCategory[launch.category] = (byCategory[launch.category] || 0) + launch.value;
  });

  // Agrupar por mês (últimos 12 meses)
  const byMonth: Record<string, { receitas: number; despesas: number }> = {};
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    byMonth[monthKey] = { receitas: 0, despesas: 0 };
  }

  launches.forEach((launch) => {
    const monthKey = launch.date.substring(0, 7);
    if (byMonth[monthKey]) {
      if (launch.type === "receita") {
        byMonth[monthKey].receitas += launch.value;
      } else {
        byMonth[monthKey].despesas += launch.value;
      }
    }
  });

  return {
    totalReceitas,
    totalDespesas,
    saldo,
    receitas,
    despesas,
    byCategory,
    byMonth,
  };
}

/**
 * Registra um listener para mudanças de dados
 * Usado pelos componentes para sincronizar em tempo real
 */
export function onDataChange(listener: DataChangeListener): () => void {
  listeners.add(listener);
  // Retornar função para remover listener
  return () => listeners.delete(listener);
}

/**
 * Notifica todos os listeners sobre mudanças
 */
function notifyListeners(): void {
  const data = calculateDerivedData();
  listeners.forEach((listener) => listener(data));
  // Disparar evento global para sincronização entre componentes
  window.dispatchEvent(new Event("lume_launches_updated"));
}

/**
 * Inicializa listeners para sincronização com eventos do navegador
 * Chamado uma vez quando o módulo é carregado
 */
export function initializeEventListeners(): void {
  if (typeof window === "undefined") return;
  
  // Sincronizar quando o evento lume_launches_updated é disparado
  window.addEventListener("lume_launches_updated", () => {
    notifyListeners();
  });
  
  // Sincronizar quando storage é alterado em outra aba
  window.addEventListener("storage", (e) => {
    if (e.key === "lume_launches") {
      notifyListeners();
    }
  });
}

/**
 * Calcula progresso em relação a uma meta
 */
export function calculateGoalProgress(
  goalType: "receita" | "despesa",
  goalValue: number
): { current: number; progress: number; status: "on-track" | "warning" | "exceeded" } {
  const data = calculateDerivedData();
  const current = goalType === "receita" ? data.totalReceitas : data.totalDespesas;
  const progress = (current / goalValue) * 100;

  let status: "on-track" | "warning" | "exceeded" = "on-track";
  if (goalType === "receita") {
    if (progress >= 100) status = "exceeded";
    else if (progress < 75) status = "warning";
  } else {
    if (progress >= 100) status = "exceeded";
    else if (progress > 75) status = "warning";
  }

  return { current, progress: Math.min(progress, 100), status };
}

/**
 * Gera relatório de tendências
 */
export function generateTrendReport(): {
  trend: "up" | "down" | "stable";
  percentageChange: number;
  recommendation: string;
} {
  const data = calculateDerivedData();
  const months = Object.entries(data.byMonth);

  if (months.length < 2) {
    return { trend: "stable", percentageChange: 0, recommendation: "Dados insuficientes para análise" };
  }

  const currentMonth = months[months.length - 1][1];
  const previousMonth = months[months.length - 2][1];

  const currentTotal = currentMonth.receitas - currentMonth.despesas;
  const previousTotal = previousMonth.receitas - previousMonth.despesas;

  const percentageChange = previousTotal === 0 ? 0 : ((currentTotal - previousTotal) / previousTotal) * 100;

  let trend: "up" | "down" | "stable" = "stable";
  let recommendation = "";

  if (percentageChange > 10) {
    trend = "up";
    recommendation = "Ótimo! Seus ganhos estão crescendo. Mantenha o ritmo!";
  } else if (percentageChange < -10) {
    trend = "down";
    recommendation = "Atenção! Seus gastos aumentaram. Revise suas despesas.";
  } else {
    trend = "stable";
    recommendation = "Sua situação financeira está estável.";
  }

  return { trend, percentageChange, recommendation };
}

/**
 * Detecta atividades suspeitas
 */
export function detectSuspiciousActivity(): {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
}[] {
  const launches = getAllLaunches();
  const alerts: { type: string; severity: "low" | "medium" | "high"; message: string }[] = [];

  // Detectar múltiplas exclusões em curto período
  const recentDeletes = launches.filter((l) => {
    const createdDate = new Date(l.createdAt);
    const now = new Date();
    return now.getTime() - createdDate.getTime() < 60000; // Últimos 60 segundos
  });

  if (recentDeletes.length > 5) {
    alerts.push({
      type: "bulk_delete",
      severity: "medium",
      message: "Múltiplas exclusões detectadas em curto período",
    });
  }

  // Detectar despesa anormalmente alta
  const data = calculateDerivedData();
  const avgDespesa = data.totalDespesas / (data.despesas.length || 1);
  const anomalyThreshold = avgDespesa * 3;

  data.despesas.forEach((despesa) => {
    if (despesa.value > anomalyThreshold) {
      alerts.push({
        type: "anomaly",
        severity: "low",
        message: `Despesa anormalmente alta detectada: R$ ${despesa.value.toFixed(2)} em ${despesa.category}`,
      });
    }
  });

  return alerts;
}

/**
 * Exporta dados para CSV
 */
export function exportToCSV(): string {
  const launches = getAllLaunches();
  const headers = ["ID", "Tipo", "Categoria", "Valor", "Descrição", "Data", "Recorrência", "Data de Criação"];
  const rows = launches.map((l) => [
    l.id,
    l.type,
    l.category,
    l.value.toFixed(2),
    l.description,
    l.date,
    l.recurrence || "N/A",
    l.createdAt,
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  return csv;
}

/**
 * Importa dados de CSV
 */
export function importFromCSV(csvContent: string): { success: number; errors: number } {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return { success: 0, errors: 0 };

  let success = 0;
  let errors = 0;

  for (let i = 1; i < lines.length; i++) {
    try {
      const [, type, category, value, description, date, recurrence] = lines[i]
        .split(",")
        .map((cell) => cell.replace(/"/g, ""));

      addLaunch({
        type: type as "receita" | "despesa",
        category,
        value: parseFloat(value),
        description,
        date,
        recurrence: recurrence !== "N/A" ? (recurrence as any) : undefined,
      });

      success++;
    } catch {
      errors++;
    }
  }

  return { success, errors };
}

/**
 * Limpa todos os dados (com confirmação)
 */
export function clearAllData(): void {
  localStorage.removeItem("lume_launches");
  notifyListeners();
}
