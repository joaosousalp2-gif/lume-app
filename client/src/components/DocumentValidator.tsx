/**
 * DocumentValidator — Lume
 * Componente para validação de CPF e CNPJ
 * Integra com backend para validação segura
 */

import { useState } from "react";
import { CheckCircle, AlertCircle, Loader2, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ValidationResult {
  type: "cpf" | "cnpj";
  document: string;
  isValid: boolean;
}

export default function DocumentValidator() {
  const [document, setDocument] = useState("");
  const [documentType, setDocumentType] = useState<"cpf" | "cnpj">("cpf");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Queries para validação (não usadas diretamente, apenas para tipo)

  const handleValidate = async () => {
    if (!document.trim()) {
      toast.error("Por favor, insira um documento");
      return;
    }

    setIsValidating(true);
    try {
      if (documentType === "cpf") {
        // Usar fetch direto para queries públicas
        const response = await fetch("/api/trpc/publicData.validateCPF?input=" + encodeURIComponent(JSON.stringify({ cpf: document })));
        const data = await response.json();
        const result = data.result.data;
        setResult({
          type: "cpf",
          document: result.cpf,
          isValid: result.isValid,
        });
        if (result.isValid) {
          toast.success("CPF válido!");
        } else {
          toast.error("Documento inválido");
        }
      } else {
        const response = await fetch("/api/trpc/publicData.validateCNPJ?input=" + encodeURIComponent(JSON.stringify({ cnpj: document })));
        const data = await response.json();
        const result = data.result.data;
        setResult({
          type: "cnpj",
          document: result.cnpj,
          isValid: result.isValid,
        });
        if (result.isValid) {
          toast.success("CNPJ válido!");
        } else {
          toast.error("Documento inválido");
        }
      }
    } catch (error) {
      toast.error("Erro ao validar documento");
      console.error(error);
    } finally {
      setIsValidating(false);
    }
  };

  const formatDocument = (value: string, type: "cpf" | "cnpj") => {
    const numbers = value.replace(/\D/g, "");
    if (type === "cpf") {
      return numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      return numbers
        .slice(0, 14)
        .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Validador de Documentos
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Valide CPF ou CNPJ de forma segura e instantânea
          </p>
        </div>

        <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {/* Seletor de Tipo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Tipo de Documento
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setDocumentType("cpf");
                  setDocument("");
                  setResult(null);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  documentType === "cpf"
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                CPF
              </button>
              <button
                onClick={() => {
                  setDocumentType("cnpj");
                  setDocument("");
                  setResult(null);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  documentType === "cnpj"
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                CNPJ
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {documentType === "cpf" ? "CPF" : "CNPJ"}
            </label>
            <Input
              type="text"
              placeholder={
                documentType === "cpf"
                  ? "000.000.000-00"
                  : "00.000.000/0000-00"
              }
              value={document}
              onChange={(e) => {
                const formatted = formatDocument(e.target.value, documentType);
                setDocument(formatted);
              }}
              className="w-full"
              disabled={isValidating}
            />
          </div>

          {/* Botão de Validação */}
          <Button
            onClick={handleValidate}
            disabled={isValidating || !document.trim()}
            className="w-full mb-6"
            size="lg"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              "Validar Documento"
            )}
          </Button>

          {/* Resultado */}
          {result && (
            <div
              className={`p-4 rounded-lg border-2 ${
                result.isValid
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-start gap-3">
                {result.isValid ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p
                    className={`font-semibold ${
                      result.isValid
                        ? "text-green-900 dark:text-green-200"
                        : "text-red-900 dark:text-red-200"
                    }`}
                  >
                    {result.isValid ? "Documento Válido" : "Documento Inválido"}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      result.isValid
                        ? "text-green-800 dark:text-green-300"
                        : "text-red-800 dark:text-red-300"
                    }`}
                  >
                    {result.type === "cpf"
                      ? `CPF: ${result.document}`
                      : `CNPJ: ${result.document}`}
                  </p>
                  {result.isValid && (
                    <p className="text-sm mt-2 text-green-700 dark:text-green-300">
                      ✓ Este documento passou na validação de dígitos verificadores
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Informações */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>🔒 Segurança:</strong> A validação é feita localmente no
              servidor. Seus dados não são armazenados ou compartilhados com
              terceiros.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
