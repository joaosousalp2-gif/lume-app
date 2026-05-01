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
      
      // Calculate financial context
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

      // 3. Get chat history (last 10 messages)
      const history = await getChatHistory(userId, 10);
      const sortedHistory = history.reverse();

      // 4. Build system prompt
      const categoriasStr = Object.entries(gastosPorCategoria)
        .map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`)
        .join(", ") || "Nenhum gasto registrado";

      const systemPrompt = `Você é um assistente financeiro especializado em educação financeira para pessoas com 60+ anos.

Dados financeiros do usuário:
- Total de receitas este mês: R$ ${totalReceita.toFixed(2)}
- Total de despesas este mês: R$ ${totalDespesa.toFixed(2)}
- Saldo: R$ ${saldo.toFixed(2)}
- Gastos por categoria: ${categoriasStr}

Seu objetivo:
1. Analisar padrões de gastos do usuário
2. Oferecer dicas personalizadas de economia
3. Responder perguntas sobre finanças
4. Verificar segurança de sites/empresas quando solicitado

Sempre use linguagem clara, acessível, sem jargão técnico.`;

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
