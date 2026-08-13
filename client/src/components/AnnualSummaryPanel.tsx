import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function AnnualSummaryPanel() {
  const year = new Date().getFullYear();
  const summaryQuery = trpc.financialReports.getAnnualSummary.useQuery({ year }, { staleTime: 60_000 });
  const summary = summaryQuery.data;
  const topCategories = summary ? Object.entries(summary.byCategory).sort(([, a], [, b]) => b - a).slice(0, 5) : [];

  return <section aria-labelledby="annual-summary-title" className="container mx-auto px-4 py-8"><Card className="bg-white/95 p-6 shadow-lg"><div className="flex items-start gap-3"><div className="rounded-full bg-cyan-100 p-3 text-cyan-700"><BarChart3 className="h-6 w-6" aria-hidden="true" /></div><div><h2 id="annual-summary-title" className="text-2xl font-bold text-slate-900">Resumo anual</h2><p className="mt-1 text-slate-600">Uma visão simples da evolução financeira de {year}.</p></div></div>{summaryQuery.isLoading && <p className="mt-5 text-slate-600">A preparar o resumo...</p>}{summary && !summary.hasData && <p className="mt-5 rounded-lg bg-slate-50 p-4 text-slate-600">Ainda não existem lançamentos para este ano.</p>}{summary?.hasData && <><div className="mt-5 grid gap-4 sm:grid-cols-3"><div className="rounded-lg bg-green-50 p-4"><p className="text-sm text-green-800">Receitas</p><p className="text-xl font-bold text-green-900">{money.format(summary.totalIncome)}</p></div><div className="rounded-lg bg-red-50 p-4"><p className="text-sm text-red-800">Despesas</p><p className="text-xl font-bold text-red-900">{money.format(summary.totalExpenses)}</p></div><div className="rounded-lg bg-blue-50 p-4"><p className="text-sm text-blue-800">Saldo</p><p className="text-xl font-bold text-blue-900">{money.format(summary.balance)}</p></div></div><div className="mt-6 grid gap-6 lg:grid-cols-2"><div><h3 className="font-semibold text-slate-900">Categorias com maior despesa</h3><div className="mt-3 space-y-2">{topCategories.map(([category, value]) => <div key={category} className="flex justify-between rounded bg-slate-50 p-3"><span>{category}</span><strong>{money.format(value)}</strong></div>)}</div></div><div><h3 className="font-semibold text-slate-900">Evolução mensal</h3><div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{summary.monthly.map((month) => <div key={month.month} className="rounded bg-slate-50 p-2 text-center"><p className="text-xs text-slate-500">{month.month.slice(5)}</p><p className="text-sm font-semibold text-slate-900">{money.format(month.income - month.expenses)}</p></div>)}</div></div></div></>}</Card></section>;
}
