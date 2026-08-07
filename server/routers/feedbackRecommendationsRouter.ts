import { protectedProcedure, router } from "../_core/trpc";
import { getChatFeedbackStats, getRecentChatFeedback } from "../db";
import {
  generateFeedbackRecommendations,
  getFeedbackInsights,
  calculateQualityScore,
} from "../feedbackRecommendations";

export const feedbackRecommendationsRouter = router({
  /**
   * Get recommendations based on feedback data
   */
  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const recentFeedback = await getRecentChatFeedback(ctx.user.id, 100);

      if (!recentFeedback || recentFeedback.length === 0) {
        return {
          success: true,
          recommendations: [],
          insights: ["Nenhum feedback disponível ainda. Comece a usar o Agente Financeiro!"],
          qualityScore: 0,
        };
      }

      const useful = recentFeedback.filter((f) => f.rating === "useful").length;
      const notUseful = recentFeedback.filter((f) => f.rating === "not_useful").length;
      const total = useful + notUseful;

      const feedbackData = {
        totalFeedback: total,
        usefulCount: useful,
        notUsefulCount: notUseful,
        usefulPercentage: Math.round((useful / total) * 100),
        recentFeedback: recentFeedback,
      };

      const recommendations = await generateFeedbackRecommendations(feedbackData);
      const insights = getFeedbackInsights(feedbackData);
      const qualityScore = calculateQualityScore(feedbackData);

      return {
        success: true,
        recommendations,
        insights,
        qualityScore,
        feedbackStats: {
          total: feedbackData.totalFeedback,
          useful: feedbackData.usefulCount,
          notUseful: feedbackData.notUsefulCount,
          usefulPercentage: feedbackData.usefulPercentage,
        },
      };
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao gerar recomendações",
        recommendations: [],
        insights: [],
        qualityScore: 0,
      };
    }
  }),

  /**
   * Get quality insights
   */
  getInsights: protectedProcedure.query(async ({ ctx }) => {
    try {
      const recentFeedback = await getRecentChatFeedback(ctx.user.id, 100);

      if (!recentFeedback || recentFeedback.length === 0) {
        return {
          success: true,
          insights: ["Nenhum feedback disponível ainda."],
          qualityScore: 0,
        };
      }

      const useful = recentFeedback.filter((f) => f.rating === "useful").length;
      const notUseful = recentFeedback.filter((f) => f.rating === "not_useful").length;
      const total = useful + notUseful;

      const feedbackData = {
        totalFeedback: total,
        usefulCount: useful,
        notUsefulCount: notUseful,
        usefulPercentage: Math.round((useful / total) * 100),
        recentFeedback: recentFeedback,
      };

      const insights = getFeedbackInsights(feedbackData);
      const qualityScore = calculateQualityScore(feedbackData);

      return {
        success: true,
        insights,
        qualityScore,
      };
    } catch (error) {
      console.error("Error getting insights:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao obter insights",
        insights: [],
        qualityScore: 0,
      };
    }
  }),
});
