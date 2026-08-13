import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  formatChange,
  formatCurrency,
  getCurrentPeriod,
  monthNames,
  parsePeriod,
} from "./MonthlyReportExport.utils";

function downloadPDF(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function MonthlyReportExport() {
  const [period, setPeriod] = useState(getCurrentPeriod);
  const reportInput = useMemo(() => parsePeriod(period), [period]);

  const summaryQuery = trpc.financialReports.getMonthlySummary.useQuery(reportInput, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const exportMutation = trpc.financialReports.exportPDF.useMutation({
    onSuccess: (result) => {
      if (!result.success || !result.data) {
        toast.error(result.error || "Não foi possível gerar o relatório");
        return;
      }
      downloadPDF(result.data.downloadUrl, result.data.filename);
      toast.success("Relatório baixado");
    },
    onError: (error) => toast.error(error.message || "Não foi possível exportar o relatório"),
  });

  const analysis = summaryQuery.data?.analysis;
  const previous = summaryQuery.data?.previousAnalysis;
  const { year, month } = parsePeriod(period);
  const periodLabel = `${monthNames[month - 1]} de ${year}`;
  const primaryRecommendation = summaryQuery.data?.recommendations?.[0];

  return (
    <Card className="overflow-hidden border-slate-700/70 bg-slate-900/80 text-white shadow-lg">
      <div className="flex flex-col gap-4 border-b border-slate-700/70 bg-slate-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-300" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-bold">Relatório mensal</h2>
            <p className="text-sm text-slate-400">Resumo financeiro e recomendações em PDF.</p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <span className="sr-only">Escolha o período</span>
          <input
            type="month"
            value={period}
            onChange={(event) => setPeriod(event.target.value || getCurrentPeriod())}
            className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Período do relatório"
          />
        </label>
      </div>

      <div className="p-5">
        {summaryQuery.isLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Calculando {periodLabel}...
          </div>
        ) : summaryQuery.isError ? (
          <p className="py-4 text-sm text-red-300">Não foi possível carregar este período.</p>
        ) : !summaryQuery.data?.hasData || !analysis ? (
          <p className="py-4 text-sm text-slate-400">Não há lançamentos em {periodLabel}.</p>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Saldo</p>
                <p className={`mt-1 text-2xl font-bold ${analysis.balance >= 0 ? "text-emerald-300" : "text-orange-300"}`}>
                  {formatCurrency(analysis.balance)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Receitas</p>
                <p className="mt-1 text-lg font-semibold text-slate-200">{formatCurrency(analysis.totalIncome)}</p>
                {previous && <p className="text-xs text-slate-500">{formatChange(analysis.totalIncome, previous.totalIncome) ?? "—"} vs. anterior</p>}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Despesas</p>
                <p className="mt-1 text-lg font-semibold text-slate-200">{formatCurrency(analysis.totalExpenses)}</p>
                {previous && <p className="text-xs text-slate-500">{formatChange(analysis.totalExpenses, previous.totalExpenses) ?? "—"} vs. anterior</p>}
              </div>
            </div>

            {primaryRecommendation && (
              <p className="rounded-md border-l-2 border-blue-400 bg-blue-950/30 px-3 py-2 text-sm text-slate-300">
                <span className="font-medium text-blue-200">Sugestão:</span> {primaryRecommendation.title}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                onClick={() => exportMutation.mutate(reportInput)}
                disabled={exportMutation.isPending}
                className="bg-emerald-600 text-white hover:bg-emerald-500"
              >
                {exportMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                {exportMutation.isPending ? "Gerando..." : "Baixar PDF"}
              </Button>
              <details className="text-sm text-slate-400">
                <summary className="cursor-pointer select-none hover:text-slate-200">Ver detalhes</summary>
                <div className="mt-3 space-y-3 rounded-md border border-slate-700/70 bg-slate-950/40 p-3">
                  <div>
                    <p className="mb-2 font-medium text-slate-300">Principais categorias</p>
                    <div className="space-y-2">
                      {analysis.categoryBreakdown.slice(0, 5).map((category) => (
                        <div key={category.category} className="flex items-center justify-between gap-3 text-xs">
                          <span>{category.category}</span>
                          <span>{formatCurrency(category.total)} ({category.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {summaryQuery.data.recommendations.length > 1 && (
                    <div>
                      <p className="mb-2 font-medium text-slate-300">Outras recomendações</p>
                      <div className="space-y-2">
                        {summaryQuery.data.recommendations.slice(1).map((recommendation) => (
                          <p key={recommendation.title} className="text-xs text-slate-400">{recommendation.description}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
