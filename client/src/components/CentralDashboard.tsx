/*
 * CentralDashboard — Lume
 * Dashboard centralizado que sincroniza em tempo real com o DataStore
 * Mostra o estado atual de todas as métricas financeiras
 */

import { useDataStore } from "@/hooks/useDataStore";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
import { detectSuspiciousActivity, generateTrendReport } from "@/lib/dataStore";

export default function CentralDashboard() {
  const { data } = useDataStore();
  const suspiciousActivities = detectSuspiciousActivity();
  const trendReport = generateTrendReport();

  const percentageChange = trendReport.percentageChange;
  const trend = trendReport.trend;

  return (
    <section id="central-dashboard" className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            📊 Dashboard Centralizado
          </h2>
          <p className="text-lg text-gray-600">Sincronização em tempo real com todos os seus lançamentos</p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Receitas */}
          <div className="p-6 rounded-xl bg-white border-2 border-green-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-600">Total de Receitas</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">R$ {data.totalReceitas.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">{data.receitas.length} lançamentos</p>
          </div>

          {/* Total Despesas */}
          <div className="p-6 rounded-xl bg-white border-2 border-red-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-600">Total de Despesas</p>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">R$ {data.totalDespesas.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">{data.despesas.length} lançamentos</p>
          </div>

          {/* Saldo */}
          <div className={`p-6 rounded-xl bg-white border-2 ${data.saldo >= 0 ? "border-blue-200" : "border-orange-200"} hover:shadow-lg transition-all`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-600">Saldo do Mês</p>
              <DollarSign className="w-5 h-5" style={{ color: data.saldo >= 0 ? "#2563EB" : "#F97316" }} />
            </div>
            <p className={`text-3xl font-bold ${data.saldo >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              R$ {data.saldo.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {data.saldo >= 0 ? "Superávit" : "Déficit"}
            </p>
          </div>

          {/* Taxa de Poupança */}
          <div className="p-6 rounded-xl bg-white border-2 border-purple-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-600">Taxa de Poupança</p>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {data.totalReceitas > 0 ? ((data.saldo / data.totalReceitas) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-gray-500 mt-2">Do total de receitas</p>
          </div>
        </div>

        {/* Análise de Tendências */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Tendência */}
          <div className={`p-6 rounded-xl border-2 ${
            trend === "up" ? "bg-green-50 border-green-200" : trend === "down" ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
          }`}>
            <h3 className="font-bold text-gray-900 mb-3">📈 Tendência Financeira</h3>
            <p className="text-2xl font-bold mb-2" style={{
              color: trend === "up" ? "#22C55E" : trend === "down" ? "#EF4444" : "#2563EB"
            }}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {Math.abs(percentageChange).toFixed(1)}%
            </p>
            <p className="text-gray-700">{trendReport.recommendation}</p>
          </div>

          {/* Alertas de Segurança */}
          <div className="p-6 rounded-xl bg-yellow-50 border-2 border-yellow-200">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Alertas de Segurança
            </h3>
            {suspiciousActivities.length > 0 ? (
              <ul className="space-y-2">
                {suspiciousActivities.map((alert, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                      alert.severity === "high" ? "bg-red-600" : alert.severity === "medium" ? "bg-orange-600" : "bg-yellow-600"
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span>{alert.message}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-700">✅ Nenhuma atividade suspeita detectada</p>
            )}
          </div>
        </div>

        {/* Distribuição por Categoria */}
        <div className="p-6 rounded-xl bg-white border-2 border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">📂 Distribuição por Categoria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.byCategory).map(([category, value]) => (
              <div key={category} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">{category}</p>
                <p className="text-2xl font-bold text-gray-900">R$ {value.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((value / (data.totalReceitas + data.totalDespesas)) * 100).toFixed(1)}% do total
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Informação de Sincronização */}
        <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-200 text-center">
          <p className="text-sm text-gray-700">
            ✅ <strong>Dashboard sincronizado em tempo real</strong> — Todos os dados são atualizados automaticamente quando você adiciona, edita ou deleta um lançamento.
          </p>
        </div>
      </div>
    </section>
  );
}
