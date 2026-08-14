export function formatPluggyImportSummary(result: { imported: number; skipped: number; accounts: number }) {
  if (result.imported > 0) {
    return `Importação concluída: ${result.imported} novas transações, ${result.skipped} já existentes e ${result.accounts} contas analisadas.`;
  }
  return `Tudo já estava sincronizado: não foram encontradas transações novas. ${result.skipped} transações existentes e ${result.accounts} contas foram verificadas.`;
}
