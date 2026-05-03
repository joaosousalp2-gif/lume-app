/*
 * HeroSection — Lume
 * Design: Modernismo Humanista — assimétrico, texto à esquerda, mockup à direita
 * Background: imagem gerada com lâmpada e fundo azul profundo
 * Texto: branco sobre fundo escuro (alto contraste)
 */

import { ArrowDown, Star, Shield, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663613130250/YrzazuYSz4uDAUDGnbJMLa/lume-hero-bg-FPfv5cz64j6s96eZc4Ri2p.webp";
const MOCKUP_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663613130250/YrzazuYSz4uDAUDGnbJMLa/lume-mockup-P5Hk8C4kHpehYSforyRNRp.webp";

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

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

    const elements = heroRef.current?.querySelectorAll(".fade-target");
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToFeatures = () => {
    document.querySelector("#funcionalidades")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        backgroundImage: `url(${HERO_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay gradient for readability */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(17, 24, 39, 0.88) 0%, rgba(30, 58, 138, 0.75) 50%, rgba(17, 24, 39, 0.5) 100%)",
        }}
      />

      <div className="container relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="fade-target opacity-0" style={{ animationDelay: "0.1s" }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              <span className="text-white text-sm font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Feito especialmente para você
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-6 leading-tight"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Ilumine suas
              <span className="block" style={{ color: "#FACC15" }}>
                finanças
              </span>
              com segurança
            </h1>

            {/* Subtitle */}
            <p
              className="text-xl text-white/85 mb-8 max-w-lg leading-relaxed"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              O Lume é o aplicativo que organiza suas finanças e protege você contra golpes — com letras grandes, tela clara e linguagem simples.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 mb-10">
              {[
                { icon: <Shield className="w-5 h-5" />, label: "Proteção contra golpes", color: "#FACC15" },
                { icon: <TrendingUp className="w-5 h-5" />, label: "Gestão financeira completa", color: "#22C55E" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: stat.color + "30", color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <span className="text-white/90 font-semibold text-base">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => document.querySelector("#download")?.scrollIntoView({ behavior: "smooth" })}
                className="lume-btn-green text-lg"
              >
                Baixar Grátis
              </button>
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-lg border-2 border-white/40 hover:bg-white/10 transition-all duration-200"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Conhecer o App
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["👴", "👵", "🧓"].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-lg"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <p className="text-white/80 text-sm font-medium">
                <strong className="text-white">+10.000 pessoas</strong> já usam o Lume
              </p>
            </div>
          </div>

          {/* Right: App Mockup */}
          <div className="fade-target opacity-0 flex justify-center lg:justify-end" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              {/* Glow behind phone */}
              <div
                className="absolute inset-0 rounded-3xl blur-3xl opacity-40"
                style={{ background: "radial-gradient(circle, #FACC15 0%, #2563EB 60%, transparent 100%)" }}
              />
              <img
                src={MOCKUP_IMG}
                alt="Tela do aplicativo Lume mostrando o painel financeiro"
                className="relative z-10 w-72 lg:w-80 xl:w-96 drop-shadow-2xl"
                style={{ filter: "drop-shadow(0 20px 60px rgba(37, 99, 235, 0.5))" }}
              />

              {/* Floating badge: Seguro */}
              <div
                className="absolute top-8 -left-6 z-20 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2"
                style={{ animation: "float 3s ease-in-out infinite" }}
              >
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-700 font-medium">Proteção</p>
                  <p className="text-sm font-bold text-gray-800">100% Seguro</p>
                </div>
              </div>

              {/* Floating badge: Saldo */}
              <div
                className="absolute bottom-16 -right-6 z-20 bg-white rounded-2xl shadow-xl px-4 py-3"
                style={{ animation: "float 3s ease-in-out infinite", animationDelay: "1.5s" }}
              >
                <p className="text-xs text-gray-700 font-medium">Saldo do mês</p>
                <p className="text-lg font-black" style={{ color: "#22C55E" }}>R$ 4.250,00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToFeatures}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors"
        aria-label="Rolar para baixo"
      >
        <span className="text-sm font-medium">Saiba mais</span>
        <ArrowDown className="w-5 h-5 animate-bounce" />
      </button>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 80L60 69.3C120 58.7 240 37.3 360 32C480 26.7 600 37.3 720 42.7C840 48 960 48 1080 42.7C1200 37.3 1320 26.7 1380 21.3L1440 16V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#F8FAFC"/>
        </svg>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  );
}
