import { ENV } from "./_core/env";

const PLUGGY_API_URL = "https://api.pluggy.ai";
let cachedApiKey: { value: string; expiresAt: number } | null = null;

type PluggyResponse = Record<string, unknown>;

async function pluggyRequest<T extends PluggyResponse>(path: string, init: RequestInit = {}, apiKey?: string): Promise<T> {
  const response = await fetch(`${PLUGGY_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "X-API-KEY": apiKey } : {}),
      ...(init.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Pluggy API error ${response.status}: ${JSON.stringify(body).slice(0, 500)}`);
  }
  return body as T;
}

export async function getPluggyApiKey(): Promise<string> {
  if (cachedApiKey && cachedApiKey.expiresAt > Date.now() + 60_000) return cachedApiKey.value;
  if (!ENV.pluggyClientId || !ENV.pluggyClientSecret) throw new Error("Pluggy credentials are not configured");
  const response = await pluggyRequest<{ apiKey: string }>("/auth", {
    method: "POST",
    body: JSON.stringify({ clientId: ENV.pluggyClientId, clientSecret: ENV.pluggyClientSecret }),
  });
  cachedApiKey = { value: response.apiKey, expiresAt: Date.now() + 110 * 60_000 };
  return response.apiKey;
}

export async function listPluggyConnectors(includeSandbox = false) {
  const apiKey = await getPluggyApiKey();
  const query = includeSandbox ? "?sandbox=true" : "";
  return pluggyRequest<{ results: Array<Record<string, unknown>> }>(`/connectors${query}`, {}, apiKey);
}

export async function createPluggyConnectToken(input: { itemId?: string; clientUserId?: string; oauthRedirectUri?: string; avoidDuplicates?: boolean } = {}) {
  const apiKey = await getPluggyApiKey();
  const body: Record<string, unknown> = {};
  if (input.itemId) body.itemId = input.itemId;
  const options: Record<string, unknown> = {};
  if (input.clientUserId) options.clientUserId = input.clientUserId;
  if (input.oauthRedirectUri) options.oauthRedirectUri = input.oauthRedirectUri;
  if (input.avoidDuplicates !== undefined) options.avoidDuplicates = input.avoidDuplicates;
  if (Object.keys(options).length) body.options = options;
  return pluggyRequest<{ accessToken: string }>("/connect_token", {
    method: "POST",
    body: JSON.stringify(body),
  }, apiKey);
}

export async function createPluggyItem(input: { connectorId: number; user: string; password: string; }) {
  const apiKey = await getPluggyApiKey();
  return pluggyRequest<{ id: string; status: string; connector?: Record<string, unknown> }>("/items", {
    method: "POST",
    body: JSON.stringify({ connectorId: input.connectorId, parameters: { user: input.user, password: input.password } }),
  }, apiKey);
}

export async function getPluggyItem(itemId: string) {
  const apiKey = await getPluggyApiKey();
  return pluggyRequest<Record<string, unknown>>(`/items/${encodeURIComponent(itemId)}`, {}, apiKey);
}

export async function listPluggyAccounts(itemId: string) {
  const apiKey = await getPluggyApiKey();
  return pluggyRequest<{ results: Array<Record<string, unknown>> }>(`/accounts?itemId=${encodeURIComponent(itemId)}`, {}, apiKey);
}

export async function listPluggyTransactions(accountId: string, from?: string, to?: string) {
  const apiKey = await getPluggyApiKey();
  const params = new URLSearchParams({ accountId });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return pluggyRequest<{ results: Array<Record<string, unknown>>; next?: string }>(`/v2/transactions?${params.toString()}`, {}, apiKey);
}

export function mapPluggyTransaction(transaction: Record<string, unknown>) {
  const amount = Number(transaction.amount ?? 0);
  const type = transaction.type === "CREDIT" ? "receita" : "despesa";
  const dateValue = typeof transaction.date === "string" ? transaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10);
  return {
    type,
    date: dateValue,
    category: typeof transaction.category === "string" && transaction.category ? transaction.category : "Importado",
    value: Math.abs(amount).toFixed(2),
    description: typeof transaction.description === "string" ? transaction.description : "Transação importada pela Pluggy",
    source: "pluggy",
    externalId: typeof transaction.id === "string" ? transaction.id : undefined,
  } as const;
}
