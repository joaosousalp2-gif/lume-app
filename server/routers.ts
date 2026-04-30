import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createLaunch, deleteLaunch, getLaunchesByUserId, updateLaunch } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  launches: router({
    list: protectedProcedure.query(({ ctx }) => getLaunchesByUserId(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["receita", "despesa"]),
        date: z.string(),
        category: z.string(),
        value: z.string(),
        description: z.string().optional(),
        recurrence: z.string().default("Única"),
        endDate: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => createLaunch({
        userId: ctx.user.id,
        ...input,
      })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        type: z.enum(["receita", "despesa"]).optional(),
        date: z.string().optional(),
        category: z.string().optional(),
        value: z.string().optional(),
        description: z.string().optional(),
        recurrence: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .mutation(({ input }) => updateLaunch(input.id, input)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteLaunch(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
