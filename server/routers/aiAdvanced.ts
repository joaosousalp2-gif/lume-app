/**
 * Advanced AI router for financial recommendations
 */

import { protectedProcedure, router } from "../\_core/trpc";
import { z } from "zod";
import {
  generateEconomyRecommendations,
  generateInvestmentRecommendations,
  generateFraudAlerts,
  generatePlanningRecommendations,
  saveRecommendation,
  getUserRecommendations,
} from "../aiRecommendations";
import { dispatchWebhookEvent } from "../webhookDispatcher";
export const aiAdvancedRouter = router({
  /**
   * Get economy recommendations (corte de gastos)
   */
  getEconomyRecommendations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const recommendations = await generateEconomyRecommendations(ctx.user.id);

      // Save to database
      for (let i = 0; i < recommendations.length; i++) {
        await saveRecommendation(
          ctx.user.id,
          "economia",
          `Dica de economia ${i + 1}`,
          recommendations[i],
          i === 0 ? "alta" : i === 1 ? "media" : "baixa"
        );
      }

      return {
        success: true,
        type: "economia",
        recommendations,
        message: "Economy recommendations generated",
      };
    } catch (error) {
      console.error("[Economy Recommendations Error]", error);
      return {
        success: false,
        error: "Failed to generate economy recommendations",
      };
    }
  }),

  /**
   * Get investment recommendations
   */
  getInvestmentRecommendations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const recommendations = await generateInvestmentRecommendations(ctx.user.id);

      // Save to database
      for (let i = 0; i < recommendations.length; i++) {
        await saveRecommendation(
          ctx.user.id,
          "investimento",
          `Oportunidade de investimento ${i + 1}`,
          recommendations[i],
          i === 0 ? "alta" : i === 1 ? "media" : "baixa"
        );
      }

      return {
        success: true,
        type: "investimento",
        recommendations,
        message: "Investment recommendations generated",
      };
    } catch (error) {
      console.error("[Investment Recommendations Error]", error);
      return {
        success: false,
        error: "Failed to generate investment recommendations",
      };
    }
  }),

  /**
   * Get fraud alerts
   */
  getFraudAlerts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const alerts = await generateFraudAlerts(ctx.user.id);

      // Save to database with high priority
      for (const alert of alerts) {
        await saveRecommendation(
          ctx.user.id,
          "fraude",
          "Alerta de fraude detectado",
          alert,
          "alta"
        );

        // Dispatch webhook event for fraud detection
        if (alerts.length > 0) {
          await dispatchWebhookEvent(ctx.user.id, "fraud_detected", {
            description: alert,
            severity: "high",
          });
        }
      }

      return {
        success: true,
        type: "fraude",
        alerts,
        message: alerts.length > 0 ? "Fraud alerts detected" : "No fraud detected",
      };
    } catch (error) {
      console.error("[Fraud Alerts Error]", error);
      return {
        success: false,
        error: "Failed to generate fraud alerts",
      };
    }
  }),

  /**
   * Get planning recommendations
   */
  getPlanningRecommendations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const recommendations = await generatePlanningRecommendations(ctx.user.id);

      // Save to database
      for (let i = 0; i < recommendations.length; i++) {
        await saveRecommendation(
          ctx.user.id,
          "planejamento",
          `Ação de planejamento ${i + 1}`,
          recommendations[i],
          i === 0 ? "alta" : i === 1 ? "media" : "baixa"
        );
      }

      return {
        success: true,
        type: "planejamento",
        recommendations,
        message: "Planning recommendations generated",
      };
    } catch (error) {
      console.error("[Planning Recommendations Error]", error);
      return {
        success: false,
        error: "Failed to generate planning recommendations",
      };
    }
  }),

  /**
   * Get all recommendations for user
   */
  getAllRecommendations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const recommendations = await getUserRecommendations(ctx.user.id);

      return {
        success: true,
        recommendations,
        total: recommendations.length,
      };
    } catch (error) {
      console.error("[Get Recommendations Error]", error);
      return {
        success: false,
        error: "Failed to get recommendations",
      };
    }
  }),

  /**
   * Mark recommendation as viewed
   */
  markAsViewed: protectedProcedure
    .input(z.object({ recommendationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { getDb } = await import("../db");
        const { aiRecommendations } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(aiRecommendations)
          .set({ status: "visualizado" })
          .where(eq(aiRecommendations.id, input.recommendationId));

        return {
          success: true,
          message: "Recommendation marked as viewed",
        };
      } catch (error) {
        console.error("[Mark as Viewed Error]", error);
        return {
          success: false,
          error: "Failed to mark recommendation as viewed",
        };
      }
    }),

  /**
   * Mark recommendation as implemented
   */
  markAsImplemented: protectedProcedure
    .input(z.object({ recommendationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { getDb } = await import("../db");
        const { aiRecommendations } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(aiRecommendations)
          .set({ status: "implementado" })
          .where(eq(aiRecommendations.id, input.recommendationId));

        return {
          success: true,
          message: "Recommendation marked as implemented",
        };
      } catch (error) {
        console.error("[Mark as Implemented Error]", error);
        return {
          success: false,
          error: "Failed to mark recommendation as implemented",
        };
      }
    }),
});
