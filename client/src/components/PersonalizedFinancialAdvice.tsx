import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, RefreshCcw, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function PersonalizedFinancialAdvice() {
  const adviceQuery = trpc.personalizedAdvice.getAdvice.useQuery(undefined, {
    staleTime: 5 * 60_000,
  });

  const handleAskAgent = (adviceText: string) => {
    localStorage.setItem("lume-agent-prefill", `Quero conversar sobre este conselho financeiro: "${adviceText}". Pode ajudar-me?`);
    window.location.href = "/dashboard/chat";
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 via-violet-50 to-white p-6 shadow-lg border border-blue-100">
      <div className="flex items-center justify-between border-b border-blue-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-600 p-3 text-white">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Conselhos do Agente IA para Você</h3>
            <p className="text-sm text-slate-600">Recomendações exclusivas baseadas nos seus lançamentos e dados importados.</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => adviceQuery.refetch()}
          disabled={adviceQuery.isFetching}
          className="gap-2 border-blue-300 text-blue-800 hover:bg-blue-100"
        >
          <RefreshCcw className={`h-4 w-4 ${adviceQuery.isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <div className="mt-5 space-y-4">
        {adviceQuery.isLoading && (
          <div className="flex items-center justify-center py-8 text-slate-600 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span>A analisar as suas finanças e gerar conselhos personalizados...</span>
          </div>
        )}

        {adviceQuery.isError && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
            Não foi possível carregar os conselhos no momento. Tente novamente mais tarde.
          </div>
        )}

        {adviceQuery.data?.advice && adviceQuery.data.advice.map((item, index) => (
          <div key={index} className="flex items-start justify-between gap-4 rounded-xl border border-blue-200/60 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-extrabold text-blue-800">
                {index + 1}
              </span>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">{item}</p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => handleAskAgent(item)}
              className="shrink-0 gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Conversar
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
