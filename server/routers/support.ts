import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";
import { recordAuditLog } from "../db";

export const supportRouter = router({
  requestHumanHelp: protectedProcedure
    .input(z.object({
      subject: z.string().min(3),
      message: z.string().min(10),
      phone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const userName = ctx.user.name || "Utilizador Lume";
      const userEmail = ctx.user.email || "Sem email";

      await recordAuditLog({
        userId,
        action: "data_accessed",
        details: JSON.stringify({ type: "REQUEST_HUMAN_HELP", subject: input.subject, phone: input.phone }),
        status: "success",
      });

      const notified = await notifyOwner({
        title: `[Lume] Pedido de Ajuda Humana de ${userName}`,
        content: `Utilizador: ${userName} (${userEmail})
Assunto: ${input.subject}
Telefone/Contacto: ${input.phone || "Não fornecido"}
Mensagem:
${input.message}`,
      });

      return {
        success: true,
        notified,
        message: "O seu pedido de ajuda foi encaminhado com sucesso para a nossa equipa de suporte.",
      };
    }),
});
