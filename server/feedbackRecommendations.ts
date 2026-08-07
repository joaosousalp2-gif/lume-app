import { invokeLLM } from "./_core/llm";

interface FeedbackData {
  totalFeedback: number;
  usefulCount: number;
  notUsefulCount: number;
  usefulPercentage: number;
  recentFeedback: Array<{
    id: number;
    messageContent: string;
    messageRole: "user" | "assistant";
    rating: "useful" | "not_useful";
    comment?: string | null;
    createdAt: Date;
  }>;
}

interface Recommendation {
  category: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionItems: string[];
}

/**
 * Analyze feedback data and generate recommendations for improving AI responses
 */
export async function generateFeedbackRecommendations(
  feedbackData: FeedbackData
): Promise<Recommendation[]> {
  if (feedbackData.totalFeedback === 0) {
    return [];
  }

  // Prepare feedback summary for LLM
  const notUsefulFeedback = feedbackData.recentFeedback
    .filter((f) => f.rating === "not_useful")
    .slice(0, 5);

  const feedbackSummary = `
Estatísticas de Feedback:
- Total de avaliações: ${feedbackData.totalFeedback}
- Taxa de satisfação: ${feedbackData.usefulPercentage}%
- Respostas úteis: ${feedbackData.usefulCount}
- Respostas não úteis: ${feedbackData.notUsefulCount}

Exemplos de respostas não úteis (últimas 5):
${notUsefulFeedback
  .map(
    (f, i) => `
${i + 1}. Mensagem: "${f.messageContent.substring(0, 100)}..."
   Avaliação: ${f.rating}
   Comentário: ${f.comment || "Sem comentário"}
`
  )
  .join("\n")}
`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em análise de qualidade de respostas de IA. 
Analise os dados de feedback fornecidos e gere recomendações específicas e acionáveis 
para melhorar a qualidade das respostas do Agente Financeiro.

Retorne um JSON com array de recomendações, cada uma com:
- category: "response_quality" | "content_accuracy" | "user_experience" | "financial_guidance"
- priority: "high" | "medium" | "low"
- title: título da recomendação
- description: descrição detalhada
- actionItems: array de ações específicas

Máximo de 3 recomendações.

${feedbackSummary}`,
        },
        {
          role: "user",
          content: "Com base no feedback fornecido, quais são as principais recomendações para melhorar a qualidade das respostas?",
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recommendations",
          strict: true,
          schema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: {
                      type: "string",
                      enum: [
                        "response_quality",
                        "content_accuracy",
                        "user_experience",
                        "financial_guidance",
                      ],
                    },
                    priority: {
                      type: "string",
                      enum: ["high", "medium", "low"],
                    },
                    title: {
                      type: "string",
                    },
                    description: {
                      type: "string",
                    },
                    actionItems: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                    },
                  },
                  required: [
                    "category",
                    "priority",
                    "title",
                    "description",
                    "actionItems",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["recommendations"],
            additionalProperties: false,
          },
        },
      },
    });

    // Parse response
    const content = response.choices[0].message.content;
    if (typeof content !== "string") {
      console.error("Invalid response format from LLM");
      return [];
    }

    const parsed = JSON.parse(content);
    return parsed.recommendations || [];
  } catch (error) {
    console.error("Error generating feedback recommendations:", error);
    return [];
  }
}

/**
 * Get insights about feedback trends
 */
export function getFeedbackInsights(feedbackData: FeedbackData): string[] {
  const insights: string[] = [];

  if (feedbackData.usefulPercentage >= 80) {
    insights.push(
      "Excelente taxa de satisfação! O Agente Financeiro está fornecendo respostas de alta qualidade."
    );
  } else if (feedbackData.usefulPercentage >= 60) {
    insights.push(
      "Boa taxa de satisfação, mas há espaço para melhorias na qualidade das respostas."
    );
  } else if (feedbackData.usefulPercentage >= 40) {
    insights.push(
      "Taxa de satisfação moderada. Recomenda-se revisar a estratégia de respostas."
    );
  } else {
    insights.push(
      "Taxa de satisfação baixa. Ação imediata necessária para melhorar a qualidade."
    );
  }

  if (feedbackData.totalFeedback < 10) {
    insights.push(
      "Dados limitados. Colete mais feedback para análises mais precisas."
    );
  }

  const recentNotUseful = feedbackData.recentFeedback
    .filter((f) => f.rating === "not_useful")
    .slice(0, 3);

  if (recentNotUseful.length > 0) {
    insights.push(
      `Últimas respostas não úteis: ${recentNotUseful.length} nos últimos registros.`
    );
  }

  return insights;
}

/**
 * Calculate quality score based on feedback
 */
export function calculateQualityScore(feedbackData: FeedbackData): number {
  if (feedbackData.totalFeedback === 0) {
    return 0;
  }

  // Base score from useful percentage
  let score = feedbackData.usefulPercentage;

  // Bonus for high volume of feedback
  if (feedbackData.totalFeedback >= 50) {
    score = Math.min(100, score + 5);
  }

  // Penalty for recent not useful feedback
  const recentNotUseful = feedbackData.recentFeedback
    .filter((f) => f.rating === "not_useful")
    .slice(0, 5);

  if (recentNotUseful.length > 2) {
    score = Math.max(0, score - 10);
  }

  return Math.round(score);
}
