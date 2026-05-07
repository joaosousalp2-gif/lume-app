import { protectedProcedure, router } from "../_core/trpc";
import { getChatHistory } from "../db";
import { exportChatToPDF } from "../chatExport";
import { z } from "zod";

export const chatExportRouter = router({
  exportPDF: protectedProcedure
    .input(
      z.object({
        includeTimestamps: z.boolean().default(true),
        includeStats: z.boolean().default(true),
      }).optional()
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get chat history for the user
        const dbMessages = await getChatHistory(ctx.user.id);

        if (dbMessages.length === 0) {
          return {
            success: false,
            error: "Nenhuma mensagem de chat para exportar",
          };
        }

        // Convert to ChatMessage format
        const messages = dbMessages.map((m) => ({
          id: String(m.id),
          content: m.content,
          role: m.role as "user" | "assistant",
          createdAt: m.createdAt,
        }));

        // Generate PDF
        const pdfBuffer = await exportChatToPDF(messages, {
          title: "Histórico de Chat - Agente Financeiro Lume",
          includeTimestamps: input?.includeTimestamps ?? true,
          includeStats: input?.includeStats ?? true,
        });

        // Return base64 encoded PDF for download
        const base64 = pdfBuffer.toString("base64");
        const timestamp = new Date().toISOString().split("T")[0];
        const filename = `lume-chat-${timestamp}.pdf`;

        return {
          success: true,
          data: {
            base64,
            filename,
            size: pdfBuffer.length,
          },
        };
      } catch (error) {
        console.error("Error exporting chat to PDF:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Erro ao exportar chat para PDF",
        };
      }
    }),

  getExportStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const messages = await getChatHistory(ctx.user.id);

      const userMessages = messages.filter((m) => m.role === "user");
      const assistantMessages = messages.filter((m) => m.role === "assistant");

      const avgResponseLength =
        assistantMessages.length > 0
          ? Math.round(
              assistantMessages.reduce((sum, m) => sum + m.content.length, 0) /
                assistantMessages.length
            )
          : 0;

      const totalCharacters = messages.reduce(
        (sum, m) => sum + m.content.length,
        0
      );

      return {
        totalMessages: messages.length,
        userMessages: userMessages.length,
        assistantMessages: assistantMessages.length,
        avgResponseLength,
        totalCharacters,
        estimatedPDFSize: `~${Math.round(totalCharacters / 1024)}KB`,
      };
    } catch (error) {
      console.error("Error getting export stats:", error);
      return {
        totalMessages: 0,
        userMessages: 0,
        assistantMessages: 0,
        avgResponseLength: 0,
        totalCharacters: 0,
        estimatedPDFSize: "0KB",
      };
    }
  }),
});
