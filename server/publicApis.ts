/**
 * Public APIs Integration — Lume
 * Integração com APIs públicas: IBGE, Banco Central, brapi.dev, CoinGecko
 * Fornece dados econômicos, cotações e indicadores financeiros
 */

// ============================================================================
// TIPOS
// ============================================================================

export interface EconomicIndicator {
  name: string;
  value: number;
  unit: string;
  date: string;
  source: "IBGE" | "BCB";
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  date: string;
}

export interface CryptoPrice {
  symbol: string;
  price: number;
  priceUSD: number;
  change24h: number;
  date: string;
}

export interface ExchangeRate {
  currency: string;
  buyRate: number;
  sellRate: number;
  date: string;
}

// Cache simples em memória (TTL em segundos)
const cache = new Map<string, { data: unknown; expiry: number }>();

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiry) {
    cache.delete(key);
    return null;
  }
  return cached.data as T;
}

function setCached<T>(key: string, data: T, ttlSeconds: number): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

// ============================================================================
// IBGE - Dados Econômicos
// ============================================================================

/**
 * Busca IPCA (Inflação) do IBGE
 * API: https://servicodados.ibge.gov.br/api/docs/agregados
 */
export async function getIPCA(): Promise<EconomicIndicator | null> {
  const cacheKey = "ibge_ipca";
  const cached = getCached<EconomicIndicator>(cacheKey);
  if (cached) return cached;

  try {
    // IPCA - Índice Nacional de Preços ao Consumidor Amplo
    // Tabela 1737 - IPCA mensal
    const response = await fetch(
      "https://servicodados.ibge.gov.br/api/v3/agregados/1737/periodos/-1/variavel/2063?formato=json"
    );

    if (!response.ok) throw new Error(`IBGE API error: ${response.status}`);

    const data = (await response.json()) as any;

    if (!data || !data[0] || !data[0].resultados) {
      return null;
    }

    const resultado = data[0].resultados[0];
    const series = resultado.series[0];

    if (!series || !series.dados || series.dados.length === 0) {
      return null;
    }

    const latestData = series.dados[0];
    const [value, date] = latestData;

    const indicator: EconomicIndicator = {
      name: "IPCA",
      value: parseFloat(value),
      unit: "%",
      date: date,
      source: "IBGE",
    };

    setCached(cacheKey, indicator, 24 * 60 * 60); // Cache 24h
    return indicator;
  } catch (error) {
    console.error("Error fetching IPCA:", error);
    return null;
  }
}

/**
 * Busca PIB do IBGE
 */
export async function getPIB(): Promise<EconomicIndicator | null> {
  const cacheKey = "ibge_pib";
  const cached = getCached<EconomicIndicator>(cacheKey);
  if (cached) return cached;

  try {
    // PIB - Produto Interno Bruto
    // Tabela 1621 - PIB trimestral
    const response = await fetch(
      "https://servicodados.ibge.gov.br/api/v3/agregados/1621/periodos/-1/variavel/9318?formato=json"
    );

    if (!response.ok) throw new Error(`IBGE API error: ${response.status}`);

    const data = (await response.json()) as any;

    if (!data || !data[0] || !data[0].resultados) {
      return null;
    }

    const resultado = data[0].resultados[0];
    const series = resultado.series[0];

    if (!series || !series.dados || series.dados.length === 0) {
      return null;
    }

    const latestData = series.dados[0];
    const [value, date] = latestData;

    const indicator: EconomicIndicator = {
      name: "PIB",
      value: parseFloat(value),
      unit: "bilhões R$",
      date: date,
      source: "IBGE",
    };

    setCached(cacheKey, indicator, 24 * 60 * 60);
    return indicator;
  } catch (error) {
    console.error("Error fetching PIB:", error);
    return null;
  }
}

// ============================================================================
// BANCO CENTRAL - Indicadores Financeiros
// ============================================================================

/**
 * Busca Taxa SELIC do Banco Central
 * API: https://dadosabertos.bcb.gov.br/
 */
export async function getSELIC(): Promise<EconomicIndicator | null> {
  const cacheKey = "bcb_selic";
  const cached = getCached<EconomicIndicator>(cacheKey);
  if (cached) return cached;

  try {
    // SELIC - Sistema Especial de Liquidação e de Custódia
    const response = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/1?formato=json"
    );

    if (!response.ok) throw new Error(`BCB API error: ${response.status}`);

    const data = (await response.json()) as any;

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const latest = data[0];

    const indicator: EconomicIndicator = {
      name: "SELIC",
      value: parseFloat(latest.valor),
      unit: "% a.a.",
      date: latest.data,
      source: "BCB",
    };

    setCached(cacheKey, indicator, 24 * 60 * 60);
    return indicator;
  } catch (error) {
    console.error("Error fetching SELIC:", error);
    return null;
  }
}

/**
 * Busca Taxa CDI do Banco Central
 */
export async function getCDI(): Promise<EconomicIndicator | null> {
  const cacheKey = "bcb_cdi";
  const cached = getCached<EconomicIndicator>(cacheKey);
  if (cached) return cached;

  try {
    // CDI - Certificado de Depósito Interbancário
    const response = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/1?formato=json"
    );

    if (!response.ok) throw new Error(`BCB API error: ${response.status}`);

    const data = (await response.json()) as any;

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const latest = data[0];

    const indicator: EconomicIndicator = {
      name: "CDI",
      value: parseFloat(latest.valor),
      unit: "% a.a.",
      date: latest.data,
      source: "BCB",
    };

    setCached(cacheKey, indicator, 24 * 60 * 60);
    return indicator;
  } catch (error) {
    console.error("Error fetching CDI:", error);
    return null;
  }
}

/**
 * Busca Cotação do Dólar do Banco Central
 */
export async function getExchangeRate(): Promise<ExchangeRate | null> {
  const cacheKey = "bcb_usd";
  const cached = getCached<ExchangeRate>(cacheKey);
  if (cached) return cached;

  try {
    // Dólar comercial - venda
    const response = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/1?formato=json"
    );

    if (!response.ok) throw new Error(`BCB API error: ${response.status}`);

    const data = (await response.json()) as any;

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const latest = data[0];

    const rate: ExchangeRate = {
      currency: "USD",
      buyRate: parseFloat(latest.valor) * 0.98, // Aproximação
      sellRate: parseFloat(latest.valor),
      date: latest.data,
    };

    setCached(cacheKey, rate, 6 * 60 * 60); // Cache 6h
    return rate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
}

// ============================================================================
// BRAPI.DEV - Cotações de Ações
// ============================================================================

/**
 * Busca cotação de ação na B3 via brapi.dev
 * Requer API Key (gratuita em https://brapi.dev/)
 */
export async function getStockQuote(
  symbol: string,
  apiKey?: string
): Promise<StockQuote | null> {
  if (!apiKey) {
    console.warn("brapi.dev API key not provided");
    return null;
  }

  const cacheKey = `brapi_${symbol}`;
  const cached = getCached<StockQuote>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://brapi.dev/api/quote/${symbol}?token=${apiKey}`
    );

    if (!response.ok) throw new Error(`brapi API error: ${response.status}`);

    const data = (await response.json()) as any;

    if (!data || !data.results || data.results.length === 0) {
      return null;
    }

    const quote = data.results[0];

    const stockQuote: StockQuote = {
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      date: new Date().toISOString().split("T")[0],
    };

    setCached(cacheKey, stockQuote, 60 * 60); // Cache 1h
    return stockQuote;
  } catch (error) {
    console.error(`Error fetching stock quote for ${symbol}:`, error);
    return null;
  }
}

// ============================================================================
// COINGECKO - Criptomoedas
// ============================================================================

/**
 * Busca preço de criptomoeda via CoinGecko
 * API pública, sem chave necessária
 */
export async function getCryptoPrice(
  cryptoId: string = "bitcoin"
): Promise<CryptoPrice | null> {
  const cacheKey = `coingecko_${cryptoId}`;
  const cached = getCached<CryptoPrice>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=brl,usd&include_24hr_change=true`
    );

    if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);

    const data = (await response.json()) as any;

    if (!data || !data[cryptoId]) {
      return null;
    }

    const cryptoData = data[cryptoId];

    const cryptoPrice: CryptoPrice = {
      symbol: cryptoId.toUpperCase(),
      price: cryptoData.brl,
      priceUSD: cryptoData.usd,
      change24h: cryptoData.brl_24h_change,
      date: new Date().toISOString().split("T")[0],
    };

    setCached(cacheKey, cryptoPrice, 60 * 60); // Cache 1h
    return cryptoPrice;
  } catch (error) {
    console.error(`Error fetching crypto price for ${cryptoId}:`, error);
    return null;
  }
}

// ============================================================================
// VALIDAÇÃO - CPF/CNPJ
// ============================================================================

/**
 * Valida CPF usando algoritmo de verificação
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, "");

  // CPF deve ter 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  // Verifica se os dígitos verificadores estão corretos
  return (
    parseInt(cleanCPF[9]) === firstDigit &&
    parseInt(cleanCPF[10]) === secondDigit
  );
}

/**
 * Valida CNPJ usando algoritmo de verificação
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, "");

  // CNPJ deve ter 14 dígitos
  if (cleanCNPJ.length !== 14) return false;

  // Verifica se todos os dígitos são iguais (CNPJ inválido)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  // Calcula primeiro dígito verificador
  let sum = 0;
  const multipliers1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ[i]) * multipliers1[i];
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  // Calcula segundo dígito verificador
  sum = 0;
  const multipliers2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ[i]) * multipliers2[i];
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  // Verifica se os dígitos verificadores estão corretos
  return (
    parseInt(cleanCNPJ[12]) === firstDigit &&
    parseInt(cleanCNPJ[13]) === secondDigit
  );
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Busca todos os indicadores econômicos principais
 */
export async function getAllEconomicIndicators(): Promise<{
  ipca: EconomicIndicator | null;
  pib: EconomicIndicator | null;
  selic: EconomicIndicator | null;
  cdi: EconomicIndicator | null;
  usd: ExchangeRate | null;
}> {
  const [ipca, pib, selic, cdi, usd] = await Promise.all([
    getIPCA(),
    getPIB(),
    getSELIC(),
    getCDI(),
    getExchangeRate(),
  ]);

  return { ipca, pib, selic, cdi, usd };
}

/**
 * Busca múltiplas cotações de ações
 */
export async function getMultipleStockQuotes(
  symbols: string[],
  apiKey?: string
): Promise<StockQuote[]> {
  const quotes = await Promise.all(
    symbols.map((symbol) => getStockQuote(symbol, apiKey))
  );
  return quotes.filter((q) => q !== null) as StockQuote[];
}

/**
 * Busca múltiplas criptomoedas
 */
export async function getMultipleCryptoPrices(
  cryptoIds: string[]
): Promise<CryptoPrice[]> {
  const prices = await Promise.all(cryptoIds.map((id) => getCryptoPrice(id)));
  return prices.filter((p) => p !== null) as CryptoPrice[];
}
