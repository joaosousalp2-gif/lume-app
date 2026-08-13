export type FraudAlert = {
  launchId: number;
  severity: "info" | "warning" | "high";
  title: string;
  reason: string;
  evidence: string;
  recommendation: string;
  value: number;
  date: string;
};

type LaunchLike = {
  id: number;
  type: "receita" | "despesa";
  date: string;
  category: string;
  value: string;
  description: string | null;
};

function asAmount(value: string): number {
  const amount = Number(value.replace(",", "."));
  return Number.isFinite(amount) ? amount : 0;
}

function daysBetween(a: string, b: string): number {
  const left = new Date(`${a}T00:00:00`).getTime();
  const right = new Date(`${b}T00:00:00`).getTime();
  return Math.abs(left - right) / 86_400_000;
}

export function detectSuspiciousTransactions(launches: LaunchLike[]): FraudAlert[] {
  const expenses = launches.filter((launch) => launch.type === "despesa" && asAmount(launch.value) > 0);
  if (!expenses.length) return [];

  const categoryTotals = new Map<string, number[]>();
  for (const launch of expenses) {
    const values = categoryTotals.get(launch.category) ?? [];
    values.push(asAmount(launch.value));
    categoryTotals.set(launch.category, values);
  }

  const alerts: FraudAlert[] = [];
  for (const launch of expenses) {
    const amount = asAmount(launch.value);
    const values = categoryTotals.get(launch.category) ?? [];
    const average = values.reduce((sum, item) => sum + item, 0) / values.length;
    if (values.length >= 3 && amount >= Math.max(average * 3, average + 500)) {
      alerts.push({
        launchId: launch.id,
        severity: "warning",
        title: "Valor fora do padrão",
        reason: `Esta despesa é muito superior à média da categoria ${launch.category}.`,
        evidence: `Valor de ${amount.toFixed(2)} comparado com uma média de ${average.toFixed(2)} em ${values.length} despesas da categoria.`,
        recommendation: "Confirme a compra no seu banco e, se não a reconhecer, contacte imediatamente o banco por um canal oficial.",
        value: amount,
        date: launch.date,
      });
    }

    const duplicate = expenses.find((other) => other.id !== launch.id && other.category === launch.category && asAmount(other.value) === amount && daysBetween(other.date, launch.date) <= 1 && (other.description ?? "").trim().toLowerCase() === (launch.description ?? "").trim().toLowerCase());
    if (duplicate && launch.id > duplicate.id) {
      alerts.push({
        launchId: launch.id,
        severity: "high",
        title: "Possível cobrança repetida",
        reason: "Encontrámos outra despesa igual na mesma categoria e num intervalo de 24 horas.",
        evidence: `Existem duas despesas de ${amount.toFixed(2)} com a mesma descrição/categoria em menos de 24 horas.`,
        recommendation: "Não confirme a cobrança como fraude sem verificar. Compare os recibos e peça ao comerciante ou banco a validação da duplicação.",
        value: amount,
        date: launch.date,
      });
    }
  }

  return alerts.sort((a, b) => (a.severity === "high" ? -1 : 1) - (b.severity === "high" ? -1 : 1));
}
