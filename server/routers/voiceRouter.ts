import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { processVoiceInput } from "../voice";

export const voiceRouter = router({
  transcribeVoice: protectedProcedure
    .input(z.object({ audioBase64: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.audioBase64, "base64");
      const text = await processVoiceInput(buffer, ctx.user.id);
      return { text };
    }),
});
