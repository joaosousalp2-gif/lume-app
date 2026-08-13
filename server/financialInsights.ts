export type FinancialLaunch = {
  id: number;
  type: "receita" | "despesa";
  date: string;
  category: string;
  value: string;
  description: string | null;
};

export type RecurringExpense = {
  key: string;
  description: string;
  category: string;
  averageValue: number;
  occurrences: number;
  nextDate: string;
};

export type FinancialInsights = {
  currentBalance: number;
  projectedBalance30Days: number;
  recurringExpenses: RecurringExpense[];
  calendar: Array<{ date: string; title: string; value: number; type: "receita" | "despesa" }>;
};

function amount(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateValue(date: string): number {
  return new Date(`${date}T00:00:00`).getTime();
}

function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00`);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function detectRecurringExpenses(launches: FinancialLaunch[]): RecurringExpense[] {
  const groups = new Map<string, FinancialLaunch[]>();
  for (const launch of launches.filter((item) => item.type === "despesa")) {
    const description = (launch.description || launch.category).trim().toLocaleLowerCase("pt-BR");
    const key = `${description}|${launch.category}`;
    groups.set(key, [...(groups.get(key) ?? []), launch]);
  }

  return Array.from(groups.entries())
    .map(([key, group]) => {
      const sorted = [...group].sort((a, b) => dateValue(a.date) - dateValue(b.date));
      const intervals = sorted.slice(1).map((item, index) => (dateValue(item.date) - dateValue(sorted[index].date)) / 86_400_000);
      const hasMonthlyPattern = intervals.length > 0 && intervals.every((interval) => interval >= 20 && interval <= 45);
      if (sorted.length < 2 || !hasMonthlyPattern) return null;
      const averageValue = sorted.reduce((sum, item) => sum + amount(item.value), 0) / sorted.length;
      return {
        key,
        description: sorted[sorted.length - 1].description || sorted[sorted.length - 1].category,
        category: sorted[sorted.length - 1].category,
        averageValue,
        occurrences: sorted.length,
        nextDate: addDays(sorted[sorted.length - 1].date, Math.round(intervals[intervals.length - 1] || 30)),
      };
    })
    .filter((item): item is RecurringExpense => item !== null);
}

export function buildFinancialInsights(launches: FinancialLaunch[], referenceDate = today()): FinancialInsights {
  const currentBalance = launches.reduce((sum, launch) => sum + (launch.type === "receita" ? amount(launch.value) : -amount(launch.value)), 0);
  const recurringExpenses = detectRecurringExpenses(launches);
  const horizon = addDays(referenceDate, 30);
  const future = launches.filter((launch) => dateValue(launch.date) > dateValue(referenceDate) && dateValue(launch.date) <= dateValue(horizon));
  const recurringFuture = recurringExpenses.filter((item) => dateValue(item.nextDate) <= dateValue(horizon));
  const futureBalance = future.reduce((sum, launch) => sum + (launch.type === "receita" ? amount(launch.value) : -amount(launch.value)), 0);
  const recurringBalance = recurringFuture.reduce((sum, item) => sum - item.averageValue, 0);
  const calendar = [
    ...future.map((launch) => ({ date: launch.date, title: launch.description || launch.category, value: amount(launch.value), type: launch.type })),
    ...recurringFuture.map((item) => ({ date: item.nextDate, title: `${item.description} (recorrente)`, value: item.averageValue, type: "despesa" as const })),
  ].sort((a, b) => dateValue(a.date) - dateValue(b.date));
  return {
    currentBalance,
    projectedBalance30Days: currentBalance + futureBalance + recurringBalance,
    recurringExpenses,
    calendar,
  };
}

export function simulateMonthlySaving(projectedBalance: number, monthlySaving: number, months: number): number {
  const safeSaving = Number.isFinite(monthlySaving) && monthlySaving > 0 ? monthlySaving : 0;
  const safeMonths = Number.isFinite(months) && months > 0 ? Math.min(Math.floor(months), 120) : 0;
  return projectedBalance + safeSaving * safeMonths;
}
