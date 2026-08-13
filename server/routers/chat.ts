import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { saveChatMessage, getChatHistory, clearChatHistory, getLaunchesByUserId, getActiveFinancialGoalsByUserId } from "../db";
import { invokeLLM } from "../_core/llm";

export const chatRouter = router({
  sendMessage: protectedProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const userMessage = input.message;

      await saveChatMessage(userId, "user", userMessage);

      const launches = await getLaunchesByUserId(userId);
      const goals = await getActiveFinancialGoalsByUserId(userId);
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const totalReceita = launches
        .filter(l => l.type === "receita" && l.date.startsWith(currentMonth))
        .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
      
      const totalDespesa = launches
        .filter(l => l.type === "despesa" && l.date.startsWith(currentMonth))
        .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
      
      const saldo = totalReceita - totalDespesa;
      
      const gastosPorCategoria: Record<string, number> = {};
      launches
        .filter(l => l.type === "despesa" && l.date.startsWith(currentMonth))
        .forEach(l => {
          gastosPorCategoria[l.category] = (gastosPorCategoria[l.category] || 0) + (parseFloat(l.value) || 0);
        });

      const categoriasStr = Object.entries(gastosPorCategoria)
        .map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`)
        .join(", ") || "Nenhum gasto registrado";

      const goalsInfo = goals.length > 0
        ? goals.map(g => `${g.name} (R$ ${g.currentAmount} de R$ ${g.targetAmount})`).join(", ")
        : "Nenhuma meta ativa";

      const history = await getChatHistory(userId, 10);
      const sortedHistory = history.reverse();

      const systemPrompt = `Você é um consultor financeiro pessoal que conversa como um amigo experiente, caloroso e humano. 
REGRAS DE OURO PARA O SEU TOM DE VOZ:
1. Fale de forma 100% natural e conversacional, como se estivesse a bater papo num café.
2. É ESTRITAMENTE PROIBIDO usar asteriscos (*), negritos em excesso, hashtags, marcadores de lista (-) ou títulos robóticos (como "Diagnóstico:" ou "Recomendação:"). O seu texto será lido por voz em alta, portanto escreva apenas frases corridas, claras e faladas.
3. Vá direto ao ponto de forma amigável e acolhedora, sem introduções formais ou mecânicas.
4. Utilize os dados reais do utilizador de forma fluida:
   - Receita deste mês: R$ ${totalReceita.toFixed(2)}
   - Despesa deste mês: R$ ${totalDespesa.toFixed(2)}
   - Saldo atual: R$ ${saldo.toFixed(2)}
   - Gastos por categoria: ${categoriasStr}
   - Metas: ${goalsInfo}`;

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
      const rawMessage = typeof assistantContent === "string" ? assistantContent : "Olá! Como posso ajudar nas suas finanças hoje?";
      
      // Limpar rigidamente qualquer asterisco ou markdown residual
      const assistantMessage = rawMessage
        .replace(/[*_#`~>-]/g, "")
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      await saveChatMessage(userId, "assistant", assistantMessage);

      return {
        message: assistantMessage,
        context: {
          totalReceita,
          totalDespesa,
          saldo,
          gastosPorCategoria,
          goals: goals.length,
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
