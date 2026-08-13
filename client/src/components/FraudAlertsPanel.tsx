import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function FraudAlertsPanel() {
  const alertsQuery = trpc.security.getFraudAlerts.useQuery(undefined, { staleTime: 60_000 });
  const alerts = alertsQuery.data ?? [];

  return (
    <section aria-labelledby="fraud-alerts-title" className="container mx-auto px-4 py-8">
      <Card className="bg-white/95 p-6 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber-100 p-3 text-amber-700"><ShieldAlert className="h-6 w-6" aria-hidden="true" /></div>
          <div>
            <h2 id="fraud-alerts-title" className="text-2xl font-bold text-slate-900">Alertas de segurança financeira</h2>
            <p className="mt-1 text-slate-600">O Lume identifica padrões fora do habitual. Um alerta não confirma fraude: confirme sempre com o seu banco.</p>
          </div>
        </div>
        {alertsQuery.isLoading && <p className="mt-5 text-sm text-slate-600">A analisar os seus lançamentos...</p>}
        {!alertsQuery.isLoading && !alerts.length && <div className="mt-5 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800"><CheckCircle2 className="h-5 w-5" />Não encontrámos padrões suspeitos nos seus lançamentos recentes.</div>}
        <div className="mt-5 space-y-3">
          {alerts.map((alert) => (
            <article key={`${alert.launchId}-${alert.title}`} className={`rounded-lg border p-4 ${alert.severity === "high" ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"}`}>
              <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><h3 className="font-semibold text-slate-900">{alert.title}</h3><p className="mt-1 text-sm text-slate-700">{alert.reason}</p><p className="mt-2 text-sm font-medium text-slate-800">{money.format(alert.value)} · {new Date(`${alert.date}T00:00:00`).toLocaleDateString("pt-BR")}</p></div></div>
            </article>
          ))}
        </div>
      </Card>
    </section>
  );
}
