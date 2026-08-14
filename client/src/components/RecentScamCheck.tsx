import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function RecentScamCheck() {
  const [expanded, setExpanded] = useState(false);
  const alertsQuery = trpc.security.getFraudAlerts.useQuery(undefined, { staleTime: 60_000 });
  const alerts = alertsQuery.data || [];
  const hasAlerts = alerts.length > 0;

  return (
    <Card className={`p-6 shadow-lg ${hasAlerts ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`} aria-labelledby="recent-scam-title">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-3 ${hasAlerts ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {hasAlerts ? <ShieldAlert className="h-6 w-6" aria-hidden="true" /> : <ShieldCheck className="h-6 w-6" aria-hidden="true" />}
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide opacity-70">Verificação rápida</p>
            <h3 id="recent-scam-title" className="text-xl font-black text-slate-900">{alertsQuery.isLoading ? "A verificar as suas despesas..." : hasAlerts ? `${alerts.length} alerta${alerts.length === 1 ? "" : "s"} para rever` : "Nenhum padrão suspeito encontrado"}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-700">{hasAlerts ? "Leia a explicação antes de tomar qualquer decisão. Se não reconhecer uma despesa, contacte o banco." : "Continuaremos a analisar os seus lançamentos para ajudar a proteger o seu dinheiro."}</p>
          </div>
        </div>
        {alertsQuery.isLoading && <Loader2 className="h-5 w-5 animate-spin text-slate-600" aria-label="A verificar" />}
      </div>

      {hasAlerts && (
        <div className="mt-4">
          <Button type="button" variant="outline" onClick={() => setExpanded((value) => !value)} className="gap-2 border-red-300 bg-white text-red-900 hover:bg-red-100">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {expanded ? "Esconder detalhes" : "Ver explicações"}
          </Button>
          {expanded && (
            <div className="mt-3 space-y-3" role="list" aria-label="Alertas de segurança">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="rounded-lg border border-red-200 bg-white p-4 text-sm text-slate-800" role="listitem">
                  <p className="font-bold text-red-900">{alert.title || "Despesa a rever"}</p>
                  <p className="mt-1">{alert.reason}</p>
                  <p className="mt-1 text-xs text-slate-600">Evidência: {alert.evidence}</p>
                  {alert.recommendation && <p className="mt-2 font-semibold text-slate-900">Próximo passo: {alert.recommendation}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
