/*
 * LaunchModals — Lume
 * Componentes modais para fluxo de lançamentos (receita/despesa)
 * Inclui: seleção de período, calendário, formulário de entrada, toast, localStorage, atalhos
 */

import { useState, useEffect, useRef } from "react";
import { X, Plus, Minus, Calendar, Check, ChevronLeft, ChevronRight, Sparkles, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface LaunchModalsProps {
  isOpen: boolean;
  type: "receita" | "despesa" | null;
  onClose: () => void;
}

interface Launch {
  id: string;
  type: "receita" | "despesa";
  date: string;
  category: string;
  value: string;
  description: string;
  recurrence: string;
  endDate: string;
  timestamp: number;
}

interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
}

const categories = {
  receita: ["Pensão", "Salário", "Aluguel de Imóvel", "Venda de Itens", "Outros"],
  despesa: ["Saúde", "Alimentação", "Moradia", "Lazer", "Transportes", "Educação", "Utilidades", "Outros"],
};

// Funções de localStorage
const getLaunches = (): Launch[] => {
  try {
    const data = localStorage.getItem("lume_launches");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLaunch = (launch: Launch) => {
  try {
    const launches = getLaunches();
    launches.push(launch);
    localStorage.setItem("lume_launches", JSON.stringify(launches));
  } catch (error) {
    console.error("Erro ao salvar lançamento:", error);
  }
};

export default function LaunchModals({ isOpen, type, onClose }: LaunchModalsProps) {
  const [step, setStep] = useState<"main" | "period" | "calendar" | "form">("main");
  const [periodType, setPeriodType] = useState<"today" | "specific" | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    category: "",
    value: "",
    description: "",
    recurrence: "Única",
    endDate: "",
  });
  const [categorySuggestion, setCategorySuggestion] = useState<CategorySuggestion | null>(null);
  const [suggestingCategory, setSuggestingCategory] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  
  // Mutations
  const suggestCategoryMutation = trpc.launches.suggestCategory.useMutation();
  const [ruleMatched, setRuleMatched] = useState<{ category: string; pattern: string } | null>(null);

  // Verificar regras ao mudar descrição
  useEffect(() => {
    if (formData.description.trim() && !formData.category && type) {
      // Aqui seria feito a verificação de regras
      // Por enquanto, apenas resetamos o estado
      setRuleMatched(null);
    } else {
      setRuleMatched(null);
    }
  }, [formData.description, type]);

  // Resetar estado quando modal abre/fecha ou tipo muda
  useEffect(() => {
    if (isOpen) {
      setStep("main");
      setPeriodType(null);
      setSelectedDate(null);
      setCurrentMonth(new Date());
      setFormData({
        category: "",
        value: "",
        description: "",
        recurrence: "Única",
        endDate: "",
      });
      setRuleMatched(null);
    }
  }, [isOpen, type]);

  // Atalhos de teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape para fechar
      if (e.key === "Escape") {
        onClose();
      }
      // Enter para "Salvar e Adicionar Outro" quando no formulário
      if (e.key === "Enter" && step === "form" && e.ctrlKey) {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, step, formData]);

  const isReceita = type === "receita";
  const bgColor = isReceita ? "#22C55E" : "#EF4444";
  const darkColor = isReceita ? "#1ea853" : "#dc2626";

  const handlePeriodSelect = (period: "today" | "specific") => {
    setPeriodType(period);
    if (period === "today") {
      setSelectedDate(new Date());
      setStep("form");
    } else {
      setStep("calendar");
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleConfirmDate = () => {
    if (selectedDate) {
      setStep("form");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "value") {
      // Format value as currency
      const numValue = value.replace(/\D/g, "");
      if (numValue) {
        const formatted = (parseInt(numValue) / 100).toFixed(2);
        setFormData({ ...formData, [name]: formatted });
      } else {
        setFormData({ ...formData, [name]: "" });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSuggestCategory = async () => {
    if (!formData.description.trim() || !type) {
      toast.error("Descreva o lançamento para obter sugestão de categoria");
      return;
    }

    setSuggestingCategory(true);
    try {
      const suggestion = await suggestCategoryMutation.mutateAsync({
        description: formData.description,
        type: type as "receita" | "despesa",
      });
      setCategorySuggestion(suggestion);
    } catch (error) {
      toast.error("Erro ao sugerir categoria. Tente novamente.");
    } finally {
      setSuggestingCategory(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (categorySuggestion) {
      setFormData({ ...formData, category: categorySuggestion.category });
      setCategorySuggestion(null);
      toast.success(`Categoria "${categorySuggestion.category}" aplicada!`);
    }
  };

  const handleSubmit = () => {
    if (formData.category && formData.value && selectedDate) {
      const launch: Launch = {
        id: `${Date.now()}-${Math.random()}`,
        type: type as "receita" | "despesa",
        date: selectedDate.toISOString().split("T")[0],
        category: formData.category,
        value: formData.value,
        description: formData.description,
        recurrence: formData.recurrence,
        endDate: formData.endDate,
        timestamp: Date.now(),
      };

      saveLaunch(launch);
      
      // Disparar evento de atualização
      window.dispatchEvent(new Event('lume_launches_updated'));

      // Toast de sucesso
      const tipoLabel = isReceita ? "Receita" : "Despesa";
      toast.success(`✅ ${tipoLabel} de R$ ${formData.value} registrada com sucesso!`, {
        description: `${formData.category} em ${selectedDate.toLocaleDateString("pt-BR")}`,
        duration: 3000,
      });

      // Reset form for next entry
      setFormData({
        category: "",
        value: "",
        description: "",
        recurrence: "Única",
        endDate: "",
      });
      // Voltar para a tela principal para registrar outro
      setStep("main");
    }
  };

  const handleSubmitAndClose = () => {
    if (formData.category && formData.value && selectedDate) {
      const launch: Launch = {
        id: `${Date.now()}-${Math.random()}`,
        type: type as "receita" | "despesa",
        date: selectedDate.toISOString().split("T")[0],
        category: formData.category,
        value: formData.value,
        description: formData.description,
        recurrence: formData.recurrence,
        endDate: formData.endDate,
        timestamp: Date.now(),
      };

      saveLaunch(launch);
      
      // Disparar evento de atualização
      window.dispatchEvent(new Event('lume_launches_updated'));

      // Toast de sucesso
      const tipoLabel = isReceita ? "Receita" : "Despesa";
      toast.success(`✅ ${tipoLabel} de R$ ${formData.value} registrada com sucesso!`, {
        description: `${formData.category} em ${selectedDate.toLocaleDateString("pt-BR")}`,
        duration: 3000,
      });

      // Reset and close
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 animate-in fade-in">
      <div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom" ref={formRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {step === "main" && (isReceita ? "➕ Adicionar Receita" : "➖ Adicionar Despesa")}
            {step === "period" && "📅 Quando você quer registrar?"}
            {step === "calendar" && "📆 Selecione a data"}
            {step === "form" && "📝 Preencha os dados"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Fechar (ESC)">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Atalhos de teclado - Dica */}
        {step === "form" && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-700">
            💡 <strong>Atalhos:</strong> Ctrl+Enter para salvar e adicionar outro | ESC para fechar
          </div>
        )}

        {/* STEP: MAIN - Choose Receipt/Expense */}
        {step === "main" && (
          <div className="space-y-4">
            <button
              onClick={() => handlePeriodSelect("today")}
              className="w-full p-6 rounded-2xl border-2 border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all text-left"
              style={{ borderColor: bgColor }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6" style={{ color: bgColor }} />
                <span className="font-bold text-lg text-gray-800">
                  {isReceita ? "Receita" : "Despesa"} Hoje
                </span>
              </div>
              <p className="text-gray-600">Registre uma {isReceita ? "receita" : "despesa"} que ocorreu ou ocorrerá hoje</p>
            </button>

            <button
              onClick={() => handlePeriodSelect("specific")}
              className="w-full p-6 rounded-2xl border-2 border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all text-left"
              style={{ borderColor: bgColor }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6" style={{ color: bgColor }} />
                <span className="font-bold text-lg text-gray-800">
                  {isReceita ? "Receita" : "Despesa"} em Data Específica
                </span>
              </div>
              <p className="text-gray-600">Escolha uma data no futuro ou passado</p>
            </button>

            <button
              onClick={onClose}
              className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gray-600 hover:bg-gray-700 transition-all"
            >
              ⬅ Voltar
            </button>
          </div>
        )}

        {/* STEP: CALENDAR */}
        {step === "calendar" && (
          <div className="space-y-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-3 rounded-lg hover:bg-gray-100 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-xl font-bold text-gray-800">
                {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-3 rounded-lg hover:bg-gray-100 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Shortcuts */}
            <div className="grid grid-cols-3 gap-2">
              {["Hoje", "Próx. Semana", "Próx. Mês"].map((label) => (
                <button
                  key={label}
                  className="py-2 px-3 rounded-lg font-semibold text-white text-sm bg-blue-600 hover:bg-blue-700 transition-all"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Calendar Grid */}
            <div>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((day) => (
                  <div key={day} className="text-center font-bold text-gray-600 text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth();
                  const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth();

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      className={`w-12 h-12 rounded-lg font-bold transition-all border-2 ${
                        isSelected
                          ? "border-blue-600 bg-blue-100 text-blue-700"
                          : isToday
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <p className="text-center text-gray-600">
                Você selecionou: <strong>{selectedDate.toLocaleDateString("pt-BR")}</strong>
              </p>
            )}

            <div className="space-y-3">
              <button
                onClick={handleConfirmDate}
                disabled={!selectedDate}
                className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: selectedDate ? bgColor : "#D1D5DB",
                  opacity: selectedDate ? 1 : 0.5,
                }}
              >
                <Check className="w-6 h-6" />
                Confirmar
              </button>
              <button
                onClick={() => setStep("main")}
                className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gray-600 hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* STEP: FORM */}
        {step === "form" && (
          <div className="space-y-6">
            {/* Date Display */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-600">Data selecionada</p>
              <p className="text-xl font-bold text-gray-800">
                {selectedDate?.toLocaleDateString("pt-BR")}
              </p>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Categoria *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg font-semibold"
              >
                <option value="">Selecione uma categoria</option>
                {categories[isReceita ? "receita" : "despesa"].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Value Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Valor (R$) *</label>
              <input
                type="text"
                name="value"
                placeholder="0,00"
                value={formData.value}
                onChange={handleInputChange}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg font-semibold"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Descrição (Opcional)</label>
              <textarea
                name="description"
                placeholder="Ex: Compras no supermercado"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={200}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg font-semibold resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-700 mt-1">{formData.description.length}/200</p>
            </div>

            {/* Matched Rule */}
            {ruleMatched && (
              <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-800">Regra Personalizada Encontrada</p>
                    <p className="text-lg font-bold text-amber-900 mt-1">{ruleMatched.category}</p>
                    <p className="text-xs text-amber-700 mt-1">Padrão: "{ruleMatched.pattern}"</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFormData({ ...formData, category: ruleMatched.category });
                      setRuleMatched(null);
                      toast.success(`Categoria "${ruleMatched.category}" aplicada!`);
                    }}
                    className="flex-1 py-2 rounded-lg font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all"
                  >
                    Aplicar
                  </button>
                  <button
                    onClick={() => setRuleMatched(null)}
                    className="flex-1 py-2 rounded-lg font-bold text-amber-700 bg-white border-2 border-amber-300 hover:bg-amber-50 transition-all"
                  >
                    Ignorar
                  </button>
                </div>
              </div>
            )}

            {/* AI Category Suggestion Button */}
            {formData.description && !formData.category && !ruleMatched && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
                <button
                  onClick={handleSuggestCategory}
                  disabled={suggestingCategory}
                  className="w-full py-3 rounded-lg font-bold text-white text-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5" />
                  {suggestingCategory ? "Sugerindo..." : "Sugerir Categoria com IA"}
                </button>
              </div>
            )}

            {/* Category Suggestion Result */}
            {categorySuggestion && (
              <div className="p-4 rounded-xl bg-green-50 border-2 border-green-300">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-800">Sugestão de IA</p>
                    <p className="text-lg font-bold text-green-900 mt-1">{categorySuggestion.category}</p>
                    <p className="text-xs text-green-700 mt-1">{categorySuggestion.reasoning}</p>
                    <p className="text-xs text-green-600 mt-1">Confiança: {(categorySuggestion.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAcceptSuggestion}
                    className="flex-1 py-2 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-all"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => setCategorySuggestion(null)}
                    className="flex-1 py-2 rounded-lg font-bold text-green-700 bg-white border-2 border-green-300 hover:bg-green-50 transition-all"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            )}

            {/* Recurrence */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Recorrência</label>
              <select
                name="recurrence"
                value={formData.recurrence}
                onChange={handleInputChange}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg font-semibold"
              >
                <option value="Única">Única (sem repetição)</option>
                <option value="Mensal">Mensal</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>

            {/* End Date (if recurrence selected) */}
            {formData.recurrence !== "Única" && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Até quando?</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg font-semibold"
                />
              </div>
            )}

            {/* Submit Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={!formData.category || !formData.value}
                className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: formData.category && formData.value ? bgColor : "#D1D5DB",
                  opacity: formData.category && formData.value ? 1 : 0.5,
                }}
                title="Ctrl+Enter"
              >
                <Check className="w-6 h-6" />
                Salvar e Adicionar Outro
              </button>
              <button
                onClick={handleSubmitAndClose}
                disabled={!formData.category || !formData.value}
                className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: formData.category && formData.value ? bgColor : "#D1D5DB",
                  opacity: formData.category && formData.value ? 1 : 0.5,
                }}
              >
                <Check className="w-6 h-6" />
                Salvar e Fechar
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gray-600 hover:bg-gray-700 transition-all"
                title="Escape"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
