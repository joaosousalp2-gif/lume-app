/*
 * Footer — Lume
 * Design: Modernismo Humanista
 * Fundo escuro, links organizados em colunas, logo com brilho
 */

import { Lightbulb, Mail, Phone, MapPin, Shield, Heart } from "lucide-react";

const footerLinks = {
  produto: [
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Segurança", href: "#seguranca" },
    { label: "Como Funciona", href: "#como-funciona" },
    { label: "Baixar App", href: "#download" },
  ],
  suporte: [
    { label: "Central de Ajuda", href: "#" },
    { label: "Fale Conosco", href: "#" },
    { label: "Tutoriais em Vídeo", href: "#" },
    { label: "Perguntas Frequentes", href: "#" },
  ],
  legal: [
    { label: "Política de Privacidade", href: "#" },
    { label: "Termos de Uso", href: "#" },
    { label: "Proteção de Dados (LGPD)", href: "#" },
    { label: "Excluir minha conta", href: "#" },
  ],
};

export default function Footer() {
  const handleNavClick = (href: string) => {
    if (href.startsWith("#") && href.length > 1) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer
      className="pt-16 pb-8"
      style={{ backgroundColor: "#1f2937" }}
    >
      <div className="container">
        {/* Main footer content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl lume-gradient-blue flex items-center justify-center logo-glow">
                <Lightbulb className="w-6 h-6 text-yellow-300" fill="currentColor" />
              </div>
              <span
                className="text-2xl font-black text-white"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Lume
              </span>
            </div>
            <p className="text-gray-400 text-base leading-relaxed mb-6">
              Iluminando a vida financeira de pessoas com mais de 60 anos. Simples, seguro e feito com carinho.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>contato@lumeapp.com.br</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-green-400" />
                <span>0800 123 4567 (gratuito)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <span>Brasil</span>
              </div>
            </div>
          </div>

          {/* Produto */}
          <div>
            <h4
              className="text-white font-bold text-lg mb-4"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Produto
            </h4>
            <ul className="space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-gray-400 hover:text-white text-base transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4
              className="text-white font-bold text-lg mb-4"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Suporte
            </h4>
            <ul className="space-y-3">
              {footerLinks.suporte.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-gray-400 hover:text-white text-base transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              className="text-white font-bold text-lg mb-4"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Legal e Privacidade
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-gray-400 hover:text-white text-base transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Security badge */}
            <div
              className="mt-6 flex items-center gap-2 rounded-xl p-3"
              style={{ backgroundColor: "rgba(37, 99, 235, 0.15)", border: "1px solid rgba(37, 99, 235, 0.3)" }}
            >
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 text-sm font-semibold">
                Dados protegidos pela LGPD
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © 2026 Lume. Todos os direitos reservados. CNPJ: 00.000.000/0001-00
            </p>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Feito com <Heart className="w-4 h-4 text-red-400" fill="currentColor" /> para a melhor geração
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
