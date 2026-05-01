/**
 * Categories Helper
 * Centraliza definição e gerenciamento de categorias
 */

export const CATEGORIES = {
  receita: ["Pensão", "Salário", "Aluguel de Imóvel", "Venda de Itens", "Outros"],
  despesa: ["Saúde", "Alimentação", "Moradia", "Lazer", "Transportes", "Educação", "Utilidades", "Outros"],
} as const;

export const RECURRENCE_OPTIONS = ["Única", "Diária", "Semanal", "Mensal", "Anual"] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  "Pensão": "bg-blue-100 text-blue-800",
  "Salário": "bg-green-100 text-green-800",
  "Aluguel de Imóvel": "bg-purple-100 text-purple-800",
  "Venda de Itens": "bg-yellow-100 text-yellow-800",
  "Saúde": "bg-red-100 text-red-800",
  "Alimentação": "bg-orange-100 text-orange-800",
  "Moradia": "bg-indigo-100 text-indigo-800",
  "Lazer": "bg-pink-100 text-pink-800",
  "Transportes": "bg-cyan-100 text-cyan-800",
  "Educação": "bg-teal-100 text-teal-800",
  "Utilidades": "bg-gray-100 text-gray-800",
  "Outros": "bg-slate-100 text-slate-800",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || "bg-gray-100 text-gray-800";
}

export function isValidCategory(category: string, type: "receita" | "despesa"): boolean {
  return (CATEGORIES[type] as readonly string[]).includes(category);
}

export function getCategoriesByType(type: "receita" | "despesa"): readonly string[] {
  return CATEGORIES[type];
}
