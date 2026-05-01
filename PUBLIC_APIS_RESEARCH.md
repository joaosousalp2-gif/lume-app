# Pesquisa: APIs Públicas para Integração no Lume App

## 1. Dados Econômicos

### IBGE (Instituto Brasileiro de Geografia e Estatística)
- **URL**: https://servicodados.ibge.gov.br/api/docs/
- **Dados disponíveis**:
  - IPCA (Inflação)
  - INPC
  - PIB
  - Índices regionais
- **Formato**: JSON, CSV, XML
- **Autenticação**: Pública (sem chave necessária)
- **Limite**: Não especificado

### Banco Central do Brasil - Portal de Dados Abertos
- **URL**: https://dadosabertos.bcb.gov.br/
- **Dados disponíveis**:
  - Taxa SELIC (histórico desde 2002)
  - Dólar comercial (venda/compra) - desde 1984
  - Estatísticas PIX
  - Taxa média de juros de crédito
  - Endividamento das famílias
  - Cartões de crédito ativos
  - Estatísticas Selic (operações, clientes, contas, participantes)
  - IFData (dados de instituições financeiras)
- **Formatos**: HTML, API, OData, JSON, CSV, WSDL, PDF, ZIP
- **Autenticação**: Pública
- **Atualização**: Mensal/Diária conforme indicador

### Banco Central - API de Câmbio
- **Endpoint**: http://api.bcb.gov.br/
- **Dados**: Cotação USD (venda), SELIC, CDI
- **Autenticação**: Pública

## 2. Cotações e Investimentos

### brapi.dev
- **URL**: https://brapi.dev/
- **Dados disponíveis**:
  - Cotações de ações B3 (OHLCV)
  - Histórico de preços
  - Dividendos
  - Balanços patrimoniais (BP)
  - Demonstrações de resultados (DRE)
  - Fluxo de caixa (DFC)
  - Indicadores fundamentalistas
  - Criptomoedas
  - Câmbio
  - Indicadores econômicos
  - Fundos Imobiliários (FIIs)
  - Opções (Derivativos)
- **Autenticação**: Requer API Key (gratuita)
- **Planos**: Gratuito e pago
- **Exemplo**: GET /api/quote/WEGE3

### CoinGecko API
- **Dados**: Criptomoedas, preços, histórico
- **Autenticação**: Pública (sem chave para uso básico)
- **Limite**: Gratuito com limitações

### Dados de Mercado
- **URL**: https://www.dadosdemercado.com.br/api/docs
- **Dados**: Cotações, histórico de preços, fundamentos
- **Autenticação**: Requer autenticação

## 3. Validação de Dados e Fraude

### Não encontradas APIs públicas específicas
**Recomendação**: Implementar validação local com:
- Algoritmo de validação de CPF/CNPJ
- Integração com serviços pagos (ex: Serasa, Boa Vista)
- Banco de dados local de padrões de fraude

## 4. Open Banking

### Banco Central - Open Banking (Futuro)
- Ainda em desenvolvimento/expansão
- Requer integração com instituições financeiras específicas
- Não há API pública centralizada ainda

## Recomendação de Priorização

1. **IBGE API** - Dados econômicos básicos (inflação, PIB)
2. **Banco Central API** - Taxa SELIC, câmbio, PIX
3. **brapi.dev** - Cotações de ações e fundamentos
4. **CoinGecko** - Criptomoedas
5. **Validação local** - CPF/CNPJ com algoritmo
6. **Fraude** - Integração com serviços pagos (fase 2)

## Próximos Passos

1. Implementar helpers para cache de dados públicos
2. Criar tRPC procedures para cada integração
3. Adicionar UI para exibir dados
4. Implementar sincronização periódica
5. Adicionar testes para cada integração
