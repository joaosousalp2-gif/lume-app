import { protectedProcedure, router } from "../_core/trpc";
import { ENV } from "../_core/env";
import { getDb } from "../db";
import { trustedContacts } from "../../drizzle/schema";
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
    const startedDb = Date.now();
    let dbOk = false;
    try {
      const db = await getDb();
      if (db) {
        await db.select().from(trustedContacts).limit(1);
        dbOk = true;
      }
    } catch {
      dbOk = false;
    }
    const database = { ok: dbOk, latencyMs: Date.now() - startedDb };

    const [ipca, pib, selic, exchange] = await Promise.all([
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
