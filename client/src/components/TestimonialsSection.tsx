/*
 * TestimonialsSection — Lume
 * Design: Modernismo Humanista
 * Depoimentos de usuários idosos, estatísticas de impacto, fundo claro
 */

import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

const stats = [
  { value: "10.000+", label: "Usuários ativos", color: "#2563EB" },
  { value: "98%", label: "Satisfação dos usuários", color: "#22C55E" },
  { value: "500+", label: "Golpes evitados", color: "#FACC15" },
  { value: "4.9★", label: "Avaliação na Play Store", color: "#7C3AED" },
];

const testimonials = [
  {
    name: "Maria Aparecida, 67 anos",
    location: "São Paulo, SP",
    avatar: "👵",
    rating: 5,
    text: "Antes eu não sabia para onde ia meu dinheiro. Com o Lume, consigo ver tudo clarinho. As letras são grandes e fáceis de ler. Minha filha ficou aliviada quando viu que estou usando!",
  },
  {
    name: "José Carlos, 72 anos",
    location: "Belo Horizonte, MG",
    avatar: "👴",
    rating: 5,
    text: "Recebi uma mensagem suspeita e usei o verificador do Lume. O aplicativo me avisou que era golpe! Me salvou de perder minha aposentadoria. Recomendo para todos os meus amigos.",
  },
  {
    name: "Tereza Cristina, 64 anos",
    location: "Curitiba, PR",
    avatar: "🧓",
    rating: 5,
    text: "O assistente de voz é maravilhoso! Pergunto 'quanto gastei com remédios?' e ele me responde na hora. Não preciso nem digitar nada. Muito prático para quem tem dificuldade com celular.",
  },
  {
    name: "Antônio Ferreira, 70 anos",
    location: "Recife, PE",
    avatar: "👴",
    rating: 5,
    text: "Gero a planilha todo mês e mostro para meu filho. Ele ficou impressionado com o quanto eu aprendi a controlar meus gastos. O Lume me deu mais independência e confiança.",
  },
  {
    name: "Lúcia Santos, 68 anos",
    location: "Porto Alegre, RS",
    avatar: "👵",
    rating: 5,
    text: "O módulo de segurança me ensinou sobre o golpe do falso parente. Semanas depois, recebi exatamente essa ligação! Graças ao Lume, não caí no golpe e protegi meu dinheiro.",
  },
  {
    name: "Roberto Alves, 75 anos",
    location: "Fortaleza, CE",
    avatar: "🧓",
    rating: 5,
    text: "Achei que seria difícil de usar, mas é muito simples. Minha neta me ajudou a instalar e em meia hora já estava registrando minha aposentadoria. Ótimo aplicativo!",
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

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

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="depoimentos"
      ref={sectionRef}
      className="py-24 bg-[#F8FAFC]"
    >
      <div className="container">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="fade-target opacity-0 lume-card text-center"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="text-4xl lg:text-5xl font-black mb-2"
                style={{ color: stat.color, fontFamily: "'Poppins', sans-serif" }}
              >
                {stat.value}
              </div>
              <p className="text-gray-600 text-base font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-16 fade-target opacity-0">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-2 mb-4">
            <Star className="w-4 h-4 text-purple-600" fill="currentColor" />
            <span className="text-purple-600 text-sm font-bold">Depoimentos</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 section-title">
            O que dizem nossos
            <span style={{ color: "#7C3AED" }}> usuários</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pessoas reais que transformaram sua relação com as finanças e se protegeram de golpes com o Lume.
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="fade-target opacity-0 mb-12">
          <div
            className="max-w-3xl mx-auto rounded-3xl p-8 lg:p-12 relative"
            style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563EB 100%)",
            }}
          >
            <Quote className="w-12 h-12 text-white/20 absolute top-8 left-8" />
            <div className="relative z-10">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonials[activeIdx].rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" />
                ))}
              </div>
              <p className="text-white text-xl lg:text-2xl leading-relaxed mb-8 font-medium">
                "{testimonials[activeIdx].text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                  {testimonials[activeIdx].avatar}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{testimonials[activeIdx].name}</p>
                  <p className="text-white/70 text-base">{testimonials[activeIdx].location}</p>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i === activeIdx ? "#FACC15" : "rgba(255,255,255,0.3)",
                    transform: i === activeIdx ? "scale(1.3)" : "scale(1)",
                  }}
                  aria-label={`Depoimento ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Grid of all testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`fade-target opacity-0 lume-card cursor-pointer transition-all duration-300 ${
                i === activeIdx ? "ring-2 ring-blue-500 shadow-xl" : ""
              }`}
              style={{ animationDelay: `${i * 0.08}s` }}
              onClick={() => setActiveIdx(i)}
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-700 text-base leading-relaxed mb-4 line-clamp-3">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-gray-700 text-sm">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
