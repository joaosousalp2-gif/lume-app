import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Database, ExternalLink, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { PluggyConnect } from "react-pluggy-connect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function PluggyOpenBankingPanel() {
  const connectorsQuery = trpc.pluggy.listConnectors.useQuery(undefined, { staleTime: 5 * 60_000 });
  const [connectorId, setConnectorId] = useState("");
  const [itemId, setItemId] = useState("");
  const createItem = trpc.pluggy.createSandboxItem.useMutation();
  const connectTokenMutation = trpc.pluggy.createConnectToken.useMutation();
  const importTransactions = trpc.pluggy.importTransactions.useMutation();
  const [connectToken, setConnectToken] = useState("");
  const [widgetError, setWidgetError] = useState("");
  const selectedConnector = useMemo(() => connectorsQuery.data?.find((connector) => String(connector.id) === connectorId), [connectorsQuery.data, connectorId]);

  useEffect(() => {
    if (!connectorId && connectorsQuery.data?.length) {
      const sandbox = connectorsQuery.data.find((connector) => /sandbox|pluggy bank/i.test(`${connector.name} ${connector.institution}`));
      setConnectorId(String((sandbox ?? connectorsQuery.data[0]).id));
    }
  }, [connectorId, connectorsQuery.data]);

  const handleOpenFinance = async () => {
    setWidgetError("");
    const result = await connectTokenMutation.mutateAsync({ oauthRedirectUri: window.location.origin });
    setConnectToken(result.accessToken);
  };

  const handleCreateSandboxItem = async () => {
    if (!connectorId) return;
    const result = await createItem.mutateAsync({ connectorId: Number(connectorId), user: "user-ok", password: "password-ok" });
    setItemId(result.id);
  };

  return (
    <section aria-labelledby="pluggy-title" className="container mx-auto px-4 py-8">
      <Card className="bg-white/95 p-6 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-3 text-blue-700"><Database className="h-6 w-6" aria-hidden="true" /></div>
          <div>
            <h2 id="pluggy-title" className="text-2xl font-bold text-slate-900">Open Banking com Pluggy</h2>
            <p className="mt-1 text-slate-600">Teste a importação real usando o ambiente Sandbox da Pluggy. Os dados Sandbox são sintéticos e não representam uma conta bancária real.</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
          <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />As credenciais de teste ficam no servidor e não são credenciais bancárias pessoais. Para uma conta real, o consentimento deve acontecer no fluxo oficial da instituição, sem enviar a palavra-passe ao Lume.</p>
        </div>

        <div className="mt-5 rounded-lg border border-violet-200 bg-violet-50 p-4">
          <p className="font-semibold text-violet-950">Ligação bancária real</p>
          <p className="mt-1 text-sm text-violet-900">Para uma conta real, use o consentimento oficial Open Finance. O Lume não recebe nem guarda a sua palavra-passe bancária.</p>
          <Button type="button" onClick={handleOpenFinance} disabled={connectTokenMutation.isPending} className="mt-3 gap-2 bg-violet-700 hover:bg-violet-800"><ExternalLink className="h-4 w-4" />{connectTokenMutation.isPending ? "A preparar consentimento..." : "Conectar banco via Open Finance"}</Button>
          {connectTokenMutation.isError && <p className="mt-2 text-sm text-red-700">Não foi possível preparar o consentimento Open Finance.</p>}
        </div>

        {connectToken && <div className="mt-5 overflow-hidden rounded-xl border border-violet-200 bg-white">
          <PluggyConnect
            connectToken={connectToken}
            includeSandbox
            language="pt"
            allowFullscreen={false}
            products={["ACCOUNTS", "TRANSACTIONS"]}
            onSuccess={({ item }) => { setItemId(item.id); setConnectToken(""); }}
            onError={(error) => { setWidgetError(error.message); setConnectToken(""); }}
            onClose={() => setConnectToken("")}
          />
        </div>}
        {widgetError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">O consentimento Pluggy não foi concluído: {widgetError}</p>}

        {connectorsQuery.isLoading && <p className="mt-5 flex items-center gap-2 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" />A carregar conectores Pluggy...</p>}
        {connectorsQuery.isError && <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800">Não foi possível carregar os conectores Pluggy. Verifique as credenciais do ambiente de teste e tente novamente.</div>}

        {connectorsQuery.data && connectorsQuery.data.length > 0 && <div className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-slate-800" htmlFor="pluggy-connector">Conector de teste</label>
          <select id="pluggy-connector" value={connectorId} onChange={(event) => setConnectorId(event.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {connectorsQuery.data.map((connector) => <option key={connector.id} value={connector.id}>{connector.name}{connector.institution ? ` — ${connector.institution}` : ""}</option>)}
          </select>
          {selectedConnector && <p className="text-sm text-slate-600">Estado do conector: <strong>{selectedConnector.status}</strong>. O Lume usa o contrato oficial da Pluggy para criar o Item e ler contas e transações.</p>}
          <Button type="button" onClick={handleCreateSandboxItem} disabled={createItem.isPending || !connectorId} className="gap-2"><CreditCard className="h-4 w-4" />{createItem.isPending ? "A criar ligação..." : "Criar ligação Sandbox"}</Button>
          {createItem.isError && <p className="text-sm text-red-700">A Pluggy recusou a criação do Item. Confirme se o conector escolhido é compatível com o ambiente Sandbox.</p>}
        </div>}

        {itemId && <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="flex items-center gap-2 font-semibold text-green-900"><CheckCircle2 className="h-5 w-5" />Item Pluggy criado com sucesso</p>
          <p className="mt-1 break-all text-xs text-green-800">ID da ligação: {itemId}</p>
          <Button type="button" variant="outline" className="mt-4 gap-2" onClick={() => importTransactions.mutate({ itemId })} disabled={importTransactions.isPending}><RefreshCw className={`h-4 w-4 ${importTransactions.isPending ? "animate-spin" : ""}`} />{importTransactions.isPending ? "A importar transações..." : "Importar transações de teste"}</Button>
          {importTransactions.isSuccess && <p className="mt-3 text-sm text-green-900">Importação concluída: {importTransactions.data.imported} novas transações, {importTransactions.data.skipped} já existentes e {importTransactions.data.accounts} contas analisadas.</p>}
          {importTransactions.isError && <p className="mt-3 text-sm text-red-700">A ligação foi criada, mas a leitura das transações falhou. Consulte o estado do Item na Pluggy e tente novamente.</p>}
        </div>}

        <p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><ExternalLink className="h-3 w-3" />O ambiente Sandbox da Pluggy devolve dados sintéticos com a mesma estrutura da API de produção.</p>
      </Card>
    </section>
  );
}
