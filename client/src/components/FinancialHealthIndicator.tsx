import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { CircleCheck, CircleAlert, CircleX, Activity } from "lucide-react";
import { trpc } from "@/lib/trpc";

export type FinancialHealthStatus = "green" | "yellow" | "red";

export function calculateFinancialHealth(launches: Array<{ type: string; value: string; date: string }>, monthPrefix: string) {
  const period = launches.filter((launch) => launch.date?.startsWith(monthPrefix));
  const income = period.filter((launch) => launch.type === "receita").reduce((sum, launch) => sum + (parseFloat(launch.value) || 0), 0);
  const expenses = period.filter((launch) => launch.type === "despesa").reduce((sum, launch) => sum + (parseFloat(launch.value) || 0), 0);
  const balance = income - expenses;
  const expenseRatio = income > 0 ? expenses / income : expenses > 0 ? 1 : 0;

  let status: FinancialHealthStatus = "green";
  if (income === 0 && expenses > 0) status = "red";
  else if (balance < 0 || expenseRatio > 1) status = "red";
  else if (expenseRatio >= 0.8 || balance < income * 0.1) status = "yellow";

  return { status, income, expenses, balance, expenseRatio, hasData: period.length > 0 };
}

const statusContent = {
  green: {
    label: "Saúde financeira estável",
    description: "As receitas cobrem as despesas e existe margem positiva neste mês.",
    className: "border-green-200 bg-green-50 text-green-900",
    icon: CircleCheck,
  },
  yellow: {
    label: "Atenção ao orçamento",
    description: "As despesas estão próximas das receitas. Vale rever os gastos não essenciais.",
    className: "border-amber-200 bg-amber-50 text-amber-950",
    icon: CircleAlert,
  },
  red: {
    label: "Precisa de atenção",
    description: "As despesas ultrapassam ou estão a consumir quase todas as receitas deste mês.",
    className: "border-red-200 bg-red-50 text-red-900",
    icon: CircleX,
  },
};

export default function FinancialHealthIndicator() {
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const launchesQuery = trpc.launches.list.useQuery();
  const health = useMemo(() => calculateFinancialHealth(launchesQuery.data || [], monthPrefix), [launchesQuery.data, monthPrefix]);
  const content = statusContent[health.status];
  const Icon = content.icon;

  return (
    <Card className={`p-5 shadow-lg ${content.className}`} aria-labelledby="financial-health-title">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-white/75 p-3" aria-hidden="true"><Icon className="h-7 w-7" /></div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide opacity-75">Semáforo Financeiro</p>
            <h3 id="financial-health-title" className="text-xl font-black">{content.label}</h3>
            <p className="mt-1 text-sm font-semibold">{health.hasData ? content.description : "Ainda não há dados suficientes neste mês. Registe ou importe transações para acompanhar a sua evolução."}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold">
          <Activity className="h-4 w-4" aria-hidden="true" />
          <span>Saldo: R$ {health.balance.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}
