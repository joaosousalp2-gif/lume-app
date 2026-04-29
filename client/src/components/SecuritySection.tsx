/*
 * SecuritySection — Lume
 * Design: Modernismo Humanista
 * Fundo azul profundo, texto branco, cards amarelos/verdes de alerta
 * Destaque para os tipos de golpes mais comuns
 */

import { useEffect, useRef } from "react";
import { ShieldCheck, AlertTriangle, Users, Phone, Lock, Eye } from "lucide-react";

const golpes = [
  {
    icon: <Phone className="w-7 h-7" />,
    title: "Golpe do Falso Parente",
    desc: "Alguém liga fingindo ser familiar em apuros pedindo dinheiro urgente. O Lume ensina como verificar a identidade.",
    color: "#FACC15",
    bg: "rgba(250, 204, 21, 0.15)",
  },
  {
    icon: <Lock className="w-7 h-7" />,
    title: "Phishing e Links Falsos",
    desc: "Mensagens com links que roubam seus dados bancários. O verificador do Lume analisa qualquer link antes de você clicar.",
    color: "#FACC15",
    bg: "rgba(250, 204, 21, 0.15)",
  },
  {
    icon: <AlertTriangle className="w-7 h-7" />,
    title: "Falsa Central de Atendimento",
    desc: "Golpistas fingem ser do banco pedindo sua senha. O Lume alerta: bancos nunca pedem senhas por telefone.",
    color: "#FACC15",
    bg: "rgba(250, 204, 21, 0.15)",
  },
  {
    icon: <Eye className="w-7 h-7" />,
    title: "Transações Incomuns",
    desc: "O Lume monitora seu padrão de gastos e alerta quando detecta movimentações fora do comum.",
    color: "#22C55E",
    bg: "rgba(34, 197, 94, 0.15)",
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Código de Segurança Familiar",
    desc: "Configure uma frase secreta com sua família para confirmar identidades em situações suspeitas.",
    color: "#22C55E",
    bg: "rgba(34, 197, 94, 0.15)",
  },
  {
    icon: <ShieldCheck className="w-7 h-7" />,
    title: "Botão de Ajuda Rápida",
    desc: "Em caso de dúvida ou golpe, acesse com um toque seus contatos de emergência e um guia passo a passo.",
    color: "#7C3AED",
    bg: "rgba(124, 58, 237, 0.15)",
  },
];

export default function SecuritySection() {
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
      id="seguranca"
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 40%, #2563EB 100%)",
      }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-16 fade-target opacity-0">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/30 rounded-full px-4 py-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-bold">Proteção Ativa</span>
          </div>
          <h2
            className="text-4xl lg:text-5xl font-black text-white mb-4 section-title"
          >
            Proteja-se dos golpes
            <span className="block" style={{ color: "#FACC15" }}>
              mais comuns
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Golpistas têm como alvo preferencial pessoas com mais de 60 anos. O Lume te ensina a reconhecer e evitar as armadilhas mais comuns.
          </p>
        </div>

        {/* Alert Banner */}
        <div
          className="fade-target opacity-0 rounded-2xl p-6 mb-12 flex items-center gap-4"
          style={{ backgroundColor: "rgba(250, 204, 21, 0.15)", border: "2px solid rgba(250, 204, 21, 0.4)" }}
        >
          <div className="w-12 h-12 rounded-xl bg-yellow-400/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-7 h-7 text-yellow-400" />
          </div>
          <div>
            <p className="text-yellow-300 font-bold text-lg">Atenção importante</p>
            <p className="text-white/80 text-base">
              Seu banco <strong className="text-white">nunca</strong> pede senha, código ou dados pessoais por telefone, SMS ou WhatsApp. Em caso de dúvida, desligue e ligue para o número oficial do seu banco.
            </p>
          </div>
        </div>

        {/* Golpes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {golpes.map((golpe, i) => (
            <div
              key={i}
              className="fade-target opacity-0 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: golpe.bg,
                border: `1px solid ${golpe.color}30`,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: golpe.color + "20", color: golpe.color }}
              >
                {golpe.icon}
              </div>
              <h3
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {golpe.title}
              </h3>
              <p className="text-white/75 text-base leading-relaxed">{golpe.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 fade-target opacity-0">
          <p className="text-white/80 text-lg mb-6">
            O Lume inclui um <strong className="text-yellow-400">módulo educativo completo</strong> com exemplos práticos e simulações de golpes reais.
          </p>
          <button
            onClick={() => document.querySelector("#download")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-10 py-5 rounded-xl font-bold text-gray-900 text-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #FACC15, #f59e0b)",
              boxShadow: "0 4px 20px rgba(250, 204, 21, 0.4)",
            }}
          >
            <ShieldCheck className="w-6 h-6" />
            Quero me Proteger
          </button>
        </div>
      </div>

      {/* Wave divider bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 80L60 69.3C120 58.7 240 37.3 360 32C480 26.7 600 37.3 720 42.7C840 48 960 48 1080 42.7C1200 37.3 1320 26.7 1380 21.3L1440 16V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#F8FAFC"/>
        </svg>
      </div>
    </section>
  );
}
