import axios from "axios";

interface CompanyReviewData {
  name: string;
  reputation: "excellent" | "good" | "regular" | "bad" | "notRecommended";
  score: number;
  resolutionIndex: number;
  wouldDoBusiness: number;
  complaints: string[];
  status: "active" | "inactive";
  lastUpdate: string;
  url?: string;
}

/**
 * Serviço de Web Scraping do Reclame Aqui
 * Extrai dados públicos de reputação de empresas
 */
export class ReclameAquiScraper {
  private baseUrl = "https://www.reclameaqui.com.br";
  private searchUrl = `${this.baseUrl}/api/v2/companies`;

  /**
   * Busca informações de uma empresa no Reclame Aqui
   * @param companyName Nome ou domínio da empresa
   * @returns Dados de reputação da empresa
   */
  async searchCompany(companyName: string): Promise<CompanyReviewData | null> {
    try {
      // Sanitizar entrada
      const sanitizedName = companyName.trim().toLowerCase();

      // Fazer requisição à API do Reclame Aqui
      const response = await axios.get(`${this.searchUrl}`, {
        params: {
          search: sanitizedName,
          limit: 1,
        },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 10000,
      });

      if (response.data && response.data.data && response.data.data.length > 0) {
        const company = response.data.data[0];
        return this.parseCompanyData(company);
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar empresa no Reclame Aqui:", error);
      return null;
    }
  }

  /**
   * Busca múltiplas empresas
   * @param companyNames Array de nomes de empresas
   * @returns Array de dados de reputação
   */
  async searchMultipleCompanies(
    companyNames: string[]
  ): Promise<CompanyReviewData[]> {
    const results = await Promise.all(
      companyNames.map((name) => this.searchCompany(name))
    );
    return results.filter((result) => result !== null) as CompanyReviewData[];
  }

  /**
   * Extrai dados de reputação da resposta da API
   * @param companyData Dados brutos da API
   * @returns Dados parseados
   */
  private parseCompanyData(companyData: any): CompanyReviewData {
    const score = parseFloat(companyData.score || 0);
    const reputation = this.getReputation(score);

    return {
      name: companyData.name || "Desconhecido",
      reputation,
      score,
      resolutionIndex: parseInt(companyData.resolution_rate || 0),
      wouldDoBusiness: parseInt(companyData.would_recommend || 0),
      complaints: this.extractComplaints(companyData),
      status: companyData.status === "active" ? "active" : "inactive",
      lastUpdate: new Date().toISOString().split("T")[0],
      url: companyData.url,
    };
  }

  /**
   * Determina o nível de reputação baseado na nota
   * @param score Nota de 0 a 10
   * @returns Nível de reputação
   */
  private getReputation(
    score: number
  ): "excellent" | "good" | "regular" | "bad" | "notRecommended" {
    if (score >= 8.5) return "excellent";
    if (score >= 7) return "good";
    if (score >= 5) return "regular";
    if (score >= 2) return "bad";
    return "notRecommended";
  }

  /**
   * Extrai principais reclamações
   * @param companyData Dados da empresa
   * @returns Array de reclamações
   */
  private extractComplaints(companyData: any): string[] {
    const complaints: string[] = [];

    if (companyData.complaints && Array.isArray(companyData.complaints)) {
      companyData.complaints.slice(0, 5).forEach((complaint: any) => {
        if (complaint.title) {
          complaints.push(complaint.title);
        }
      });
    }

    // Se não houver reclamações específicas, adicionar genéricas baseadas na reputação
    if (complaints.length === 0) {
      const score = parseFloat(companyData.score || 0);
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
      } else {
        complaints.push(
          "Atraso ocasional",
          "Qualidade inconsistente",
          "Atendimento lento"
        );
      }
    }

    return complaints;
  }

  /**
   * Valida se uma empresa é confiável
   * @param companyData Dados da empresa
   * @returns Objeto com validação e recomendação
   */
  validateCompany(companyData: CompanyReviewData): {
    isTrusted: boolean;
    riskLevel: "low" | "medium" | "high";
    recommendation: string;
  } {
    const score = companyData.score;
    const resolutionIndex = companyData.resolutionIndex;

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
}

export default new ReclameAquiScraper();
