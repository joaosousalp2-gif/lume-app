/*
 * GoalsSection — Lume
 * Design: Modernismo Humanista
 * Metas Financeiras com alertas de limite e progresso visual
 */

import { useState, useEffect } from "react";
import { Plus, Trash2, AlertCircle, TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";

interface Goal {
  id: string;
  category: string;
  limit: number;
  period: "mensal" | "trimestral" | "anual";
  createdAt: number;
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

export default function GoalsSection() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [newGoal, setNewGoal] = useState({ category: "", limit: "", period: "mensal" as const });
  const [showForm, setShowForm] = useState(false);

  // Carregar metas e lançamentos
  useEffect(() => {
    const loadData = () => {
      try {
        const goalsData = localStorage.getItem("lume_goals");
        if (goalsData) {
          setGoals(JSON.parse(goalsData));
        }

        const launchesData = localStorage.getItem("lume_launches");
        if (launchesData) {
          setLaunches(JSON.parse(launchesData));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    loadData();

    const handleStorageChange = () => {
      loadData();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Calcular gasto em uma categoria
  const getSpendingByCategory = (category: string): number => {
    return launches
      .filter(l => l.type === "despesa" && l.category === category)
      .reduce((sum, l) => sum + parseFloat(l.value), 0);
  };

  // Adicionar meta
  const addGoal = () => {
    if (!newGoal.category || !newGoal.limit) {
      toast.error("❌ Preencha todos os campos!");
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      category: newGoal.category,
      limit: parseFloat(newGoal.limit),
      period: newGoal.period,
      createdAt: Date.now(),
    };

    const updated = [...goals, goal];
    localStorage.setItem("lume_goals", JSON.stringify(updated));
    setGoals(updated);
    setNewGoal({ category: "", limit: "", period: "mensal" });
    setShowForm(false);

    toast.success("✅ Meta criada com sucesso!", {
      description: `${goal.category}: R$ ${goal.limit.toFixed(2)}`,
    });
  };

  // Deletar meta
  const deleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    localStorage.setItem("lume_goals", JSON.stringify(updated));
    setGoals(updated);
    toast.success("✅ Meta deletada!");
  };

  // Obter categorias únicas dos lançamentos
  const allCategories = Array.from(new Set(launches.map(l => l.category)));

  return (
    <section id="metas" className="py-20 bg-white">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            🎯 Metas Financeiras
          </h2>
          <p className="text-lg text-gray-600">Defina metas por categoria e acompanhe seu progresso</p>
        </div>

        {/* Botão Adicionar */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all mb-8"
        >
          <Plus className="w-5 h-5" />
          Adicionar Meta
        </button>

        {/* Formulário */}
        {showForm && (
          <div className="mb-8 p-6 rounded-xl bg-blue-50 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Selecionar categoria...</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Limite (R$)"
                value={newGoal.limit}
                onChange={(e) => setNewGoal({ ...newGoal, limit: e.target.value })}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
              />

              <select
                value={newGoal.period}
                onChange={(e) => setNewGoal({ ...newGoal, period: e.target.value as any })}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
              >
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
              </select>

              <button
                onClick={addGoal}
                className="px-6 py-2 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-all"
              >
                Criar Meta
              </button>
            </div>
          </div>
        )}

        {/* Metas */}
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const spending = getSpendingByCategory(goal.category);
              const percentage = (spending / goal.limit) * 100;
              const isWarning = percentage >= 80;
              const isExceeded = percentage > 100;

              return (
                <div
                  key={goal.id}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    isExceeded
                      ? "bg-red-50 border-red-300"
                      : isWarning
                      ? "bg-yellow-50 border-yellow-300"
                      : "bg-green-50 border-green-300"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold text-gray-800">{goal.category}</p>
                      <p className="text-sm text-gray-600 capitalize">{goal.period}</p>
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Alerta */}
                  {isExceeded && (
                    <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-sm font-bold text-red-700">Limite excedido!</p>
                    </div>
                  )}

                  {isWarning && !isExceeded && (
                    <div className="mb-4 p-3 rounded-lg bg-yellow-100 border border-yellow-300 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm font-bold text-yellow-700">Próximo do limite</p>
                    </div>
                  )}

                  {/* Valores */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700">Gasto</span>
                      <span className="text-sm font-bold text-gray-700">R$ {spending.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700">Limite</span>
                      <span className="text-sm font-bold text-gray-700">R$ {goal.limit.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isExceeded
                            ? "bg-red-600"
                            : isWarning
                            ? "bg-yellow-600"
                            : "bg-green-600"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Percentual */}
                  <div className="text-center">
                    <p className="text-2xl font-black" style={{
                      color: isExceeded ? "#DC2626" : isWarning ? "#D97706" : "#16A34A"
                    }}>
                      {percentage.toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-600">do limite</p>
                  </div>

                  {/* Restante */}
                  {!isExceeded && (
                    <div className="mt-4 p-3 rounded-lg bg-white border border-gray-200">
                      <p className="text-sm text-gray-600">Restante</p>
                      <p className="text-xl font-bold text-green-600">
                        R$ {(goal.limit - spending).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">Nenhuma meta criada ainda</p>
            <p className="text-sm text-gray-500">Clique em "Adicionar Meta" para começar</p>
          </div>
        )}
      </div>
    </section>
  );
}
