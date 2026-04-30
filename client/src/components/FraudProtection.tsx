/*
 * FraudProtection — Lume
 * Proteção contra fraudes: números suspeitos, verificador de links e educação
 */

import { useState, useEffect } from "react";
import { AlertTriangle, Link2, BookOpen, Phone, Mail, CheckCircle, XCircle, Loader } from "lucide-react";
import { toast } from "sonner";
import { checkUrlSafety, getThreatInfo, type SafeBrowsingResult } from "@/lib/safeBrowsing";

interface SuspiciousNumber {
  id: string;
  number: string;
  type: "phone" | "email";
  reason: string;
  reports: number;
  verified: boolean;
}

interface EducationTip {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  icon: string;
}

const SUSPICIOUS_NUMBERS: SuspiciousNumber[] = [
  {
    id: "1",
    number: "(11) 98765-4321",
    type: "phone",
    reason: "Golpe de empréstimo rápido",
    reports: 1247,
    verified: true,
  },
  {
    id: "2",
    number: "suporte@banco-falso.com",
    type: "email",
    reason: "Phishing - Falsificação de banco",
    reports: 892,
    verified: true,
  },
  {
    id: "3",
    number: "(21) 99999-8888",
    type: "phone",
    reason: "Golpe de herança falsa",
    reports: 654,
    verified: true,
  },
];

const EDUCATION_TIPS: EducationTip[] = [
  {
    id: "1",
    title: "Golpe do Falso Suporte Técnico",
    description:
      "Golpistas ligam fingindo ser do suporte de seu banco ou operadora. Nunca compartilhe dados pessoais ou senhas por telefone.",
    category: "Telefone",
    date: "2025-04-28",
    icon: "📱",
  },
  {
    id: "2",
    title: "Phishing por Email",
    description:
      "Emails falsos que parecem ser de instituições financeiras pedindo para confirmar dados. Sempre acesse o site digitando a URL manualmente.",
    category: "Email",
    date: "2025-04-27",
    icon: "📧",
  },
  {
    id: "3",
    title: "Golpe do Pix Reverso",
    description:
      "Golpista envia Pix 'por engano' e depois pede para devolver. Na verdade, o Pix é revertido e você fica sem o dinheiro.",
    category: "Pix",
    date: "2025-04-26",
    icon: "💳",
  },
  {
    id: "4",
    title: "Falsa Oportunidade de Investimento",
    description:
      "Promessas de ganhos rápidos e fáceis em investimentos. Desconfie de rendimentos muito altos e sem risco aparente.",
    category: "Investimento",
    date: "2025-04-25",
    icon: "📈",
  },
];

export default function FraudProtection() {
  const [activeTab, setActiveTab] = useState<"numbers" | "links" | "education">("numbers");
  const [suspiciousNumbers, setSuspiciousNumbers] = useState<SuspiciousNumber[]>(SUSPICIOUS_NUMBERS);
  const [reportedNumbers, setReportedNumbers] = useState<string[]>([]);
  const [linkToCheck, setLinkToCheck] = useState("");
  const [linkResult, setLinkResult] = useState<SafeBrowsingResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkHistory, setCheckHistory] = useState<SafeBrowsingResult[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("lume_reported_numbers");
    if (stored) {
      setReportedNumbers(JSON.parse(stored));
    }
    
    const history = localStorage.getItem("lume_link_check_history");
    if (history) {
      setCheckHistory(JSON.parse(history));
    }
  }, []);

  const reportNumber = (number: string) => {
    if (reportedNumbers.includes(number)) {
      toast.info("ℹ️ Você já reportou este número");
      return;
    }

    const updated = [...reportedNumbers, number];
    setReportedNumbers(updated);
    localStorage.setItem("lume_reported_numbers", JSON.stringify(updated));

    // Atualizar contador
    setSuspiciousNumbers(
      suspiciousNumbers.map((n) => (n.number === number ? { ...n, reports: n.reports + 1 } : n))
    );

    toast.success("✅ Número reportado com sucesso!");
  };

  const checkLink = async () => {
    if (!linkToCheck.trim()) {
      toast.error("❌ Digite uma URL para verificar");
      return;
    }

    setIsChecking(true);
    try {
      // Chamar o serviço Safe Browsing
      const result = await checkUrlSafety(linkToCheck);
      setLinkResult(result);
      
      // Adicionar ao histórico
      setCheckHistory([result, ...checkHistory.slice(0, 9)]);
      
      // Salvar no localStorage
      localStorage.setItem("lume_link_check_history", JSON.stringify([result, ...checkHistory.slice(0, 9)]));

      if (result.safe) {
        toast.success("✅ Link seguro!");
      } else {
        toast.error(`⚠️ ${result.details}`);
      }
    } catch (error) {
      toast.error("❌ Erro ao verificar URL");
      console.error(error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section id="fraud-protection" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <h2 className="text-4xl font-black text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              🛡️ Proteção contra Fraudes
            </h2>
          </div>
          <p className="text-lg text-gray-600">Ferramentas e educação para proteger você contra golpes</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-gray-200 overflow-x-auto">
          {[
            { id: "numbers", label: "📞 Números Suspeitos", icon: Phone },
            { id: "links", label: "🔗 Verificador de Links", icon: Link2 },
            { id: "education", label: "📚 Educação", icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-bold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ABA: NÚMEROS SUSPEITOS */}
        {activeTab === "numbers" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-red-50 border-2 border-red-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Base de Dados de Números Suspeitos</h3>
              <p className="text-gray-700 mb-4">
                Estes números foram reportados como fraudulentos por múltiplos usuários. Se receber uma ligação ou mensagem destes números, desconfie!
              </p>

              <div className="space-y-3">
                {suspiciousNumbers.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg bg-white border-2 border-red-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {item.type === "phone" ? (
                            <Phone className="w-5 h-5 text-red-600" />
                          ) : (
                            <Mail className="w-5 h-5 text-red-600" />
                          )}
                          <p className="font-bold text-gray-900">{item.number}</p>
                          {item.verified && (
                            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                              ✓ Verificado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.reason}</p>
                        <p className="text-xs text-gray-500">{item.reports} pessoas reportaram este número</p>
                      </div>
                      <button
                        onClick={() => reportNumber(item.number)}
                        className={`px-4 py-2 rounded-lg font-bold text-white transition-all whitespace-nowrap ${
                          reportedNumbers.includes(item.number)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                        disabled={reportedNumbers.includes(item.number)}
                      >
                        {reportedNumbers.includes(item.number) ? "✓ Reportado" : "Reportar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Adicionar Número Suspeito */}
            <div className="p-6 rounded-xl bg-yellow-50 border-2 border-yellow-200">
              <h4 className="font-bold text-gray-900 mb-3">Encontrou um número suspeito?</h4>
              <p className="text-gray-700 mb-4">
                Compartilhe com a comunidade Lume para proteger outros usuários. Seus dados pessoais não serão compartilhados.
              </p>
              <button className="px-6 py-2 rounded-lg font-bold text-white bg-yellow-600 hover:bg-yellow-700 transition-all">
                Reportar Novo Número
              </button>
            </div>
          </div>
        )}

        {/* ABA: VERIFICADOR DE LINKS */}
        {activeTab === "links" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-blue-50 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Verificador de Links em Tempo Real</h3>
              <p className="text-gray-700 mb-4">
                Cole um link para verificar se é seguro. Detectamos phishing, malware e sites fraudulentos.
              </p>

              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={linkToCheck}
                  onChange={(e) => setLinkToCheck(e.target.value)}
                  placeholder="Cole a URL aqui (ex: https://exemplo.com)"
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={checkLink}
                  disabled={isChecking}
                  className="px-6 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isChecking ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar"
                  )}
                </button>
              </div>

              {linkResult && (
                <div
                  className={`p-6 rounded-xl border-2 ${
                    linkResult.safe
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {linkResult.safe ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-2">
                        {getThreatInfo(linkResult.threat).icon} {getThreatInfo(linkResult.threat).name}
                      </p>
                      <p className="text-sm text-gray-700 mb-2">{getThreatInfo(linkResult.threat).description}</p>
                      <p className="text-xs text-gray-600 break-all mb-2">URL: {linkResult.url}</p>
                      {linkResult.details && (
                        <p className="text-xs text-gray-600 mb-2">Detalhes: {linkResult.details}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Confiança: {linkResult.confidence}%</span>
                        <span>•</span>
                        <span>{linkResult.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Histórico de Verificações */}
            {checkHistory.length > 0 && (
              <div className="p-6 rounded-xl bg-gray-50 border-2 border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">📋 Histórico de Verificações</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {checkHistory.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg bg-white border border-gray-200 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="break-all text-gray-700">{item.url}</span>
                        {item.safe ? (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dicas de Segurança */}
            <div className="p-6 rounded-xl bg-purple-50 border-2 border-purple-200">
              <h4 className="font-bold text-gray-900 mb-3">💡 Dicas para Não Cair em Phishing</h4>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Sempre verifique a URL antes de clicar — procure por "https://" e o cadeado</li>
                <li>✓ Desconfie de emails pedindo para "confirmar dados" ou "atualizar informações"</li>
                <li>✓ Nunca clique em links de emails suspeitos — acesse o site digitando a URL manualmente</li>
                <li>✓ Use um gerenciador de senhas para não digitar senhas em sites falsos</li>
              </ul>
            </div>
          </div>
        )}

        {/* ABA: EDUCAÇÃO */}
        {activeTab === "education" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {EDUCATION_TIPS.map((tip) => (
                <div key={tip.id} className="p-6 rounded-xl bg-white border-2 border-gray-200 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{tip.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{tip.title}</h4>
                      <p className="text-xs text-gray-500">{tip.category}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{tip.description}</p>
                  <p className="text-xs text-gray-500">Publicado em {tip.date}</p>
                </div>
              ))}
            </div>

            {/* Notificações Semanais */}
            <div className="p-6 rounded-xl bg-green-50 border-2 border-green-200">
              <h4 className="font-bold text-gray-900 mb-3">📬 Receber Dicas Semanais</h4>
              <p className="text-gray-700 mb-4">
                Ative notificações para receber dicas de segurança toda semana e ficar protegido contra novos tipos de fraudes.
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
                <span className="font-semibold text-gray-900">Receber notificações de segurança</span>
              </label>
            </div>

            {/* Quiz de Segurança */}
            <div className="p-6 rounded-xl bg-blue-50 border-2 border-blue-200">
              <h4 className="font-bold text-gray-900 mb-3">🎯 Quiz: Teste Seus Conhecimentos</h4>
              <p className="text-gray-700 mb-4">
                Responda 5 perguntas rápidas sobre segurança financeira e descubra seu nível de proteção contra fraudes.
              </p>
              <button className="px-6 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all">
                Iniciar Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
