/*
 * FeaturesSection — Lume
 * Design: Modernismo Humanista
 * Grid de cards com ícones grandes, cores da paleta Lume, animações fade-up
 * Acessibilidade: textos grandes, alto contraste, ícones com legendas
 */

import { useEffect, useRef } from "react";
import {
  PlusCircle,
  FileSpreadsheet,
  BarChart2,
  ShieldAlert,
  Phone,
  MessageSquareWarning,
  Target,
  Mic,
  Sun,
} from "lucide-react";

const FINANCE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663613130250/YrzazuYSz4uDAUDGnbJMLa/lume-finance-mUabDhGEReCf7o8HnKRnYt.webp";
const SECURITY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663613130250/YrzazuYSz4uDAUDGnbJMLa/lume-security-cLVjxujKHpyi9KfwbsyPUF.webp";
const VOICE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663613130250/YrzazuYSz4uDAUDGnbJMLa/lume-voice-bnCkQWBHSQ2Eye4XkoQgHz.webp";

const featureGroups = [
  {
    id: "gestao",
    tag: "Gestão Financeira",
    tagColor: "#22C55E",
    tagBg: "#dcfce7",
    title: "Controle total das suas finanças",
    description:
      "Registre receitas e despesas com facilidade, visualize gráficos claros e exporte planilhas detalhadas. Tudo com letras grandes e tela organizada.",
    image: FINANCE_IMG,
    imageAlt: "Ilustração de gráficos financeiros coloridos",
    imageLeft: false,
    features: [
      {
        icon: <PlusCircle className="w-6 h-6" />,
        color: "#22C55E",
        bg: "#dcfce7",
        title: "Adicionar Transação",
        desc: "Registre receitas e despesas com botões grandes e campos simples.",
      },
      {
        icon: <FileSpreadsheet className="w-6 h-6" />,
        color: "#2563EB",
        bg: "#dbeafe",
        title: "Gerar Planilha",
        desc: "Exporte planilhas anuais em Excel ou CSV com um toque.",
      },
      {
        icon: <BarChart2 className="w-6 h-6" />,
        color: "#2563EB",
        bg: "#dbeafe",
        title: "Ver Relatório",
        desc: "Gráficos de barras e pizza para entender seus gastos facilmente.",
      },
      {
        icon: <Target className="w-6 h-6" />,
        color: "#22C55E",
        bg: "#dcfce7",
        title: "Configurar Metas",
        desc: "Defina objetivos financeiros e acompanhe seu progresso.",
      },
    ],
  },
  {
    id: "seguranca-features",
    tag: "Proteção e Segurança",
    tagColor: "#d97706",
    tagBg: "#fef3c7",
    title: "Proteção contra golpes e fraudes",
    description:
      "Aprenda a identificar golpes comuns, verifique mensagens suspeitas e tenha acesso rápido a contatos de emergência. Sua segurança em primeiro lugar.",
    image: SECURITY_IMG,
    imageAlt: "Ilustração de escudo de proteção com ícones de segurança",
    imageLeft: true,
    features: [
      {
        icon: <ShieldAlert className="w-6 h-6" />,
        color: "#d97706",
        bg: "#fef3c7",
        title: "Alertas de Segurança",
        desc: "Módulo educativo sobre os golpes mais comuns para idosos.",
      },
      {
        icon: <MessageSquareWarning className="w-6 h-6" />,
        color: "#d97706",
        bg: "#fef3c7",
        title: "Verificar Mensagem",
        desc: "Cole um link ou texto suspeito e o Lume analisa o risco.",
      },
      {
        icon: <Phone className="w-6 h-6" />,
        color: "#7C3AED",
        bg: "#ede9fe",
        title: "Ajuda Rápida",
        desc: "Acesso imediato a familiares, banco e polícia em caso de golpe.",
      },
      {
        icon: <ShieldAlert className="w-6 h-6" />,
        color: "#d97706",
        bg: "#fef3c7",
        title: "Código Familiar",
        desc: "Crie uma senha secreta com a família para confirmar identidades.",
      },
    ],
  },
  {
    id: "assistente",
    tag: "Assistente de Voz",
    tagColor: "#7C3AED",
    tagBg: "#ede9fe",
    title: "Fale com o Lume, ele responde",
    description:
      "Use sua voz para registrar gastos, consultar saldos e receber dicas de segurança. O Lume entende você e responde com clareza.",
    image: VOICE_IMG,
    imageAlt: "Ilustração de assistente de voz com microfone e ondas sonoras",
    imageLeft: false,
    features: [
      {
        icon: <Mic className="w-6 h-6" />,
        color: "#7C3AED",
        bg: "#ede9fe",
        title: "Assistente de Voz com IA",
        desc: '"Quanto gastei com remédios este mês?" — pergunte e receba a resposta.',
      },
      {
        icon: <Sun className="w-6 h-6" />,
        color: "#d97706",
        bg: "#fef3c7",
        title: "Resumo Diário",
        desc: "Ao abrir o app, veja um resumo claro das suas finanças do dia.",
      },
    ],
  },
];

function FeatureCard({
  icon,
  color,
  bg,
  title,
  desc,
}: {
  icon: React.ReactNode;
  color: string;
  bg: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="lume-card flex gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bg, color }}
      >
        {icon}
      </div>
      <div>
        <h4
          className="text-lg font-bold text-gray-800 mb-1"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {title}
        </h4>
        <p className="text-gray-600 text-base leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
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
      id="funcionalidades"
      ref={sectionRef}
      className="py-24 bg-[#F8FAFC]"
    >
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-20 fade-target opacity-0">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-4">
            <span className="text-blue-600 text-sm font-bold">Funcionalidades</span>
          </div>
          <h2
            className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 section-title"
          >
            Tudo que você precisa,
            <span className="block" style={{ color: "#2563EB" }}>
              simples e claro
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            O Lume foi desenvolvido pensando em você: letras grandes, botões amplos e linguagem fácil de entender.
          </p>
        </div>

        {/* Feature Groups */}
        {featureGroups.map((group, groupIdx) => (
          <div
            key={group.id}
            className={`grid lg:grid-cols-2 gap-12 items-center mb-24 fade-target opacity-0`}
            style={{ animationDelay: `${groupIdx * 0.15}s` }}
          >
            {/* Image */}
            <div className={group.imageLeft ? "order-1 lg:order-1" : "order-1 lg:order-2"}>
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-3xl blur-2xl opacity-20"
                  style={{ backgroundColor: group.tagColor }}
                />
                <img
                  src={group.image}
                  alt={group.imageAlt}
                  className="relative z-10 w-full max-w-md mx-auto rounded-3xl shadow-2xl"
                />
              </div>
            </div>

            {/* Content */}
            <div className={group.imageLeft ? "order-2 lg:order-2" : "order-2 lg:order-1"}>
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 text-sm font-bold"
                style={{ backgroundColor: group.tagBg, color: group.tagColor }}
              >
                {group.tag}
              </div>
              <h3
                className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 section-title"
              >
                {group.title}
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {group.description}
              </p>
              <div className="grid gap-4">
                {group.features.map((feat, i) => (
                  <FeatureCard key={i} {...feat} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
