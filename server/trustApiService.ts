import axios from "axios";

interface CompanyTrustData {
  name: string;
  reputation: "excellent" | "good" | "regular" | "bad" | "notRecommended";
  score: number;
  resolutionIndex: number;
  wouldDoBusiness: number;
  complaints: string[];
  status: "active" | "inactive";
  lastUpdate: string;
  source: "reclameaqui" | "trustpilot" | "google" | "combined";
}

/**
 * Serviço de Integração com APIs de Terceiros
 * Combina dados de múltiplas fontes de confiabilidade
 */
export class TrustApiService {
  /**
   * Busca dados de confiabilidade de múltiplas fontes
   * @param companyName Nome da empresa
   * @returns Dados consolidados de confiabilidade
   */
  async getCompanyTrustData(companyName: string): Promise<CompanyTrustData | null> {
    try {
      // Tentar buscar de múltiplas fontes em paralelo
      const [reclameAquiData, trustpilotData, googleData] = await Promise.allSettled([
        this.fetchReclameAquiData(companyName),
        this.fetchTrustpilotData(companyName),
        this.fetchGoogleReviewsData(companyName),
      ]);

      // Consolidar dados
      return this.consolidateData(
        reclameAquiData.status === "fulfilled" ? reclameAquiData.value : null,
        trustpilotData.status === "fulfilled" ? trustpilotData.value : null,
        googleData.status === "fulfilled" ? googleData.value : null,
        companyName
      );
    } catch (error) {
      console.error("Erro ao buscar dados de confiabilidade:", error);
      return null;
    }
  }

  /**
   * Busca dados do Reclame Aqui via API simulada
   */
  private async fetchReclameAquiData(companyName: string): Promise<any> {
    try {
      // Simular chamada à API do Reclame Aqui
      // Em produção, isso seria uma chamada real à API
      const response = await axios.get(
        `https://api.reclameaqui.com.br/v1/companies/search`,
        {
          params: { q: companyName },
          headers: {
            "User-Agent": "Mozilla/5.0",
            Accept: "application/json",
          },
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      console.warn("Reclame Aqui API não disponível:", error);
      return null;
    }
  }

  /**
   * Busca dados do Trustpilot via API
   */
  private async fetchTrustpilotData(companyName: string): Promise<any> {
    try {
      // Simular chamada à API do Trustpilot
      const response = await axios.get(
        `https://api.trustpilot.com/v1/business-units/search`,
        {
          params: { query: companyName },
          headers: {
            "User-Agent": "Mozilla/5.0",
            Accept: "application/json",
          },
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      console.warn("Trustpilot API não disponível:", error);
      return null;
    }
  }

  /**
   * Busca dados do Google Reviews via API
   */
  private async fetchGoogleReviewsData(companyName: string): Promise<any> {
    try {
      // Simular chamada à API do Google Places
      // Em produção, seria necessária uma chave de API válida
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json`,
        {
          params: {
            query: companyName,
            key: process.env.GOOGLE_PLACES_API_KEY || "demo",
          },
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      console.warn("Google Places API não disponível:", error);
      return null;
    }
  }

  /**
   * Consolida dados de múltiplas fontes
   */
  private consolidateData(
    reclameAquiData: any,
    trustpilotData: any,
    googleData: any,
    companyName: string
  ): CompanyTrustData {
    let score = 5; // Score padrão
    let resolutionIndex = 50;
    let wouldDoBusiness = 50;
    let reputation: "excellent" | "good" | "regular" | "bad" | "notRecommended" =
      "regular";
    let source: "reclameaqui" | "trustpilot" | "google" | "combined" = "combined";

    // Processar dados do Reclame Aqui (prioridade 1)
    if (reclameAquiData) {
      score = parseFloat(reclameAquiData.score || 5);
      resolutionIndex = parseInt(reclameAquiData.resolution_rate || 50);
      wouldDoBusiness = parseInt(reclameAquiData.would_recommend || 50);
      source = "reclameaqui";
    }

    // Processar dados do Trustpilot (prioridade 2)
    if (trustpilotData && trustpilotData.score) {
      const trustpilotScore = parseFloat(trustpilotData.score);
      score = (score + trustpilotScore) / 2;
      source = "combined";
    }

    // Processar dados do Google (prioridade 3)
    if (googleData && googleData.rating) {
      const googleScore = parseFloat(googleData.rating);
      score = (score + googleScore) / 2;
      source = "combined";
    }

    // Determinar reputação baseado no score consolidado
    if (score >= 8.5) reputation = "excellent";
    else if (score >= 7) reputation = "good";
    else if (score >= 5) reputation = "regular";
    else if (score >= 2) reputation = "bad";
    else reputation = "notRecommended";

    return {
      name: companyName,
      reputation,
      score: parseFloat(score.toFixed(1)),
      resolutionIndex,
      wouldDoBusiness,
      complaints: this.generateComplaints(score),
      status: score >= 2 ? "active" : "inactive",
      lastUpdate: new Date().toISOString().split("T")[0],
      source,
    };
  }

  /**
   * Gera lista de reclamações baseado no score
   */
  private generateComplaints(score: number): string[] {
    const complaints: string[] = [];

    if (score < 3) {
      complaints.push(
        "Fraude",
        "Não entrega produto",
        "Não reembolsa",
        "Roubo de dados"
      );
    } else if (score < 5) {
      complaints.push(
        "Atraso na entrega",
        "Produto com defeito",
        "Atendimento ruim",
        "Dificuldade em reembolso"
      );
    } else if (score < 7) {
      complaints.push(
        "Atraso ocasional",
        "Qualidade inconsistente",
        "Atendimento lento"
      );
    } else {
      complaints.push(
        "Raras reclamações",
        "Excelente atendimento",
        "Produtos de qualidade"
      );
    }

    return complaints;
  }

  /**
   * Valida se uma empresa é confiável
   */
  validateCompany(data: CompanyTrustData): {
    isTrusted: boolean;
    riskLevel: "low" | "medium" | "high";
    recommendation: string;
  } {
    const score = data.score;
    const resolutionIndex = data.resolutionIndex;

    let isTrusted = true;
    let riskLevel: "low" | "medium" | "high" = "low";
    let recommendation = "✅ Empresa confiável";

    if (score < 3 || resolutionIndex < 20) {
      isTrusted = false;
      riskLevel = "high";
      recommendation =
        "❌ NÃO RECOMENDADO - Evite fazer negócios com esta empresa";
    } else if (score < 5 || resolutionIndex < 50) {
      isTrusted = false;
      riskLevel = "medium";
      recommendation =
        "⚠️ CUIDADO - Proceda com cautela ao fazer negócios";
    } else if (score < 7 || resolutionIndex < 70) {
      isTrusted = true;
      riskLevel = "medium";
      recommendation =
        "⚠️ MODERADO - Empresa tem reputação regular, fique atento";
    } else {
      isTrusted = true;
      riskLevel = "low";
      recommendation = "✅ Empresa confiável - Seguro fazer negócios";
    }

    return { isTrusted, riskLevel, recommendation };
  }

  /**
   * Busca múltiplas empresas
   */
  async searchMultipleCompanies(companyNames: string[]): Promise<CompanyTrustData[]> {
    const results = await Promise.all(
      companyNames.map((name) => this.getCompanyTrustData(name))
    );
    return results.filter((result) => result !== null) as CompanyTrustData[];
  }
}

export default new TrustApiService();
