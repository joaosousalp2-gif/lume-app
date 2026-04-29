/*
 * SpreadsheetsSection — Lume
 * Design: Modernismo Humanista
 * Módulo de Planilhas Financeiras com gráficos interativos, tabelas e fluxos
 * Destaque: visualizações de dados, exportação, projeções
 */

import { useEffect, useRef, useState } from "react";
import { BarChart3, PieChart, TrendingUp, Download, FileSpreadsheet, Eye, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, PieChart as RechartsPie, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

const monthlyData = [
  { month: "Jan", receitas: 2300, despesas: 1320, saldo: 980 },
  { month: "Fev", receitas: 2300, despesas: 1450, saldo: 850 },
  { month: "Mar", receitas: 2300, despesas: 1200, saldo: 1100 },
  { month: "Abr", receitas: 2300, despesas: 1320, saldo: 980 },
  { month: "Mai", receitas: 2300, despesas: 1100, saldo: 1200 },
  { month: "Jun", receitas: 2300, despesas: 1500, saldo: 800 },
];

const categoryData = [
  { name: "Alimentação", value: 270.50, color: "#2563EB" },
  { name: "Saúde", value: 200, color: "#22C55E" },
  { name: "Moradia", value: 800, color: "#FACC15" },
  { name: "Lazer", value: 50, color: "#7C3AED" },
];

const projectionData = [
  { mes: "Fev", otimista: 1089.50, realista: 979.50, pessimista: 869.50 },
  { mes: "Mar", otimista: 2179, realista: 1959, pessimista: 1738 },
  { mes: "Abr", otimista: 3268.50, realista: 2938.50, pessimista: 2607.50 },
  { mes: "Mai", otimista: 4358, realista: 3918, pessimista: 3477 },
  { mes: "Jun", otimista: 5447.50, realista: 4897.50, pessimista: 4346.50 },
  { mes: "Jul", otimista: 6537, realista: 5877, pessimista: 5216 },
];

const transactionsExample = [
  { data: "01/01/2025", tipo: "Receita", categoria: "Pensão", valor: "R$ 2.000,00", descricao: "Pensão mensal" },
  { data: "05/01/2025", tipo: "Despesa", categoria: "Alimentação", valor: "R$ 150,50", descricao: "Compras supermercado" },
  { data: "08/01/2025", tipo: "Despesa", categoria: "Saúde", valor: "R$ 200,00", descricao: "Consulta médica" },
  { data: "10/01/2025", tipo: "Despesa", categoria: "Moradia", valor: "R$ 800,00", descricao: "Aluguel" },
  { data: "15/01/2025", tipo: "Receita", categoria: "Outros", valor: "R$ 300,00", descricao: "Venda de itens usados" },
  { data: "20/01/2025", tipo: "Despesa", categoria: "Alimentação", valor: "R$ 120,00", descricao: "Compras supermercado" },
  { data: "25/01/2025", tipo: "Despesa", categoria: "Lazer", valor: "R$ 50,00", descricao: "Cinema" },
];

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
    desc: "Revise gráficos e tabelas antes de exportar.",
  },
  {
    number: "05",
    title: "Exporte e Salve",
    desc: "Salve no celular, nuvem, email ou WhatsApp.",
  },
];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="lume-card">
      <h4 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

export default function SpreadsheetsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"monthly" | "category" | "projection">("monthly");

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

  return (
    <section
      id="planilhas"
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-white to-blue-50"
    >
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16 fade-target opacity-0">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-2 mb-4">
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            <span className="text-purple-600 text-sm font-bold">Módulo de Planilhas</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 section-title">
            Transforme seus dados em
            <span style={{ color: "#7C3AED" }}> relatórios profissionais</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Gere planilhas estruturadas, gráficos visuais e projeções financeiras. Exporte em Excel, PDF ou CSV com um toque.
          </p>
        </div>

        {/* Tipos de Planilhas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {spreadsheetTypes.map((type, i) => (
            <div
              key={i}
              className="fade-target opacity-0 lume-card group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: type.bg, color: type.color }}
              >
                {type.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {type.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{type.desc}</p>
              <ul className="space-y-2">
                {type.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4" style={{ color: type.color }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Visualizações Interativas */}
        <div className="fade-target opacity-0 mb-20">
          <h3 className="text-3xl font-black text-gray-900 mb-8 text-center section-title">
            Visualize seus dados
          </h3>

          {/* Tabs */}
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            {[
              { id: "monthly", label: "Receitas vs Despesas", icon: <BarChart3 className="w-4 h-4" /> },
              { id: "category", label: "Despesas por Categoria", icon: <PieChart className="w-4 h-4" /> },
              { id: "projection", label: "Projeção 6 Meses", icon: <TrendingUp className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {activeTab === "monthly" && (
              <>
                <ChartCard title="Receitas vs Despesas (6 meses)">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="receitas" fill="#22C55E" name="Receitas" />
                      <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Evolução do Saldo Acumulado">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="saldo" stroke="#2563EB" strokeWidth={3} name="Saldo" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </>
            )}

            {activeTab === "category" && (
              <>
                <ChartCard title="Distribuição de Despesas por Categoria">
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie data={categoryData}>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </ChartCard>
                <div className="lume-card">
                  <h4 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Resumo por Categoria
                  </h4>
                  <div className="space-y-3">
                    {categoryData.map((cat, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="font-semibold text-gray-700">{cat.name}</span>
                        </div>
                        <span className="text-lg font-bold" style={{ color: cat.color }}>
                          R$ {cat.value.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-3 mt-3 flex items-center justify-between">
                      <span className="font-bold text-gray-800">Total</span>
                      <span className="text-lg font-black text-gray-900">
                        R$ {categoryData.reduce((sum, cat) => sum + cat.value, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "projection" && (
              <>
                <ChartCard title="Projeção de Saldo Acumulado (3 Cenários)">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                      <Legend />
                      <Line type="monotone" dataKey="otimista" stroke="#22C55E" strokeWidth={2} name="Otimista (+10%)" />
                      <Line type="monotone" dataKey="realista" stroke="#2563EB" strokeWidth={2} name="Realista" />
                      <Line type="monotone" dataKey="pessimista" stroke="#ef4444" strokeWidth={2} name="Pessimista (-10%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
                <div className="lume-card">
                  <h4 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Recomendações
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: "#dcfce7", borderLeft: "4px solid #22C55E" }}>
                      <p className="text-sm font-semibold text-green-900">
                        ✓ Se manter o padrão realista, terá <strong>R$ 5.877</strong> economizados em 6 meses.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: "#dbeafe", borderLeft: "4px solid #2563EB" }}>
                      <p className="text-sm font-semibold text-blue-900">
                        → Seu padrão de gastos é estável. Considere aumentar a economia em 10%.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: "#fef3c7", borderLeft: "4px solid #FACC15" }}>
                      <p className="text-sm font-semibold text-yellow-900">
                        ⚠ Cenário pessimista: R$ 5.216. Revise seus gastos com alimentação.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Fluxo Passo a Passo */}
        <div className="fade-target opacity-0 mb-20">
          <h3 className="text-3xl font-black text-gray-900 mb-12 text-center section-title">
            Como gerar uma planilha
          </h3>

          <div className="grid lg:grid-cols-5 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-12 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5"
                    style={{ backgroundColor: "#dbeafe" }}
                  />
                )}

                {/* Step card */}
                <div className="relative z-10 lume-card text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-black text-white text-lg"
                    style={{ backgroundColor: "#2563EB" }}
                  >
                    {step.number}
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela de Exemplo */}
        <div className="fade-target opacity-0 mb-20">
          <h3 className="text-3xl font-black text-gray-900 mb-8 text-center section-title">
            Exemplo: Planilha Mensal de Janeiro
          </h3>

          <div className="lume-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #d1d5db" }}>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Data</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Tipo</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Categoria</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-800">Valor</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-800">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {transactionsExample.map((t, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td className="px-4 py-3 text-gray-700">{t.data}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: t.tipo === "Receita" ? "#dcfce7" : "#fee2e2",
                          color: t.tipo === "Receita" ? "#166534" : "#991b1b",
                        }}
                      >
                        {t.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{t.categoria}</td>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: t.tipo === "Receita" ? "#22C55E" : "#ef4444" }}>
                      {t.valor}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.descricao}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Resumo */}
            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total de Receitas</p>
                <p className="text-2xl font-black" style={{ color: "#22C55E" }}>R$ 2.300,00</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total de Despesas</p>
                <p className="text-2xl font-black" style={{ color: "#ef4444" }}>R$ 1.320,50</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Saldo do Mês</p>
                <p className="text-2xl font-black" style={{ color: "#2563EB" }}>R$ 979,50</p>
              </div>
            </div>
          </div>
        </div>

        {/* Opções de Exportação */}
        <div className="fade-target opacity-0">
          <h3 className="text-3xl font-black text-gray-900 mb-8 text-center section-title">
            Exporte em múltiplos formatos
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                format: "Excel (.xlsx)",
                desc: "Arquivo nativo do Microsoft Excel com múltiplas abas, fórmulas e formatação automática.",
                icon: "📊",
                color: "#22C55E",
              },
              {
                format: "PDF",
                desc: "Relatório visual profissional otimizado para impressão, com logo e marca Lume.",
                icon: "📄",
                color: "#2563EB",
              },
              {
                format: "CSV (.csv)",
                desc: "Arquivo de texto simples, útil para importação em outros softwares.",
                icon: "📋",
                color: "#7C3AED",
              },
            ].map((exp, i) => (
              <div key={i} className="lume-card text-center">
                <div className="text-5xl mb-4">{exp.icon}</div>
                <h4 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {exp.format}
                </h4>
                <p className="text-gray-600 text-base leading-relaxed mb-4">{exp.desc}</p>
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: `linear-gradient(135deg, ${exp.color}, ${exp.color}dd)`,
                    boxShadow: `0 4px 15px ${exp.color}40`,
                  }}
                >
                  <Download className="w-5 h-5" />
                  Exportar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
