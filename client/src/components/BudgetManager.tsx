/*
 * BudgetManager — Lume
 * Orçamento mensal personalizável com alertas
 */

import { useState, useEffect } from "react";
import { Wallet, AlertCircle, TrendingDown, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
  createdAt: number;
}

const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Utilidades",
  "Outros",
];

export default function BudgetManager() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [newBudget, setNewBudget] = useState({ category: "Alimentação", limit: 500 });
  const [currentMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = () => {
    try {
      const stored = localStorage.getItem("lume_budgets");
      if (stored) {
        setBudgets(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
    }
  };

  const saveBudgets = (updated: Budget[]) => {
    try {
      localStorage.setItem("lume_budgets", JSON.stringify(updated));
      setBudgets(updated);
    } catch (error) {
      console.error("Erro ao salvar orçamentos:", error);
    }
  };

  const addBudget = () => {
    if (newBudget.limit <= 0) {
      toast.error("❌ Limite deve ser maior que zero");
      return;
    }

    const budget: Budget = {
      id: Date.now().toString(),
      category: newBudget.category,
      limit: newBudget.limit,
      spent: 0,
      month: currentMonth,
      createdAt: Date.now(),
    };

    const updated = [...budgets, budget];
    saveBudgets(updated);
    toast.success(`✅ Orçamento de ${newBudget.category} criado!`);
    setNewBudget({ category: "Alimentação", limit: 500 });
  };

  const deleteBudget = (id: string) => {
    const updated = budgets.filter((b) => b.id !== id);
    saveBudgets(updated);
    toast.success("✅ Orçamento deletado");
  };

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 90) return "bg-orange-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getAlertStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return { text: "❌ Limite excedido", color: "text-red-600" };
    if (percentage >= 90) return { text: "⚠️ 90% do limite", color: "text-orange-600" };
    if (percentage >= 75) return { text: "⚠️ 75% do limite", color: "text-yellow-600" };
    return { text: "✅ Normal", color: "text-green-600" };
  };

  const currentBudgets = budgets.filter((b) => b.month === currentMonth);

  return (
    <section id="budgets" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="w-8 h-8 text-green-600" />
            <h2 className="text-4xl font-black text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              💰 Orçamento Mensal
            </h2>
          </div>
          <p className="text-lg text-gray-600">Defina limites por categoria e controle seus gastos em tempo real</p>
        </div>

        {/* Adicionar Novo Orçamento */}
        <div className="mb-12 p-6 rounded-xl bg-blue-50 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Novo Orçamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
              <select
                value={newBudget.category}
                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Limite (R$)</label>
              <input
                type="number"
                value={newBudget.limit}
                onChange={(e) => setNewBudget({ ...newBudget, limit: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                min="0"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addBudget}
                className="w-full px-6 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Orçamentos */}
        {currentBudgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentBudgets.map((budget) => {
              const percentage = (budget.spent / budget.limit) * 100;
              const alert = getAlertStatus(budget.spent, budget.limit);

              return (
                <div key={budget.id} className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{budget.category}</h4>
                      <p className={`text-sm font-semibold ${alert.color}`}>{alert.text}</p>
                    </div>
                    <button
                      onClick={() => deleteBudget(budget.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        R$ {budget.spent.toFixed(2)} / R$ {budget.limit.toFixed(2)}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all ${getProgressColor(budget.spent, budget.limit)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs text-gray-600 mb-1">Disponível</p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {Math.max(0, budget.limit - budget.spent).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs text-gray-600 mb-1">Gasto</p>
                      <p className="text-lg font-bold text-gray-900">R$ {budget.spent.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">Nenhum orçamento criado ainda</p>
            <p className="text-sm text-gray-500">Crie seu primeiro orçamento acima</p>
          </div>
        )}

        {/* Dicas */}
        <div className="mt-12 p-6 rounded-xl bg-green-50 border-2 border-green-200">
          <h4 className="font-bold text-gray-900 mb-3">💡 Dicas para Orçamento Eficaz</h4>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Comece com categorias principais (alimentação, moradia, transporte)</li>
            <li>✓ Revise seus orçamentos mensalmente baseado em gastos reais</li>
            <li>✓ Reserve 10-20% para emergências e imprevistos</li>
            <li>✓ Aumente gradualmente seus limites conforme sua renda aumenta</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
