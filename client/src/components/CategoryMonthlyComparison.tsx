import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Calendar, Layers } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function compareCategoriesAcrossMonths(
  currentLaunches: Array<{ type: string; category: string; value: string; date: string }>,
  previousLaunches: Array<{ type: string; category: string; value: string; date: string }>
) {
  const currentMap = new Map<string, number>();
  for (const l of currentLaunches) {
    if (l.type === "despesa") {
      const val = parseFloat(l.value) || 0;
      currentMap.set(l.category, (currentMap.get(l.category) || 0) + val);
    }
  }

  const previousMap = new Map<string, number>();
  for (const l of previousLaunches) {
    if (l.type === "despesa") {
      const val = parseFloat(l.value) || 0;
      previousMap.set(l.category, (previousMap.get(l.category) || 0) + val);
    }
  }

  const allCategories = Array.from(new Set([...Array.from(currentMap.keys()), ...Array.from(previousMap.keys())]));
  return allCategories.map((category) => {
    const current = currentMap.get(category) || 0;
    const previous = previousMap.get(category) || 0;
    const diff = current - previous;
    const percentChange = previous > 0 ? (diff / previous) * 100 : current > 0 ? 100 : 0;
    return {
      category,
      current,
      previous,
      diff,
      percentChange,
    };
  }).sort((a, b) => b.current - a.current);
}

export default function CategoryMonthlyComparison() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const currentQuery = trpc.financialReports.getMonthlySummary.useQuery({ month: selectedMonth, year: selectedYear });
  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  const previousQuery = trpc.financialReports.getMonthlySummary.useQuery({ month: prevMonth, year: prevYear });
  const launchesQuery = trpc.launches.list.useQuery();

  const comparison = useMemo(() => {
    const all = launchesQuery.data || [];
    const currentPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
    const prevPrefix = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;

    const currentLaunches = all.filter((l) => l.date?.startsWith(currentPrefix));
    const previousLaunches = all.filter((l) => l.date?.startsWith(prevPrefix));

    return compareCategoriesAcrossMonths(currentLaunches, previousLaunches);
  }, [launchesQuery.data, selectedMonth, selectedYear, prevMonth, prevYear]);

  const maxExpense = useMemo(() => {
    if (!comparison.length) return 1;
    return Math.max(...comparison.map((c) => Math.max(c.current, c.previous)), 1);
  }, [comparison]);

  return (
    <Card className="bg-white/95 p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-3 text-blue-700">
            <BarChart3 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Comparação Mensal por Categoria</h3>
            <p className="text-sm text-slate-600">Analise como os seus gastos mudaram em relação ao mês anterior.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700" htmlFor="comp-month">Período:</label>
          <input
            id="comp-month"
            type="month"
            value={`${selectedYear}-${String(selectedMonth).padStart(2, "0")}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split("-");
              if (y && m) {
                setSelectedYear(parseInt(y, 10));
                setSelectedMonth(parseInt(m, 10));
              }
            }}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {comparison.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
            <Layers className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-700">Sem despesas registadas para o período.</p>
            <p className="text-xs text-slate-500">Adicione transações ou importe dados do Open Finance para visualizar a comparação.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comparison.map((item) => {
              const currentPercent = (item.current / maxExpense) * 100;
              const prevPercent = (item.previous / maxExpense) * 100;
              const isUp = item.diff > 0;
              return (
                <div key={item.category} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:bg-slate-50">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                    <span>{item.category}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-600">Anterior: R$ {item.previous.toFixed(2)}</span>
                      <span className="text-slate-900 font-extrabold">Atual: R$ {item.current.toFixed(2)}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${isUp ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                        <TrendingUp className={`h-3 w-3 ${isUp ? "" : "rotate-180"}`} />
                        {item.percentChange > 0 ? `+${item.percentChange.toFixed(0)}%` : `${item.percentChange.toFixed(0)}%`}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-[11px] font-semibold text-slate-500">Mês atual</span>
                      <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${Math.max(currentPercent, 3)}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-[11px] font-semibold text-slate-500">Mês ant.</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-slate-400 rounded-full transition-all duration-500" style={{ width: `${Math.max(prevPercent, 3)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
