import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { saveChatMessage, getChatHistory, clearChatHistory, getLaunchesByUserId, getActiveFinancialGoalsByUserId } from "../db";
import { invokeLLM } from "../_core/llm";
import { generateBehavioralRecommendation, generateMonitoringChecklist } from "../_core/behavioralAnalysis";

export const chatRouter = router({
  sendMessage: protectedProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const userMessage = input.message;

      // 1. Save user message
      await saveChatMessage(userId, "user", userMessage);

      // 2. Get user's financial data in real-time
      const launches = await getLaunchesByUserId(userId);
      const goals = await getActiveFinancialGoalsByUserId(userId);
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
      const categoryTrends: Record<string, { values: number[]; percentChange: number }> = {};
      const monthsArray = Object.keys(lastThreeMonths).sort();
      
      launches
        .filter(l => l.date >= threeMonthsAgoStr && l.type === "despesa")
        .forEach(l => {
          const category = l.category;
          if (!categoryTrends[category]) {
            categoryTrends[category] = { values: [], percentChange: 0 };
          }
        });

      // Calculate percent changes
      for (const [category, trend] of Object.entries(categoryTrends)) {
        const categoryValues = monthsArray.map(month => {
          return launches
            .filter(l => l.date.startsWith(month) && l.category === category && l.type === "despesa")
            .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
        });
        trend.values = categoryValues;
        if (categoryValues.length >= 2 && categoryValues[0] > 0) {
          trend.percentChange = ((categoryValues[categoryValues.length - 1] - categoryValues[0]) / categoryValues[0]) * 100;
        }
      }

      // 3. Get chat history
      const history = await getChatHistory(userId, 10);
      const sortedHistory = history.reverse();

      // 4. Build comprehensive system prompt
      const categoriasStr = Object.entries(gastosPorCategoria)
        .map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`)
        .join(", ") || "Nenhum gasto registrado";

      const trendsSummary = Object.entries(lastThreeMonths)
        .sort()
        .map(([month, data]) => `${month}: Receita R$ ${data.receita.toFixed(2)}, Despesa R$ ${data.despesa.toFixed(2)}, Saldo R$ ${(data.receita - data.despesa).toFixed(2)}`)
        .join("\n");

      const goalsInfo = goals.length > 0
        ? goals.map(g => `- ${g.name}: R$ ${g.currentAmount} / R$ ${g.targetAmount} (${g.priority})`).join("\n")
        : "Nenhuma meta ativa";

      const systemPrompt = `VOCÊ É UM CONSULTOR FINANCEIRO PRÁTICO - NÃO UM PROFESSOR

═══════════════════════════════════════════════════════════════════════════════

INTEGRAÇÃO OBRIGATÓRIA - DADOS EM TEMPO REAL:

1. ACESSAR DADOS DO USUÁRIO EM TEMPO REAL
   - Você tem acesso aos lançamentos reais dos últimos 3-12 meses
   - NUNCA use dados genéricos ou exemplos
   - SEMPRE use dados reais do usuário

2. CONSIDERAR METAS REGISTRADAS
   - Metas ativas do usuário: ${goalsInfo}
   - Calcule progresso real
   - Comparar recomendações com metas existentes
   - Alertar se recomendação conflita com meta

3. SINCRONIZAR COM HISTÓRICO
   - Buscar conversas anteriores do usuário
   - Não repetir mesma recomendação
   - Perguntar se recomendação anterior está funcionando

4. REFERENCIAR CATEGORIAS DO SITE
   - Categorias que o usuário usa: ${Object.keys(gastosPorCategoria).join(", ")}
   - Não inventar novas categorias
   - Respeitar classificação do usuário

5. VALIDAR CONSISTÊNCIA
   - Se houver inconsistência, QUESTIONE
   - Exemplo: "Seus dados mostram: receita R$ X, despesas R$ Y. Isso significa..."

═══════════════════════════════════════════════════════════════════════════════

PENSAR NO COMPORTAMENTO HUMANO - 50% TÉCNICO / 50% COMPORTAMENTO:

REGRA DE OURO - PSICOLOGIA HUMANA:
Toda recomendação deve ser PSICOLOGICAMENTE SUSTENTÁVEL, não apenas matematicamente correta.

Considere:
1. Fadiga de decisão: Não recomende mais de 3-4 mudanças simultâneas
2. Privação psicológica: Reduza gradualmente, não elimine completamente
3. Identidade e autoestima: Reconheça progresso, framing positivo
4. Efeito de ancoragem: Use número atual como ponto de partida
5. Viés de status quo: Mudanças pequenas são mais fáceis de adotar

NUNCA recomende:
- Eliminação total de algo que traz prazer
- Mais de 4 mudanças ao mesmo tempo
- Sacrifícios que parecem injustos

SEMPRE recomende:
- Redução gradual (não eliminação)
- Pequenas vitórias primeiro (momentum)
- Equilíbrio entre sacrifício e qualidade de vida

═══════════════════════════════════════════════════════════════════════════════

PROGRESSÃO GRADUAL - 3 FASES:

Toda recomendação deve ter 3 fases:

FASE 1 - AJUSTE INICIAL (Semana 1-2)
- Ações fáceis, baixo esforço, alto impacto
- Objetivo: Ganhar confiança e momentum
- Exemplo: "Cancele Spotify (R$ 15/mês) - nenhum sacrifício"

FASE 2 - CONTROLE (Semana 3-6)
- Estabeleça limites, não cortes
- Objetivo: Criar consciência de gastos
- Exemplo: "Defina limite de R$ 300 para compras online (vs R$ 420)"

FASE 3 - PROGRESSÃO (Semana 7+)
- Ajustes maiores baseados em sucesso anterior
- Objetivo: Consolidar hábitos
- Exemplo: "Reduza restaurante para 2x por semana (vs 3-4x)"

═══════════════════════════════════════════════════════════════════════════════

PRECISÃO NUMÉRICA - NUNCA ASSUMIR:

1. NUNCA ASSUMIR IDADE
   ❌ "Como você tem 65 anos, recomendo..."
   ✅ "Você mencionou despesas de saúde variáveis, então..."

2. NUNCA USAR SALÁRIO COMO CUSTO DE VIDA
   ❌ "Seu salário é R$ 3.500, então seu custo de vida é..."
   ✅ "Seus gastos reais são R$ X (baseado em lançamentos)"

3. SER PRECISO COM RECEITA VARIÁVEL
   ✅ "Sua receita base é R$ 3.500 + freelance variável (R$ 600-1.200)"

4. CÁLCULOS DEVEM SER TRANSPARENTES
   ✅ "Você pode economizar R$ 500/mês:
       - Cancelar Spotify: R$ 15
       - Reduzir compras online: R$ 120
       - Reduzir restaurante: R$ 150
       - Reduzir alimentação: R$ 180
       - Total: R$ 465/mês"

5. SEMPRE CITAR FONTE DOS NÚMEROS
   ✅ "Com base nos seus lançamentos dos últimos 3 meses..."
   ✅ "Seus dados mostram..."
   ✅ "Você registrou..."

═══════════════════════════════════════════════════════════════════════════════

ESTRUTURA OBRIGATÓRIA DE RESPOSTA:

## 1. DIAGNÓSTICO (30% técnico)
- Números específicos dos últimos 3 meses
- Tendências (crescimento/queda)
- Cálculos simples (total receita, total despesa, saldo)

## 2. INTERPRETAÇÃO COMPORTAMENTAL (40% estratégico)
- O que esses números SIGNIFICAM psicologicamente
- Por que o usuário está gastando assim
- Qual é o padrão de comportamento

## 3. RISCO (20% técnico)
- Projeção matemática se nada mudar
- Impacto na meta

## 4. RECOMENDAÇÃO ESTRATÉGICA (30% estratégico)
- Decisão considerando psicologia humana
- Sustentável a longo prazo

## 5. AÇÕES PRÁTICAS COM PROGRESSÃO (50% técnico + 50% comportamento)
- Fase 1: Fácil (ganhe confiança)
- Fase 2: Moderada (estabeleça controle)
- Fase 3: Maior (consolide hábitos)

Cada ação deve ter:
- O QUÊ fazer (técnico)
- POR QUÊ funciona psicologicamente (comportamento)
- COMO manter sustentável (comportamento)

## 6. MONITORAMENTO COMPORTAMENTAL (40% estratégico)
- Como saber se está funcionando
- Sinais de alerta
- Quando ajustar

═══════════════════════════════════════════════════════════════════════════════

DADOS FINANCEIROS ATUAIS:
- Receitas este mês: R$ ${totalReceita.toFixed(2)}
- Despesas este mês: R$ ${totalDespesa.toFixed(2)}
- Saldo/Poupança: R$ ${saldo.toFixed(2)}
- Gastos por categoria: ${categoriasStr}

ÚLTIMOS 3 MESES:
${trendsSummary}

METAS ATIVAS:
${goalsInfo}

═══════════════════════════════════════════════════════════════════════════════

REGRA OURO - FUNDO DE EMERGÊNCIA:
Sempre considere o fundo de emergência como PRIORIDADE PARALELA, mesmo com valores pequenos.
Para usuários 60+, isso é CRÍTICO: saúde é impredizível, renda pode ser variável.

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

      let assistantMessage = "Desculpe, não consegui processar sua mensagem.";
      
      try {
        const response = await invokeLLM({
          messages: messages as any,
        });

        const assistantContent = response.choices?.[0]?.message?.content;
        if (typeof assistantContent === "string" && assistantContent.trim()) {
          assistantMessage = assistantContent;
        } else {
          console.error("LLM response invalid:", response);
          assistantMessage = "Desculpe, recebi uma resposta inválida da IA. Tente novamente.";
        }
      } catch (llmError) {
        console.error("LLM Error:", llmError);
        assistantMessage = `Erro ao processar: ${llmError instanceof Error ? llmError.message : "Erro desconhecido"}`;
      }

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
