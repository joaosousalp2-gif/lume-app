/*
 * Navbar — Lume
 * Design: Modernismo Humanista
 * Sticky nav with translucent background, Poppins font, Lume brand colors
 */

import { useState, useEffect } from "react";
import { Lightbulb, Menu, X } from "lucide-react";

const navLinks = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#seguranca", label: "Segurança" },
  { href: "#como-funciona", label: "Como Funciona" },
  { href: "#lancamentos", label: "Lancamentos" },
  { href: "#savings-goals", label: "Metas" },
  { href: "#central-dashboard", label: "Dashboard" },
  { href: "#bank-accounts", label: "Contas" },
  { href: "#budgets", label: "Orcamento" },
  { href: "#planilhas", label: "Planilhas" },
  { href: "#fraud-protection", label: "Proteção" },
  { href: "#ai-analysis", label: "IA" },
  { href: "#trust-verification", label: "Confiabilidade" },
  { href: "#download", label: "Baixar App" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <nav className="flex items-center justify-between py-4">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2 group"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center lume-gradient-blue logo-glow">
              <Lightbulb className="w-6 h-6 text-yellow-300" fill="currentColor" />
            </div>
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: "'Poppins', sans-serif", color: scrolled ? "#2563EB" : "#fff" }}
            >
              Lume
            </span>
          </a>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNavClick(link.href)}
                  className={`text-base font-semibold transition-colors duration-200 hover:text-blue-600 ${
                    scrolled ? "text-gray-700" : "text-white/90"
                  }`}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={() => handleNavClick("#download")}
              className="lume-btn-primary text-base px-6 py-3"
            >
              Baixar Grátis
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? (
              <X className={`w-6 h-6 ${scrolled ? "text-gray-700" : "text-white"}`} />
            ) : (
              <Menu className={`w-6 h-6 ${scrolled ? "text-gray-700" : "text-white"}`} />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow-xl border-t border-gray-100">
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-left text-lg font-semibold text-gray-700 hover:text-blue-600 py-2 border-b border-gray-100 transition-colors"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick("#download")}
              className="lume-btn-primary mt-2 justify-center"
            >
              Baixar Grátis
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
