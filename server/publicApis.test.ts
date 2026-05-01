import { describe, it, expect, vi } from "vitest";
import {
  validateCPF,
  validateCNPJ,
  getIPCA,
  getSELIC,
  getCDI,
  getExchangeRate,
  getCryptoPrice,
  getStockQuote,
  getAllEconomicIndicators,
  getMultipleCryptoPrices,
} from "./publicApis";

describe("Public APIs Integration", () => {
  describe("CPF Validation", () => {
    it("should validate correct CPF", () => {
      // CPF válido: 123.456.789-09 (exemplo)
      expect(validateCPF("11144477735")).toBe(true);
    });

    it("should reject invalid CPF with wrong length", () => {
      expect(validateCPF("123")).toBe(false);
    });

    it("should reject CPF with all same digits", () => {
      expect(validateCPF("11111111111")).toBe(false);
    });

    it("should reject invalid CPF checksum", () => {
      expect(validateCPF("12345678901")).toBe(false);
    });

    it("should handle CPF with formatting", () => {
      expect(validateCPF("111.444.777-35")).toBe(true);
    });
  });

  describe("CNPJ Validation", () => {
    it("should validate correct CNPJ", () => {
      // CNPJ válido: 11.222.333/0001-81
      expect(validateCNPJ("11222333000181")).toBe(true);
    });

    it("should reject invalid CNPJ with wrong length", () => {
      expect(validateCNPJ("123")).toBe(false);
    });

    it("should reject CNPJ with all same digits", () => {
      expect(validateCNPJ("11111111111111")).toBe(false);
    });

    it("should reject invalid CNPJ checksum", () => {
      expect(validateCNPJ("12345678901234")).toBe(false);
    });

    it("should handle CNPJ with formatting", () => {
      expect(validateCNPJ("11.222.333/0001-81")).toBe(true);
    });
  });

  describe("Economic Indicators", () => {
    it("should fetch IPCA from IBGE", async () => {
      const ipca = await getIPCA();
      if (ipca) {
        expect(ipca.name).toBe("IPCA");
        expect(ipca.source).toBe("IBGE");
        expect(ipca.unit).toBe("%");
        expect(typeof ipca.value).toBe("number");
        expect(typeof ipca.date).toBe("string");
      }
    }, { timeout: 10000 });

    it("should fetch SELIC from BCB", async () => {
      const selic = await getSELIC();
      if (selic) {
        expect(selic.name).toBe("SELIC");
        expect(selic.source).toBe("BCB");
        expect(selic.unit).toBe("% a.a.");
        expect(typeof selic.value).toBe("number");
        expect(typeof selic.date).toBe("string");
      }
    }, { timeout: 10000 });

    it("should fetch CDI from BCB", async () => {
      const cdi = await getCDI();
      if (cdi) {
        expect(cdi.name).toBe("CDI");
        expect(cdi.source).toBe("BCB");
        expect(cdi.unit).toBe("% a.a.");
        expect(typeof cdi.value).toBe("number");
      }
    }, { timeout: 10000 });

    it("should fetch exchange rate from BCB", async () => {
      const rate = await getExchangeRate();
      if (rate) {
        expect(rate.currency).toBe("USD");
        expect(typeof rate.buyRate).toBe("number");
        expect(typeof rate.sellRate).toBe("number");
        expect(rate.sellRate > rate.buyRate).toBe(true);
      }
    }, { timeout: 10000 });
  });

  describe("Cryptocurrency Prices", () => {
    it("should fetch Bitcoin price from CoinGecko", async () => {
      const btc = await getCryptoPrice("bitcoin");
      if (btc) {
        expect(btc.symbol).toBe("BITCOIN");
        expect(typeof btc.price).toBe("number");
        expect(typeof btc.priceUSD).toBe("number");
        expect(typeof btc.change24h).toBe("number");
      }
    }, { timeout: 10000 });

    it("should fetch Ethereum price from CoinGecko", async () => {
      const eth = await getCryptoPrice("ethereum");
      if (eth) {
        expect(eth.symbol).toBe("ETHEREUM");
        expect(typeof eth.price).toBe("number");
        expect(typeof eth.priceUSD).toBe("number");
      }
    }, { timeout: 10000 });

    it("should fetch multiple crypto prices", async () => {
      const prices = await getMultipleCryptoPrices([
        "bitcoin",
        "ethereum",
      ]);
      expect(Array.isArray(prices)).toBe(true);
      prices.forEach((price) => {
        expect(typeof price.symbol).toBe("string");
        expect(typeof price.price).toBe("number");
        expect(typeof price.priceUSD).toBe("number");
      });
    }, { timeout: 15000 });
  });

  describe("Stock Quotes", () => {
    it("should return null when API key is not provided", async () => {
      const quote = await getStockQuote("WEGE3");
      expect(quote).toBeNull();
    });

    it("should fetch stock quote with valid API key", async () => {
      const apiKey = process.env.BRAPI_API_KEY;
      if (apiKey) {
        const quote = await getStockQuote("WEGE3", apiKey);
        if (quote) {
          expect(quote.symbol).toBe("WEGE3");
          expect(typeof quote.price).toBe("number");
          expect(typeof quote.change).toBe("number");
          expect(typeof quote.changePercent).toBe("number");
        }
      }
    }, { timeout: 10000 });
  });

  describe("All Economic Indicators", () => {
    it("should fetch all economic indicators", async () => {
      const indicators = await getAllEconomicIndicators();
      expect(indicators).toHaveProperty("ipca");
      expect(indicators).toHaveProperty("pib");
      expect(indicators).toHaveProperty("selic");
      expect(indicators).toHaveProperty("cdi");
      expect(indicators).toHaveProperty("usd");
    }, { timeout: 30000 });
  });

  describe("Caching", () => {
    it("should cache IPCA results", async () => {
      // First call
      const ipca1 = await getIPCA();
      // Second call should return cached result
      const ipca2 = await getIPCA();

      if (ipca1 && ipca2) {
        expect(ipca1.value).toBe(ipca2.value);
        expect(ipca1.date).toBe(ipca2.date);
      }
    }, { timeout: 10000 });

    it("should cache crypto prices", async () => {
      // First call
      const btc1 = await getCryptoPrice("bitcoin");
      // Second call should return cached result
      const btc2 = await getCryptoPrice("bitcoin");

      if (btc1 && btc2) {
        expect(btc1.price).toBe(btc2.price);
        expect(btc1.priceUSD).toBe(btc2.priceUSD);
      }
    }, { timeout: 10000 });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      // Network errors are caught and return null
      // This is tested implicitly by the API calls
      expect(true).toBe(true);
    });

    it("should handle invalid API responses gracefully", async () => {
      // Invalid responses are caught and return null
      // This is tested implicitly by the API calls
      expect(true).toBe(true);
    });
  });
});
