import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, Plus, Trash2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Integration {
  id: number;
  provider: string;
  name: string;
  createdAt: Date;
}

interface ProviderConfig {
  provider: "twilio" | "sendgrid" | "stripe" | "openai";
  name: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    type: "text" | "password";
  }[];
}

const PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    provider: "twilio",
    name: "Twilio (SMS)",
    fields: [
      {
        key: "accountSid",
        label: "Account SID",
        placeholder: "Seu Account SID do Twilio",
        type: "password",
      },
      {
        key: "authToken",
        label: "Auth Token",
        placeholder: "Seu Auth Token do Twilio",
        type: "password",
      },
      {
        key: "fromNumber",
        label: "Número de Origem",
        placeholder: "+55 (XX) XXXXX-XXXX",
        type: "text",
      },
    ],
  },
  {
    provider: "sendgrid",
    name: "SendGrid (Email)",
    fields: [
      {
        key: "apiKey",
        label: "API Key",
        placeholder: "Sua API Key do SendGrid",
        type: "password",
      },
      {
        key: "fromEmail",
        label: "Email de Origem",
        placeholder: "seu@email.com",
        type: "text",
      },
      {
        key: "fromName",
        label: "Nome de Origem",
        placeholder: "Seu Nome",
        type: "text",
      },
    ],
  },
  {
    provider: "stripe",
    name: "Stripe (Pagamentos)",
    fields: [
      {
        key: "secretKey",
        label: "Secret Key",
        placeholder: "Sua Secret Key do Stripe",
        type: "password",
      },
      {
        key: "publishableKey",
        label: "Publishable Key",
        placeholder: "Sua Publishable Key do Stripe",
        type: "text",
      },
    ],
  },
  {
    provider: "openai",
    name: "OpenAI (IA Customizada)",
    fields: [
      {
        key: "apiKey",
        label: "API Key",
        placeholder: "Sua API Key do OpenAI",
        type: "password",
      },
      {
        key: "model",
        label: "Modelo",
        placeholder: "gpt-4 ou gpt-3.5-turbo",
        type: "text",
      },
    ],
  },
];

export default function IntegrationsSettings() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<"twilio" | "sendgrid" | "stripe" | "openai">("twilio");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [integrationName, setIntegrationName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Queries and Mutations
  const listQuery = (trpc as any).integrations.list.useQuery(undefined, { enabled: !!user });
  const addMutation = (trpc as any).integrations.add.useMutation();
  const deleteMutation = (trpc as any).integrations.delete.useMutation();

  useEffect(() => {
    if (listQuery.isLoading) {
      setLoading(true);
      setError(null);
    } else if (listQuery.error) {
      setError("Erro ao carregar integrações");
      setLoading(false);
    } else if (listQuery.data) {
      setIntegrations(listQuery.data);
      setLoading(false);
      setError(null);
    }
  }, [listQuery.data, listQuery.isLoading, listQuery.error]);

  const handleAddIntegration = async () => {
    if (!integrationName.trim()) {
      toast.error("Por favor, insira um nome para a integração");
      return;
    }

    const config = PROVIDER_CONFIGS.find((c) => c.provider === selectedProvider);
    if (!config) return;

    // Validate all fields are filled
    const missingFields = config.fields.filter((f) => !formData[f.key]?.trim());
    if (missingFields.length > 0) {
      toast.error(`Por favor, preencha todos os campos: ${missingFields.map((f) => f.label).join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await addMutation.mutateAsync({
        provider: selectedProvider,
        name: integrationName,
        credentials: formData,
      });

      if (result.success) {
        toast.success(`${config.name} adicionado com sucesso!`);
        setFormData({});
        setIntegrationName("");
        listQuery.refetch();
      } else {
        toast.error(result.error || "Erro ao adicionar integração");
      }
    } catch (err) {
      console.error("Error adding integration:", err);
      toast.error("Erro ao adicionar integração");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIntegration = async (integrationId: number) => {
    if (!confirm("Tem certeza que deseja remover esta integração?")) return;

    try {
      const result = await deleteMutation.mutateAsync({ integrationId });
      if (result.success) {
        toast.success("Integração removida com sucesso");
        listQuery.refetch();
      } else {
        toast.error(result.error || "Erro ao remover integração");
      }
    } catch (err) {
      console.error("Error deleting integration:", err);
      toast.error("Erro ao remover integração");
    }
  };

  const currentConfig = PROVIDER_CONFIGS.find((c) => c.provider === selectedProvider);

  if (!user) {
    return (
      <Card className="p-8 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
        <p className="text-gray-600">Você precisa estar autenticado para gerenciar integrações.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">Adicionar Integração</TabsTrigger>
          <TabsTrigger value="list">Minhas Integrações</TabsTrigger>
        </TabsList>

        {/* Add Integration Tab */}
        <TabsContent value="add" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Adicionar Nova Integração</h3>

            {/* Provider Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provedor
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PROVIDER_CONFIGS.map((config) => (
                  <button
                    key={config.provider}
                    onClick={() => setSelectedProvider(config.provider)}
                    className={`p-3 rounded-lg border-2 transition ${
                      selectedProvider === config.provider
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium text-gray-800">{config.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Integration Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Integração
              </label>
              <Input
                placeholder="Ex: Meu Twilio Pessoal"
                value={integrationName}
                onChange={(e) => setIntegrationName(e.target.value)}
                className="bg-gray-50 border-gray-300"
              />
            </div>

            {/* Dynamic Fields */}
            {currentConfig && (
              <div className="space-y-4 mb-6">
                <p className="text-sm text-gray-600">Credenciais do {currentConfig.name}</p>
                {currentConfig.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.key] || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="bg-gray-50 border-gray-300"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Security Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Segurança</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Suas credenciais são criptografadas com AES-256-GCM e armazenadas com segurança.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAddIntegration}
              disabled={submitting || !integrationName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Adicionar Integração
                </>
              )}
            </Button>
          </Card>
        </TabsContent>

        {/* List Integrations Tab */}
        <TabsContent value="list" className="space-y-4">
          {loading ? (
            <Card className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando integrações...</p>
            </Card>
          ) : error ? (
            <Card className="p-8 text-center">
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <Button onClick={() => listQuery.refetch()} variant="outline">
                Tentar Novamente
              </Button>
            </Card>
          ) : integrations.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600 mb-4">Nenhuma integração configurada ainda.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {integrations.map((integration) => {
                const config = PROVIDER_CONFIGS.find((c) => c.provider === integration.provider);
                return (
                  <Card key={integration.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-600" />
                          <p className="font-medium text-gray-800">{integration.name}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {config?.name} • Adicionado em{" "}
                          {new Date(integration.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDeleteIntegration(integration.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
