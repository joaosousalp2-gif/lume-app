/**
 * Budget — Lume
 * Componente para gerenciar orçamentos mensais por categoria
 */

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, AlertCircle, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getAllLaunches } from "@/lib/dataStore";

interface Budget {
  id: number;
  category: string;
  limit: string;
  month: string;
  alertThresholds: string;
}

const CATEGORIES = {
  receita: ["Pensão", "Salário", "Aluguel de Imóvel", "Venda de Itens", "Outros"],
  despesa: ["Saúde", "Alimentação", "Moradia", "Lazer", "Transportes", "Educação", "Utilidades", "Outros"],
};

export default function Budget() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );
  const [formData, setFormData] = useState({
    category: "",
    limit: "",
  });

  // Queries e Mutations
  const budgetsQuery = trpc.budgets.list.useQuery({ month: currentMonth }, { enabled: true });
  const createMutation = trpc.budgets.create.useMutation();
  const updateMutation = trpc.budgets.update.useMutation();
  const deleteMutation = trpc.budgets.delete.useMutation();

  // Carregar orçamentos
  useEffect(() => {
    if (budgetsQuery.data) {
      setBudgets(budgetsQuery.data as Budget[]);
    }
  }, [budgetsQuery.data]);

  // Calcular gasto por categoria
  const getSpentAmount = (category: string): number => {
    const launches = getAllLaunches();
    const monthStr = currentMonth;
    return launches
      .filter((l: any) => {
        const launchMonth = l.date.slice(0, 7);
        return l.category === category && l.type === "despesa" && launchMonth === monthStr;
      })
      .reduce((sum: number, l: any) => sum + (parseFloat(l.value) || 0), 0);
  };

  // Calcular percentual de uso
  const getUsagePercentage = (spent: number, limit: number): number => {
    if (limit === 0) return 0;
    return Math.min((spent / limit) * 100, 100);
  };

  // Obter status do orçamento
  const getStatus = (percentage: number): { label: string; color: string } => {
    if (percentage >= 100) return { label: "Excedido", color: "red" };
    if (percentage >= 90) return { label: "Crítico", color: "orange" };
    if (percentage >= 75) return { label: "Atenção", color: "yellow" };
    return { label: "OK", color: "green" };
  };

  const handleSubmit = async () => {
    if (!formData.category.trim() || !formData.limit.trim()) {
      toast.error("Categoria e limite são obrigatórios");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          category: formData.category,
          limit: formData.limit,
        });
        toast.success("Orçamento atualizado!");
      } else {
        await createMutation.mutateAsync({
          category: formData.category,
          limit: formData.limit,
          month: currentMonth,
        });
        toast.success("Orçamento criado!");
      }

      await budgetsQuery.refetch();
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar orçamento");
    }
  };

  const handleEdit = (budget: Budget) => {
    setFormData({
      category: budget.category,
      limit: budget.limit,
    });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este orçamento?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Orçamento deletado!");
      await budgetsQuery.refetch();
    } catch (error) {
      toast.error("Erro ao deletar orçamento");
    }
  };

  const resetForm = () => {
    setFormData({ category: "", limit: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMonth(e.target.value);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
          📊 Orçamento Mensal
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Orçamento
        </button>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-bold text-gray-700">Mês:</label>
        <input
          type="month"
          value={currentMonth}
          onChange={handleMonthChange}
          className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none font-semibold"
        />
      </div>

      {/* Form */}
      {showForm && (
        <div className="p-6 rounded-xl bg-purple-50 border-2 border-purple-200 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">
            {editingId ? "Editar Orçamento" : "Novo Orçamento"}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIES.despesa.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Limite (R$)</label>
              <input
                type="number"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                placeholder="0.00"
                step="0.01"
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all"
            >
              {editingId ? "Atualizar" : "Criar"}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 py-3 rounded-lg font-bold text-purple-700 bg-white border-2 border-purple-300 hover:bg-purple-50 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Budgets List */}
      <div className="space-y-3">
        {budgets.length === 0 ? (
          <div className="p-6 rounded-xl bg-gray-50 border-2 border-gray-200 text-center">
            <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600 font-semibold">Nenhum orçamento para este mês</p>
            <p className="text-sm text-gray-500">Crie um orçamento para controlar seus gastos</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const limit = parseFloat(budget.limit) || 0;
            const spent = getSpentAmount(budget.category);
            const percentage = getUsagePercentage(spent, limit);
            const status = getStatus(percentage);

            return (
              <div key={budget.id} className="p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-purple-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{budget.category}</h3>
                    <p className="text-sm text-gray-600">
                      R$ {spent.toFixed(2)} de R$ {limit.toFixed(2)}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-${status.color}-500`}>
                    {status.label}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all rounded-full ${
                        percentage >= 100
                          ? "bg-red-500"
                          : percentage >= 90
                          ? "bg-orange-500"
                          : percentage >= 75
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{percentage.toFixed(0)}% utilizado</p>
                </div>

                {/* Alert */}
                {percentage >= 75 && (
                  <div className="mb-3 p-2 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700">
                      Você utilizou {percentage.toFixed(0)}% do seu orçamento para {budget.category}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deletar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
