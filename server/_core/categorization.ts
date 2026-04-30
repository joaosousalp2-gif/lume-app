/**
 * Categorization Helper — Lume
 * Usa IA para sugerir categorias automáticas para lançamentos
 */

import { invokeLLM } from "./llm";

export interface CategorySuggestion {
  category: string;
  confidence: number; // 0-1
  reasoning: string;
}

/**
 * Categorias pré-definidas do sistema
 */
export const PREDEFINED_CATEGORIES = {
  receita: [
    "Pensão",
    "Salário",
    "Aluguel de Imóvel",
    "Venda de Itens",
    "Outros"
  ],
  despesa: [
    "Saúde",
    "Alimentação",
    "Moradia",
    "Lazer",
    "Transportes",
    "Educação",
    "Utilidades",
    "Outros"
  ]
};

/**
 * Sugere uma categoria usando IA baseada na descrição do lançamento
 */
export async function suggestCategory(
  description: string,
  type: "receita" | "despesa",
  historicalCategories?: string[]
): Promise<CategorySuggestion> {
  try {
    const categories = PREDEFINED_CATEGORIES[type];
    const historicalContext = historicalCategories && historicalCategories.length > 0
      ? `\n\nHistórico de categorias usadas pelo usuário: ${historicalCategories.join(", ")}`
      : "";

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente de categorização de lançamentos financeiros. 
Sua tarefa é analisar a descrição de um lançamento e sugerir a categoria mais apropriada.

Categorias disponíveis para ${type}:
${categories.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Responda SEMPRE em JSON com a seguinte estrutura:
{
  "category": "nome da categoria",
  "confidence": número entre 0 e 1,
  "reasoning": "breve explicação da escolha"
}

Regras:
- Escolha APENAS uma das categorias listadas
- confidence deve ser um número entre 0 (muito incerto) e 1 (muito confiante)
- Seja conciso na reasoning
- Se não tiver certeza, escolha "Outros" com confidence baixa${historicalContext}`
        },
        {
          role: "user",
          content: `Categorize este ${type === "receita" ? "recebimento" : "gasto"}: "${description}"`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "category_suggestion",
          strict: true,
          schema: {
            type: "object",
            properties: {
              category: {
                type: "string",
                description: "Categoria sugerida"
              },
              confidence: {
                type: "number",
                description: "Confiança da sugestão (0-1)"
              },
              reasoning: {
                type: "string",
                description: "Explicação da escolha"
              }
            },
            required: ["category", "confidence", "reasoning"],
            additionalProperties: false
          }
        }
      }
    });

    // Extrair resposta JSON
    const content = response.choices[0].message.content;
    if (typeof content !== "string") {
      throw new Error("Resposta inválida da IA");
    }

    const suggestion = JSON.parse(content) as CategorySuggestion;

    // Validar que a categoria está na lista permitida
    if (!categories.includes(suggestion.category)) {
      return {
        category: "Outros",
        confidence: 0.3,
        reasoning: "Categoria sugerida não reconhecida, usando 'Outros' como padrão"
      };
    }

    // Garantir que confidence está entre 0 e 1
    suggestion.confidence = Math.max(0, Math.min(1, suggestion.confidence));

    return suggestion;
  } catch (error) {
    console.error("Erro ao sugerir categoria:", error);
    // Em caso de erro, retornar sugestão padrão
    return {
      category: "Outros",
      confidence: 0,
      reasoning: "Erro ao processar sugestão de IA, usando 'Outros' como padrão"
    };
  }
}

/**
 * Sugere múltiplas categorias ordenadas por confiança
 */
export async function suggestCategoriesRanked(
  description: string,
  type: "receita" | "despesa",
  historicalCategories?: string[],
  topN: number = 3
): Promise<CategorySuggestion[]> {
  try {
    const categories = PREDEFINED_CATEGORIES[type];
    const historicalContext = historicalCategories && historicalCategories.length > 0
      ? `\n\nHistórico de categorias usadas pelo usuário: ${historicalCategories.join(", ")}`
      : "";

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente de categorização de lançamentos financeiros.
Sua tarefa é analisar a descrição de um lançamento e sugerir as ${topN} categorias mais apropriadas, ordenadas por confiança.

Categorias disponíveis para ${type}:
${categories.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Responda SEMPRE em JSON com a seguinte estrutura:
{
  "suggestions": [
    {
      "category": "nome da categoria",
      "confidence": número entre 0 e 1,
      "reasoning": "breve explicação"
    }
  ]
}

Regras:
- Retorne até ${topN} sugestões
- Ordene por confidence (decrescente)
- Escolha APENAS categorias da lista
- confidence deve estar entre 0 e 1
- Seja conciso nas reasoning${historicalContext}`
        },
        {
          role: "user",
          content: `Sugira as ${topN} melhores categorias para este ${type === "receita" ? "recebimento" : "gasto"}: "${description}"`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "category_suggestions_ranked",
          strict: true,
          schema: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    confidence: { type: "number" },
                    reasoning: { type: "string" }
                  },
                  required: ["category", "confidence", "reasoning"],
                  additionalProperties: false
                }
              }
            },
            required: ["suggestions"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (typeof content !== "string") {
      throw new Error("Resposta inválida da IA");
    }

    const result = JSON.parse(content) as { suggestions: CategorySuggestion[] };
    const validCategories = new Set(PREDEFINED_CATEGORIES[type]);

    // Filtrar e validar sugestões
    return result.suggestions
      .filter(s => validCategories.has(s.category))
      .map(s => ({
        ...s,
        confidence: Math.max(0, Math.min(1, s.confidence))
      }))
      .slice(0, topN);
  } catch (error) {
    console.error("Erro ao sugerir categorias:", error);
    return [
      {
        category: "Outros",
        confidence: 0,
        reasoning: "Erro ao processar sugestões de IA"
      }
    ];
  }
}

/**
 * Aprende com o histórico do usuário para melhorar sugestões
 */
export function extractUserCategoryPreferences(
  launches: Array<{ category: string; description: string; type: "receita" | "despesa" }>
): Record<string, string[]> {
  const preferences: Record<string, string[]> = {};

  launches.forEach(launch => {
    const key = `${launch.type}:${launch.category}`;
    if (!preferences[key]) {
      preferences[key] = [];
    }
    preferences[key].push(launch.description);
  });

  return preferences;
}

/**
 * Valida se uma categoria é válida para o tipo de lançamento
 */
export function isValidCategory(category: string, type: "receita" | "despesa"): boolean {
  return PREDEFINED_CATEGORIES[type].includes(category);
}

/**
 * Retorna todas as categorias disponíveis para um tipo
 */
export function getAvailableCategories(type: "receita" | "despesa"): string[] {
  return PREDEFINED_CATEGORIES[type];
}
