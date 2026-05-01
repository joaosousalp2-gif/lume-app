import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { saveChatMessage, getChatHistory, clearChatHistory, getLaunchesByUserId } from "../db";
import { invokeLLM } from "../_core/llm";

export const chatRouter = router({
  sendMessage: protectedProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const userMessage = input.message;

      // 1. Save user message
      await saveChatMessage(userId, "user", userMessage);

      // 2. Get user's financial data
      const launches = await getLaunchesByUserId(userId);
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Calculate financial context for current month
      const totalReceita = launches
        .filter(l => l.type === "receita" && l.date.startsWith(currentMonth))
        .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
      
      const totalDespesa = launches
        .filter(l => l.type === "despesa" && l.date.startsWith(currentMonth))
        .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
      
      const saldo = totalReceita - totalDespesa;
      
      // Group expenses by category
      const gastosPorCategoria: Record<string, number> = {};
      launches
        .filter(l => l.type === "despesa" && l.date.startsWith(currentMonth))
        .forEach(l => {
          gastosPorCategoria[l.category] = (gastosPorCategoria[l.category] || 0) + (parseFloat(l.value) || 0);
        });

      // Calculate trends from last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const threeMonthsAgoStr = threeMonthsAgo.toISOString().slice(0, 7);
      
      const lastThreeMonths: Record<string, { receita: number; despesa: number }> = {};
      launches
        .filter(l => l.date >= threeMonthsAgoStr)
        .forEach(l => {
          const month = l.date.slice(0, 7);
          if (!lastThreeMonths[month]) {
            lastThreeMonths[month] = { receita: 0, despesa: 0 };
          }
          const value = parseFloat(l.value) || 0;
          if (l.type === "receita") {
            lastThreeMonths[month].receita += value;
          } else {
            lastThreeMonths[month].despesa += value;
          }
        });

      // Calculate category trends
      const categoryTrends: Record<string, Array<{ month: string; value: number }>> = {};
      launches
        .filter(l => l.date >= threeMonthsAgoStr && l.type === "despesa")
        .forEach(l => {
          const month = l.date.slice(0, 7);
          const category = l.category;
          if (!categoryTrends[category]) {
            categoryTrends[category] = [];
          }
          const existing = categoryTrends[category].find(t => t.month === month);
          if (existing) {
            existing.value += parseFloat(l.value) || 0;
          } else {
            categoryTrends[category].push({ month, value: parseFloat(l.value) || 0 });
          }
        });

      // 3. Get chat history (last 10 messages)
      const history = await getChatHistory(userId, 10);
      const sortedHistory = history.reverse();

      // 4. Build enhanced system prompt
      const categoriasStr = Object.entries(gastosPorCategoria)
        .map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`)
        .join(", ") || "Nenhum gasto registrado";

      const trendsSummary = Object.entries(lastThreeMonths)
        .sort()
        .map(([month, data]) => `${month}: Receita R$ ${data.receita.toFixed(2)}, Despesa R$ ${data.despesa.toFixed(2)}, Saldo R$ ${(data.receita - data.despesa).toFixed(2)}`)
        .join("\n");

      const systemPrompt = `VOCÊ É UM CONSULTOR FINANCEIRO PRÁTICO, NÃO UM PROFESSOR.

POSTURA:
- Direto e objetivo (sem "encheção de linguiça")
- Analítico e baseado em DADOS
- Decisivo (toma posição clara, não fica "em cima do muro")
- Focado em AÇÃO, não em teoria
- Honesto sobre riscos

EVITE:
- Excesso de elogios ("você está no caminho certo")
- Linguagem emocional ("com carinho", "adorei sua pergunta")
- Respostas neutras que não comprometem ("você pode fazer X ou Y")
- Frases genéricas de motivação ("boa sorte!", "tenha disciplina")
- Assumir informações não fornecidas (idade, dependentes, estado civil)

DADOS FINANCEIROS ATUAIS:
- Receitas este mês: R$ ${totalReceita.toFixed(2)}
- Despesas este mês: R$ ${totalDespesa.toFixed(2)}
- Saldo/Poupança: R$ ${saldo.toFixed(2)}
- Gastos por categoria: ${categoriasStr}

ÚLTIMOS 3 MESES:
${trendsSummary}

ESTRUTURA OBRIGATÓRIA DE RESPOSTA:

## 1. DIAGNÓSTICO
O que está acontecendo com as finanças? Resuma em 2-3 linhas com números específicos e padrões identificados.

## 2. RISCO
O que pode dar errado se nada mudar? Cite pelo menos 1 risco específico, projete o cenário negativo.

## 3. RECOMENDAÇÃO CLARA
O que deve ser feito? Uma recomendação principal (não "você pode fazer X ou Y"), justificada com dados.

## 4. AÇÕES PRÁTICAS
Como executar? Seja tão específico que o usuário possa começar HOJE. Não diga "registre seus gastos", diga "anote todos os gastos por 30 dias em uma planilha".

ANÁLISE OBRIGATÓRIA:
1. Interprete os números: identifique tendências, calcule projeções, alerte sobre riscos
2. Identifique PELO MENOS um risco claro
3. Questione a situação: há inconsistências? Faltam informações importantes?

REGRA OURO - FUNDO DE EMERGÊNCIA:
Sempre considere o fundo de emergência como PRIORIDADE PARALELA, mesmo com valores pequenos.
Para usuários 60+, isso é CRÍTICO: saúde é impredizível, renda pode ser variável, emergências são frequentes.

LINGUAGEM:
- Banir: "você está no caminho certo", "com carinho", "registre seus gastos", "tenha disciplina", "boa sorte"
- Usar: números específicos, ações concretas, recomendações decisivas

USUÁRIO: Pessoa 60+ com foco em segurança financeira e educação prática.
Linguagem clara, acessível, sem jargão técnico.`;

      // 5. Call LLM with context and history
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        ...sortedHistory.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user", content: userMessage },
      ];

      const response = await invokeLLM({
        messages: messages as any,
      });

      const assistantContent = response.choices?.[0]?.message?.content;
      const assistantMessage = typeof assistantContent === "string" ? assistantContent : "Desculpe, não consegui processar sua mensagem.";

      // 6. Save assistant response
      await saveChatMessage(userId, "assistant", assistantMessage);

      // 7. Return response
      return {
        message: assistantMessage,
        context: {
          totalReceita,
          totalDespesa,
          saldo,
          gastosPorCategoria,
        },
      };
    }),

  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const history = await getChatHistory(ctx.user.id, 50);
    return history.reverse();
  }),

  clearHistory: protectedProcedure.mutation(async ({ ctx }) => {
    await clearChatHistory(ctx.user.id);
    return { success: true };
  }),
});
