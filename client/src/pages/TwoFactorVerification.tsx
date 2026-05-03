/**
 * TwoFactorVerification — Lume
 * Página para verificação de código 2FA após login
 * Suporta Email, SMS e Authenticator
 */

import { useState, useEffect } from "react";
import { Shield, Mail, Smartphone, Key, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface TwoFactorVerificationProps {
  userId?: string;
  method?: "email" | "sms" | "authenticator";
  onSuccess?: () => void;
}

export default function TwoFactorVerification({
  userId = "",
  method = "email",
  onSuccess = () => {},
}: TwoFactorVerificationProps = {}) {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [, setLocation] = useLocation();

  const maxAttempts = 5;
  const isLocked = attempts >= maxAttempts;

  const verifyCode = async () => {
    if (!code.trim()) {
      toast.error("Por favor, insira o código");
      return;
    }

    if (code.length !== 6 && method !== "authenticator") {
      toast.error("O código deve ter 6 dígitos");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/trpc/security.verify2FA", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          code,
          method,
        }),
      });

      const data = await response.json();

      if (data.result?.data?.isValid) {
        toast.success("Código verificado com sucesso!");
        onSuccess();
      } else {
        setAttempts(attempts + 1);
        if (attempts + 1 >= maxAttempts) {
          toast.error("Muitas tentativas. Tente novamente mais tarde.");
        } else {
          toast.error(
            `Código inválido. ${maxAttempts - attempts - 1} tentativas restantes.`
          );
        }
      }
    } catch (error) {
      toast.error("Erro ao verificar código");
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isVerifying && !isLocked) {
      verifyCode();
    }
  };

  const getMethodInfo = () => {
    switch (method) {
      case "email":
        return {
          icon: <Mail className="w-8 h-8" />,
          title: "Verificação por Email",
          description: "Insira o código enviado para seu email",
          placeholder: "000000",
        };
      case "sms":
        return {
          icon: <Smartphone className="w-8 h-8" />,
          title: "Verificação por SMS",
          description: "Insira o código enviado para seu celular",
          placeholder: "000000",
        };
      case "authenticator":
        return {
          icon: <Key className="w-8 h-8" />,
          title: "Verificação por Authenticator",
          description: "Insira o código do seu aplicativo autenticador",
          placeholder: "000000",
        };
      default:
        return {
          icon: <Shield className="w-8 h-8" />,
          title: "Verificação",
          description: "Insira o código de verificação",
          placeholder: "000000",
        };
    }
  };

  const methodInfo = getMethodInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              {methodInfo.icon}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
              {methodInfo.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-center mt-2">
              {methodInfo.description}
            </p>
          </div>

          {/* Code Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Código de Verificação
            </label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder={methodInfo.placeholder}
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(value);
              }}
              onKeyPress={handleKeyPress}
              disabled={isVerifying || isLocked}
              className="text-center text-2xl tracking-widest font-mono"
              maxLength={6}
            />
          </div>

          {/* Attempts Warning */}
          {attempts > 0 && (
            <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-900 dark:text-yellow-200">
                ⚠️ {maxAttempts - attempts} tentativa(s) restante(s)
              </p>
            </div>
          )}

          {/* Locked Message */}
          {isLocked && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-900 dark:text-red-200">
                ❌ Muitas tentativas. Tente novamente mais tarde.
              </p>
            </div>
          )}

          {/* Verify Button */}
          <Button
            onClick={verifyCode}
            disabled={isVerifying || isLocked || code.length < 6}
            className="w-full mb-4"
            size="lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar Código"
            )}
          </Button>

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            disabled={isVerifying}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>💡 Dica:</strong> Se não recebeu o código, verifique sua
              pasta de spam ou tente novamente em alguns minutos.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
