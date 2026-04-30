import React, { useState, useEffect } from "react";
import { Target, Plus, Trash2, Edit2, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { getAllLaunches } from "@/lib/dataStore";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  priority: "low" | "medium" | "high";
  description?: string;
  createdAt: string;
}

interface Launch {
  id: string;
  type: "receita" | "despesa";
  category: string;
  value: number;
  description: string;
  date: string;
}

export default function SavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    targetAmount: string;
    deadline: string;
    category: string;
    priority: "low" | "medium" | "high";
    description: string;
  }>({
    name: "",
    targetAmount: "",
    deadline: "",
    category: "",
    priority: "medium",
    description: "",
  });

  // Carregar metas e lançamentos do localStorage
  useEffect(() => {
    const storedGoals = localStorage.getItem("lume_savings_goals");
    if (storedGoals) {
      try {
        setGoals(JSON.parse(storedGoals));
      } catch (e) {
        console.error("Erro ao carregar metas:", e);
      }
    }

    const storedLaunches = getAllLaunches();
    setLaunches(storedLaunches as Launch[]);
  }, []);

  // Sincronizar com eventos de lançamentos
  useEffect(() => {
    const handleLaunchesUpdate = () => {
      const storedLaunches = getAllLaunches();
      setLaunches(storedLaunches as Launch[]);
    };

    window.addEventListener("lume_launches_updated", handleLaunchesUpdate);
    return () => window.removeEventListener("lume_launches_updated", handleLaunchesUpdate);
  }, []);

  // Calcular valor economizado por categoria
  const calculateSavingsByCategory = (category: string): number => {
    return launches
      .filter((l) => l.type === "receita" && l.category === category)
      .reduce((sum, l) => sum + (typeof l.value === 'number' ? l.value : parseFloat(l.value as any) || 0), 0);
  };

  // Salvar metas no localStorage
  const saveGoals = (updatedGoals: SavingsGoal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem("lume_savings_goals", JSON.stringify(updatedGoals));
    window.dispatchEvent(new Event("lume_savings_goals_updated"));
  };

  // Adicionar/editar meta
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.targetAmount || !formData.deadline) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const targetAmount = parseFloat(formData.targetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast.error("Valor alvo deve ser maior que zero");
      return;
    }

    if (editingId) {
      // Editar meta existente
      const updatedGoals = goals.map((goal) =>
        goal.id === editingId
          ? {
              ...goal,
              name: formData.name,
              targetAmount,
              deadline: formData.deadline,
              category: formData.category,
              priority: formData.priority,
              description: formData.description,
            }
          : goal
      );
      saveGoals(updatedGoals);
      toast.success("Meta atualizada com sucesso!");
      setEditingId(null);
    } else {
      // Criar nova meta
      const newGoal: SavingsGoal = {
        id: Date.now().toString(),
        name: formData.name,
        targetAmount,
        currentAmount: calculateSavingsByCategory(formData.category),
        deadline: formData.deadline,
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
        createdAt: new Date().toISOString(),
      };
      saveGoals([...goals, newGoal]);
      toast.success("Meta criada com sucesso!");
    }

    // Resetar formulário
    setFormData({
      name: "",
      targetAmount: "",
      deadline: "",
      category: "",
      priority: "medium",
      description: "",
    });
    setShowForm(false);
  };

  // Deletar meta
  const handleDelete = (id: string) => {
    const updatedGoals = goals.filter((goal) => goal.id !== id);
    saveGoals(updatedGoals);
    toast.success("Meta deletada com sucesso!");
  };

  // Editar meta
  const handleEdit = (goal: SavingsGoal) => {
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      deadline: goal.deadline,
      category: goal.category,
              priority: goal.priority,
      description: goal.description || "",
    });
    setEditingId(goal.id);
    setShowForm(true);
  };

  // Calcular progresso
  const getProgress = (goal: SavingsGoal): number => {
    const currentAmount = calculateSavingsByCategory(goal.category);
    return Math.min((currentAmount / goal.targetAmount) * 100, 100);
  };

  // Calcular dias restantes
  const getDaysRemaining = (deadline: string): number => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Determinar status da meta
  const getGoalStatus = (goal: SavingsGoal): "completed" | "on-track" | "at-risk" | "overdue" => {
    const progress = getProgress(goal);
    const daysRemaining = getDaysRemaining(goal.deadline);

    if (progress >= 100) return "completed";
    if (daysRemaining < 0) return "overdue";
    if (daysRemaining <= 30 && progress < 75) return "at-risk";
    return "on-track";
  };

  // Cores por prioridade
  const priorityColors = {
    low: "bg-blue-50 border-blue-200",
    medium: "bg-yellow-50 border-yellow-200",
    high: "bg-red-50 border-red-200",
  };

  const priorityBadgeColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  // Cores por status
  const statusColors = {
    completed: "text-green-600",
    "on-track": "text-blue-600",
    "at-risk": "text-orange-600",
    overdue: "text-red-600",
  };

  const statusBgColors = {
    completed: "bg-green-50",
    "on-track": "bg-blue-50",
    "at-risk": "bg-orange-50",
    overdue: "bg-red-50",
  };

  const statusLabels = {
    completed: "✅ Concluída",
    "on-track": "📈 No Caminho",
    "at-risk": "⚠️ Em Risco",
    overdue: "❌ Vencida",
  };

  return (
    <section id="savings-goals" className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600" />
              Metas de Economia
            </h2>
            <p className="text-gray-600 mt-2">
              Defina e acompanhe seus objetivos financeiros com alertas automáticos
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                name: "",
                targetAmount: "",
                deadline: "",
                category: "",
                priority: "medium",
                description: "",
              });
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            Nova Meta
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? "Editar Meta" : "Criar Nova Meta"}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome da Meta *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Viagem para Europa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Valor Alvo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valor Alvo (R$) *
                </label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="Ex: 5000"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Poupança">Poupança</option>
                  <option value="Investimentos">Investimentos</option>
                  <option value="Viagem">Viagem</option>
                  <option value="Educação">Educação</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Moradia">Moradia</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {/* Prazo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prazo *
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Prioridade */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prioridade
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva sua meta e por que é importante para você"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botões */}
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                >
                  {editingId ? "Atualizar Meta" : "Criar Meta"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      name: "",
                      targetAmount: "",
                      deadline: "",
                      category: "",
                      priority: "medium",
                      description: "",
                    });
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Metas */}
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {goals.map((goal) => {
              const progress = getProgress(goal);
              const daysRemaining = getDaysRemaining(goal.deadline);
              const status = getGoalStatus(goal);
              const currentAmount = calculateSavingsByCategory(goal.category);

              return (
                <div
                  key={goal.id}
                  className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${priorityColors[goal.priority]}`}
                >
                  {/* Cabeçalho */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{goal.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${statusBgColors[status]} ${statusColors[status]}`}>
                    {statusLabels[status]}
                  </div>

                  {/* Prioridade */}
                  <div className={`inline-block ml-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${priorityBadgeColors[goal.priority]}`}>
                    Prioridade: {goal.priority === "low" ? "Baixa" : goal.priority === "medium" ? "Média" : "Alta"}
                  </div>

                  {/* Progresso */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Progresso</span>
                      <span className="text-sm font-bold text-gray-900">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          progress >= 100
                            ? "bg-green-500"
                            : progress >= 75
                            ? "bg-blue-500"
                            : progress >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Valores */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-white rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Economizado</p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {currentAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Faltam</p>
                      <p className="text-lg font-bold text-red-600">
                        R$ {Math.max(0, goal.targetAmount - currentAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Prazo */}
                  <div className="flex items-center justify-between text-sm text-gray-600 p-3 bg-white rounded-lg">
                    <span>Prazo: {new Date(goal.deadline).toLocaleDateString("pt-BR")}</span>
                    <span className={daysRemaining < 0 ? "text-red-600 font-bold" : "font-semibold"}>
                      {daysRemaining < 0
                        ? `${Math.abs(daysRemaining)} dias atrás`
                        : daysRemaining === 0
                        ? "Hoje!"
                        : `${daysRemaining} dias`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma meta criada</h3>
            <p className="text-gray-600 mb-6">
              Comece a definir suas metas financeiras para acompanhar seus objetivos
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              Criar Primeira Meta
            </button>
          </div>
        )}

        {/* Resumo de Metas */}
        {goals.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-6">📊 Resumo das Metas</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total de Metas</p>
                <p className="text-3xl font-bold">{goals.length}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Metas Concluídas</p>
                <p className="text-3xl font-bold">
                  {goals.filter((g) => getGoalStatus(g) === "completed").length}
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Valor Total Alvo</p>
                <p className="text-3xl font-bold">
                  R$ {goals.reduce((sum, g) => sum + g.targetAmount, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Valor Economizado</p>
                <p className="text-3xl font-bold">
                  R$ {goals.reduce((sum, g) => sum + calculateSavingsByCategory(g.category), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
