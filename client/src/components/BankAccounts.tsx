/**
 * BankAccounts — Lume
 * Componente para gerenciar múltiplas contas bancárias
 */

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, DollarSign, Wallet } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface BankAccount {
  id: number;
  name: string;
  type: "corrente" | "poupanca" | "investimentos" | "outro";
  balance: string;
  bankName?: string;
  accountNumber?: string;
  displayOrder: number;
}

const ACCOUNT_TYPES = {
  corrente: { label: "Conta Corrente", icon: "🏦" },
  poupanca: { label: "Poupança", icon: "🏪" },
  investimentos: { label: "Investimentos", icon: "📈" },
  outro: { label: "Outro", icon: "💼" },
};

export default function BankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    type: "corrente" | "poupanca" | "investimentos" | "outro";
    balance: string;
    bankName: string;
    accountNumber: string;
  }>({
    name: "",
    type: "corrente",
    balance: "0",
    bankName: "",
    accountNumber: "",
  });

  // Queries e Mutations
  const accountsQuery = trpc.accounts.list.useQuery();
  const totalBalanceQuery = trpc.accounts.getTotalBalance.useQuery();
  const createMutation = trpc.accounts.create.useMutation();
  const updateMutation = trpc.accounts.update.useMutation();
  const deleteMutation = trpc.accounts.delete.useMutation();

  // Carregar contas
  useEffect(() => {
    if (accountsQuery.data) {
      setAccounts(accountsQuery.data as BankAccount[]);
    }
  }, [accountsQuery.data]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome da conta é obrigatório");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("Conta atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Conta criada com sucesso!");
      }

      // Recarregar contas
      await accountsQuery.refetch();
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar conta");
    }
  };

  const handleEdit = (account: BankAccount) => {
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
      bankName: account.bankName || "",
      accountNumber: account.accountNumber || "",
    });
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta conta?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Conta deletada com sucesso!");
      await accountsQuery.refetch();
    } catch (error) {
      toast.error("Erro ao deletar conta");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "corrente",
      balance: "0",
      bankName: "",
      accountNumber: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const totalBalance = totalBalanceQuery.data || "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
          💰 Contas Bancárias
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nova Conta
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <p className="text-sm font-semibold opacity-90">Saldo Total</p>
        <p className="text-4xl font-black mt-2">R$ {parseFloat(totalBalance).toFixed(2)}</p>
      </div>

      {/* Form */}
      {showForm && (
        <div className="p-6 rounded-xl bg-blue-50 border-2 border-blue-200 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">
            {editingId ? "Editar Conta" : "Nova Conta Bancária"}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Conta</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Conta Corrente Santander"
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                >
                  {Object.entries(ACCOUNT_TYPES).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Saldo</label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Banco (Opcional)</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="ex: Santander"
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Número da Conta (Opcional)</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="ex: 123456-7"
                className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all"
            >
              {editingId ? "Atualizar" : "Criar Conta"}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 py-3 rounded-lg font-bold text-blue-700 bg-white border-2 border-blue-300 hover:bg-blue-50 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="space-y-3">
        {accounts.length === 0 ? (
          <div className="p-6 rounded-xl bg-gray-50 border-2 border-gray-200 text-center">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600 font-semibold">Nenhuma conta cadastrada</p>
            <p className="text-sm text-gray-700">Crie sua primeira conta para começar</p>
          </div>
        ) : (
          accounts.map((account) => {
            const typeInfo = ACCOUNT_TYPES[account.type];
            return (
              <div key={account.id} className="p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <h3 className="text-lg font-bold text-gray-900">{account.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{typeInfo.label}</p>
                    {account.bankName && (
                      <p className="text-xs text-gray-700 mt-1">Banco: {account.bankName}</p>
                    )}
                    {account.accountNumber && (
                      <p className="text-xs text-gray-700">Conta: {account.accountNumber}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-blue-600">
                      R$ {parseFloat(account.balance).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(account)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
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
