import { protectedProcedure, router } from "../_core/trpc";
import { ENV } from "../_core/env";
import { getDb } from "../db";
import { getExchangeRate, getIPCA, getPIB, getSELIC } from "../publicApis";

async function probe<T>(fn: () => Promise<T | null>) {
  const started = Date.now();
  try {
    const value = await fn();
    return { ok: value !== null, latencyMs: Date.now() - started };
  } catch {
    return { ok: false, latencyMs: Date.now() - started };
  }
}

export const healthRouter = router({
  status: protectedProcedure.query(async () => {
    const [database, ipca, pib, selic, exchange] = await Promise.all([
      getDb().then((db) => ({ ok: Boolean(db), latencyMs: 0 })).catch(() => ({ ok: false, latencyMs: 0 })),
      probe(getIPCA),
      probe(getPIB),
      probe(getSELIC),
      probe(getExchangeRate),
    ]);
    return {
      checkedAt: new Date().toISOString(),
      services: {
        database,
        oauth: { ok: Boolean(ENV.oAuthServerUrl && ENV.appId), latencyMs: 0 },
        forge: { ok: Boolean(ENV.forgeApiUrl && ENV.forgeApiKey), latencyMs: 0 },
        storage: { ok: Boolean(ENV.forgeApiUrl && ENV.forgeApiKey), latencyMs: 0 },
        ipca,
        pib,
        selic,
        exchange,
      },
    };
  }),
});
