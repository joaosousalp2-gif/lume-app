/*
 * Navbar — Lume
 * Design: Modernismo Humanista
 * Sticky nav with translucent background, Poppins font, Lume brand colors
 */

import { useState, useEffect } from "react";
import { Menu, X, Eye } from "lucide-react";
import { useTabsContext } from "@/contexts/TabsContext";
import ThemeToggle from "./ThemeToggle";
import { applyReadableMode, getReadableModeState, READABLE_MODE_STORAGE_KEY } from "@/lib/readableMode";

interface NavLink {
  href: string;
  label: string;
  external?: boolean;
  tab?: string;
}

const navLinks: NavLink[] = [
  { href: "#funcionalidades", label: "Finanças", tab: "financeiro" },
  { href: "#seguranca", label: "Segurança", tab: "seguranca" },
  { href: "#ai-analysis", label: "Análise", tab: "analise" },
  { href: "/dashboard/chat", label: "Agente IA", external: true },
  { href: "#download", label: "Baixar", tab: "download" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [readableMode, setReadableMode] = useState(() => getReadableModeState(typeof window !== "undefined" ? window.localStorage.getItem(READABLE_MODE_STORAGE_KEY) : null));
  const { setActiveTab } = useTabsContext();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    applyReadableMode(readableMode);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [readableMode]);

  const toggleReadableMode = () => {
    setReadableMode((current) => {
      const next = !current;
      applyReadableMode(next);
      return next;
    });
  };

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
            <img
              src="/manus-storage/lume-logo-official_0b7827ba.png"
              alt="Lume — Finanças e Segurança para Você"
              className={`h-12 w-auto max-w-[150px] object-contain transition-[filter] duration-300 ${scrolled ? "drop-shadow-sm" : "brightness-0 invert"}`}
            />
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
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={toggleReadableMode}
              aria-pressed={readableMode}
              aria-label={readableMode ? "Desativar modo de alta legibilidade" : "Ativar modo de alta legibilidade"}
              title={readableMode ? "Desativar alta legibilidade" : "Ativar alta legibilidade"}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${readableMode ? "border-blue-600 bg-blue-100 text-blue-900" : scrolled ? "border-slate-200 bg-white/70 text-slate-700" : "border-white/30 bg-white/10 text-white"}`}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              <span className="hidden lg:inline">Letras maiores</span>
            </button>
            <ThemeToggle />
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
            <button
              type="button"
              onClick={toggleReadableMode}
              aria-pressed={readableMode}
              className="flex items-center gap-2 text-left text-lg font-semibold text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 py-2 border-b border-gray-100 transition-colors rounded px-2"
            >
              <Eye className="h-5 w-5" aria-hidden="true" />
              {readableMode ? "Desativar letras maiores" : "Letras maiores"}
            </button>
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
          </div>
        </div>
      )}
    </header>
  );
}
