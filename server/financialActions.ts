import { randomUUID } from "node:crypto";

export type FinancialActionType = "create_launch";
export type LaunchType = "receita" | "despesa";

export type PreparedFinancialAction = {
  actionId: string;
  type: FinancialActionType;
  launch: {
    type: LaunchType;
    date: string;
    category: string;
    value: string;
    description: string;
    recurrence: string;
  };
  confirmationText: string;
};

const CATEGORY_ALIASES: Array<[string, string[]]> = [
  ["Supermercado", ["supermercado", "mercado", "mercearia", "compras"]],
  ["Alimentação", ["alimentação", "alimentacao", "restaurante", "comida", "café", "cafe", "lanche"]],
  ["Transporte", ["transporte", "combustível", "combustivel", "gasolina", "uber", "táxi", "taxi", "ônibus", "onibus"]],
  ["Saúde", ["saúde", "saude", "farmácia", "farmacia", "médico", "medico", "consulta"]],
  ["Moradia", ["moradia", "aluguel", "renda", "casa", "condomínio", "condominio"]],
  ["Contas", ["conta", "luz", "água", "agua", "internet", "telefone", "energia"]],
  ["Lazer", ["lazer", "cinema", "viagem", "passeio"]],
  ["Educação", ["educação", "educacao", "curso", "escola", "livro"]],
];

function normalizeMoney(raw: string): string | null {
  const normalized = raw.replace(/\s/g, "").replace(/€/g, "").replace(/R\$/gi, "");
  if (!normalized) return null;

  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");
  let value = normalized;
  if (lastComma > lastDot) {
    value = normalized.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma && /\.\d{1,2}$/.test(normalized)) {
    value = normalized.replace(/,/g, "");
  } else {
    value = normalized.replace(/[,.]/g, "");
  }

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) return null;
  return amount.toFixed(2);
}

function formatCurrency(value: string): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}

function today(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(text: string): string {
  const match = text.match(/\b(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\b/);
  if (!match) return today();
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = match[3] ? Number(match[3].length === 2 ? `20${match[3]}` : match[3]) : new Date().getFullYear();
  if (month < 1 || month > 12 || day < 1 || day > 31) return today();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseType(text: string): LaunchType | null {
  if (/\b(recebi|receita|ganhei|salário|salario|rendimento|entrada|pagaram)\b/i.test(text)) return "receita";
  if (/\b(gastei|despesa|paguei|pagar|comprei|compra|saída|saida|custou)\b/i.test(text)) return "despesa";
  return null;
}

function parseCategory(text: string): string {
  const normalized = text.toLocaleLowerCase("pt-BR");
  const found = CATEGORY_ALIASES.find(([, aliases]) => aliases.some((alias) => normalized.includes(alias)));
  return found?.[0] ?? "Outros";
}

export function prepareFinancialAction(message: string): PreparedFinancialAction | null {
  const cleaned = message.trim().replace(/\s+/g, " ");
  if (!cleaned) return null;

  const type = parseType(cleaned);
  const moneyMatch = cleaned.match(/(?:r\$|€)?\s*(?:\d{1,3}(?:[.\s]\d{3})+|\d+)(?:[,.]\d{1,2})?/i);
  const value = moneyMatch ? normalizeMoney(moneyMatch[0]) : null;
  if (!type || !value) return null;

  const category = parseCategory(cleaned);
  const date = parseDate(cleaned);
  const description = cleaned.replace(/\b(lume|por favor|regista|registre|adiciona|adicione|uma|um|despesa|receita|gasto|ganho|de|no|na|em|hoje|amanhã|amanha)\b/gi, " ").replace(/\s+/g, " ").trim() || category;
  const launch = {
    type,
    date,
    category,
    value,
    description,
    recurrence: "Única",
  } as const;

  const actionLabel = type === "despesa" ? "despesa" : "receita";
  const confirmationText = `Vou registar uma ${actionLabel} de ${formatCurrency(value)} em ${category}, na data ${date.split("-").reverse().join("/")}. Confirma?`;

  return {
    actionId: randomUUID(),
    type: "create_launch",
    launch,
    confirmationText,
  };
}
