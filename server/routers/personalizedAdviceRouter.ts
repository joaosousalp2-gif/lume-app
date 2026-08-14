import { protectedProcedure, router } from "../_core/trpc";
import { getLaunchesByUserId } from "../db";
import { generatePersonalizedFinancialAdvice } from "../personalizedAdvice";

export const personalizedAdviceRouter = router({
  getAdvice: protectedProcedure.query(async ({ ctx }) => {
    const rawLaunches = await getLaunchesByUserId(ctx.user.id);
    const launches = rawLaunches.map(l => ({ ...l, description: l.description ?? undefined }));
    const advice = await generatePersonalizedFinancialAdvice(launches);
    return {
      success: true,
      advice,
    };
  }),
});
