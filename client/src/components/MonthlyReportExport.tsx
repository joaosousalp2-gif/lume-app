import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Download, FileText, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatChange(current: number, previous: number) {
  if (previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

function downloadBase64PDF(base64: string, filename: string) {
  const binary = window.atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function MonthlyReportExport() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const reportInput = useMemo(() => ({ month, year }), [month, year]);

  const summaryQuery = trpc.financialReports.getMonthlySummary.useQuery(reportInput);
  const exportMutation = trpc.financialReports.exportPDF.useMutation({
    onSuccess: (result) => {
      if (!result.success || !result.data) {
        toast.error(result.error || "Não foi possível gerar o relatório");
        return;
      }
      downloadBase64PDF(result.data.base64, result.data.filename);
      toast.success("Relatório mensal baixado com sucesso");
    },
    onError: (error) => toast.error(error.message || "Não foi possível exportar o relatório"),
  });

  const analysis = summaryQuery.data?.analysis;
  const previousAnalysis = summaryQuery.data?.previousAnalysis;
  const incomeChange = analysis && previousAnalysis
    ? formatChange(analysis.totalIncome, previousAnalysis.totalIncome)
    : null;
  const expenseChange = analysis && previousAnalysis
    ? formatChange(analysis.totalExpenses, previousAnalysis.totalExpenses)
    : null;

  return (
    <Card className="overflow-hidden border-slate-700 bg-slate-900/80 text-white shadow-xl">
      <div className="border-b border-slate-700 bg-gradient-to-r from-blue-900/70 to-indigo-900/70 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-300" />
              <h2 className="text-2xl font-bold">Relatório financeiro mensal</h2>
            </div>
            <p className="text-sm text-blue-100">
              Analise gastos, compare com o mês anterior e receba recomendações personalizadas.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Período do relatório">
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Mês"
            >
              {monthNames.map((name, index) => (
                <option key={name} value={index + 1}>{name}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Ano"
            >
              {Array.from({ length: 5 }, (_, index) => today.getFullYear() - index).map((optionYear) => (
                <option key={optionYear} value={optionYear}>{optionYear}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {summaryQuery.isLoading ? (
          <div className="flex items-center justify-center gap-3 py-10 text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Calculando análise do mês...</span>
          </div>
        ) : summaryQuery.isError ? (
          <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-950/30 p-4 text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>Não foi possível carregar os dados do período. Tente novamente.</p>
          </div>
        ) : !summaryQuery.data?.hasData || !analysis ? (
          <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-6 text-center text-slate-300">
            <p className="font-medium">Ainda não há lançamentos em {monthNames[month - 1]} de {year}.</p>
            <p className="mt-1 text-sm text-slate-400">Registre receitas ou despesas para gerar o relatório.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
                <p className="text-sm text-slate-400">Receitas</p>
                <p className="mt-1 text-2xl font-bold text-emerald-300">{formatCurrency(analysis.totalIncome)}</p>
                {incomeChange !== null && (
                  <p className={`mt-2 flex items-center gap-1 text-xs ${incomeChange >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                    {incomeChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(incomeChange)}% vs. mês anterior
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
                <p className="text-sm text-slate-400">Despesas</p>
                <p className="mt-1 text-2xl font-bold text-red-300">{formatCurrency(analysis.totalExpenses)}</p>
                {expenseChange !== null && (
                  <p className={`mt-2 flex items-center gap-1 text-xs ${expenseChange <= 0 ? "text-emerald-300" : "text-red-300"}`}>
                    {expenseChange <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {Math.abs(expenseChange)}% vs. mês anterior
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
                <p className="text-sm text-slate-400">Saldo</p>
                <p className={`mt-1 text-2xl font-bold ${analysis.balance >= 0 ? "text-blue-300" : "text-orange-300"}`}>
                  {formatCurrency(analysis.balance)}
                </p>
                <p className="mt-2 text-xs text-slate-400">Receitas menos despesas</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Gastos por categoria</h3>
                <div className="space-y-3">
                  {analysis.categoryBreakdown.slice(0, 6).map((category) => (
                    <div key={category.category}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-slate-300">{category.category}</span>
                        <span className="text-slate-400">{formatCurrency(category.total)} ({category.percentage}%)</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(category.percentage, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">Recomendações personalizadas</h3>
                <div className="space-y-3">
                  {summaryQuery.data.recommendations.length === 0 ? (
                    <p className="text-sm text-slate-400">Nenhuma recomendação adicional para este período.</p>
                  ) : summaryQuery.data.recommendations.map((recommendation) => (
                    <div key={recommendation.title} className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-slate-200">{recommendation.title}</p>
                        <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs capitalize text-blue-200">{recommendation.priority}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{recommendation.description}</p>
                      {recommendation.estimatedSavings > 0 && (
                        <p className="mt-2 text-xs text-emerald-300">Economia potencial: {formatCurrency(recommendation.estimatedSavings)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={() => exportMutation.mutate(reportInput)}
              disabled={exportMutation.isPending}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-500 sm:w-auto"
            >
              {exportMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {exportMutation.isPending ? "Gerando PDF..." : "Baixar relatório em PDF"}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
