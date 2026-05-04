/*
 * Navbar — Lume
 * Design: Modernismo Humanista
 * Sticky nav with translucent background, Poppins font, Lume brand colors
 */

import { useState, useEffect } from "react";
import { Lightbulb, Menu, X, Brain } from "lucide-react";
import { useTabsContext } from "@/contexts/TabsContext";
import ThemeToggle from "./ThemeToggle";

interface NavLink {
  href: string;
  label: string;
  external?: boolean;
  tab?: string;
}

const navLinks: NavLink[] = [
  { href: "#funcionalidades", label: "Funcionalidades", tab: "financeiro" },
  { href: "#seguranca", label: "Segurança", tab: "seguranca" },
  { href: "#como-funciona", label: "Como Funciona", tab: "analise" },
  { href: "#lancamentos", label: "Lancamentos", tab: "financeiro" },
  { href: "#savings-goals", label: "Metas", tab: "financeiro" },
  { href: "#central-dashboard", label: "Dashboard", tab: "financeiro" },
  { href: "#bank-accounts", label: "Contas", tab: "financeiro" },
  { href: "#planilhas", label: "Planilhas", tab: "financeiro" },
  { href: "#fraud-protection", label: "Proteção", tab: "seguranca" },
  { href: "#ai-analysis", label: "IA", tab: "analise" },
  { href: "#trust-verification", label: "Confiabilidade", tab: "seguranca" },
  { href: "#download", label: "Baixar App", tab: "download" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setActiveTab } = useTabsContext();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string, external?: boolean, tab?: string) => {
    setMobileOpen(false);
    if (external) {
      window.location.href = href;
      return;
    }
    if (tab) {
      setActiveTab(tab);
    }
    // Tentar fazer scroll apenas se o elemento existir
    try {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.warn(`Elemento ${href} não encontrado`);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
      role="banner"
    >
      <div className="container">
        <nav className="flex items-center justify-between py-4" aria-label="Navegação principal">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2 group"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            aria-label="Lume - Voltar ao topo"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center lume-gradient-blue logo-glow">
              <Lightbulb className="w-6 h-6 text-yellow-300" fill="currentColor" aria-hidden="true" />
            </div>
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: "'Poppins', sans-serif", color: scrolled ? "#2563EB" : "#fff" }}
            >
              Lume
            </span>
          </a>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-6" role="menubar">
            {navLinks.map((link) => (
              <li key={link.href} role="none">
                <button
                  onClick={() => handleNavClick(link.href, link.external, link.tab)}
                  className={`text-base font-semibold transition-colors duration-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 ${
                    scrolled ? "text-gray-700" : "text-white/90"
                  }`}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                  role="menuitem"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Theme Toggle */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Agente IA Button */}
          <div className="hidden md:block">
            <button
              onClick={() => handleNavClick("/agent", true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              aria-label="Abrir Agente Financeiro IA"
            >
              <Brain className="w-5 h-5" />
              Agente IA
            </button>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={() => handleNavClick("#download")}
              className="lume-btn-primary text-base px-6 py-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
              aria-label="Baixar Lume gratuitamente"
            >
              Baixar Grátis
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? (
              <X className={`w-6 h-6 ${scrolled ? "text-gray-700" : "text-white"}`} aria-hidden="true" />
            ) : (
              <Menu className={`w-6 h-6 ${scrolled ? "text-gray-700" : "text-white"}`} aria-hidden="true" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow-xl border-t border-gray-100" id="mobile-menu" role="navigation" aria-label="Menu móvel">
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href, link.external, link.tab)}
                className="text-left text-lg font-semibold text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 py-2 border-b border-gray-100 transition-colors rounded px-2"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick("/agent", true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 w-full mt-2"
              aria-label="Abrir Agente Financeiro IA"
            >
              <Brain className="w-5 h-5" />
              Agente IA
            </button>
            <button
              onClick={() => handleNavClick("#download")}
              className="lume-btn-primary mt-2 justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
              aria-label="Baixar Lume gratuitamente"
            >
              Baixar Grátis
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
