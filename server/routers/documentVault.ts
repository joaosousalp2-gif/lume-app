import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";
import { storageGetSignedUrl, storagePut } from "../storage";
import { createDocumentVaultItem, getDocumentVaultByUserId } from "../db";

const extractedSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    merchant: { type: "string" },
    date: { type: "string" },
    amount: { type: "number" },
    category: { type: "string" },
    confidence: { type: "number" },
    notes: { type: "string" },
  },
  required: ["title", "merchant", "date", "amount", "category", "confidence", "notes"],
  additionalProperties: false,
} as const;

export const documentVaultRouter = router({
  list: protectedProcedure.query(({ ctx }) => getDocumentVaultByUserId(ctx.user.id)),

  upload: protectedProcedure
    .input(z.object({
      fileBase64: z.string().min(100).max(12_000_000),
      filename: z.string().min(1).max(255),
      mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
      title: z.string().min(1).max(255),
      category: z.enum(["fatura", "recibo", "contrato", "comprovativo", "outro"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const buffer = Buffer.from(input.fileBase64, "base64");
      if (buffer.length > 8 * 1024 * 1024) throw new Error("O documento deve ter no máximo 8 MB.");
      const uploaded = await storagePut(`users/${ctx.user.id}/documents/${safeFilename}`, buffer, input.mimeType);
      let extractedData: Record<string, unknown> | null = null;

      if (input.mimeType.startsWith("image/")) {
        try {
          const signedUrl = await storageGetSignedUrl(uploaded.key);
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "Analise apenas o recibo ou documento fornecido. Extraia os campos solicitados em JSON. Se algo não estiver legível, use string vazia ou zero e reduza confidence. Não invente valores." },
              { role: "user", content: [{ type: "text", text: "Extraia os dados deste documento financeiro." }, { type: "image_url", image_url: { url: signedUrl, detail: "high" } }] },
            ],
            response_format: { type: "json_schema", json_schema: { name: "receipt_extraction", strict: true, schema: extractedSchema } },
          });
          const content = response.choices?.[0]?.message?.content;
          if (typeof content === "string") extractedData = JSON.parse(content) as Record<string, unknown>;
        } catch (error) {
          console.warn("[DocumentVault] Extração não disponível:", error);
        }
      }

      const documentDate = typeof extractedData?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(extractedData.date) ? extractedData.date : null;
      const saved = await createDocumentVaultItem({
        userId: ctx.user.id,
        title: input.title,
        category: input.category,
        fileUrl: uploaded.url,
        storageKey: uploaded.key,
        extractedData: extractedData ? JSON.stringify(extractedData) : null,
        documentDate,
      });
      return { success: true, fileUrl: uploaded.url, storageKey: uploaded.key, extractedData, saved };
    }),
});
