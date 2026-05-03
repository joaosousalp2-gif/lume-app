/**
 * CategorizationRules — Lume
 * Componente para gerenciar regras personalizadas de categorização automática
 */

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const CATEGORIES = {
  receita: ["Pensão", "Salário", "Aluguel de Imóvel", "Venda de Itens", "Outros"],
  despesa: ["Saúde", "Alimentação", "Moradia", "Lazer", "Transportes", "Educação", "Utilidades", "Outros"],
};

const getAvailableCategories = (type: "receita" | "despesa") => CATEGORIES[type];

interface Rule {
  id: number;
  pattern: string;
  type: "receita" | "despesa";
  category: string;
  priority: number;
  isActive: number;
  timesApplied: number;
}

export default function CategorizationRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    pattern: "",
    type: "despesa" as "receita" | "despesa",
    category: "",
    priority: 0,
  });

  // Queries e mutations
  const rulesQuery = trpc.rules.list.useQuery();
  const createRuleMutation = trpc.rules.create.useMutation();
  const updateRuleMutation = trpc.rules.update.useMutation();
  const deleteRuleMutation = trpc.rules.delete.useMutation();

  // Carregar regras
  useEffect(() => {
    if (rulesQuery.data) {
      setRules(rulesQuery.data);
    }
  }, [rulesQuery.data]);

  const handleAddRule = async () => {
    if (!formData.pattern.trim() || !formData.category) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingId) {
        await updateRuleMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("Regra atualizada com sucesso!");
      } else {
        await createRuleMutation.mutateAsync(formData);
        toast.success("Regra criada com sucesso!");
      }

      // Recarregar regras
      await rulesQuery.refetch();

      // Reset form
      setFormData({
        pattern: "",
        type: "despesa",
        category: "",
        priority: 0,
      });
      setEditingId(null);
      setIsOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar regra. Tente novamente.");
    }
  };

  const handleEdit = (rule: Rule) => {
    setFormData({
      pattern: rule.pattern,
      type: rule.type,
      category: rule.category,
      priority: rule.priority,
    });
    setEditingId(rule.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta regra?")) return;

    try {
      await deleteRuleMutation.mutateAsync({ id });
      toast.success("Regra deletada com sucesso!");
      await rulesQuery.refetch();
    } catch (error) {
      toast.error("Erro ao deletar regra. Tente novamente.");
    }
  };

  const handleCancel = () => {
    setFormData({
      pattern: "",
      type: "despesa",
      category: "",
      priority: 0,
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const availableCategories = getAvailableCategories(formData.type);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">⚙️ Regras Personalizadas</h2>
          <p className="text-gray-600 mt-1">Defina padrões para categorizar automaticamente seus lançamentos</p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Regra
        </button>
      </div>

      {/* Form */}
      {isOpen && (
        <div className="p-6 rounded-xl bg-blue-50 border-2 border-blue-200 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? "Editar Regra" : "Criar Nova Regra"}
          </h3>

          <div className="space-y-4">
            {/* Pattern Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Padrão de Busca *
              </label>
              <input
                type="text"
                placeholder="Ex: Uber, Netflix, Salário..."
                value={formData.pattern}
                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none font-semibold"
              />
              <p className="text-xs text-gray-700 mt-1">
                A regra será aplicada quando a descrição contiver este padrão (case-insensitive)
              </p>
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tipo *</label>
              <div className="flex gap-3">
                {(["receita", "despesa"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, type })}
                    className={`flex-1 py-2 rounded-lg font-bold transition-all border-2 ${
                      formData.type === type
                        ? "border-blue-500 bg-blue-100 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {type === "receita" ? "➕ Receita" : "➖ Despesa"}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Categoria *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none font-semibold"
              >
                <option value="">Selecione uma categoria</option>
                {availableCategories.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Prioridade (maior = aplicada primeiro)
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none font-semibold"
              />
              <p className="text-xs text-gray-700 mt-1">Padrão: 0. Use números maiores para priorizar</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddRule}
                className="flex-1 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all"
              >
                {editingId ? "Atualizar" : "Criar"} Regra
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-lg font-bold text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="p-6 rounded-xl bg-gray-50 border-2 border-gray-200 text-center">
            <AlertCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-600 font-semibold">Nenhuma regra criada ainda</p>
            <p className="text-sm text-gray-700 mt-1">Crie sua primeira regra para começar a categorizar automaticamente</p>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="p-4 rounded-xl bg-white border-2 border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="px-2 py-1 rounded bg-gray-100 font-mono text-sm font-bold text-gray-800">
                      {rule.pattern}
                    </code>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        rule.type === "receita"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {rule.type === "receita" ? "➕ Receita" : "➖ Despesa"}
                    </span>
                    {rule.isActive ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-200" />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Categoria:</p>
                      <p className="font-bold text-gray-900">{rule.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Prioridade:</p>
                      <p className="font-bold text-gray-900">{rule.priority}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Aplicações:</p>
                      <p className="font-bold text-gray-900">{rule.timesApplied}x</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(rule)}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                    title="Deletar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica:</strong> As regras são aplicadas automaticamente ao criar lançamentos. Você pode usar
          palavras-chave como "Uber", "Netflix", "Salário" para categorizar rapidamente seus gastos recorrentes.
        </p>
      </div>
    </div>
  );
}
