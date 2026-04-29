/*
 * HowItWorksSection — Lume
 * Design: Modernismo Humanista
 * Passos numerados com linha conectora, ícones grandes, cores alternadas
 */

import { useEffect, useRef } from "react";
import { Download, UserCircle, PlusCircle, BarChart2, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Download className="w-8 h-8" />,
    title: "Baixe o Lume",
    desc: "Disponível gratuitamente na Google Play Store. Instalação simples em poucos minutos.",
    color: "#2563EB",
    bg: "#dbeafe",
  },
  {
    number: "02",
    icon: <UserCircle className="w-8 h-8" />,
    title: "Crie seu Perfil",
    desc: "Cadastre-se com nome e dados básicos. Configure seu PIN ou biometria para acesso seguro.",
    color: "#22C55E",
    bg: "#dcfce7",
  },
  {
    number: "03",
    icon: <PlusCircle className="w-8 h-8" />,
    title: "Registre suas Finanças",
    desc: "Adicione suas receitas (aposentadoria, pensão) e despesas mensais com botões grandes e simples.",
    color: "#2563EB",
    bg: "#dbeafe",
  },
  {
    number: "04",
    icon: <BarChart2 className="w-8 h-8" />,
    title: "Acompanhe os Relatórios",
    desc: "Veja gráficos claros do seu dinheiro, exporte planilhas e defina metas financeiras.",
    color: "#22C55E",
    bg: "#dcfce7",
  },
  {
    number: "05",
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "Fique Protegido",
    desc: "Aprenda sobre golpes, verifique mensagens suspeitas e tenha seus contatos de emergência sempre à mão.",
    color: "#FACC15",
    bg: "#fef3c7",
    textColor: "#92400e",
  },
];

const screens = [
  {
    title: "Tela Inicial",
    desc: "Dashboard com saldo, últimas transações e dicas de segurança do dia.",
    color: "#2563EB",
  },
  {
    title: "Adicionar Transação",
    desc: "Formulário simples com botões grandes para registrar receita ou despesa.",
    color: "#22C55E",
  },
  {
    title: "Histórico",
    desc: "Lista de todas as transações com filtros por data e categoria.",
    color: "#2563EB",
  },
  {
    title: "Relatórios",
    desc: "Gráficos e resumos com opção de exportar planilha em Excel ou PDF.",
    color: "#22C55E",
  },
  {
    title: "Segurança",
    desc: "Módulo educacional, verificador de mensagens e contatos de emergência.",
    color: "#FACC15",
  },
  {
    title: "Assistente de Voz",
    desc: "Interface de voz para consultas rápidas e registro de transações.",
    color: "#7C3AED",
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

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
      id="como-funciona"
      ref={sectionRef}
      className="py-24 bg-white"
    >
      <div className="container">
        {/* Header */}
        <div className="text-center mb-20 fade-target opacity-0">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-2 mb-4">
            <span className="text-green-600 text-sm font-bold">Como Funciona</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 section-title">
            Comece em
            <span style={{ color: "#22C55E" }}> 5 passos simples</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            O Lume foi pensado para ser fácil desde o primeiro uso. Sem complicação, sem termos técnicos.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mb-24">
          {/* Connecting line (desktop) */}
          <div
            className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 z-0"
            style={{ background: "linear-gradient(90deg, #dbeafe, #dcfce7, #dbeafe, #dcfce7, #fef3c7)" }}
          />

          <div className="grid lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, i) => (
              <div
                key={i}
                className="fade-target opacity-0 flex flex-col items-center text-center"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {/* Number + Icon */}
                <div className="relative mb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: step.bg, color: step.color }}
                  >
                    {step.icon}
                  </div>
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.number}
                  </div>
                </div>
                <h3
                  className="text-lg font-bold text-gray-800 mb-2"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Screens Grid */}
        <div className="fade-target opacity-0">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-black text-gray-900 mb-3 section-title">
              Telas do Aplicativo
            </h3>
            <p className="text-lg text-gray-600">
              Cada tela foi projetada para ser clara, organizada e fácil de usar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {screens.map((screen, i) => (
              <div
                key={i}
                className="lume-card group"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: screen.color }}
                  />
                  <h4
                    className="text-lg font-bold text-gray-800"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {screen.title}
                  </h4>
                </div>
                <p className="text-gray-600 text-base leading-relaxed">{screen.desc}</p>
                <div
                  className="mt-4 h-1 rounded-full w-0 group-hover:w-full transition-all duration-500"
                  style={{ backgroundColor: screen.color }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
