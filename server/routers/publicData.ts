/**
 * Public Data Router — Lume
 * Procedimentos tRPC para acessar dados de APIs públicas
 */

import { publicProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getIPCA,
  getPIB,
  getSELIC,
  getCDI,
  getExchangeRate,
  getCryptoPrice,
  getStockQuote,
  getMultipleCryptoPrices,
  getAllEconomicIndicators,
  validateCPF,
  validateCNPJ,
} from "../publicApis";

export const publicDataRouter = {
  /**
   * Busca todos os indicadores econômicos principais
   */
  economicIndicators: publicProcedure.query(async () => {
    return await getAllEconomicIndicators();
  }),

  /**
   * Busca IPCA (Inflação) do IBGE
   */
  ipca: publicProcedure.query(async () => {
    return await getIPCA();
  }),

  /**
   * Busca PIB do IBGE
   */
  pib: publicProcedure.query(async () => {
    return await getPIB();
  }),

  /**
   * Busca Taxa SELIC do Banco Central
   */
  selic: publicProcedure.query(async () => {
    return await getSELIC();
  }),

  /**
   * Busca Taxa CDI do Banco Central
   */
  cdi: publicProcedure.query(async () => {
    return await getCDI();
  }),

  /**
   * Busca Cotação do Dólar do Banco Central
   */
  exchangeRate: publicProcedure.query(async () => {
    return await getExchangeRate();
  }),

  /**
   * Busca preço de criptomoeda
   */
  cryptoPrice: publicProcedure
    .input(
      z.object({
        cryptoId: z.string().default("bitcoin"),
      })
    )
    .query(async ({ input }) => {
      return await getCryptoPrice(input.cryptoId);
    }),

  /**
   * Busca múltiplos preços de criptomoedas
   */
  multipleCryptoPrices: publicProcedure
    .input(
      z.object({
        cryptoIds: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      return await getMultipleCryptoPrices(input.cryptoIds);
    }),

  /**
   * Busca cotação de ação na B3
   */
  stockQuote: publicProcedure
    .input(
      z.object({
        symbol: z.string(),
        apiKey: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getStockQuote(input.symbol, input.apiKey);
    }),

  /**
   * Valida CPF
   */
  validateCPF: publicProcedure
    .input(
      z.object({
        cpf: z.string(),
      })
    )
    .query(({ input }) => {
      return {
        cpf: input.cpf,
        isValid: validateCPF(input.cpf),
      };
    }),

  /**
   * Valida CNPJ
   */
  validateCNPJ: publicProcedure
    .input(
      z.object({
        cnpj: z.string(),
      })
    )
    .query(({ input }) => {
      return {
        cnpj: input.cnpj,
        isValid: validateCNPJ(input.cnpj),
      };
    }),
};
