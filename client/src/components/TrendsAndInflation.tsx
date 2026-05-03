/*
 * TrendsAndInflation — Lume
 * Análise de tendências financeiras e calculadora de inflação
 */

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, BarChart3, Calculator } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TrendData {
  month: string;
  spending: number;
  income: number;
}

export default function TrendsAndInflation() {
  const [activeTab, setActiveTab] = useState<"trends" | "inflation">("trends");
  const [trendData] = useState<TrendData[]>([
    { month: "Jan", spending: 2500, income: 4000 },
    { month: "Fev", spending: 2800, income: 4000 },
    { month: "Mar", spending: 2600, income: 4000 },
    { month: "Abr", spending: 3200, income: 4500 },
    { month: "Mai", spending: 3100, income: 4500 },
    { month: "Jun", spending: 2900, income: 4500 },
  ]);

  const [inflationData] = useState([
    { month: "Jan/2024", rate: 0.42 },
    { month: "Fev/2024", rate: 0.38 },
    { month: "Mar/2024", rate: 0.61 },
    { month: "Abr/2024", rate: 0.57 },
    { month: "Mai/2024", rate: 0.45 },
    { month: "Jun/2024", rate: 0.38 },
  ]);

  const [purchasingPower, setPurchasingPower] = useState(1000);
  const [inflationRate, setInflationRate] = useState(4.5);
  const [months, setMonths] = useState(12);

  const calculatePurchasingPower = () => {
    const monthlyRate = inflationRate / 100 / 12;
    const result = purchasingPower / Math.pow(1 + monthlyRate, months);
    return result.toFixed(2);
  };

  // Análise de tendências
  const avgSpending = trendData.reduce((sum, d) => sum + d.spending, 0) / trendData.length;
  const lastMonthSpending = trendData[trendData.length - 1].spending;
  const spendingChange = ((lastMonthSpending - avgSpending) / avgSpending) * 100;

  return (
    <section id="trends" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <h2 className="text-4xl font-black text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              📊 Análise Financeira Avançada
            </h2>
          </div>
          <p className="text-lg text-gray-600">Tendências, inflação e poder de compra em um só lugar</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-gray-200">
          {[
            { id: "trends", label: "📈 Tendências", icon: TrendingUp },
            { id: "inflation", label: "💹 Inflação", icon: Calculator },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-bold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ABA: TENDÊNCIAS */}
        {activeTab === "trends" && (
          <div className="space-y-8">
            {/* Gráfico de Tendências */}
            <div className="p-6 rounded-xl bg-white border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Últimos 6 Meses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="spending" stroke="#EF4444" name="Gastos" strokeWidth={2} />
                  <Line type="monotone" dataKey="income" stroke="#22C55E" name="Renda" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Análise de Mudanças */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-white border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-2">Gasto Médio</p>
                <p className="text-3xl font-bold text-gray-900">R$ {avgSpending.toFixed(2)}</p>
                <p className="text-xs text-gray-700 mt-2">Últimos 6 meses</p>
              </div>

              <div className={`p-6 rounded-xl bg-white border-2 ${spendingChange > 0 ? "border-red-200" : "border-green-200"}`}>
                <p className="text-sm text-gray-600 mb-2">Mudança no Gasto</p>
                <div className="flex items-center gap-2">
                  {spendingChange > 0 ? (
                    <TrendingUp className="w-6 h-6 text-red-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-green-600" />
                  )}
                  <p className={`text-3xl font-bold ${spendingChange > 0 ? "text-red-600" : "text-green-600"}`}>
                    {spendingChange > 0 ? "+" : ""}{spendingChange.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-white border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-2">Últimas Mudanças</p>
                <p className="text-3xl font-bold text-gray-900">
                  {spendingChange > 0 ? "📈 Aumento" : "📉 Redução"}
                </p>
                <p className="text-xs text-gray-700 mt-2">
                  {spendingChange > 0
                    ? "Seus gastos aumentaram este mês"
                    : "Seus gastos diminuíram este mês"}
                </p>
              </div>
            </div>

            {/* Recomendações */}
            <div className="p-6 rounded-xl bg-blue-50 border-2 border-blue-200">
              <h4 className="font-bold text-gray-900 mb-3">💡 Recomendações de Economia</h4>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Seus gastos com alimentação aumentaram 15% — considere revisar suas compras</li>
                <li>✓ Oportunidade: Você economizou R$ 300 em transporte este mês</li>
                <li>✓ Dica: Mantenha seus gastos abaixo de R$ 2.800 para atingir sua meta de economia</li>
              </ul>
            </div>
          </div>
        )}

        {/* ABA: INFLAÇÃO */}
        {activeTab === "inflation" && (
          <div className="space-y-8">
            {/* Gráfico de Inflação */}
            <div className="p-6 rounded-xl bg-white border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Taxa de Inflação Mensal (%)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inflationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="rate" fill="#7C3AED" name="Inflação" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Calculadora de Poder de Compra */}
            <div className="p-6 rounded-xl bg-purple-50 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Calculadora de Poder de Compra</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Valor Inicial (R$)</label>
                  <input
                    type="number"
                    value={purchasingPower}
                    onChange={(e) => setPurchasingPower(parseFloat(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Taxa Inflação Anual (%)</label>
                  <input
                    type="number"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(parseFloat(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Período (Meses)</label>
                  <input
                    type="number"
                    value={months}
                    onChange={(e) => setMonths(parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Resultado */}
              <div className="p-6 rounded-xl bg-white border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-2">Poder de Compra Após {months} Meses</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-purple-600">R$ {calculatePurchasingPower()}</p>
                  <p className="text-lg text-gray-600">
                    (Perda de R$ {(purchasingPower - parseFloat(calculatePurchasingPower())).toFixed(2)})
                  </p>
                </div>
                <p className="text-sm text-gray-700 mt-3">
                  Com uma inflação de {inflationRate}% ao ano, seu dinheiro perderá poder de compra ao longo do tempo.
                </p>
              </div>
            </div>

            {/* Dicas de Proteção */}
            <div className="p-6 rounded-xl bg-green-50 border-2 border-green-200">
              <h4 className="font-bold text-gray-900 mb-3">🛡️ Como Proteger Seu Poder de Compra</h4>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Invista em ativos que acompanhem a inflação (ações, fundos imobiliários)</li>
                <li>✓ Considere investimentos em renda fixa com taxa acima da inflação</li>
                <li>✓ Mantenha uma reserva de emergência em conta poupança</li>
                <li>✓ Revise seus orçamentos regularmente considerando a inflação</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
