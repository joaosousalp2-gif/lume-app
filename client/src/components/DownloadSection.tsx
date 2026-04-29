/*
 * DownloadSection — Lume
 * Design: Modernismo Humanista
 * CTA de download com destaque verde, lista de benefícios, QR code simulado
 */

import { useEffect, useRef } from "react";
import { Download, CheckCircle, Smartphone, Lightbulb } from "lucide-react";

const benefits = [
  "Gratuito para baixar e usar",
  "Sem anúncios ou cobranças ocultas",
  "Seus dados são 100% privados e criptografados",
  "Funciona sem internet para consultas básicas",
  "Atualizações automáticas e gratuitas",
  "Suporte em português, paciente e didático",
];

export default function DownloadSection() {
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
      id="download"
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #14532d 0%, #16a34a 40%, #22C55E 100%)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
      />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
      />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="fade-target opacity-0">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-2 mb-6">
              <Download className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-bold">Disponível Agora</span>
            </div>

            <h2
              className="text-4xl lg:text-5xl font-black text-white mb-6 section-title"
            >
              Baixe o Lume
              <span className="block text-yellow-300">gratuitamente</span>
            </h2>

            <p className="text-xl text-white/85 mb-8 leading-relaxed">
              Disponível para todos os celulares Android. Instale agora e comece a cuidar melhor do seu dinheiro hoje mesmo.
            </p>

            {/* Benefits list */}
            <ul className="space-y-3 mb-10">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-yellow-300 flex-shrink-0" />
                  <span className="text-white/90 text-lg font-medium">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                className="flex items-center gap-3 px-8 py-5 rounded-2xl font-bold text-green-900 text-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #FACC15, #f59e0b)",
                  boxShadow: "0 4px 20px rgba(250, 204, 21, 0.4)",
                }}
                onClick={() => {
                  // Placeholder: would link to Play Store
                  alert("Em breve na Google Play Store!");
                }}
              >
                <Smartphone className="w-7 h-7" />
                <div className="text-left">
                  <p className="text-xs font-semibold opacity-80">Disponível no</p>
                  <p className="text-xl font-black">Google Play</p>
                </div>
              </button>
            </div>

            <p className="mt-4 text-white/60 text-sm">
              * Requer Android 7.0 ou superior. Compatível com a maioria dos celulares.
            </p>
          </div>

          {/* Right: App Preview Card */}
          <div className="fade-target opacity-0 flex justify-center">
            <div
              className="rounded-3xl p-8 max-w-sm w-full"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 rounded-2xl lume-gradient-blue flex items-center justify-center logo-glow">
                  <Lightbulb className="w-8 h-8 text-yellow-300" fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Lume
                  </h3>
                  <p className="text-white/70 text-sm">Versão 1.0 — Android</p>
                </div>
              </div>

              {/* App info */}
              <div className="space-y-4 mb-8">
                {[
                  { label: "Tamanho", value: "28 MB" },
                  { label: "Classificação", value: "Livre (para todos)" },
                  { label: "Idioma", value: "Português (Brasil)" },
                  { label: "Última atualização", value: "Abril 2026" },
                  { label: "Avaliação", value: "⭐⭐⭐⭐⭐ 4.9/5" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-white/70 text-base">{item.label}</span>
                    <span className="text-white font-semibold text-base">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* QR Code placeholder */}
              <div className="text-center">
                <div
                  className="w-32 h-32 mx-auto rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: "rgba(255,255,255,0.9)" }}
                >
                  <div className="grid grid-cols-7 gap-0.5 p-2">
                    {/* Simplified QR pattern */}
                    {Array.from({ length: 49 }, (_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-sm"
                        style={{
                          backgroundColor: [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48,8,15,22,29,36,10,17,24,31,38,11,18,25,32,39].includes(i)
                            ? "#2563EB"
                            : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-white/70 text-sm">Aponte a câmera para baixar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 80L60 69.3C120 58.7 240 37.3 360 32C480 26.7 600 37.3 720 42.7C840 48 960 48 1080 42.7C1200 37.3 1320 26.7 1380 21.3L1440 16V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#1f2937"/>
        </svg>
      </div>
    </section>
  );
}
