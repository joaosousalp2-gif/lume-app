type AnnualLaunch = { type: "receita" | "despesa"; date: string; category: string; value: string };

export function buildAnnualFinancialSummary(launches: AnnualLaunch[], year: number) {
  const inYear = launches.filter((launch) => launch.date.startsWith(`${year}-`));
  const totalIncome = inYear.filter((launch) => launch.type === "receita").reduce((sum, launch) => sum + Number(launch.value.replace(",", ".")), 0);
  const totalExpenses = inYear.filter((launch) => launch.type === "despesa").reduce((sum, launch) => sum + Number(launch.value.replace(",", ".")), 0);
  const byCategory: Record<string, number> = {};
  for (const launch of inYear.filter((item) => item.type === "despesa")) byCategory[launch.category] = (byCategory[launch.category] ?? 0) + Number(launch.value.replace(",", "."));
  const monthly = Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, "0")}`;
    const items = inYear.filter((launch) => launch.date.startsWith(month));
    return {
      month,
      income: items.filter((item) => item.type === "receita").reduce((sum, item) => sum + Number(item.value.replace(",", ".")), 0),
      expenses: items.filter((item) => item.type === "despesa").reduce((sum, item) => sum + Number(item.value.replace(",", ".")), 0),
    };
  });
  return { year, totalIncome, totalExpenses, balance: totalIncome - totalExpenses, byCategory, monthly, hasData: inYear.length > 0 };
}
