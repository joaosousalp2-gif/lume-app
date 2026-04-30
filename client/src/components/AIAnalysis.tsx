import React, { useState, useEffect } from "react";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, Zap } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

interface Launch {
  id: string;
  type: "receita" | "despesa";
  category: string;
  value: number;
  description: string;
  date: string;
  recurrence?: string;
}

interface AIInsight {
  id: string;
  type: "opportunity" | "warning" | "suggestion";
  title: string;
  description: string;
  potentialSavings?: number;
  icon: React.ReactNode;
}

export default function AIAnalysis() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [categoryAnalysis, setCategoryAnalysis] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"7" | "30" | "90">("30");

  useEffect(() => {
    // Carregar lançamentos do localStorage
    const stored = localStorage.getItem("lume_launches");
    if (stored) {
      try {
        setLaunches(JSON.parse(stored));
      } catch (e) {
        console.error("Erro ao carregar lançamentos:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (launches.length > 0) {
      analyzeFinances();
    }
  }, [launches, selectedPeriod]);

  const analyzeFinances = () => {
    const newInsights: AIInsight[] = [];
    const days = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredLaunches = launches.filter(
      (l) => new Date(l.date) >= cutoffDate
    );

    // Análise 1: Despesas Recorrentes
    const categoryTotals: { [key: string]: number } = {};
    const categoryCount: { [key: string]: number } = {};

    filteredLaunches
      .filter((l) => l.type === "despesa")
      .forEach((l) => {
        categoryTotals[l.category] = (categoryTotals[l.category] || 0) + l.value;
        categoryCount[l.category] = (categoryCount[l.category] || 0) + 1;
      });

    // Identificar categorias com alto gasto
    Object.entries(categoryTotals).forEach(([category, total]) => {
      const count = categoryCount[category];
      const numTotal = typeof total === 'number' ? total : parseFloat(total as any) || 0;
      const average = numTotal / count;

      if (numTotal > 500) {
        newInsights.push({
          id: `high-${category}`,
          type: "warning",
          title: `Alto gasto em ${category}`,
          description: `Você gastou R$ ${numTotal.toFixed(2)} em ${category} nos últimos ${days} dias (${count} transações). Considere revisar essas despesas.`,
          potentialSavings: numTotal * 0.1,
          icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
        });
      }
    });

    // Análise 2: Oportunidades de Economia
    const totalDespesas = filteredLaunches
      .filter((l) => l.type === "despesa")
      .reduce((sum, l) => sum + (typeof l.value === 'number' ? l.value : parseFloat(l.value as any) || 0), 0);

    const totalReceitas = filteredLaunches
      .filter((l) => l.type === "receita")
      .reduce((sum, l) => sum + (typeof l.value === 'number' ? l.value : parseFloat(l.value as any) || 0), 0);

    if (totalReceitas > 0) {
      const savingsRate = ((totalReceitas - totalDespesas) / totalReceitas) * 100;

      if (savingsRate < 10) {
        newInsights.push({
          id: "low-savings",
          type: "opportunity",
          title: "Aumentar taxa de poupança",
          description: `Sua taxa de poupança é de ${savingsRate.toFixed(1)}%. Objetivo recomendado: 20%. Reduza despesas em R$ ${((totalReceitas * 0.2 - (totalReceitas - totalDespesas))).toFixed(2)} para atingir a meta.`,
          potentialSavings: (totalReceitas * 0.2 - (totalReceitas - totalDespesas)),
          icon: <TrendingUp className="w-5 h-5 text-green-500" />,
        });
      } else {
        newInsights.push({
          id: "good-savings",
          type: "suggestion",
          title: "Excelente taxa de poupança!",
          description: `Parabéns! Sua taxa de poupança é ${savingsRate.toFixed(1)}%. Continue assim!`,
          icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
        });
      }
    }

    // Análise 3: Despesas por Categoria
    const categoryData = Object.entries(categoryTotals).map(([category, total]) => {
      const numTotal = typeof total === 'number' ? total : parseFloat(total as any) || 0;
      return {
        name: category,
        value: numTotal,
        percentage: totalDespesas > 0 ? ((numTotal / totalDespesas) * 100).toFixed(1) : '0',
      };
    });

    setCategoryAnalysis(categoryData);

    // Análise 4: Tendência de Gastos
    const trendData: { [key: string]: number } = {};
    filteredLaunches.forEach((l) => {
      const date = new Date(l.date).toLocaleDateString("pt-BR");
      if (l.type === "despesa") {
        const numValue = typeof l.value === 'number' ? l.value : parseFloat(l.value as any) || 0;
        trendData[date] = (trendData[date] || 0) + numValue;
      }
    });

    const sortedTrends = Object.entries(trendData)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, value]) => ({ date, despesas: value }));

    setTrends(sortedTrends);

    // Análise 5: Sugestões Automáticas
    const alimentacao = categoryTotals["Alimentação"] || 0;
    const numAlimentacao = typeof alimentacao === 'number' ? alimentacao : parseFloat(alimentacao as any) || 0;
    if (numAlimentacao > 300) {
      newInsights.push({
        id: "food-suggestion",
        type: "suggestion",
        title: "Otimizar gastos com alimentação",
        description: "Considere preparar refeições em casa ou usar aplicativos de cashback para economizar em alimentação.",
        potentialSavings: numAlimentacao * 0.15,
        icon: <Zap className="w-5 h-5 text-yellow-500" />,
      });
    }

    const transporte = categoryTotals["Transporte"] || 0;
    const numTransporte = typeof transporte === 'number' ? transporte : parseFloat(transporte as any) || 0;
    if (numTransporte > 200) {
      newInsights.push({
        id: "transport-suggestion",
        type: "suggestion",
        title: "Reduzir gastos com transporte",
        description: "Explore opções como carona compartilhada, transporte público ou bicicleta para economizar.",
        potentialSavings: numTransporte * 0.2,
        icon: <Zap className="w-5 h-5 text-yellow-500" />,
      });
    }

    setInsights(newInsights);
  };

  const COLORS = ["#2563EB", "#22C55E", "#FACC15", "#7C3AED", "#EF4444", "#F97316"];

  return (
    <section id="ai-analysis" className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              Análise Inteligente (IA)
            </h2>
            <p className="text-gray-600 mt-2">
              Insights automáticos baseados em seus padrões de gastos
            </p>
          </div>
          <div className="flex gap-2">
            {(["7", "30", "90"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedPeriod === period
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Últimos {period} dias
              </button>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                insight.type === "warning"
                  ? "bg-orange-50 border-orange-200"
                  : insight.type === "opportunity"
                  ? "bg-green-50 border-green-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                {insight.icon}
                <h3 className="font-bold text-gray-900">{insight.title}</h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
              {insight.potentialSavings && (
                <p className="text-sm font-semibold text-green-600">
                  💰 Economia potencial: R$ {insight.potentialSavings.toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Tendência de Gastos */}
          {trends.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">📈 Tendência de Gastos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `R$ ${(typeof value === 'number' ? value : parseFloat(value || '0')).toFixed(2)}`} />
                  <Line
                    type="monotone"
                    dataKey="despesas"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Despesas Diárias"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Distribuição por Categoria */}
          {categoryAnalysis.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">📊 Distribuição por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryAnalysis}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryAnalysis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `R$ ${(typeof value === 'number' ? value : parseFloat(value || '0')).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Resumo de Análise */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-xl">
          <h3 className="text-2xl font-bold mb-4">🤖 Resumo da Análise</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-purple-100 text-sm mb-1">Total de Insights</p>
              <p className="text-3xl font-bold">{insights.length}</p>
            </div>
            <div>
              <p className="text-purple-100 text-sm mb-1">Economia Potencial</p>
              <p className="text-3xl font-bold">
                R$ {(() => {
                  const total = insights.reduce((sum, i) => {
                    const savings = i.potentialSavings || 0;
                    return sum + (typeof savings === 'number' ? savings : parseFloat(savings as any) || 0);
                  }, 0);
                  return typeof total === 'number' ? total.toFixed(2) : '0.00';
                })()}
              </p>
            </div>
            <div>
              <p className="text-purple-100 text-sm mb-1">Categorias Analisadas</p>
              <p className="text-3xl font-bold">{categoryAnalysis.length}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
