import React, { useState } from "react";
import { Search, CheckCircle, AlertTriangle, XCircle, TrendingUp, Users, Target } from "lucide-react";
import { toast } from "sonner";
import { useTrustVerification } from "@/hooks/useTrustVerification";

export default function TrustVerification() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, loading, error, searchCompany, clearData } = useTrustVerification();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Digite um nome ou URL para buscar");
      return;
    }
    searchCompany(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery("");
    clearData();
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
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Exemplos: amazon.com.br, mercadolivre.com.br, aliexpress.com
          </p>
        </div>

        {/* Mensagens de Status */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">{error}</p>
          </div>
        )}

        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-sm text-blue-600 font-semibold">Buscando dados de confiabilidade...</p>
          </div>
        )}

        {/* Resultado da Busca */}
        {data && !loading && (
          <div className={`p-8 rounded-xl border-2 ${getReputationColor(data.reputation)}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Esquerda: Informações Principais */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  {getReputationIcon(data.reputation)}
                  <div>
                    <h3 className="text-3xl font-bold">{data.name}</h3>
                    <p className="text-sm mt-1">
                      Fonte: <span className="font-semibold">{data.source.toUpperCase()}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Reputação */}
                  <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Reputação Geral</p>
                    <p className="text-2xl font-bold">
                      {getReputationLabel(data.reputation)}
                    </p>
                  </div>

                  {/* Nota */}
                  <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Nota do Consumidor</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold">{data.score.toFixed(1)}</p>
                      <p className="text-gray-600">/10</p>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          data.score >= 8
                            ? "bg-green-500"
                            : data.score >= 6
                            ? "bg-blue-600"
                            : data.score >= 4
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${(data.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Última Atualização */}
                  <p className="text-xs text-gray-600">
                    Última atualização: {data.lastUpdate}
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
                      {data.resolutionIndex}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Percentual de problemas resolvidos pela empresa
                  </p>
                  <div className="w-full bg-gray-300 rounded-full h-3 mt-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${data.resolutionIndex}%` }}
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
                      {data.wouldDoBusiness}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Percentual de consumidores que recomendariam
                  </p>
                  <div className="w-full bg-gray-300 rounded-full h-3 mt-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full"
                      style={{ width: `${data.wouldDoBusiness}%` }}
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
                    {data.complaints.map((complaint, idx) => (
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
              {data.reputation === "excellent" || data.reputation === "good" ? (
                <p className="text-green-700">
                  ✅ Esta empresa tem boa reputação. É seguro fazer negócios, mas sempre fique atento aos termos e condições.
                </p>
              ) : data.reputation === "regular" ? (
                <p className="text-yellow-700">
                  ⚠️ Esta empresa tem reputação regular. Proceda com cautela e verifique bem antes de fazer negócios.
                </p>
              ) : (
                <p className="text-red-700">
                  ❌ Esta empresa NÃO é recomendada. Evite fazer negócios com ela. Se já teve problemas, reporte no Reclame Aqui.
                </p>
              )}
            </div>

            {/* Botão Limpar */}
            <div className="mt-6">
              <button
                onClick={handleClear}
                className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Limpar Busca
              </button>
            </div>
          </div>
        )}

        {!data && !loading && searchQuery && (
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-600">Nenhuma empresa encontrada. Tente outro nome.</p>
          </div>
        )}
      </div>
    </section>
  );
}
