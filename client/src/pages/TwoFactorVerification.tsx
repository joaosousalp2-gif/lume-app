/*
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

export default function TwoFactorVerification() {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [method, setMethod] = useState<"email" | "sms" | "authenticator">("email");
  const [, setLocation] = useLocation();

  const maxAttempts = 5;
  const isLocked = attempts >= maxAttempts;

  // Get 2FA status
  const { data: statusData } = trpc.auth.twoFA.getStatus.useQuery();

  useEffect(() => {
    if (statusData?.success) {
      console.log("2FA Status:", statusData);
    }
  }, [statusData]);

  const verifyCode = async () => {
    if (!code.trim()) {
      toast.error("Por favor, insira o código");
      return;
    }

    if (code.length !== 6 && method !== "authenticator") {
      toast.error("O código deve ter 6 dígitos");
      return;
    }

    if (isLocked) {
      toast.error("Muitas tentativas. Tente novamente mais tarde.");
      return;
    }

    setIsVerifying(true);
    try {
      const verifyMutation = trpc.auth.twoFA.verify.useMutation();
      const result = await verifyMutation.mutateAsync({
        code,
        method,
      });

      if (result.success && result.verified) {
        toast.success("Verificação bem-sucedida!");
        setCode("");
        // Redirect to home after successful verification
        setTimeout(() => setLocation("/"), 1500);
      } else {
        toast.error(result.error || "Código inválido");
        setAttempts(attempts + 1);
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Erro ao verificar código");
      setAttempts(attempts + 1);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkip = () => {
    toast.warning("2FA será necessário para acessar sua conta");
    setLocation("/");
  };

  const getMethodIcon = () => {
    switch (method) {
      case "email":
        return <Mail className="w-6 h-6" />;
      case "sms":
        return <Smartphone className="w-6 h-6" />;
      case "authenticator":
        return <Key className="w-6 h-6" />;
    }
  };

  const getMethodLabel = () => {
    switch (method) {
      case "email":
        return "Código enviado para seu email";
      case "sms":
        return "Código enviado por SMS";
      case "authenticator":
        return "Código do seu aplicativo de autenticação";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-white mb-2">
            Verificação de Segurança
          </h1>
          <p className="text-center text-gray-300 mb-6">
            Digite o código de verificação para continuar
          </p>

          {/* Method Selector */}
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getMethodIcon()}
                <div>
                  <p className="text-sm text-gray-400">Método</p>
                  <p className="text-white font-medium capitalize">{method}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-300 mt-2">{getMethodLabel()}</p>
          </div>

          {/* Code Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Código de Verificação
            </label>
            <Input
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={isVerifying || isLocked}
              maxLength={6}
              className="text-center text-2xl font-mono tracking-widest bg-slate-700 border-slate-600 text-white placeholder-gray-500"
            />
            {isLocked && (
              <p className="text-red-400 text-sm mt-2">
                Muitas tentativas. Tente novamente mais tarde.
              </p>
            )}
            <p className="text-gray-400 text-xs mt-2">
              Tentativas restantes: {maxAttempts - attempts}
            </p>
          </div>

          {/* Verify Button */}
          <Button
            onClick={verifyCode}
            disabled={isVerifying || isLocked || !code}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors mb-3"
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

          {/* Skip Button */}
          <Button
            onClick={handleSkip}
            variant="outline"
            className="w-full text-gray-300 border-slate-600 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {/* Help Text */}
          <p className="text-center text-gray-400 text-xs mt-6">
            Não recebeu o código?{" "}
            <button className="text-blue-400 hover:text-blue-300 underline">
              Reenviar
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
