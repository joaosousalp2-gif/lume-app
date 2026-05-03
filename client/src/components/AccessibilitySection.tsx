/*
 * AccessibilitySection — Lume
 * Design: Modernismo Humanista
 * Destaque para os princípios de UX/UI para idosos
 * Fundo branco com cards coloridos, ícones grandes
 */

import { useEffect, useRef } from "react";
import { Type, MousePointer, Navigation, Brain, Volume2, Eye } from "lucide-react";

const principles = [
  {
    icon: <Type className="w-8 h-8" />,
    title: "Letras Grandes",
    desc: "Mínimo de 18px para todos os textos. Fontes arredondadas e de alta legibilidade em todo o aplicativo.",
    color: "#2563EB",
    bg: "#dbeafe",
  },
  {
    icon: <MousePointer className="w-8 h-8" />,
    title: "Botões Amplos",
    desc: "Áreas de toque generosas, com feedback visual e sonoro imediato. Sem gestos complicados.",
    color: "#22C55E",
    bg: "#dcfce7",
  },
  {
    icon: <Eye className="w-8 h-8" />,
    title: "Alto Contraste",
    desc: "Paleta de cores com contraste elevado para facilitar a leitura em qualquer condição de luz.",
    color: "#7C3AED",
    bg: "#ede9fe",
  },
  {
    icon: <Navigation className="w-8 h-8" />,
    title: "Navegação Simples",
    desc: "Caminhos curtos e lógicos. Poucos passos para completar qualquer tarefa no aplicativo.",
    color: "#2563EB",
    bg: "#dbeafe",
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "Design Consistente",
    desc: "Padrões visuais idênticos em todas as telas. O que você aprende em uma tela vale para todas.",
    color: "#22C55E",
    bg: "#dcfce7",
  },
  {
    icon: <Volume2 className="w-8 h-8" />,
    title: "Leitura em Voz Alta",
    desc: "Todos os resumos e alertas podem ser lidos em voz alta pelo assistente de voz do Lume.",
    color: "#7C3AED",
    bg: "#ede9fe",
  },
];

export default function AccessibilitySection() {
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
      ref={sectionRef}
      className="py-24 bg-white"
    >
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16 fade-target opacity-0">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-4">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 text-sm font-bold">Acessibilidade</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 section-title">
            Feito para ser
            <span style={{ color: "#2563EB" }}> fácil de usar</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Cada detalhe do Lume foi pensado seguindo as melhores práticas de design para pessoas com mais de 60 anos.
          </p>
        </div>

        {/* Principles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {principles.map((p, i) => (
            <div
              key={i}
              className="fade-target opacity-0 lume-card group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: p.bg, color: p.color }}
              >
                {p.icon}
              </div>
              <h3
                className="text-xl font-bold text-gray-800 mb-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {p.title}
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Quote highlight */}
        <div
          className="fade-target opacity-0 rounded-3xl p-8 lg:p-12 text-center"
          style={{
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            border: "2px solid #bae6fd",
          }}
        >
          <p
            className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4 leading-relaxed"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            "O Lume usa um português formal, porém simples e direto, evitando jargões técnicos. O tom é confiável, paciente, didático e empático."
          </p>
          <p className="text-gray-700 text-lg">— Princípio de comunicação do Lume</p>
        </div>
      </div>
    </section>
  );
}
