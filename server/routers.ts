import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createLaunch, deleteLaunch, getLaunchesByUserId, updateLaunch, getRulesByUserId, createRule, updateRule, deleteRule, matchRuleForDescription, incrementRuleUsage } from "./db";
import { suggestCategory, getAvailableCategories } from "./_core/categorization";

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

  trust: router({
    verify: publicProcedure
      .input(z.object({ company: z.string() }))
      .query(({ input }) => ({
        success: true,
        data: {
          company: input.company,
          reputation: "Bom",
          score: 7.5,
          resolutionIndex: 85,
          wouldReturnPercentage: 72,
          complaints: [
            { category: "Entrega", count: 12 },
            { category: "Qualidade", count: 8 },
            { category: "Atendimento", count: 5 },
          ],
          status: "Ativa",
        },
      })),
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
    suggestCategory: protectedProcedure
      .input(z.object({
        description: z.string(),
        type: z.enum(["receita", "despesa"]),
      }))
      .mutation(({ input }) => suggestCategory(input.description, input.type)),
    getCategories: publicProcedure
      .input(z.object({
        type: z.enum(["receita", "despesa"]),
      }))
      .query(({ input }) => getAvailableCategories(input.type)),
  }),

  rules: router({
    list: protectedProcedure.query(({ ctx }) => getRulesByUserId(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        pattern: z.string().min(1, "Padrão não pode estar vazio"),
        type: z.enum(["receita", "despesa"]),
        category: z.string().min(1, "Categoria não pode estar vazia"),
        priority: z.number().default(0),
      }))
      .mutation(({ ctx, input }) => createRule({
        userId: ctx.user.id,
        pattern: input.pattern,
        type: input.type,
        category: input.category,
        priority: input.priority,
        isActive: 1,
        timesApplied: 0,
      })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        pattern: z.string().optional(),
        type: z.enum(["receita", "despesa"]).optional(),
        category: z.string().optional(),
        priority: z.number().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(({ input }) => updateRule(input.id, input)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteRule(input.id)),
    matchRule: protectedProcedure
      .input(z.object({
        description: z.string(),
        type: z.enum(["receita", "despesa"]),
      }))
      .query(({ ctx, input }) => matchRuleForDescription(ctx.user.id, input.description, input.type)),
  }),
});

export type AppRouter = typeof appRouter;
