import React, { useState } from "react";
import { Search, CheckCircle, AlertTriangle, XCircle, TrendingUp, Users, Target } from "lucide-react";
import { toast } from "sonner";

interface CompanyReview {
  name: string;
  reputation: "excellent" | "good" | "regular" | "bad" | "notRecommended";
  score: number;
  resolutionIndex: number;
  wouldDoBusiness: number;
  complaints: string[];
  status: "active" | "inactive";
  lastUpdate: string;
}

const MOCK_COMPANIES: { [key: string]: CompanyReview } = {
  "amazon.com.br": {
    name: "Amazon Brasil",
    reputation: "excellent",
    score: 8.5,
    resolutionIndex: 92,
    wouldDoBusiness: 88,
    complaints: ["Atraso na entrega", "Produto diferente do anúncio"],
    status: "active",
    lastUpdate: "2025-04-29",
  },
  "mercadolivre.com.br": {
    name: "Mercado Livre",
    reputation: "good",
    score: 7.8,
    resolutionIndex: 85,
    wouldDoBusiness: 82,
    complaints: ["Vendedor não responde", "Produto com defeito"],
    status: "active",
    lastUpdate: "2025-04-29",
  },
  "aliexpress.com": {
    name: "AliExpress",
    reputation: "regular",
    score: 6.2,
    resolutionIndex: 65,
    wouldDoBusiness: 58,
    complaints: ["Demora na entrega", "Qualidade inferior", "Dificuldade em reembolso"],
    status: "active",
    lastUpdate: "2025-04-28",
  },
  "exemplo-fraude.com": {
    name: "Exemplo Fraude",
    reputation: "notRecommended",
    score: 1.5,
    resolutionIndex: 5,
    wouldDoBusiness: 2,
    complaints: ["Fraude", "Roubo de dados", "Não entrega produto", "Não reembolsa"],
    status: "inactive",
    lastUpdate: "2025-04-20",
  },
};

export default function TrustVerification() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyReview | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Digite um nome ou URL para buscar");
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const company = Object.values(MOCK_COMPANIES).find(
        (c) => c.name.toLowerCase().includes(query) || query.includes(c.name.toLowerCase())
      );

      if (company) {
        setSelectedCompany(company);
        toast.success(`Informações de ${company.name} carregadas!`);
      } else {
        toast.error("Empresa não encontrada no Reclame Aqui");
        setSelectedCompany(null);
      }
      setIsSearching(false);
    }, 1000);
  };

  const getReputationColor = (reputation: string) => {
    switch (reputation) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200";
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "regular":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "bad":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "notRecommended":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getReputationLabel = (reputation: string) => {
    switch (reputation) {
      case "excellent":
        return "Excelente";
      case "good":
        return "Bom";
      case "regular":
        return "Regular";
      case "bad":
        return "Ruim";
      case "notRecommended":
        return "Não Recomendada";
      default:
        return "Desconhecido";
    }
  };

  const getReputationIcon = (reputation: string) => {
    switch (reputation) {
      case "excellent":
      case "good":
        return <CheckCircle className="w-8 h-8" />;
      case "regular":
        return <AlertTriangle className="w-8 h-8" />;
      case "bad":
      case "notRecommended":
        return <XCircle className="w-8 h-8" />;
      default:
        return <AlertTriangle className="w-8 h-8" />;
    }
  };

  return (
    <section id="trust-verification" className="py-16 bg-white">
      <div className="container mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Search className="w-8 h-8 text-blue-600" />
            Verificador de Confiabilidade
          </h2>
          <p className="text-gray-600">
            Verifique a reputação de empresas e sites no Reclame Aqui antes de fazer negócios
          </p>
        </div>

        {/* Barra de Busca */}
        <div className="mb-12">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Digite o nome da empresa ou URL (ex: amazon.com.br)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
            >
              {isSearching ? "Buscando..." : "Buscar"}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Exemplos: amazon.com.br, mercadolivre.com.br, aliexpress.com
          </p>
        </div>

        {/* Resultado da Busca */}
        {selectedCompany && (
          <div className={`p-8 rounded-xl border-2 ${getReputationColor(selectedCompany.reputation)}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Esquerda: Informações Principais */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  {getReputationIcon(selectedCompany.reputation)}
                  <div>
                    <h3 className="text-3xl font-bold">{selectedCompany.name}</h3>
                    <p className="text-sm mt-1">
                      Status: <span className="font-semibold">
                        {selectedCompany.status === "active" ? "✅ Ativa" : "❌ Desativada"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Reputação */}
                  <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Reputação Geral</p>
                    <p className="text-2xl font-bold">
                      {getReputationLabel(selectedCompany.reputation)}
                    </p>
                  </div>

                  {/* Nota */}
                  <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Nota do Consumidor</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold">{selectedCompany.score.toFixed(1)}</p>
                      <p className="text-gray-600">/10</p>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(selectedCompany.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Última Atualização */}
                  <p className="text-xs text-gray-600">
                    Última atualização: {new Date(selectedCompany.lastUpdate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              {/* Direita: Métricas */}
              <div className="space-y-4">
                {/* Índice de Solução */}
                <div className="bg-white bg-opacity-60 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-700 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Índice de Solução
                    </p>
                    <span className="text-2xl font-bold text-green-600">
                      {selectedCompany.resolutionIndex}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Percentual de problemas resolvidos pela empresa
                  </p>
                  <div className="w-full bg-gray-300 rounded-full h-3 mt-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${selectedCompany.resolutionIndex}%` }}
                    />
                  </div>
                </div>

                {/* Voltaria a Fazer Negócio */}
                <div className="bg-white bg-opacity-60 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-700 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Voltaria a Fazer Negócio
                    </p>
                    <span className="text-2xl font-bold text-purple-600">
                      {selectedCompany.wouldDoBusiness}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Percentual de consumidores que recomendariam
                  </p>
                  <div className="w-full bg-gray-300 rounded-full h-3 mt-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full"
                      style={{ width: `${selectedCompany.wouldDoBusiness}%` }}
                    />
                  </div>
                </div>

                {/* Principais Reclamações */}
                <div className="bg-white bg-opacity-60 p-6 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Principais Reclamações
                  </p>
                  <ul className="space-y-2">
                    {selectedCompany.complaints.map((complaint, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {complaint}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recomendação Final */}
            <div className="mt-8 p-6 bg-white bg-opacity-80 rounded-lg border-l-4 border-blue-600">
              <p className="font-bold text-gray-900 mb-2">💡 Recomendação:</p>
              {selectedCompany.reputation === "excellent" || selectedCompany.reputation === "good" ? (
                <p className="text-green-700">
                  ✅ Esta empresa tem boa reputação. É seguro fazer negócios, mas sempre fique atento aos termos e condições.
                </p>
              ) : selectedCompany.reputation === "regular" ? (
                <p className="text-yellow-700">
                  ⚠️ Esta empresa tem reputação regular. Proceda com cautela e verifique bem antes de fazer transações.
                </p>
              ) : (
                <p className="text-red-700">
                  ❌ Esta empresa tem reputação ruim ou não é recomendada. Evite fazer negócios ou procure alternativas.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Empresas Sugeridas */}
        {!selectedCompany && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(MOCK_COMPANIES).map((company) => (
              <button
                key={company.name}
                onClick={() => {
                  setSelectedCompany(company);
                  setSearchQuery(company.name);
                }}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-lg ${getReputationColor(company.reputation)}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getReputationIcon(company.reputation)}
                  <h4 className="font-bold">{company.name}</h4>
                </div>
                <p className="text-sm mb-2">Nota: {company.score.toFixed(1)}/10</p>
                <p className="text-xs">
                  {getReputationLabel(company.reputation)}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-3">ℹ️ Como usar o Verificador:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Digite o nome da empresa ou URL na barra de busca</li>
            <li>✓ Verifique a reputação geral e nota do consumidor</li>
            <li>✓ Analise o índice de solução e percentual de recomendação</li>
            <li>✓ Leia as principais reclamações para identificar problemas comuns</li>
            <li>✓ Use as recomendações para tomar decisões informadas</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
