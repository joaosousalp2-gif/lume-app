import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, FileText, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function PrintableFinancialSummary() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const launchesQuery = trpc.launches.list.useQuery();

  const periodLaunches = useMemo(() => {
    const all = launchesQuery.data || [];
    const prefix = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
    return all.filter((l) => l.date?.startsWith(prefix));
  }, [launchesQuery.data, selectedMonth, selectedYear]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    const categories: Record<string, number> = {};

    for (const l of periodLaunches) {
      const val = parseFloat(l.value) || 0;
      if (l.type === "receita") {
        income += val;
      } else {
        expense += val;
        categories[l.category] = (categories[l.category] || 0) + val;
      }
    }

    return {
      income,
      expense,
      balance: income - expense,
      categories: Object.entries(categories).sort((a, b) => b[1] - a[1]),
    };
  }, [periodLaunches]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="bg-white/95 p-6 shadow-lg print:shadow-none print:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-3 text-green-700">
            <Printer className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Relatório Simplificado para Impressão</h3>
            <p className="text-sm text-slate-600">Formato limpo e em alta legibilidade para leitura em papel.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={`${selectedYear}-${String(selectedMonth).padStart(2, "0")}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split("-");
              if (y && m) {
                setSelectedYear(parseInt(y, 10));
                setSelectedMonth(parseInt(m, 10));
              }
            }}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Button type="button" onClick={handlePrint} className="gap-2 bg-green-700 hover:bg-green-800 text-white font-bold">
            <Printer className="h-4 w-4" />
            Imprimir Relatório
          </Button>
        </div>
      </div>

      {/* Printable Sheet View */}
      <div className="mt-6 space-y-6 print:mt-0 print:space-y-4 text-slate-900">
        <div className="border-b-2 border-slate-900 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight">LUME — RESUMO FINANCEIRO</h1>
              <p className="text-sm text-slate-600">Plataforma de Gestão e Segurança Financeira</p>
            </div>
            <div className="text-right text-sm font-semibold">
              <p>Período: {String(selectedMonth).padStart(2, "0")}/{selectedYear}</p>
              <p className="text-xs text-slate-500">Emitido em {new Date().toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-b border-slate-300 pb-6">
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase">Receitas Totais</p>
            <p className="mt-1 text-xl font-extrabold text-green-700">R$ {summary.income.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase">Despesas Totais</p>
            <p className="mt-1 text-xl font-extrabold text-red-700">R$ {summary.expense.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase">Saldo do Mês</p>
            <p className={`mt-1 text-xl font-extrabold ${summary.balance >= 0 ? "text-blue-700" : "text-amber-700"}`}>
              R$ {summary.balance.toFixed(2)}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 mb-3">Gastos por Categoria</h4>
          {summary.categories.length === 0 ? (
            <p className="text-sm text-slate-600 italic">Nenhuma despesa registada neste mês.</p>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100">
                  <th className="py-2.5 px-3 font-bold text-slate-800">Categoria</th>
                  <th className="py-2.5 px-3 font-bold text-slate-800 text-right">Valor Gasto</th>
                  <th className="py-2.5 px-3 font-bold text-slate-800 text-right">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {summary.categories.map(([category, val]) => {
                  const pct = summary.expense > 0 ? (val / summary.expense) * 100 : 0;
                  return (
                    <tr key={category} className="border-b border-slate-200">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{category}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">R$ {val.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{pct.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-8 border-t border-slate-300 pt-4 text-xs text-slate-500 flex items-center justify-between">
          <span>Lume App — Segurança e Tranquilidade Financeira</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </Card>
  );
}
