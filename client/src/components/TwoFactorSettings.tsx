/**
 * TwoFactorSettings — Lume
 * Componente para gerenciar configurações de 2FA no dashboard
 */

import { useState } from "react";
import { Shield, Mail, Smartphone, Key, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface TwoFactorMethod {
  type: "email" | "sms" | "authenticator";
  enabled: boolean;
  verified: boolean;
  lastUsed?: string;
}

export default function TwoFactorSettings() {
  const [methods, setMethods] = useState<TwoFactorMethod[]>([
    { type: "email", enabled: false, verified: false },
    { type: "sms", enabled: false, verified: false },
    { type: "authenticator", enabled: false, verified: false },
  ]);

  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copied, setCopied] = useState(false);

  const getMethodInfo = (type: string) => {
    switch (type) {
      case "email":
        return {
          icon: <Mail className="w-5 h-5" />,
          title: "Email",
          description: "Receba códigos por email",
        };
      case "sms":
        return {
          icon: <Smartphone className="w-5 h-5" />,
          title: "SMS",
          description: "Receba códigos por SMS",
        };
      case "authenticator":
        return {
          icon: <Key className="w-5 h-5" />,
          title: "Authenticator",
          description: "Use um app como Google Authenticator",
        };
      default:
        return {
          icon: <Shield className="w-5 h-5" />,
          title: "Desconhecido",
          description: "Método desconhecido",
        };
    }
  };

  const handleEnableMethod = async (type: string) => {
    toast.loading("Habilitando 2FA...");
    // Aqui você chamaria a API para habilitar o método
    toast.dismiss();
    toast.success(`${type} habilitado com sucesso!`);
  };

  const handleDisableMethod = async (type: string) => {
    if (confirm(`Tem certeza que deseja desabilitar 2FA por ${type}?`)) {
      toast.loading("Desabilitando 2FA...");
      // Aqui você chamaria a API para desabilitar o método
      toast.dismiss();
      toast.success(`${type} desabilitado com sucesso!`);
    }
  };

  const handleGenerateBackupCodes = async () => {
    toast.loading("Gerando códigos de backup...");
    // Aqui você chamaria a API para gerar códigos
    setBackupCodes([
      "ABC123DEF456",
      "GHI789JKL012",
      "MNO345PQR678",
      "STU901VWX234",
      "YZA567BCD890",
    ]);
    toast.dismiss();
    toast.success("Códigos de backup gerados!");
  };

  const handleCopyBackupCodes = () => {
    const text = backupCodes.join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Códigos copiados!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Autenticação de Dois Fatores
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Aumente a segurança da sua conta habilitando 2FA
        </p>
      </div>

      {/* Warning */}
      <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900 dark:text-yellow-200">
              Recomendamos habilitar 2FA
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
              2FA protege sua conta contra acessos não autorizados, mesmo se
              alguém descobrir sua senha.
            </p>
          </div>
        </div>
      </Card>

      {/* Methods */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Métodos de Verificação
        </h3>

        {methods.map((method) => {
          const info = getMethodInfo(method.type);
          return (
            <Card
              key={method.type}
              className="p-4 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    {info.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {info.title}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {info.description}
                    </p>
                    {method.verified && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ✓ Verificado
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant={method.enabled ? "destructive" : "default"}
                  size="sm"
                  onClick={() =>
                    method.enabled
                      ? handleDisableMethod(method.type)
                      : handleEnableMethod(method.type)
                  }
                >
                  {method.enabled ? "Desabilitar" : "Habilitar"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Backup Codes */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Códigos de Backup
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Guarde esses códigos em um local seguro. Você pode usá-los para acessar
          sua conta se perder acesso aos seus métodos de 2FA.
        </p>

        {backupCodes.length === 0 ? (
          <Button onClick={handleGenerateBackupCodes} className="w-full">
            Gerar Códigos de Backup
          </Button>
        ) : (
          <Card className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <div className="space-y-3">
              <div className="bg-white dark:bg-slate-800 p-3 rounded font-mono text-sm text-slate-900 dark:text-white whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                {backupCodes.join("\n")}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyBackupCodes}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Códigos
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Info */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <strong>💡 Dica:</strong> Você pode habilitar múltiplos métodos de 2FA.
          Se um método não estiver disponível, você poderá usar outro.
        </p>
      </Card>
    </div>
  );
}
