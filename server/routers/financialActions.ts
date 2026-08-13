import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { createLaunch } from "../db";
import { ENV } from "../_core/env";
import { protectedProcedure, router } from "../_core/trpc";
import { prepareFinancialAction } from "../financialActions";

const actionSchema = z.object({
  actionId: z.string().uuid(),
  type: z.literal("create_launch"),
  launch: z.object({
    type: z.enum(["receita", "despesa"]),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    category: z.string().min(1).max(64),
    value: z.string().regex(/^\d+(\.\d{2})$/),
    description: z.string().min(1).max(500),
    recurrence: z.string().min(1).max(20),
  }),
  confirmationText: z.string().min(1).max(300),
});

type SignedAction = z.infer<typeof actionSchema> & { userId: number; expiresAt: number };

function sign(value: string): string {
  return createHmac("sha256", ENV.cookieSecret || "lume-confirmation-key").update(value).digest("base64url");
}

function encodeAction(action: SignedAction): string {
  const payload = Buffer.from(JSON.stringify(action)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeAction(token: string): SignedAction {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) throw new Error("Token de confirmação inválido");
  const expected = sign(payload);
  const valid = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) throw new Error("Token de confirmação inválido");
  const action = actionSchema.extend({ userId: z.number(), expiresAt: z.number() }).parse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
  if (action.expiresAt < Date.now()) throw new Error("A confirmação expirou. Prepare o comando novamente.");
  return action;
}

export const financialActionsRouter = router({
  prepare: protectedProcedure
    .input(z.object({ message: z.string().min(1).max(1000) }))
    .mutation(({ ctx, input }) => {
      const action = prepareFinancialAction(input.message);
      if (!action) {
        return { requiresConfirmation: false as const, action: null, message: "Não consegui identificar uma operação financeira completa. Diga, por exemplo: regista uma despesa de 35 euros no supermercado." };
      }
      const signedAction: SignedAction = {
        ...action,
        userId: ctx.user.id,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };
      return {
        requiresConfirmation: true as const,
        action: { ...action, confirmationToken: encodeAction(signedAction) },
        message: action.confirmationText,
      };
    }),

  confirm: protectedProcedure
    .input(z.object({ confirmationToken: z.string().min(1), confirmed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (!input.confirmed) return { success: false as const, cancelled: true as const, message: "Tudo bem. Não alterei os seus dados." };
      let action: SignedAction;
      try {
        action = decodeAction(input.confirmationToken);
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Confirmação inválida");
      }
      if (action.userId !== ctx.user.id) throw new Error("Esta confirmação pertence a outro utilizador.");
      if (action.type !== "create_launch") throw new Error("Tipo de operação não suportado.");

      await createLaunch({ userId: ctx.user.id, ...action.launch });
      return { success: true as const, cancelled: false as const, message: "Registo concluído. A operação foi adicionada às suas finanças." };
    }),
});
