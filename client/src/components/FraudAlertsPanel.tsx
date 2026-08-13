import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, MessageCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function FraudAlertsPanel() {
  const alertsQuery = trpc.security.getFraudAlerts.useQuery(undefined, { staleTime: 60_000 });
  const historyQuery = trpc.chat.getHistory.useQuery(undefined, { staleTime: 60_000 });
  const alerts = alertsQuery.data ?? [];
  const [expanded, setExpanded] = useState<number | null>(null);

  const askAgent = (alert: (typeof alerts)[number]) => {
    localStorage.setItem("lume-agent-prefill", `Explique com palavras simples este alerta: ${alert.title}. Motivo: ${alert.reason}. Evidência: ${alert.evidence}. O que devo verificar: ${alert.recommendation}`);
    window.location.href = "/dashboard/chat";
  };

  const recentConversation = (historyQuery.data ?? []).slice(-6);

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
          {alerts.map((alert) => {
            const isOpen = expanded === alert.launchId;
            return <article key={`${alert.launchId}-${alert.title}`} className={`rounded-lg border p-4 ${alert.severity === "high" ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"}`}>
              <button type="button" className="flex w-full items-start gap-3 text-left" aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? null : alert.launchId)}>
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <span className="min-w-0 flex-1"><strong className="block text-slate-900">{alert.title}</strong><span className="mt-1 block text-sm text-slate-700">{alert.reason}</span><span className="mt-2 block text-sm font-medium text-slate-800">{money.format(alert.value)} · {new Date(`${alert.date}T00:00:00`).toLocaleDateString("pt-BR")}</span></span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-slate-700 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {isOpen && <div className="mt-4 border-t border-slate-200/80 pt-4 text-sm text-slate-800">
                <p><strong>Por que apareceu:</strong> {alert.evidence}</p>
                <p className="mt-2"><strong>Próximo passo seguro:</strong> {alert.recommendation}</p>
                <Button type="button" variant="outline" className="mt-4 gap-2" onClick={() => askAgent(alert)}><MessageCircle className="h-4 w-4" />Pedir explicação ao Agente IA</Button>
              </div>}
            </article>;
          })}
        </div>

        <details className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer font-semibold text-slate-900">Histórico recente de conversas com o Agente IA</summary>
          {historyQuery.isLoading && <p className="mt-3 text-sm text-slate-600">A carregar o histórico...</p>}
          {!historyQuery.isLoading && !recentConversation.length && <p className="mt-3 text-sm text-slate-600">Ainda não existem conversas guardadas.</p>}
          {recentConversation.length > 0 && <div className="mt-3 space-y-2">{recentConversation.map((message) => <div key={message.id} className={`rounded-md p-3 text-sm ${message.role === "assistant" ? "bg-white text-slate-800" : "bg-blue-100 text-blue-950"}`}><div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{message.role === "assistant" ? "Agente IA" : "Você"} · {new Date(message.createdAt).toLocaleString("pt-BR")}</div><p>{message.content}</p></div>)}</div>}
        </details>
      </Card>
    </section>
  );
}
