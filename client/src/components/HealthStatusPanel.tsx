import { useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

function label(key: string) { return ({ database: "Base de dados", oauth: "Autenticação", forge: "Serviços internos", storage: "Armazenamento", ipca: "IBGE · IPCA", pib: "IBGE · PIB", selic: "BCB · Selic", exchange: "BCB · Câmbio" } as Record<string, string>)[key] ?? key; }

export default function HealthStatusPanel() {
  const healthQuery = trpc.health.status.useQuery(undefined, { enabled: false });
  const [hasChecked, setHasChecked] = useState(false);
  const runCheck = async () => { await healthQuery.refetch(); setHasChecked(true); };
  const services = healthQuery.data?.services ? Object.entries(healthQuery.data.services) : [];

  return <section aria-labelledby="health-status-title" className="container mx-auto px-4 py-8"><Card className="bg-white/95 p-6 shadow-lg"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="rounded-full bg-slate-100 p-3 text-slate-700"><Activity className="h-6 w-6" aria-hidden="true" /></div><div><h2 id="health-status-title" className="text-2xl font-bold text-slate-900">Estado das conexões</h2><p className="mt-1 text-slate-600">Verificação sob pedido, sem expor chaves ou dados pessoais.</p></div></div><Button type="button" variant="outline" className="gap-2" onClick={runCheck} disabled={healthQuery.isFetching}><RefreshCw className="h-4 w-4" />{healthQuery.isFetching ? "A verificar..." : "Verificar agora"}</Button></div>{!hasChecked && <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Prima “Verificar agora” para testar os serviços.</p>}{hasChecked && <><div className="mt-5 grid gap-3 sm:grid-cols-2">{services.map(([key, value]) => <div key={key} className={`rounded-lg border p-3 ${value.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}><div className="flex items-center justify-between gap-3"><strong className="text-slate-900">{label(key)}</strong><span className={`text-sm font-semibold ${value.ok ? "text-green-700" : "text-red-700"}`}>{value.ok ? "Operacional" : "Indisponível"}</span></div>{value.latencyMs > 0 && <p className="mt-1 text-xs text-slate-600">Resposta: {value.latencyMs} ms</p>}{!value.ok && key !== "database" && <p className="mt-1 text-xs text-red-800">Pode ser uma indisponibilidade temporária ou exigir credencial/fornecedor.</p>}</div>)}</div><p className="mt-4 text-xs text-slate-500">Última verificação: {healthQuery.data?.checkedAt ? new Date(healthQuery.data.checkedAt).toLocaleString("pt-BR") : "agora"}</p></>}</Card></section>;
}
