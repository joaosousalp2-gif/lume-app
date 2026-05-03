/*
 * LaunchesSection — Lume
 * Design: Modernismo Humanista
 * Módulo de Lançamentos Financeiros com calendário, formulários, rastreamento, filtros e PDF
 */

import { useEffect, useRef, useState } from "react";
import { Calendar, Plus, TrendingUp, TrendingDown, BarChart3, PieChart, Trash2, Edit2, Download, Search, Filter, X } from "lucide-react";
import LaunchModals from "./LaunchModals";
import { BarChart, Bar, PieChart as RechartsPie, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";
import { getAllLaunches, calculateDerivedData, deleteLaunch, onDataChange, exportToCSV, type DerivedData } from "@/lib/dataStore";

interface Launch {
  id: string;
  type: "receita" | "despesa";
  date: string;
  category: string;
  value: number;
  description: string;
  recurrence?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

const currentDate = new Date(2025, 3, 29); // 29 de abril de 2025

function TransactionCard({ transaction, showTime = false, onDelete }: { transaction: any; showTime?: boolean; onDelete?: () => void }) {
  const isReceita = transaction.type === "receita";
  const value = typeof transaction.value === "string" ? parseFloat(transaction.value) : transaction.value;
  
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
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-bold text-lg" style={{ color: isReceita ? "#22C55E" : "#ef4444" }}>
            {isReceita ? "+" : "-"}R$ {value.toFixed(2)}
          </p>
          {showTime && <p className="text-xs text-gray-700">{transaction.time}</p>}
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600"
            title="Deletar"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"receita" | "despesa" | null>(null);
  const [launches, setLaunches] = useState<Launch[]>([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"all" | "receita" | "despesa">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Carregar lançamentos do localStorage
  useEffect(() => {
    const loadLaunches = () => {
      try {
        const data = localStorage.getItem("lume_launches");
        if (data) {
          setLaunches(JSON.parse(data));
        }
      } catch (error) {
        console.error("Erro ao carregar lançamentos:", error);
      }
    };
    loadLaunches();

    const handleStorageChange = () => {
      loadLaunches();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    try {
      const data = localStorage.getItem("lume_launches");
      if (data) {
        setLaunches(JSON.parse(data));
      }
    } catch (error) {
      console.error("Erro ao carregar lançamentos:", error);
    }
  };

  const openModal = (type: "receita" | "despesa") => {
    setModalType(type);
    setModalOpen(true);
  };

  const deleteLaunch = (id: string) => {
    const updated = launches.filter(l => l.id !== id);
    localStorage.setItem("lume_launches", JSON.stringify(updated));
    setLaunches(updated);
  };

  // Funções de filtro
  const getFilteredLaunches = (launches: Launch[]) => {
    return launches.filter(launch => {
      const matchesSearch = launch.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          launch.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || launch.category === selectedCategory;
      const matchesType = selectedType === "all" || launch.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  };

  // Obter lançamentos por aba
  const getTodayLaunches = () => {
    const today = new Date().toISOString().split("T")[0];
    return getFilteredLaunches(launches.filter(l => l.date === today));
  };

  const getFutureLaunches = () => {
    const today = new Date().toISOString().split("T")[0];
    return getFilteredLaunches(launches.filter(l => l.date > today));
  };

  const getHistoryLaunches = () => {
    const today = new Date().toISOString().split("T")[0];
    return getFilteredLaunches(launches.filter(l => l.date < today));
  };

  // Calcular resumos
  const calculateSummary = (launchList: Launch[]) => {
    const receitas = launchList
      .filter(l => l.type === "receita")
      .reduce((sum, l) => sum + (typeof l.value === 'string' ? parseFloat(l.value) : l.value), 0);
    const despesas = launchList
      .filter(l => l.type === "despesa")
      .reduce((sum, l) => sum + (typeof l.value === 'string' ? parseFloat(l.value) : l.value), 0);
    return { receitas, despesas, saldo: receitas - despesas };
  };

  // Exportar Relatório em CSV
  const generatePDF = () => {
    const allSummary = calculateSummary(launches);
    
    // Criar conteúdo CSV
    let csvContent = "Data,Tipo,Categoria,Descrição,Valor\n";
    launches.forEach(l => {
      const val = typeof l.value === 'string' ? parseFloat(l.value) : l.value;
      csvContent += `${l.date},${l.type === "receita" ? "Receita" : "Despesa"},${l.category},"${l.description}",R$ ${val.toFixed(2)}\n`;
    });
    
    // Adicionar resumo
    csvContent += "\n\nRESUMO GERAL\n";
    csvContent += `Total de Receitas,R$ ${allSummary.receitas.toFixed(2)}\n`;
    csvContent += `Total de Despesas,R$ ${allSummary.despesas.toFixed(2)}\n`;
    csvContent += `Saldo,R$ ${allSummary.saldo.toFixed(2)}\n`;
    
    // Criar blob e download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Relatorio_Lancamentos_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
    
    toast.success("✅ Relatório exportado com sucesso!", {
      description: "Arquivo CSV foi baixado",
      duration: 3000,
    });
  };

  // Obter categorias únicas
  const allCategories = Array.from(new Set(launches.map(l => l.category)));

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const todayLaunches = getTodayLaunches();
  const futureLaunches = getFutureLaunches();
  const historyLaunches = getHistoryLaunches();
  const todaySummary = calculateSummary(todayLaunches);
  const allSummary = calculateSummary(launches);

  return (
    <section id="lancamentos" ref={sectionRef} className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            💰 Lançamentos Financeiros
          </h2>
          <p className="text-lg text-gray-600">Registre, acompanhe e analise todas as suas receitas e despesas</p>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={() => openModal("receita")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 transition-all"
          >
            <Plus className="w-5 h-5" />
            Adicionar Receita
          </button>
          <button
            onClick={() => openModal("despesa")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-all"
          >
            <Plus className="w-5 h-5" />
            Adicionar Despesa
          </button>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all"
          >
            <Download className="w-5 h-5" />
            Exportar PDF
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all"
          >
            <Filter className="w-5 h-5" />
            Filtros
          </button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="mb-8 p-6 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Filtros Avançados</h3>
              <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-blue-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Busca */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-200" />
                  <input
                    type="text"
                    placeholder="Categoria ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Todas</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Limpar Filtros */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory(null);
                    setSelectedType("all");
                  }}
                  className="w-full px-4 py-2 rounded-lg font-bold text-white bg-gray-600 hover:bg-gray-700 transition-all"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-xl bg-green-50 border border-green-200">
            <p className="text-sm text-green-700 font-bold mb-2">Total de Receitas</p>
            <p className="text-3xl font-black text-green-600">R$ {allSummary.receitas.toFixed(2)}</p>
          </div>
          <div className="p-6 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 font-bold mb-2">Total de Despesas</p>
            <p className="text-3xl font-black text-red-600">R$ {allSummary.despesas.toFixed(2)}</p>
          </div>
          <div className="p-6 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-700 font-bold mb-2">Saldo Total</p>
            <p className="text-3xl font-black" style={{ color: allSummary.saldo >= 0 ? "#22C55E" : "#EF4444" }}>
              R$ {allSummary.saldo.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Abas */}
        <div className="mb-8 flex gap-2 border-b border-gray-200 overflow-x-auto">
          {[
            { id: "today", label: `📅 Hoje (${todayLaunches.length})`, count: todayLaunches.length },
            { id: "future", label: `⏰ Futuros (${futureLaunches.length})`, count: futureLaunches.length },
            { id: "history", label: `📜 Histórico (${historyLaunches.length})`, count: historyLaunches.length },
            { id: "tracking", label: "📊 Rastreamento", count: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-bold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das Abas */}
        <div className="space-y-6">
          {/* ABA: HOJE */}
          {activeTab === "today" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-sm text-green-700 font-bold">Receitas Hoje</p>
                  <p className="text-2xl font-black text-green-600">R$ {todaySummary.receitas.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700 font-bold">Despesas Hoje</p>
                  <p className="text-2xl font-black text-red-600">R$ {todaySummary.despesas.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-700 font-bold">Saldo Hoje</p>
                  <p className="text-2xl font-black" style={{ color: todaySummary.saldo >= 0 ? "#22C55E" : "#EF4444" }}>
                    R$ {todaySummary.saldo.toFixed(2)}
                  </p>
                </div>
              </div>

              {todayLaunches.length > 0 ? (
                <div className="space-y-3">
                  {todayLaunches.map((launch) => (
                    <TransactionCard
                      key={launch.id}
                      transaction={launch}
                      onDelete={() => deleteLaunch(launch.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <p className="text-gray-600 font-semibold">Nenhum lançamento registrado para hoje</p>
                </div>
              )}
            </div>
          )}

          {/* ABA: FUTUROS */}
          {activeTab === "future" && (
            <div className="space-y-6">
              {futureLaunches.length > 0 ? (
                <div className="space-y-3">
                  {futureLaunches.map((launch) => (
                    <TransactionCard
                      key={launch.id}
                      transaction={launch}
                      onDelete={() => deleteLaunch(launch.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <p className="text-gray-600 font-semibold">Nenhum lançamento futuro registrado</p>
                </div>
              )}
            </div>
          )}

          {/* ABA: HISTÓRICO */}
          {activeTab === "history" && (
            <div className="space-y-6">
              {historyLaunches.length > 0 ? (
                <div className="space-y-3">
                  {historyLaunches.map((launch) => (
                    <TransactionCard
                      key={launch.id}
                      transaction={launch}
                      onDelete={() => deleteLaunch(launch.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <p className="text-gray-600 font-semibold">Nenhum lançamento no histórico</p>
                </div>
              )}
            </div>
          )}

          {/* ABA: RASTREAMENTO */}
          {activeTab === "tracking" && (
            <div className="space-y-6">
              {launches.length > 0 ? (
                <>
                  {/* Gráfico de Pizza - Distribuição por Categoria */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Distribuição por Categoria</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie data={
                        Object.entries(
                          launches.reduce((acc: any, l) => {
                            const value = typeof l.value === 'string' ? parseFloat(l.value) : l.value;
                            acc[l.category] = (acc[l.category] || 0) + value;
                            return acc;
                          }, {})
                        ).map(([name, value]) => ({ name, value }))
                      }>
                        <Pie dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                          {Object.entries(
                            launches.reduce((acc: any, l) => {
                              const value = typeof l.value === 'string' ? parseFloat(l.value) : l.value;
                              acc[l.category] = (acc[l.category] || 0) + value;
                              return acc;
                            }, {})
                          ).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={["#2563EB", "#22C55E", "#FACC15", "#7C3AED", "#EF4444"][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>

                  {/* Gráfico de Barras - Receita vs Despesa */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Receita vs Despesa</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { name: "Totais", receitas: allSummary.receitas, despesas: allSummary.despesas }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="receitas" fill="#22C55E" name="Receitas" />
                        <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <p className="text-gray-600 font-semibold">Nenhum lançamento para rastrear</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <LaunchModals isOpen={modalOpen} type={modalType} onClose={closeModal} />
    </section>
  );
}
