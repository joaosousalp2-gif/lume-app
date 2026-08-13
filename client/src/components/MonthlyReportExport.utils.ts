export const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;

export function getCurrentPeriod(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function parsePeriod(period: string) {
  const [yearText, monthText] = period.split("-");
  return {
    year: Number(yearText),
    month: Number(monthText),
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatChange(current: number, previous: number) {
  if (previous === 0) return null;
  const change = Math.round(((current - previous) / Math.abs(previous)) * 100);
  return `${change > 0 ? "+" : ""}${change}%`;
}
