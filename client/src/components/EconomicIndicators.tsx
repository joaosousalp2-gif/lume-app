/**
 * EconomicIndicators — Lume
 * Componente para exibir indicadores econômicos em tempo real
 * Integra com IBGE, Banco Central e CoinGecko
 */

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";

interface IndicatorCardProps {
  name: string;
  value: number | null;
  unit: string;
  source: string;
  isLoading?: boolean;
  change?: number;
}

function IndicatorCard({
  name,
  value,
  unit,
  source,
  isLoading,
  change,
}: IndicatorCardProps) {
  const isPositive = change ? change > 0 : false;

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {name}
          </p>
          {isLoading ? (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-slate-500">Carregando...</span>
            </div>
          ) : value !== null ? (
            <div className="mt-2">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {typeof value === "number" ? value.toFixed(2) : value}
                <span className="text-sm font-normal text-slate-600 dark:text-slate-400 ml-1">
                  {unit}
                </span>
              </p>
              {change !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {change.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500 mt-2">Dados indisponíveis</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">{source}</p>
        </div>
      </div>
    </Card>
  );
}

export default function EconomicIndicators() {
  const [cryptoPrices, setCryptoPrices] = useState<
    Record<string, { price: number; change24h: number }>
  >({});

  // Buscar indicadores econômicos
  const { data: indicators, isLoading: indicatorsLoading } =
    trpc.publicData.economicIndicators.useQuery();

  // Buscar preços de criptomoedas
  const { data: cryptoData, isLoading: cryptoLoading } =
    trpc.publicData.multipleCryptoPrices.useQuery(
      {
        cryptoIds: ["bitcoin", "ethereum"],
      },
      {
        refetchInterval: 60000, // Atualizar a cada 1 minuto
      }
    );

  useEffect(() => {
    if (cryptoData) {
      const prices: Record<string, { price: number; change24h: number }> = {};
      cryptoData.forEach((crypto) => {
        prices[crypto.symbol] = {
          price: crypto.price,
          change24h: crypto.change24h,
        };
      });
      setCryptoPrices(prices);
    }
  }, [cryptoData]);

  return (
    <section className="py-16 px-4 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Indicadores Econômicos
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Dados em tempo real do Banco Central, IBGE e mercado de criptomoedas
          </p>
        </div>

        {/* Indicadores Econômicos */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Economia Brasileira
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <IndicatorCard
              name="IPCA (Inflação)"
              value={indicators?.ipca?.value ?? null}
              unit={indicators?.ipca?.unit ?? "%"}
              source={indicators?.ipca?.source ?? "IBGE"}
              isLoading={indicatorsLoading}
            />
            <IndicatorCard
              name="Taxa SELIC"
              value={indicators?.selic?.value ?? null}
              unit={indicators?.selic?.unit ?? "% a.a."}
              source={indicators?.selic?.source ?? "BCB"}
              isLoading={indicatorsLoading}
            />
            <IndicatorCard
              name="Taxa CDI"
              value={indicators?.cdi?.value ?? null}
              unit={indicators?.cdi?.unit ?? "% a.a."}
              source={indicators?.cdi?.source ?? "BCB"}
              isLoading={indicatorsLoading}
            />
            <IndicatorCard
              name="Dólar (Venda)"
              value={indicators?.usd?.sellRate ?? null}
              unit="R$"
              source="BCB"
              isLoading={indicatorsLoading}
            />
          </div>
        </div>

        {/* Criptomoedas */}
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Criptomoedas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IndicatorCard
              name="Bitcoin"
              value={cryptoPrices["BITCOIN"]?.price ?? null}
              unit="R$"
              source="CoinGecko"
              isLoading={cryptoLoading}
              change={cryptoPrices["BITCOIN"]?.change24h}
            />
            <IndicatorCard
              name="Ethereum"
              value={cryptoPrices["ETHEREUM"]?.price ?? null}
              unit="R$"
              source="CoinGecko"
              isLoading={cryptoLoading}
              change={cryptoPrices["ETHEREUM"]?.change24h}
            />
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <strong>💡 Dica:</strong> Os indicadores são atualizados automaticamente.
            Use essas informações para tomar decisões financeiras mais informadas.
            Lembre-se de que dados históricos e tendências são importantes para
            análises mais precisas.
          </p>
        </div>
      </div>
    </section>
  );
}
