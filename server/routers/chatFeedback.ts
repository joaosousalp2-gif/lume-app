import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { saveChatMessageFeedback, getChatFeedbackStats, getRecentChatFeedback } from "../db";

export const chatFeedbackRouter = router({
  /**
   * Save feedback for a chat message
   */
  saveFeedback: protectedProcedure
    .input(
      z.object({
        messageContent: z.string().min(1),
        messageRole: z.enum(["user", "assistant"]),
        messageTimestamp: z.date(),
        rating: z.enum(["useful", "not_useful"]),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const feedback = await saveChatMessageFeedback(
        ctx.user.id,
        input.messageContent,
        input.messageRole,
        input.messageTimestamp,
        input.rating,
        input.comment
      );

      return {
        success: true,
        feedback,
      };
    }),

  /**
   * Get feedback statistics for the current user
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await getChatFeedbackStats(ctx.user.id);
    return stats;
  }),

  /**
   * Get recent feedback for the current user
   */
  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const feedback = await getRecentChatFeedback(ctx.user.id, input.limit);
      return feedback;
    }),
});
