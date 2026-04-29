/*
 * LaunchModals — Lume
 * Componentes modais para fluxo de lançamentos (receita/despesa)
 * Inclui: seleção de período, calendário, formulário de entrada
 */

import { useState } from "react";
import { X, Plus, Minus, Calendar, Check, ChevronLeft, ChevronRight } from "lucide-react";

interface LaunchModalsProps {
  isOpen: boolean;
  type: "receita" | "despesa" | null;
  onClose: () => void;
}

const categories = {
  receita: ["Pensão", "Salário", "Aluguel de Imóvel", "Venda de Itens", "Outros"],
  despesa: ["Saúde", "Alimentação", "Moradia", "Lazer", "Transportes", "Educação", "Utilidades", "Outros"],
};

export default function LaunchModals({ isOpen, type, onClose }: LaunchModalsProps) {
  const [step, setStep] = useState<"main" | "period" | "calendar" | "form">("main");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    category: "",
    value: "",
    description: "",
    recurrence: "Única",
    endDate: "",
  });

  const isReceita = type === "receita";
  const bgColor = isReceita ? "#22C55E" : "#EF4444";
  const darkColor = isReceita ? "#1ea853" : "#dc2626";

  const handlePeriodSelect = (period: "today" | "specific") => {
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
      const formatted = (parseInt(numValue) / 100).toFixed(2);
      setFormData({ ...formData, [name]: formatted });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = () => {
    if (formData.category && formData.value) {
      console.log("Lançamento registrado:", { type, selectedDate, ...formData });
      // Reset and close
      setStep("main");
      setFormData({ category: "", value: "", description: "", recurrence: "Única", endDate: "" });
      setSelectedDate(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {step === "main" && (isReceita ? "Adicionar Receita" : "Adicionar Despesa")}
            {step === "period" && "Quando você quer registrar?"}
            {step === "calendar" && "Selecione a data"}
            {step === "form" && "Preencha os dados"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* STEP: MAIN - Choose Receipt/Expense */}
        {step === "main" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("period")}
              className="w-full p-6 rounded-2xl border-2 border-gray-200 hover:shadow-lg transition-all text-left"
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
              onClick={() => setStep("period")}
              className="w-full p-6 rounded-2xl border-2 border-gray-200 hover:shadow-lg transition-all text-left"
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
              Voltar
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
                className="p-3 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-xl font-bold text-gray-800">
                {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-3 rounded-lg hover:bg-gray-100"
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
                className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all"
                style={{
                  backgroundColor: selectedDate ? bgColor : "#D1D5DB",
                  opacity: selectedDate ? 1 : 0.5,
                }}
              >
                <Check className="w-6 h-6 inline mr-2" />
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
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200</p>
            </div>

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
              >
                <Check className="w-6 h-6" />
                Confirmar e Salvar
              </button>
              <button
                onClick={() => {
                  setStep("main");
                  setFormData({ category: "", value: "", description: "", recurrence: "Única", endDate: "" });
                }}
                className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gray-600 hover:bg-gray-700 transition-all"
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
