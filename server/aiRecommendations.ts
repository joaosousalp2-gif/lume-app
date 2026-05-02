/**
 * AI Recommendations engine for financial advice
 * Generates recommendations for: economia, investimentos, fraude, planejamento
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { aiRecommendations, launches, budgets, financialGoals } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Get user's financial data for analysis
 */
async function getUserFinancialData(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userLaunches = await db
    .select()
    .from(launches)
    .where(eq(launches.userId, userId))
    .limit(100);

  const userBudgets = await db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, userId));

  const userGoals = await db
    .select()
    .from(financialGoals)
    .where(eq(financialGoals.userId, userId));

  return {
    launches: userLaunches,
    budgets: userBudgets,
    goals: userGoals,
  };
}

/**
 * Generate economy recommendations (corte de gastos)
 */
export async function generateEconomyRecommendations(userId: number): Promise<string[]> {
  try {
    const data = await getUserFinancialData(userId);

    // Calculate spending by category
    const expenses = data.launches.filter((l: any) => l.type === "despesa");
    const categorySpending: Record<string, number> = {};

    for (const expense of expenses) {
      const amount = parseFloat(expense.value);
      categorySpending[expense.category] =
        (categorySpending[expense.category] || 0) + amount;
    }

    const prompt = `Analise estes gastos e sugira 3 formas práticas de economizar:
    
Gastos por categoria:
${Object.entries(categorySpending)
  .map(([cat, amount]) => `- ${cat}: R$ ${amount.toFixed(2)}`)
  .join("\n")}

Orçamentos definidos:
${data.budgets
  .map((b: any) => `- ${b.category}: R$ ${b.limit}`)
  .join("\n")}

Retorne apenas 3 recomendações práticas e específicas, uma por linha.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um consultor financeiro especializado em economia pessoal. Dê recomendações práticas e específicas.",
        },
        { role: "user", content: prompt },
      ],
    });

    const recommendations = (response.choices[0].message.content as string)
      .split("\n")
      .filter((r) => r.trim())
      .slice(0, 3);

    return recommendations;
  } catch (error) {
    console.error("[Economy Recommendations Error]", error);
    return [];
  }
}

/**
 * Generate investment recommendations
 */
export async function generateInvestmentRecommendations(userId: number): Promise<string[]> {
  try {
    const data = await getUserFinancialData(userId);

    // Calculate income and savings
    const income = data.launches
      .filter((l: any) => l.type === "receita")
      .reduce((sum: number, l: any) => sum + parseFloat(l.value), 0);

    const expenses = data.launches
      .filter((l: any) => l.type === "despesa")
      .reduce((sum: number, l: any) => sum + parseFloat(l.value), 0);

    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    const prompt = `Com base nestes dados financeiros, sugira 3 opções de investimento:

Renda mensal: R$ ${income.toFixed(2)}
Gastos mensais: R$ ${expenses.toFixed(2)}
Economia mensal: R$ ${savings.toFixed(2)}
Taxa de poupança: ${savingsRate.toFixed(1)}%

Metas de investimento:
${data.goals
  .map((g: any) => `- ${g.name}: R$ ${g.targetAmount} (prazo: ${g.targetDate})`)
  .join("\n")}

Retorne 3 sugestões de investimento adequadas ao perfil, uma por linha.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um assessor de investimentos. Recomende opções seguras e adequadas ao perfil de renda.",
        },
        { role: "user", content: prompt },
      ],
    });

    const recommendations = (response.choices[0].message.content as string)
      .split("\n")
      .filter((r) => r.trim())
      .slice(0, 3);

    return recommendations;
  } catch (error) {
    console.error("[Investment Recommendations Error]", error);
    return [];
  }
}

/**
 * Generate fraud alerts (detecção de padrões suspeitos)
 */
export async function generateFraudAlerts(userId: number): Promise<string[]> {
  try {
    const data = await getUserFinancialData(userId);

    // Analyze transaction patterns
    const launches = data.launches as any[];
    const recentLaunches = launches.slice(-30); // Last 30 transactions

    // Calculate average transaction value
    const avgValue =
      recentLaunches.reduce((sum, l) => sum + parseFloat(l.value), 0) /
      recentLaunches.length;

    // Find outliers
    const outliers = recentLaunches.filter(
      (l) => parseFloat(l.value) > avgValue * 3
    );

    const prompt = `Analise estes padrões de transação e identifique possíveis fraudes:

Transações recentes: ${recentLaunches.length}
Valor médio: R$ ${avgValue.toFixed(2)}
Transações anormais (3x acima da média): ${outliers.length}

Transações suspeitas:
${outliers
  .map(
    (l) =>
      `- ${l.description}: R$ ${l.value} (${l.category}) em ${l.date}`
  )
  .join("\n")}

Identifique até 3 possíveis sinais de fraude ou atividades anormais, uma por linha.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em segurança financeira. Identifique padrões suspeitos e possíveis fraudes.",
        },
        { role: "user", content: prompt },
      ],
    });

    const alerts = (response.choices[0].message.content as string)
      .split("\n")
      .filter((a) => a.trim())
      .slice(0, 3);

    return alerts;
  } catch (error) {
    console.error("[Fraud Alerts Error]", error);
    return [];
  }
}

/**
 * Generate financial planning recommendations
 */
export async function generatePlanningRecommendations(userId: number): Promise<string[]> {
  try {
    const data = await getUserFinancialData(userId);

    // Calculate metrics
    const income = data.launches
      .filter((l: any) => l.type === "receita")
      .reduce((sum: number, l: any) => sum + parseFloat(l.value), 0);

    const expenses = data.launches
      .filter((l: any) => l.type === "despesa")
      .reduce((sum: number, l: any) => sum + parseFloat(l.value), 0);

    const prompt = `Com base no perfil financeiro, sugira 3 ações de planejamento:

Renda: R$ ${income.toFixed(2)}
Gastos: R$ ${expenses.toFixed(2)}
Saldo: R$ ${(income - expenses).toFixed(2)}

Metas ativas: ${data.goals.length}
Orçamentos: ${data.budgets.length}

Retorne 3 recomendações de planejamento financeiro de longo prazo, uma por linha.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um planejador financeiro. Recomende ações estratégicas para melhorar a saúde financeira.",
        },
        { role: "user", content: prompt },
      ],
    });

    const recommendations = (response.choices[0].message.content as string)
      .split("\n")
      .filter((r) => r.trim())
      .slice(0, 3);

    return recommendations;
  } catch (error) {
    console.error("[Planning Recommendations Error]", error);
    return [];
  }
}

/**
 * Save recommendation to database
 */
export async function saveRecommendation(
  userId: number,
  type: "economia" | "investimento" | "fraude" | "planejamento",
  title: string,
  description: string,
  priority: "baixa" | "media" | "alta" = "media"
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(aiRecommendations).values({
      userId,
      type,
      title,
      description,
      priority,
      status: "novo",
    });
  } catch (error) {
    console.error("[Save Recommendation Error]", error);
  }
}

/**
 * Get all recommendations for user
 */
export async function getUserRecommendations(userId: number) {
  try {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.userId, userId));
  } catch (error) {
    console.error("[Get Recommendations Error]", error);
    return [];
  }
}
