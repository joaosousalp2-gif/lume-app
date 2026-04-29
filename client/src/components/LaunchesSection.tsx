/*
 * LaunchesSection — Lume
 * Design: Modernismo Humanista
 * Módulo de Lançamentos Financeiros com calendário, formulários e rastreamento de gastos
 */

import { useEffect, useRef, useState } from "react";
import { Calendar, Plus, TrendingUp, TrendingDown, BarChart3, PieChart, Trash2, Edit2 } from "lucide-react";
import { BarChart, Bar, PieChart as RechartsPie, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

const currentDate = new Date(2025, 3, 29); // 29 de abril de 2025

const todayTransactions = [
  { id: 1, type: "receita", category: "Pensão", value: 2000, description: "Pensão mensal", time: "09:30" },
  { id: 2, type: "despesa", category: "Alimentação", value: 85.50, description: "Supermercado", time: "14:15" },
];

const futureTransactions = [
  { date: "05/05/2025", type: "despesa", category: "Moradia", value: 800, description: "Aluguel" },
  { date: "10/05/2025", type: "despesa", category: "Alimentação", value: 300, description: "Compras mês" },
  { date: "15/05/2025", type: "despesa", category: "Saúde", value: 150, description: "Farmácia" },
  { date: "20/05/2025", type: "despesa", category: "Transportes", value: 100, description: "Combustível" },
  { date: "25/05/2025", type: "receita", category: "Aluguel de Imóvel", value: 500, description: "Aluguel recebido" },
];

const historyTransactions = [
  { date: "28/04/2025", type: "despesa", category: "Lazer", value: 50, description: "Cinema" },
  { date: "27/04/2025", type: "despesa", category: "Alimentação", value: 120, description: "Restaurante" },
  { date: "25/04/2025", type: "despesa", category: "Saúde", value: 200, description: "Consulta médica" },
  { date: "20/04/2025", type: "despesa", category: "Alimentação", value: 155, description: "Supermercado" },
  { date: "15/04/2025", type: "receita", category: "Outros", value: 300, description: "Venda de itens" },
];

const categorySpending = [
  { name: "Alimentação", value: 450, percentage: 30, color: "#2563EB" },
  { name: "Moradia", value: 800, percentage: 53, color: "#22C55E" },
  { name: "Saúde", value: 150, percentage: 10, color: "#FACC15" },
  { name: "Lazer", value: 100, percentage: 7, color: "#7C3AED" },
];

const monthlyComparison = [
  { month: "Fevereiro", alimentacao: 400, moradia: 800, saude: 180, lazer: 50 },
  { month: "Março", alimentacao: 420, moradia: 800, saude: 150, lazer: 80 },
  { month: "Abril", alimentacao: 450, moradia: 800, saude: 150, lazer: 100 },
];

const cashFlowData = [
  { date: "01/05", receitas: 2000, despesas: 0, saldo: 2000 },
  { date: "05/05", receitas: 0, despesas: 800, saldo: 1200 },
  { date: "10/05", receitas: 0, despesas: 300, saldo: 900 },
  { date: "15/05", receitas: 0, despesas: 150, saldo: 750 },
  { date: "20/05", receitas: 0, despesas: 100, saldo: 650 },
  { date: "25/05", receitas: 500, despesas: 0, saldo: 1150 },
];

function TransactionCard({ transaction, showTime = false }: { transaction: any; showTime?: boolean }) {
  const isReceita = transaction.type === "receita";
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 flex-1">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: isReceita ? "#dcfce7" : "#fee2e2",
            color: isReceita ? "#22C55E" : "#ef4444",
          }}
        >
          {isReceita ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{transaction.category}</p>
          <p className="text-sm text-gray-600">{transaction.description}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg" style={{ color: isReceita ? "#22C55E" : "#ef4444" }}>
          {isReceita ? "+" : "-"}R$ {transaction.value.toFixed(2)}
        </p>
        {showTime && <p className="text-xs text-gray-500">{transaction.time}</p>}
      </div>
    </div>
  );
}

function CalendarDay({ day, hasReceita, hasDespesa, isToday, isSelected, onClick }: any) {
  let bgColor = "bg-white";
  let textColor = "text-gray-700";
  let borderColor = "border-gray-200";

  if (isToday) {
    bgColor = "bg-blue-100";
    textColor = "text-blue-700";
    borderColor = "border-blue-500";
  } else if (isSelected) {
    bgColor = "bg-blue-500";
    textColor = "text-white";
    borderColor = "border-blue-600";
  }

  if (hasReceita && hasDespesa) {
    bgColor = "bg-yellow-50";
    borderColor = "border-yellow-300";
  } else if (hasReceita) {
    bgColor = "bg-green-50";
    borderColor = "border-green-300";
  } else if (hasDespesa) {
    bgColor = "bg-red-50";
    borderColor = "border-red-300";
  }

  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${bgColor} ${textColor} ${borderColor} hover:shadow-md`}
    >
      {day}
    </button>
  );
}

export default function LaunchesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"today" | "future" | "history" | "tracking">("today");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll(".fade-target");
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const todayTotal = todayTransactions.reduce((sum, t) => sum + (t.type === "receita" ? t.value : -t.value), 0);
  const todayReceitas = todayTransactions.filter((t) => t.type === "receita").reduce((sum, t) => sum + t.value, 0);
  const todayDespesas = todayTransactions.filter((t) => t.type === "despesa").reduce((sum, t) => sum + t.value, 0);

  return (
    <section
      id="lancamentos"
      ref={sectionRef}
      className="py-24 bg-white"
    >
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16 fade-target opacity-0">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-2 mb-4">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="text-green-600 text-sm font-bold">Lançamentos Financeiros</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 section-title">
            Registre suas
            <span style={{ color: "#22C55E" }}> movimentações</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Interface intuitiva para registrar receitas, despesas, planejar o futuro e acompanhar seus gastos.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap fade-target opacity-0">
          {[
            { id: "today", label: "Hoje", icon: <Calendar className="w-4 h-4" /> },
            { id: "future", label: "Futuros", icon: <TrendingUp className="w-4 h-4" /> },
            { id: "history", label: "Histórico", icon: <TrendingDown className="w-4 h-4" /> },
            { id: "tracking", label: "Rastreamento", icon: <BarChart3 className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: TODAY */}
        {activeTab === "today" && (
          <div className="fade-target opacity-0 max-w-3xl mx-auto">
            <div className="lume-card mb-6">
              <div className="text-center mb-6">
                <p className="text-gray-600 text-lg mb-2">Quinta-feira, 29 de abril de 2025</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Receitas</p>
                    <p className="text-2xl font-black" style={{ color: "#22C55E" }}>
                      R$ {todayReceitas.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Despesas</p>
                    <p className="text-2xl font-black" style={{ color: "#ef4444" }}>
                      R$ {todayDespesas.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Saldo</p>
                    <p className="text-2xl font-black" style={{ color: todayTotal >= 0 ? "#22C55E" : "#ef4444" }}>
                      R$ {todayTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 lume-btn-green">
                <Plus className="w-6 h-6" />
                Adicionar Lançamento Hoje
              </button>
            </div>

            <div className="space-y-4">
              {todayTransactions.map((t) => (
                <TransactionCard key={t.id} transaction={t} showTime />
              ))}
            </div>
          </div>
        )}

        {/* TAB: FUTURE */}
        {activeTab === "future" && (
          <div className="fade-target opacity-0">
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Calendar */}
              <div className="lg:col-span-1 lume-card">
                <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Maio 2025
                </h3>
                <div className="flex justify-between items-center mb-4">
                  <button className="px-3 py-1 rounded text-sm font-semibold hover:bg-gray-100">← Anterior</button>
                  <button className="px-3 py-1 rounded text-sm font-semibold hover:bg-gray-100">Próximo →</button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((day) => {
                    const hasReceita = futureTransactions.some((t) => t.date.startsWith(`${String(day).padStart(2, "0")}/05`));
                    const hasDespesa = futureTransactions.some((t) => t.date.startsWith(`${String(day).padStart(2, "0")}/05`) && t.type === "despesa");
                    return (
                      <CalendarDay
                        key={day}
                        day={day}
                        hasReceita={hasReceita}
                        hasDespesa={hasDespesa}
                        isToday={false}
                        isSelected={selectedDate === day}
                        onClick={() => setSelectedDate(day)}
                      />
                    );
                  })}
                </div>

                <button className="w-full mt-4 py-3 rounded-xl font-bold text-white text-base lume-btn-green flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Adicionar Lançamento
                </button>
              </div>

              {/* Future Transactions List */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Lançamentos Planejados
                </h3>
                <div className="space-y-3">
                  {futureTransactions.map((t, i) => (
                    <div key={i} className="lume-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: t.type === "receita" ? "#dcfce7" : "#fee2e2",
                              color: t.type === "receita" ? "#22C55E" : "#ef4444",
                            }}
                          >
                            {t.type === "receita" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{t.category}</p>
                            <p className="text-sm text-gray-600">{t.date}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <p className="font-bold text-lg" style={{ color: t.type === "receita" ? "#22C55E" : "#ef4444" }}>
                            {t.type === "receita" ? "+" : "-"}R$ {t.value.toFixed(2)}
                          </p>
                          <button className="p-2 hover:bg-gray-100 rounded">
                            <Edit2 className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cash Flow */}
            <div className="lume-card">
              <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Fluxo de Caixa - Próximos 30 Dias
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="receitas" fill="#22C55E" name="Receitas" />
                  <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB: HISTORY */}
        {activeTab === "history" && (
          <div className="fade-target opacity-0 max-w-3xl mx-auto">
            <div className="lume-card mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Últimos 30 Dias
              </h3>
              <div className="space-y-3">
                {historyTransactions.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: t.type === "receita" ? "#dcfce7" : "#fee2e2",
                          color: t.type === "receita" ? "#22C55E" : "#ef4444",
                        }}
                      >
                        {t.type === "receita" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{t.category}</p>
                        <p className="text-sm text-gray-600">{t.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold" style={{ color: t.type === "receita" ? "#22C55E" : "#ef4444" }}>
                        {t.type === "receita" ? "+" : "-"}R$ {t.value.toFixed(2)}
                      </p>
                      <button className="p-2 hover:bg-gray-100 rounded">
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: TRACKING */}
        {activeTab === "tracking" && (
          <div className="fade-target opacity-0">
            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="lume-card text-center">
                <p className="text-sm text-gray-600 mb-2">Total de Receitas</p>
                <p className="text-3xl font-black" style={{ color: "#22C55E" }}>R$ 2.500,00</p>
              </div>
              <div className="lume-card text-center">
                <p className="text-sm text-gray-600 mb-2">Total de Despesas</p>
                <p className="text-3xl font-black" style={{ color: "#ef4444" }}>R$ 1.500,00</p>
              </div>
              <div className="lume-card text-center">
                <p className="text-sm text-gray-600 mb-2">Saldo do Mês</p>
                <p className="text-3xl font-black" style={{ color: "#2563EB" }}>R$ 1.000,00</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="lume-card">
                <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Distribuição de Despesas
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie data={categorySpending}>
                    <Pie
                      data={categorySpending}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>

              <div className="lume-card">
                <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Comparação de Gastos por Mês
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="alimentacao" fill="#2563EB" name="Alimentação" />
                    <Bar dataKey="moradia" fill="#22C55E" name="Moradia" />
                    <Bar dataKey="saude" fill="#FACC15" name="Saúde" />
                    <Bar dataKey="lazer" fill="#7C3AED" name="Lazer" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="lume-card">
              <h3 className="text-lg font-bold text-gray-800 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Gastos por Categoria - Abril 2025
              </h3>
              <div className="space-y-4">
                {categorySpending.map((cat, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">{cat.name}</span>
                      <span className="font-bold" style={{ color: cat.color }}>
                        R$ {cat.value.toFixed(2)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
