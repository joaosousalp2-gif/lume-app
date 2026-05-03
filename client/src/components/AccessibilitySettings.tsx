/**
 * AccessibilitySettings — Lume
 * Componente para gerenciar configurações de acessibilidade
 * Inclui: tema escuro/claro, modo alto contraste, tamanho de fonte
 */

import { useState, useEffect } from "react";
import { Moon, Sun, Maximize2, Type } from "lucide-react";

type Theme = "light" | "dark" | "auto";
type Contrast = "normal" | "high";
type FontSize = "small" | "normal" | "large";

export default function AccessibilitySettings() {
  const [theme, setTheme] = useState<Theme>("auto");
  const [contrast, setContrast] = useState<Contrast>("normal");
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [isOpen, setIsOpen] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedTheme = (localStorage.getItem("a11y_theme") as Theme) || "auto";
    const savedContrast = (localStorage.getItem("a11y_contrast") as Contrast) || "normal";
    const savedFontSize = (localStorage.getItem("a11y_fontSize") as FontSize) || "normal";

    setTheme(savedTheme);
    setContrast(savedContrast);
    setFontSize(savedFontSize);

    applySettings(savedTheme, savedContrast, savedFontSize);
  }, []);

  const applySettings = (newTheme: Theme, newContrast: Contrast, newFontSize: FontSize) => {
    const root = document.documentElement;

    // Apply theme
    if (newTheme === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", newTheme === "dark");
    }

    // Apply contrast
    root.classList.toggle("high-contrast", newContrast === "high");

    // Apply font size
    root.style.fontSize = {
      small: "14px",
      normal: "16px",
      large: "18px",
    }[newFontSize];

    // Save to localStorage
    localStorage.setItem("a11y_theme", newTheme);
    localStorage.setItem("a11y_contrast", newContrast);
    localStorage.setItem("a11y_fontSize", newFontSize);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applySettings(newTheme, contrast, fontSize);
  };

  const handleContrastChange = (newContrast: Contrast) => {
    setContrast(newContrast);
    applySettings(theme, newContrast, fontSize);
  };

  const handleFontSizeChange = (newFontSize: FontSize) => {
    setFontSize(newFontSize);
    applySettings(theme, contrast, newFontSize);
  };

  return (
    <div className="relative">
      {/* Accessibility Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label="Abrir configurações de acessibilidade"
        aria-expanded={isOpen}
        aria-controls="accessibility-menu"
      >
        <Maximize2 className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div
          id="accessibility-menu"
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50"
          role="region"
          aria-label="Configurações de acessibilidade"
        >
          {/* Theme Selection */}
          <fieldset className="mb-6">
            <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Tema
            </legend>
            <div className="space-y-2">
              {(["light", "dark", "auto"] as const).map((t) => (
                <label key={t} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={t}
                    checked={theme === t}
                    onChange={() => handleThemeChange(t)}
                    className="w-4 h-4 cursor-pointer"
                    aria-label={`Tema ${t === "light" ? "claro" : t === "dark" ? "escuro" : "automático"}`}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    {t === "light" && <Sun className="w-4 h-4" aria-hidden="true" />}
                    {t === "dark" && <Moon className="w-4 h-4" aria-hidden="true" />}
                    {t === "auto" && <Maximize2 className="w-4 h-4" aria-hidden="true" />}
                    {t === "light" ? "Claro" : t === "dark" ? "Escuro" : "Automático"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Contrast Selection */}
          <fieldset className="mb-6">
            <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Contraste
            </legend>
            <div className="space-y-2">
              {(["normal", "high"] as const).map((c) => (
                <label key={c} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="contrast"
                    value={c}
                    checked={contrast === c}
                    onChange={() => handleContrastChange(c)}
                    className="w-4 h-4 cursor-pointer"
                    aria-label={`Contraste ${c === "normal" ? "normal" : "alto"}`}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {c === "normal" ? "Normal" : "Alto"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Font Size Selection */}
          <fieldset>
            <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Type className="w-4 h-4" aria-hidden="true" />
              Tamanho da Fonte
            </legend>
            <div className="space-y-2">
              {(["small", "normal", "large"] as const).map((f) => (
                <label key={f} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="fontSize"
                    value={f}
                    checked={fontSize === f}
                    onChange={() => handleFontSizeChange(f)}
                    className="w-4 h-4 cursor-pointer"
                    aria-label={`Tamanho de fonte ${f === "small" ? "pequeno" : f === "normal" ? "normal" : "grande"}`}
                  />
                  <span
                    className="text-sm text-gray-700 dark:text-gray-300"
                    style={{
                      fontSize: { small: "12px", normal: "14px", large: "16px" }[f],
                    }}
                  >
                    {f === "small" ? "Pequeno" : f === "normal" ? "Normal" : "Grande"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Help Text */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-200">
              Essas configurações são salvas no seu navegador e aplicadas automaticamente.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Fechar configurações de acessibilidade"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}
