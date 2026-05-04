/**
 * Webhooks Settings Page
 * Allows users to configure webhooks for critical events
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2, Trash2, Bell } from "lucide-react";
import { toast } from "sonner";

export default function WebhooksSettings() {
  const [form, setForm] = useState({
    name: "",
    eventType: "",
    notificationMethod: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: webhooks = [], isLoading, error: listError } = (trpc as any).webhooks.list.useQuery();
  const { data: eventTypes = [] } = (trpc as any).webhooks.getEventTypes.useQuery();
  const { data: notificationMethods = [] } = (trpc as any).webhooks.getNotificationMethods.useQuery();
  const utils = trpc.useUtils() as any;

  // Mutations
  const { mutate: createWebhook } = (trpc as any).webhooks.create.useMutation({
    onSuccess: () => {
      toast.success("Webhook criado com sucesso!");
      setForm({ name: "", eventType: "", notificationMethod: "" });
      utils.webhooks.list.invalidate();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const { mutate: deleteWebhook } = (trpc as any).webhooks.delete.useMutation({
    onSuccess: () => {
      toast.success("Webhook removido com sucesso!");
      utils.webhooks.list.invalidate();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.eventType || !form.notificationMethod) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);
    try {
      createWebhook({
        name: form.name,
        eventType: form.eventType as any,
        notificationMethod: form.notificationMethod as any,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (webhookId: number) => {
    if (confirm("Tem certeza que deseja remover este webhook?")) {
      deleteWebhook({ id: webhookId });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Webhooks de Notificação</h1>
        <p className="text-muted-foreground mt-2">
          Configure notificações por SMS ou Email para eventos críticos
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Criar Webhook</TabsTrigger>
          <TabsTrigger value="list">Meus Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Novo Webhook</CardTitle>
              <CardDescription>
                Configure um novo webhook para receber notificações sobre eventos críticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Webhook</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Alerta de Fraude"
                    value={form.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventType">Tipo de Evento</Label>
                  <Select value={form.eventType} onValueChange={(value) => handleInputChange("eventType", value)}>
                    <SelectTrigger id="eventType">
                      <SelectValue placeholder="Selecione um tipo de evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type: any) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Método de Notificação</Label>
                  <Select
                    value={form.notificationMethod}
                    onValueChange={(value) => handleInputChange("notificationMethod", value)}
                  >
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Selecione um método" />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationMethods.map((method: any) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Certifique-se de ter configurado suas credenciais de integração (Twilio/SendGrid) antes de criar webhooks.
                  </p>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Criar Webhook
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
                Erro ao carregar webhooks: {listError.message}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : webhooks.length > 0 ? (
            <div className="grid gap-4">
              {webhooks.map((webhook: any) => (
                <Card key={webhook.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{webhook.name}</CardTitle>
                        <CardDescription>
                          {webhook.eventType.split("_").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")} via {webhook.notificationMethod.toUpperCase()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            webhook.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {webhook.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Criado em</p>
                        <p className="font-medium">
                          {new Date(webhook.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Última atualização</p>
                        <p className="font-medium">
                          {new Date(webhook.updatedAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(webhook.id)}
                        className="w-full"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-muted-foreground">
                    Nenhum webhook configurado ainda
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Crie um novo webhook para começar a receber notificações
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-100">Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
          <p>
            • Webhooks de SMS requerem credenciais válidas do Twilio configuradas em Integrações
          </p>
          <p>
            • Webhooks de Email requerem credenciais válidas do SendGrid configuradas em Integrações
          </p>
          <p>
            • As notificações serão enviadas para o telefone/email registrado em sua conta
          </p>
          <p>
            • Você pode criar múltiplos webhooks para diferentes tipos de eventos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
