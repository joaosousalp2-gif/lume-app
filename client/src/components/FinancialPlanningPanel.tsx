import { useMemo, useState } from "react";
import { CalendarDays, Repeat2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function FinancialPlanningPanel() {
  const insightsQuery = trpc.financialInsights.get.useQuery(undefined, { staleTime: 60_000 });
  const [monthlySaving, setMonthlySaving] = useState("100");
  const [months, setMonths] = useState("12");
  const insights = insightsQuery.data;
  const simulatedBalance = useMemo(() => {
    const saving = Number(monthlySaving.replace(",", "."));
    const duration = Number(months);
    if (!insights || !Number.isFinite(saving) || saving < 0 || !Number.isFinite(duration) || duration < 1) return null;
    return insights.projectedBalance30Days + saving * Math.min(Math.floor(duration), 120);
  }, [insights, monthlySaving, months]);

  return (
    <section aria-labelledby="financial-planning-title" className="container mx-auto px-4 py-8">
      <Card className="bg-white/95 p-6 shadow-lg">
        <div className="flex items-start gap-3"><div className="rounded-full bg-blue-100 p-3 text-blue-700"><TrendingUp className="h-6 w-6" aria-hidden="true" /></div><div><h2 id="financial-planning-title" className="text-2xl font-bold text-slate-900">Planeamento financeiro</h2><p className="mt-1 text-slate-600">Veja o que pode acontecer nos próximos 30 dias antes de tomar decisões.</p></div></div>
        {insightsQuery.isLoading && <p className="mt-5 text-slate-600">A calcular o seu planeamento...</p>}
        {insights && <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-4"><p className="text-sm text-slate-600">Saldo calculado</p><p className="mt-1 text-2xl font-bold text-slate-900">{money.format(insights.currentBalance)}</p></div><div className="rounded-lg bg-blue-50 p-4"><p className="text-sm text-blue-800">Projeção em 30 dias</p><p className="mt-1 text-2xl font-bold text-blue-900">{money.format(insights.projectedBalance30Days)}</p></div></div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4"><h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Repeat2 className="h-5 w-5" />Despesas recorrentes</h3>{insights.recurringExpenses.length ? <div className="mt-3 space-y-2">{insights.recurringExpenses.map((item) => <div key={item.key} className="flex justify-between gap-3 rounded-md bg-slate-50 p-3"><span><strong>{item.description}</strong><small className="block text-slate-600">Próxima previsão: {new Date(`${item.nextDate}T00:00:00`).toLocaleDateString("pt-BR")}</small></span><strong>{money.format(item.averageValue)}</strong></div>)}</div> : <p className="mt-3 text-sm text-slate-600">Ainda não há dados suficientes para reconhecer recorrências.</p>}</div>
            <div className="rounded-lg border border-slate-200 p-4"><h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><CalendarDays className="h-5 w-5" />Próximos compromissos</h3>{insights.calendar.length ? <div className="mt-3 space-y-2">{insights.calendar.slice(0, 6).map((item, index) => <div key={`${item.date}-${item.title}-${index}`} className="flex justify-between gap-3 rounded-md bg-slate-50 p-3"><span><strong>{item.title}</strong><small className="block text-slate-600">{new Date(`${item.date}T00:00:00`).toLocaleDateString("pt-BR")}</small></span><strong className={item.type === "receita" ? "text-green-700" : "text-slate-900"}>{item.type === "receita" ? "+" : "-"}{money.format(item.value)}</strong></div>)}</div> : <p className="mt-3 text-sm text-slate-600">Não existem compromissos futuros registados.</p>}</div>
          </div>
          <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4"><h3 className="text-lg font-semibold text-indigo-950">Simulador “e se?”</h3><p className="mt-1 text-sm text-indigo-900">Teste uma economia mensal sem alterar os seus dados.</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium text-indigo-950">Quanto poupar por mês?<Input className="mt-1 bg-white" inputMode="decimal" value={monthlySaving} onChange={(event) => setMonthlySaving(event.target.value)} /></label><label className="text-sm font-medium text-indigo-950">Durante quantos meses?<Input className="mt-1 bg-white" inputMode="numeric" value={months} onChange={(event) => setMonths(event.target.value)} /></label></div>{simulatedBalance !== null && <p className="mt-4 text-indigo-950">Saldo simulado ao fim do período: <strong>{money.format(simulatedBalance)}</strong></p>}</div>
        </>}
      </Card>
    </section>
  );
}
