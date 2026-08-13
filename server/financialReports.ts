/**
 * Financial Reports Generator
 * Generates comprehensive monthly financial reports in PDF format
 */

import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import { getLaunchesByUserAndMonth, getBudgetsByUserAndMonth } from "./db";

interface MonthlyTransaction {
  id: number;
  description: string;
  amount: number;
  type: "receita" | "despesa";
  category: string;
  date: Date;
}

interface CategoryAnalysis {
  category: string;
  total: number;
  percentage: number;
  transactionCount: number;
}

interface MonthlyAnalysis {
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: CategoryAnalysis[];
  topExpenses: MonthlyTransaction[];
  budgetComparison: {
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentage: number;
  }[];
  previousAnalysis?: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
  } | null;
}

interface PersonalizedRecommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedSavings: number;
}

/**
 * Get monthly analysis for a user
 */
export async function getMonthlyAnalysis(
  userId: number,
  month: number,
  year: number
): Promise<MonthlyAnalysis | null> {
  try {
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    const launches = await getLaunchesByUserAndMonth(userId, monthKey);
    const budgets = await getBudgetsByUserAndMonth(userId, monthKey);

    if (!launches || launches.length === 0) {
      return null;
    }

    // Calculate totals
    const totalIncome = launches
      .filter((t: any) => t.type === "receita")
      .reduce((sum: number, t: any) => sum + Number.parseFloat(t.value || "0"), 0);

    const totalExpenses = launches
      .filter((t: any) => t.type === "despesa")
      .reduce((sum: number, t: any) => sum + Number.parseFloat(t.value || "0"), 0);

    // Category breakdown
    const categoryMap = new Map<string, { total: number; count: number }>();
    launches
      .filter((t: any) => t.type === "despesa")
      .forEach((t: any) => {
        const current = categoryMap.get(t.category) || { total: 0, count: 0 };
        categoryMap.set(t.category, {
          total: current.total + Number.parseFloat(t.value || "0"),
          count: current.count + 1,
        });
      });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      percentage: Math.round((data.total / totalExpenses) * 100),
      transactionCount: data.count,
    }));

    // Top expenses
    const topExpenses = launches
      .filter((t: any) => t.type === "despesa")
      .map((t: any) => ({
        id: t.id,
        description: t.description || "Sem descrição",
        amount: Number.parseFloat(t.value || "0"),
        type: t.type,
        category: t.category,
        date: new Date(t.date),
      }))
      .sort((a: MonthlyTransaction, b: MonthlyTransaction) => b.amount - a.amount)
      .slice(0, 5);

    // Budget comparison
    const budgetComparison = (budgets || []).map((b: any) => {
      const spent = categoryMap.get(b.category)?.total || 0;
      return {
        category: b.category,
        budgeted: Number.parseFloat(b.limit || "0"),
        spent,
        remaining: Number.parseFloat(b.limit || "0") - spent,
        percentage: Number.parseFloat(b.limit || "0") > 0
          ? Math.round((spent / Number.parseFloat(b.limit || "0")) * 100)
          : 0,
      };
    });

    return {
      month: new Date(year, month - 1).toLocaleDateString("pt-BR", { month: "long" }),
      year,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      categoryBreakdown,
      topExpenses,
      budgetComparison,
    };
  } catch (error) {
    console.error("Error getting monthly analysis:", error);
    return null;
  }
}

/**
 * Generate personalized recommendations based on spending patterns
 */
export async function generateMonthlyRecommendations(
  analysis: MonthlyAnalysis
): Promise<PersonalizedRecommendation[]> {
  try {
    const recommendations: PersonalizedRecommendation[] = [];

    // Check budget overages
    const overages = analysis.budgetComparison.filter((b) => b.percentage > 100);
    if (overages.length > 0) {
      const totalOverage = overages.reduce((sum, b) => sum + (b.spent - b.budgeted), 0);
      recommendations.push({
        title: "Reduza gastos em categorias acima do orçamento",
        description: `Você ultrapassou o orçamento em ${overages.length} categorias. Total excedido: R$ ${totalOverage.toFixed(2)}`,
        priority: "high",
        estimatedSavings: totalOverage,
      });
    }

    // Check high expense categories
    const highExpenses = analysis.categoryBreakdown.filter((c) => c.percentage > 30);
    if (highExpenses.length > 0) {
      recommendations.push({
        title: "Revise gastos em categorias de alto custo",
        description: `Categorias como ${highExpenses.map((c) => c.category).join(", ")} representam mais de 30% dos seus gastos.`,
        priority: "medium",
        estimatedSavings: highExpenses.reduce((sum, c) => sum + c.total * 0.1, 0),
      });
    }

    // Check balance
    if (analysis.balance < 0) {
      recommendations.push({
        title: "Você teve déficit este mês",
        description: `Suas despesas superaram a renda em R$ ${Math.abs(analysis.balance).toFixed(2)}. Considere aumentar a renda ou reduzir despesas.`,
        priority: "high",
        estimatedSavings: Math.abs(analysis.balance),
      });
    } else if (analysis.balance > 0) {
      recommendations.push({
        title: "Excelente! Você teve superávit",
        description: `Você economizou R$ ${analysis.balance.toFixed(2)} este mês. Considere investir ou poupar este valor.`,
        priority: "medium",
        estimatedSavings: 0,
      });
    }

    return recommendations;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return [];
  }
}

/**
 * Generate PDF report
 */
export async function generateMonthlyReportPDF(
  analysis: MonthlyAnalysis,
  recommendations: PersonalizedRecommendation[]
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  let yPosition = height - 50;

  const checkPageSpace = (neededSpace: number) => {
    if (yPosition < neededSpace) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 50;
    }
  };

  const drawText = (text: string, size: number = 10, bold: boolean = false, color = rgb(0.2, 0.2, 0.2), maxWidth: number = 495) => {
    // Simple word wrapping for long texts
    const words = text.split(" ");
    let line = "";
    const lines: string[] = [];

    // Approximate character width per point
    const charWidth = size * 0.55;
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);

    for (const word of words) {
      if ((line + word).length > maxCharsPerLine) {
        if (line) lines.push(line.trim());
        line = word + " ";
      } else {
        line += word + " ";
      }
    }
    if (line) lines.push(line.trim());

    for (const l of lines) {
      checkPageSpace(size + 8);
      page.drawText(l, {
        x: 50,
        y: yPosition,
        size,
        color,
      });
      yPosition -= size + 6;
    }
  };

  const drawSection = (title: string) => {
    checkPageSpace(35);
    yPosition -= 10;
    page.drawText(title, {
      x: 50,
      y: yPosition,
      size: 13,
      color: rgb(0.1, 0.3, 0.7),
    });
    yPosition -= 18;
  };

  // Header
  drawText("RELATORIO FINANCEIRO MENSAL - LUME", 16, true, rgb(0.1, 0.3, 0.7));
  drawText(`Periodo: ${analysis.month.charAt(0).toUpperCase() + analysis.month.slice(1)} de ${analysis.year}`, 12, true, rgb(0.4, 0.4, 0.4));
  yPosition -= 5;

  // Summary
  drawSection("RESUMO DO MES");
  drawText(`Renda Total: R$ ${analysis.totalIncome.toFixed(2)}`);
  drawText(`Despesas Totais: R$ ${analysis.totalExpenses.toFixed(2)}`);
  const balanceColor = analysis.balance >= 0 ? rgb(0.1, 0.6, 0.2) : rgb(0.8, 0.2, 0.2);
  drawText(`Saldo do Mes: R$ ${analysis.balance.toFixed(2)}`, 11, true, balanceColor);

  // Comparison with previous period if available
  if (analysis.previousAnalysis) {
    yPosition -= 5;
    drawSection("COMPARACAO COM O MES ANTERIOR");
    const prevInc = analysis.previousAnalysis.totalIncome;
    const prevExp = analysis.previousAnalysis.totalExpenses;
    const prevBal = analysis.previousAnalysis.balance;
    const incDiff = prevInc > 0 ? Math.round(((analysis.totalIncome - prevInc) / prevInc) * 100) : 0;
    const expDiff = prevExp > 0 ? Math.round(((analysis.totalExpenses - prevExp) / prevExp) * 100) : 0;
    drawText(`Renda Anterior: R$ ${prevInc.toFixed(2)} (${incDiff >= 0 ? "+" : ""}${incDiff}%)`);
    drawText(`Despesa Anterior: R$ ${prevExp.toFixed(2)} (${expDiff >= 0 ? "+" : ""}${expDiff}%)`);
    drawText(`Saldo Anterior: R$ ${prevBal.toFixed(2)}`);
  }

  // Category Breakdown
  if (analysis.categoryBreakdown.length > 0) {
    drawSection("ANALISE DE GASTOS POR CATEGORIA");
    analysis.categoryBreakdown.forEach((cat) => {
      drawText(`- ${cat.category}: R$ ${cat.total.toFixed(2)} (${cat.percentage}% do total, ${cat.transactionCount} transacoes)`);
    });
  }

  // Budget Comparison
  if (analysis.budgetComparison.length > 0) {
    drawSection("COMPARACAO COM O ORCAMENTO");
    analysis.budgetComparison.forEach((budget) => {
      const status = budget.percentage > 100 ? "EXCEDIDO" : "DENTRO DO LIMITE";
      drawText(`- ${budget.category}: Gasto R$ ${budget.spent.toFixed(2)} / Orcado R$ ${budget.budgeted.toFixed(2)} [${status}]`);
    });
  }

  // Top Expenses
  if (analysis.topExpenses.length > 0) {
    drawSection("MAIORES DESPESAS DO PERIODO");
    analysis.topExpenses.forEach((exp, idx) => {
      drawText(`${idx + 1}. ${exp.description} (${exp.category}): R$ ${exp.amount.toFixed(2)}`);
    });
  }

  // Recommendations
  if (recommendations.length > 0) {
    drawSection("RECOMENDACOES PERSONALIZADAS DA IA");
    recommendations.forEach((rec) => {
      checkPageSpace(45);
      drawText(`[Prioridade: ${rec.priority.toUpperCase()}] ${rec.title}`, 10, true, rgb(0.1, 0.3, 0.7));
      drawText(rec.description, 9, false, rgb(0.3, 0.3, 0.3));
      if (rec.estimatedSavings > 0) {
        drawText(`Economia Potencial Estimada: R$ ${rec.estimatedSavings.toFixed(2)}`, 9, true, rgb(0.1, 0.6, 0.2));
      }
      yPosition -= 4;
    });
  }

  // Footer on all pages
  const totalPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const p = pdfDoc.getPage(i);
    p.drawText(`Lume App - Pagina ${i + 1} de ${totalPages} - Gerado em ${new Date().toLocaleDateString("pt-BR")}`, {
      x: 50,
      y: 25,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  return Buffer.from(await pdfDoc.save());
}
