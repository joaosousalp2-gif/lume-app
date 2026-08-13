/*
 * HeroSection — Lume
 * Estrutura: HTML semântico limpo com classes CSS e interatividade simples
 */

import { Star, Shield, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import { setupSmoothScrolling } from "@/lib/interactive";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663613130250/YrzazuYSz4uDAUDGnbJMLa/lume-hero-bg-FPfv5cz64j6s96eZc4Ri2p.webp";

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setupSmoothScrolling();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeIn");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = heroRef.current?.querySelectorAll(".fade-target");
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-slate-950"
      style={{
        backgroundImage: `url(${HERO_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-label="Apresentação principal"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-blue-950/80 to-slate-950/60" aria-hidden="true" />

      <div className="container relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="fade-target opacity-0 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" aria-hidden="true" />
              <span className="text-white text-sm font-semibold">Feito especialmente para você</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight font-heading">
              Ilumine suas <span className="text-yellow-400">finanças</span> com segurança
            </h1>

            <p className="text-xl text-white/85 max-w-lg leading-relaxed">
              O Lume é o aplicativo que organiza suas finanças e protege você contra golpes — com letras grandes, tela clara e linguagem simples.
            </p>

            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-yellow-400/20 text-yellow-400">
                  <Shield className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-white/90 font-semibold">Proteção contra golpes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-white/90 font-semibold">Gestão financeira completa</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <a href="#download" className="lume-btn-green text-lg no-underline">
                Baixar Grátis
              </a>
              <a href="#funcionalidades" className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-white text-lg border-2 border-white/40 hover:bg-white/10 transition-colors">
                Conhecer o App
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
