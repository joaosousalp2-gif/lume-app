import { invokeLLM } from "./_core/llm";

export async function generatePersonalizedFinancialAdvice(launches: Array<{ type: string; category: string; value: string; description?: string }>) {
  const totalIncome = launches.filter(l => l.type === "receita").reduce((acc, l) => acc + (parseFloat(l.value) || 0), 0);
  const totalExpense = launches.filter(l => l.type === "despesa").reduce((acc, l) => acc + (parseFloat(l.value) || 0), 0);
  const balance = totalIncome - totalExpense;

  const categories: Record<string, number> = {};
  for (const l of launches) {
    if (l.type === "despesa") {
      categories[l.category] = (categories[l.category] || 0) + (parseFloat(l.value) || 0);
    }
  }

  const topCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`)
    .join(", ");

  const prompt = `Você é o assistente financeiro humano e acolhedor da Lume, focado em ajudar pessoas com mais de 60 anos com clareza e empatia.
Dados financeiros do utilizador:
- Receitas totais: R$ ${totalIncome.toFixed(2)}
- Despesas totais: R$ ${totalExpense.toFixed(2)}
- Saldo: R$ ${balance.toFixed(2)}
- Principais categorias de gastos: ${topCategories || "Nenhum gasto registado ainda"}

Escreva 3 conselhos financeiros curtos, diretos, acolhedores e práticos, sem usar asteriscos, sem formatação robótica e sem jargão complexo. Cada conselho deve ter no máximo duas frases.`;

  try {
    const res = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um consultor financeiro humano, caloroso e direto para público sênior." },
        { role: "user", content: prompt },
      ],
    });

    const rawContent = res.choices[0]?.message?.content;
    const content = typeof rawContent === "string" ? rawContent : "";
    const cleaned = content.replace(/[\*\_#]/g, "").trim();
    if (cleaned) {
      return cleaned.split("\n").filter(Boolean).slice(0, 3);
    }
  } catch (error) {
    console.error("Error generating personalized advice via LLM:", error);
  }

  // Fallback seguro baseado em regras
  const fallback = [];
  if (balance < 0) {
    fallback.push("As suas despesas estão acima das receitas este mês. Vamos tentar rever os gastos não essenciais juntos?");
  } else {
    fallback.push("Parabéns por manter o orçamento equilibrado! Continuar a poupar um pouco todos os meses traz muita tranquilidade.");
  }
  if (topCategories) {
    fallback.push(`Notamos que os seus maiores gastos estão concentrados em ${topCategories}. Vale a pena conferir se há oportunidades de otimização.`);
  } else {
    fallback.push("Adicione as suas receitas e despesas ou ligue o Open Finance para receber recomendações detalhadas.");
  }
  fallback.push("Lembre-se de manter uma reserva de emergência guardada com segurança numa conta de rendimento garantido.");
  return fallback;
}
