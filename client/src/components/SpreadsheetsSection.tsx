/*
 * SpreadsheetsSection — Lume
 * Design: Modernismo Humanista
 * Módulo de Planilhas Financeiras com dados reais de lançamentos
 * Conectado com LaunchesSection - sincroniza automaticamente
 */

import { useEffect, useRef, useState } from "react";
import { BarChart3, PieChart, TrendingUp, Download, FileSpreadsheet, Eye, CheckCircle2, Calendar } from "lucide-react";
import { BarChart, Bar, PieChart as RechartsPie, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";

interface Launch {
  id: string;
  type: "receita" | "despesa";
  date: string;
  category: string;
  value: string;
  description: string;
  recurrence: string;
  endDate: string;
  timestamp: number;
}

const spreadsheetTypes = [
  {
    title: "Planilha Mensal Detalhada",
    desc: "Todas as transações do mês com resumo por categoria e gráficos.",
    icon: <FileSpreadsheet className="w-7 h-7" />,
    color: "#2563EB",
    bg: "#dbeafe",
    features: ["Transações completas", "Resumo por categoria", "Gráfico de pizza", "Comparação com mês anterior"],
  },
  {
    title: "Planilha Trimestral",
    desc: "Consolidação de 3 meses com análise de tendências.",
    icon: <BarChart3 className="w-7 h-7" />,
    color: "#22C55E",
    bg: "#dcfce7",
    features: ["3 meses em abas", "Resumo trimestral", "Gráficos comparativos", "Análise de tendências"],
  },
  {
    title: "Planilha Anual Completa",
    desc: "Visão completa do ano com análise de categorias e projeções.",
    icon: <TrendingUp className="w-7 h-7" />,
    color: "#7C3AED",
    bg: "#ede9fe",
    features: ["12 meses detalhados", "Análise de categorias", "Projeções futuras", "14 abas estruturadas"],
  },
  {
    title: "Planilha de Projeção",
    desc: "Previsões para próximos meses com 3 cenários.",
    icon: <TrendingUp className="w-7 h-7" />,
    color: "#FACC15",
    bg: "#fef3c7",
    features: ["3 cenários", "Recomendações", "Gráfico de evolução", "Análise de padrões"],
  },
];

const steps = [
  {
    number: "01",
    title: "Selecione o Período",
    desc: "Escolha o mês, trimestre ou ano desejado em um calendário grande e intuitivo.",
  },
  {
    number: "02",
    title: "Confirme os Dados",
    desc: "Veja um resumo: quantas transações, total de receitas e despesas.",
  },
  {
    number: "03",
    title: "Escolha o Formato",
    desc: "Exporte em Excel, PDF ou CSV conforme sua necessidade.",
  },
  {
    number: "04",
    title: "Visualize a Prévia",
    desc: "Veja como ficará antes de baixar e compartilhe com quem precisar.",
  },
  {
    number: "05",
    title: "Baixe a Planilha",
    desc: "Arquivo pronto para usar, editar e compartilhar com segurança.",
  },
];

export default function SpreadsheetsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("mensal");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split("T")[0].substring(0, 7));
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  // Carregar lançamentos do localStorage e sincronizar em tempo real
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

    const handleStorageChange = () => loadLaunches();
    const handleLaunchesUpdated = () => loadLaunches();
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("lume_launches_updated", handleLaunchesUpdated);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("lume_launches_updated", handleLaunchesUpdated);
    };
  }, []);

  // Processar dados quando lançamentos mudam
  useEffect(() => {
    processLaunchesData();
  }, [launches, selectedMonth, selectedPeriod]);

  // Processar dados de lançamentos
  const processLaunchesData = () => {
    if (!launches || launches.length === 0) {
      setMonthlyData([]);
      setCategoryData([]);
      return;
    }

    // Agrupar por mês
    const monthlyMap: { [key: string]: { receitas: number; despesas: number } } = {};

    launches.forEach(launch => {
      const monthKey = launch.date.substring(0, 7); // YYYY-MM
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { receitas: 0, despesas: 0 };
      }

      const value = parseFloat(launch.value);
      if (launch.type === "receita") {
        monthlyMap[monthKey].receitas += value;
      } else {
        monthlyMap[monthKey].despesas += value;
      }
    });

    // Converter para array e calcular saldo
    const monthlyArray = Object.entries(monthlyMap)
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        monthKey: month,
        receitas: data.receitas,
        despesas: data.despesas,
        saldo: data.receitas - data.despesas,
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    setMonthlyData(monthlyArray);

    // Agrupar por categoria (mês selecionado)
    const categoryMap: { [key: string]: number } = {};
    launches
      .filter(l => l.date.startsWith(selectedMonth) && l.type === "despesa")
      .forEach(launch => {
        const value = parseFloat(launch.value);
        categoryMap[launch.category] = (categoryMap[launch.category] || 0) + value;
      });

    const categoryArray = Object.entries(categoryMap)
      .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);

    setCategoryData(categoryArray);
  };

  // Exportar planilha como CSV
  const exportSpreadsheet = (type: string) => {
    if (launches.length === 0) {
      toast.error("❌ Nenhum lançamento para exportar!");
      return;
    }

    let csvContent = "";

    if (type === "mensal") {
      csvContent = "Data,Tipo,Categoria,Descrição,Valor\n";
      launches
        .filter(l => l.date.startsWith(selectedMonth))
        .forEach(l => {
          csvContent += `${l.date},${l.type === "receita" ? "Receita" : "Despesa"},${l.category},"${l.description}",R$ ${parseFloat(l.value).toFixed(2)}\n`;
        });

      const monthTotal = launches
        .filter(l => l.date.startsWith(selectedMonth))
        .reduce((acc, l) => {
          const value = parseFloat(l.value);
          return {
            receitas: acc.receitas + (l.type === "receita" ? value : 0),
            despesas: acc.despesas + (l.type === "despesa" ? value : 0),
          };
        }, { receitas: 0, despesas: 0 });

      csvContent += `\n\nRESUMO DO MÊS\nReceitas,R$ ${monthTotal.receitas.toFixed(2)}\nDespesas,R$ ${monthTotal.despesas.toFixed(2)}\nSaldo,R$ ${(monthTotal.receitas - monthTotal.despesas).toFixed(2)}\n`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Planilha_${type}_${selectedMonth}.csv`);
    link.click();

    toast.success("✅ Planilha exportada com sucesso!", {
      description: `Arquivo CSV foi baixado`,
    });
  };

  // Calcular resumo geral
  const totalReceitas = launches.reduce((sum, l) => sum + (l.type === "receita" ? parseFloat(l.value) : 0), 0);
  const totalDespesas = launches.reduce((sum, l) => sum + (l.type === "despesa" ? parseFloat(l.value) : 0), 0);
  const totalSaldo = totalReceitas - totalDespesas;

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

  return (
    <section id="planilhas" ref={sectionRef} className="py-20 bg-white">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            📊 Transforme seus dados em relatórios profissionais
          </h2>
          <p className="text-lg text-gray-600">Gere planilhas automáticas com todos os seus lançamentos financeiros</p>
        </div>

        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="p-6 rounded-xl bg-green-50 border border-green-200">
            <p className="text-sm text-green-700 font-bold mb-2">Total de Receitas</p>
            <p className="text-3xl font-black text-green-600">R$ {totalReceitas.toFixed(2)}</p>
          </div>
          <div className="p-6 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 font-bold mb-2">Total de Despesas</p>
            <p className="text-3xl font-black text-red-600">R$ {totalDespesas.toFixed(2)}</p>
          </div>
          <div className="p-6 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-700 font-bold mb-2">Saldo Total</p>
            <p className="text-3xl font-black" style={{ color: totalSaldo >= 0 ? "#22C55E" : "#EF4444" }}>
              R$ {totalSaldo.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Seletor de Período */}
        <div className="mb-12 p-6 rounded-xl bg-blue-50 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Planilha</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
              >
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mês/Período</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        {launches.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Gráfico de Barras - Receita vs Despesa */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Receita vs Despesa (Últimos 6 meses)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="receitas" fill="#22C55E" name="Receitas" />
                  <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Pizza - Distribuição por Categoria */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Distribuição por Categoria ({selectedMonth})</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie data={categoryData}>
                    <Pie dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={["#2563EB", "#22C55E", "#FACC15", "#7C3AED", "#EF4444"][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  Nenhuma despesa neste período
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tipos de Planilhas */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Tipos de Planilhas Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {spreadsheetTypes.map((type, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border-2 transition-all hover:shadow-lg"
                style={{ borderColor: type.color, backgroundColor: type.bg }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div style={{ color: type.color }}>{type.icon}</div>
                  <h4 className="font-bold text-gray-900">{type.title}</h4>
                </div>
                <p className="text-sm text-gray-700 mb-4">{type.desc}</p>
                <ul className="space-y-2 mb-6">
                  {type.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4" style={{ color: type.color }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => exportSpreadsheet(type.title.toLowerCase().includes("mensal") ? "mensal" : "trimestral")}
                  className="w-full px-4 py-2 rounded-lg font-bold text-white transition-all"
                  style={{ backgroundColor: type.color }}
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Gerar Planilha
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Passos */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Como Funciona</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl text-white mx-auto mb-4"
                  style={{ backgroundColor: "#2563EB" }}
                >
                  {step.number}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        {launches.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">Nenhum lançamento registrado</p>
            <p className="text-sm text-gray-500">Registre lançamentos na seção "Lançamentos Financeiros" para gerar planilhas</p>
          </div>
        )}
      </div>
    </section>
  );
}
