import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { toast } from "sonner";

interface Launch {
  id: string;
  type: "receita" | "despesa";
  category: string;
  value: number;
  description: string;
  date: string;
  recurrence?: string;
}

interface TrustAlert {
  id: string;
  launchId: string;
  description: string;
  merchant: string;
  trustScore: number;
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
}

const SUSPICIOUS_KEYWORDS = [
  "phishing",
  "fraude",
  "golpe",
  "scam",
  "fake",
  "clonado",
  "roubo",
  "falsificado",
];

const HIGH_RISK_MERCHANTS = [
  "exemplo-fraude.com",
  "site-suspeito.net",
  "loja-fake.br",
];

export default function TrustIntegration() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [trustAlerts, setTrustAlerts] = useState<TrustAlert[]>([]);
  const [overallTrustScore, setOverallTrustScore] = useState(100);

  useEffect(() => {
    // Carregar lançamentos do localStorage
    const stored = localStorage.getItem("launches");
    if (stored) {
      try {
        setLaunches(JSON.parse(stored));
      } catch (e) {
        console.error("Erro ao carregar lançamentos:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (launches.length > 0) {
      analyzeTrust();
    }
  }, [launches]);

  const analyzeTrust = () => {
    const newAlerts: TrustAlert[] = [];
    let totalRiskScore = 0;

    launches.forEach((launch) => {
      let riskLevel: "low" | "medium" | "high" = "low";
      let trustScore = 100;
      let recommendation = "✅ Transação segura";

      // Verificar palavras-chave suspeitas na descrição
      const hasSuspiciousKeywords = SUSPICIOUS_KEYWORDS.some((keyword) =>
        launch.description.toLowerCase().includes(keyword)
      );

      if (hasSuspiciousKeywords) {
        riskLevel = "high";
        trustScore = 20;
        recommendation =
          "⚠️ Descrição contém palavras-chave suspeitas. Verifique se esta transação é legítima.";
      }

      // Verificar se é um comerciante de alto risco
      const isHighRiskMerchant = HIGH_RISK_MERCHANTS.some((merchant) =>
        launch.description.toLowerCase().includes(merchant)
      );

      if (isHighRiskMerchant) {
        riskLevel = "high";
        trustScore = 15;
        recommendation =
          "❌ Este comerciante está na lista de alto risco. Evite transações com este fornecedor.";
      }

      // Verificar valores anormalmente altos
      if (launch.type === "despesa" && launch.value > 5000) {
        if (riskLevel === "low") riskLevel = "medium";
        trustScore = Math.max(trustScore - 20, 0);
        recommendation =
          "⚠️ Valor elevado detectado. Confirme se esta é uma transação esperada.";
      }

      // Verificar padrões de múltiplas transações rápidas
      const recentTransactions = launches.filter((l) => {
        const daysDiff =
          (new Date().getTime() - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff < 1;
      });

      if (recentTransactions.length > 5) {
        if (riskLevel === "low") riskLevel = "medium";
        trustScore = Math.max(trustScore - 15, 0);
        recommendation =
          "⚠️ Múltiplas transações detectadas em curto período. Verifique se todas são legítimas.";
      }

      totalRiskScore += 100 - trustScore;

      if (riskLevel !== "low" || hasSuspiciousKeywords || isHighRiskMerchant) {
        newAlerts.push({
          id: `alert-${launch.id}`,
          launchId: launch.id,
          description: launch.description,
          merchant: launch.description,
          trustScore,
          riskLevel,
          recommendation,
        });
      }
    });

    setTrustAlerts(newAlerts);

    // Calcular score geral de confiança
    const avgRiskScore = launches.length > 0 ? totalRiskScore / launches.length : 0;
    const finalScore = Math.max(100 - avgRiskScore, 0);
    setOverallTrustScore(finalScore);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-50 border-green-200 text-green-700";
      case "medium":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "high":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "medium":
      case "high":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <section id="trust-integration" className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            Monitoramento de Confiabilidade
          </h2>
          <p className="text-gray-600">
            Análise automática de segurança para seus lançamentos financeiros
          </p>
        </div>

        {/* Score Geral */}
        <div className="mb-12 p-8 bg-white rounded-xl border-2 border-blue-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Score */}
            <div className="text-center">
              <p className="text-gray-600 text-sm font-semibold mb-2">Score de Confiança Geral</p>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={
                      overallTrustScore >= 80
                        ? "#22C55E"
                        : overallTrustScore >= 50
                        ? "#FACC15"
                        : "#EF4444"
                    }
                    strokeWidth="8"
                    strokeDasharray={`${(overallTrustScore / 100) * 282.7} 282.7`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {overallTrustScore.toFixed(0)}%
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {overallTrustScore >= 80
                  ? "✅ Excelente"
                  : overallTrustScore >= 50
                  ? "⚠️ Moderado"
                  : "❌ Baixo"}
              </p>
            </div>

            {/* Estatísticas */}
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Transações Seguras</p>
                <p className="text-2xl font-bold text-green-600">
                  {launches.length - trustAlerts.length}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-600 mb-1">Alertas de Confiança</p>
                <p className="text-2xl font-bold text-yellow-600">{trustAlerts.length}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Total de Lançamentos</p>
                <p className="text-2xl font-bold text-blue-600">{launches.length}</p>
              </div>
            </div>

            {/* Recomendações */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-gray-900 mb-3">💡 Recomendações:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                {overallTrustScore >= 80 ? (
                  <>
                    <li>✅ Suas transações estão seguras</li>
                    <li>✅ Continue monitorando regularmente</li>
                    <li>✅ Mantenha a vigilância em transações altas</li>
                  </>
                ) : overallTrustScore >= 50 ? (
                  <>
                    <li>⚠️ Revise as transações com alertas</li>
                    <li>⚠️ Verifique comerciantes desconhecidos</li>
                    <li>⚠️ Aumente a cautela em transações</li>
                  </>
                ) : (
                  <>
                    <li>❌ Atenção: Múltiplos alertas detectados</li>
                    <li>❌ Verifique imediatamente as transações</li>
                    <li>❌ Considere bloquear cartões se necessário</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Alertas Detalhados */}
        {trustAlerts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">⚠️ Alertas de Confiança</h3>
            <div className="space-y-4">
              {trustAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-6 rounded-xl border-2 ${getRiskColor(alert.riskLevel)}`}
                >
                  <div className="flex items-start gap-4">
                    {getRiskIcon(alert.riskLevel)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{alert.merchant}</h4>
                        <span className="text-sm font-semibold">
                          Score: {alert.trustScore}/100
                        </span>
                      </div>
                      <p className="text-sm mb-3">{alert.description}</p>
                      <div className="w-full bg-gray-300 rounded-full h-2 mb-3">
                        <div
                          className={`h-2 rounded-full ${
                            alert.trustScore >= 80
                              ? "bg-green-500"
                              : alert.trustScore >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${alert.trustScore}%` }}
                        />
                      </div>
                      <p className="text-sm font-semibold">{alert.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-3">ℹ️ Como Funciona o Monitoramento:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              ✓ <strong>Análise de Palavras-Chave:</strong> Detecta descrições suspeitas
            </li>
            <li>
              ✓ <strong>Verificação de Comerciantes:</strong> Compara com lista de alto risco
            </li>
            <li>
              ✓ <strong>Detecção de Anomalias:</strong> Identifica valores e padrões incomuns
            </li>
            <li>
              ✓ <strong>Score de Confiança:</strong> Calcula segurança geral de suas transações
            </li>
            <li>
              ✓ <strong>Alertas em Tempo Real:</strong> Notifica sobre transações suspeitas
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
