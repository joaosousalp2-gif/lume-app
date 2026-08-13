import { protectedProcedure, router } from "../_core/trpc";
import {
  generateMonthlyRecommendations,
  generateMonthlyReportPDF,
  getMonthlyAnalysis,
} from "../financialReports";
import { storagePut } from "../storage";
import { z } from "zod";

const reportInput = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

function getPreviousPeriod(month: number, year: number) {
  return month === 1
    ? { month: 12, year: year - 1 }
    : { month: month - 1, year };
}

export const financialReportsRouter = router({
  getMonthlySummary: protectedProcedure
    .input(reportInput)
    .query(async ({ ctx, input }) => {
      const analysis = await getMonthlyAnalysis(ctx.user.id, input.month, input.year);
      if (!analysis) {
        return {
          success: true,
          hasData: false,
          analysis: null,
          previousAnalysis: null,
          recommendations: [],
        };
      }

      const previous = getPreviousPeriod(input.month, input.year);
      const previousAnalysis = await getMonthlyAnalysis(
        ctx.user.id,
        previous.month,
        previous.year
      );
      const recommendations = await generateMonthlyRecommendations(analysis);

      const analysisWithPrevious = {
        ...analysis,
        previousAnalysis: previousAnalysis
          ? {
              totalIncome: previousAnalysis.totalIncome,
              totalExpenses: previousAnalysis.totalExpenses,
              balance: previousAnalysis.balance,
            }
          : null,
      };

      return {
        success: true,
        hasData: true,
        analysis: analysisWithPrevious,
        previousAnalysis,
        recommendations,
      };
    }),

  exportPDF: protectedProcedure
    .input(reportInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const analysis = await getMonthlyAnalysis(ctx.user.id, input.month, input.year);
        if (!analysis) {
          return {
            success: false,
            error: "Nenhum lançamento encontrado para o mês selecionado",
          };
        }

        const previous = getPreviousPeriod(input.month, input.year);
        const previousAnalysis = await getMonthlyAnalysis(
          ctx.user.id,
          previous.month,
          previous.year
        );

        const analysisWithPrevious = {
          ...analysis,
          previousAnalysis: previousAnalysis
            ? {
                totalIncome: previousAnalysis.totalIncome,
                totalExpenses: previousAnalysis.totalExpenses,
                balance: previousAnalysis.balance,
              }
            : null,
        };

        const recommendations = await generateMonthlyRecommendations(analysis);
        const pdfBuffer = await generateMonthlyReportPDF(analysisWithPrevious, recommendations);
        const monthKey = `${input.year}-${String(input.month).padStart(2, "0")}`;
        const filename = `lume-relatorio-financeiro-${monthKey}.pdf`;
        const stored = await storagePut(
          `users/${ctx.user.id}/financial-reports/${filename}`,
          pdfBuffer,
          "application/pdf"
        );

        return {
          success: true,
          data: {
            downloadUrl: stored.url,
            filename,
            size: pdfBuffer.length,
            month: monthKey,
          },
        };
      } catch (error) {
        console.error("Error exporting monthly financial report:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Erro ao exportar relatório financeiro",
        };
      }
    }),
});

export type FinancialReportsRouter = typeof financialReportsRouter;

export { getPreviousPeriod };
