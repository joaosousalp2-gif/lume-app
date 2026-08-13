import { z } from "zod";
import { getLaunchesByUserId } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { buildFinancialInsights, simulateMonthlySaving } from "../financialInsights";

export const financialInsightsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const launches = await getLaunchesByUserId(ctx.user.id);
    return buildFinancialInsights(launches);
  }),

  simulate: protectedProcedure
    .input(z.object({ monthlySaving: z.number().min(0).max(1_000_000), months: z.number().int().min(1).max(120) }))
    .query(async ({ ctx, input }) => {
      const launches = await getLaunchesByUserId(ctx.user.id);
      const insights = buildFinancialInsights(launches);
      return {
        currentBalance: insights.currentBalance,
        projectedBalance30Days: insights.projectedBalance30Days,
        simulatedBalance: simulateMonthlySaving(insights.projectedBalance30Days, input.monthlySaving, input.months),
      };
    }),
});
