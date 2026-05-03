import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Provider = "twilio" | "sendgrid" | "stripe" | "openai";

interface IntegrationForm {
  provider: Provider;
  credentials: Record<string, string>;
}

export default function UserIntegrationsSettings() {
  const [form, setForm] = useState<IntegrationForm>({
    provider: "twilio",
    credentials: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: integrations = [], isLoading, error: listError } = trpc.integrations.list.useQuery();
  const utils = trpc.useUtils();

  const { mutate: addIntegration } = trpc.integrations.add.useMutation({
    onSuccess: () => {
      toast.success("Integração adicionada com sucesso!");
      setForm({ provider: "twilio", credentials: {} });
      utils.integrations.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const { mutate: deleteIntegration } = trpc.integrations.delete.useMutation({
    onSuccess: () => {
      toast.success("Integração removida com sucesso!");
      utils.integrations.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setForm({
      ...form,
      credentials: {
        ...form.credentials,
        [field]: value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      addIntegration({
        provider: form.provider,
        credentials: form.credentials,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (integrationId: number) => {
    if (confirm("Tem certeza que deseja remover esta integração?")) {
      deleteIntegration({ id: integrationId });
    }
  };

  const getProviderFields = (provider: Provider) => {
    switch (provider) {
      case "twilio":
        return [
          { key: "accountSid", label: "Account SID", placeholder: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
          { key: "authToken", label: "Auth Token", placeholder: "your-auth-token", type: "password" },
          { key: "phoneNumber", label: "Phone Number", placeholder: "+55 (11) 98765-4321" },
        ];
      case "sendgrid":
        return [
          { key: "apiKey", label: "API Key", placeholder: "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "password" },
          { key: "fromEmail", label: "From Email", placeholder: "noreply@example.com" },
          { key: "fromName", label: "From Name", placeholder: "Lume App" },
        ];
      case "stripe":
        return [
          { key: "secretKey", label: "Secret Key", placeholder: "sk_live_xxxxxxxxxxxxxxxxxxxxxxxx", type: "password" },
          { key: "publishableKey", label: "Publishable Key", placeholder: "pk_live_xxxxxxxxxxxxxxxxxxxxxxxx" },
        ];
      case "openai":
        return [
          { key: "apiKey", label: "API Key", placeholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "password" },
          { key: "model", label: "Model", placeholder: "gpt-4", value: "gpt-4" },
        ];
      default:
        return [];
    }
  };

  const currentIntegration = integrations?.find((i) => i.provider === form.provider);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrações de API</h1>
        <p className="text-muted-foreground mt-2">
          Configure suas credenciais de Twilio, SendGrid e outros serviços para usar 2FA e notificações.
        </p>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">Adicionar Integração</TabsTrigger>
          <TabsTrigger value="list">Minhas Integrações ({integrations.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Nova Integração</CardTitle>
              <CardDescription>
                Forneça suas credenciais de API para ativar funcionalidades como 2FA via SMS e email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provedor</Label>
                  <Select
                    value={form.provider}
                    onValueChange={(value) => {
                      setForm({
                        provider: value as Provider,
                        credentials: {},
                      });
                    }}
                  >
                    <SelectTrigger id="provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio (SMS)</SelectItem>
                      <SelectItem value="sendgrid">SendGrid (Email)</SelectItem>
                      <SelectItem value="stripe">Stripe (Pagamentos)</SelectItem>
                      <SelectItem value="openai">OpenAI (IA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {getProviderFields(form.provider).map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      <Input
                        id={field.key}
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        value={form.credentials[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>

                {currentIntegration && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      Você já tem uma integração {form.provider.toUpperCase()}. Remova a existente antes de adicionar uma nova, ou edite-a na aba "Minhas Integrações".
                    </p>
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Salvar Integração
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {listError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-300">
                Erro ao carregar integrações: {listError.message}
              </p>
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : integrations.length > 0 ? (
            <div className="grid gap-4">
              {integrations.map((integration: any) => (
                <Card key={integration.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="capitalize">{integration.provider}</CardTitle>
                        <CardDescription>
                          Adicionado em {new Date(integration.createdAt).toLocaleDateString("pt-BR")}
                        </CardDescription>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(integration.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        Credenciais armazenadas com segurança (criptografadas em AES-256-GCM).
                      </p>
                      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-green-800 dark:text-green-300">Ativa e pronta para uso</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Nenhuma integração configurada.</p>
                  <p className="text-sm text-muted-foreground">
                    Adicione uma integração na aba anterior para começar.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base">Segurança das Credenciais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
          <p>✅ Suas credenciais são criptografadas com AES-256-GCM antes de serem armazenadas.</p>
          <p>✅ Apenas você pode acessar suas credenciais descriptografadas.</p>
          <p>✅ Nós nunca compartilhamos suas credenciais com terceiros.</p>
          <p>✅ Você pode remover qualquer integração a qualquer momento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
