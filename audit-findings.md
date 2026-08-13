# Achados da auditoria de integrações

## 2026-08-13 — Inventário inicial

A configuração de conectores foi carregada em modo de leitura. O projeto utiliza principalmente serviços internos pré-configurados, APIs públicas chamadas diretamente pelo backend e APIs nativas do navegador. Não foram habilitados conectores externos adicionais para esta auditoria.

O módulo `server/publicApis.ts` chama o serviço de dados agregados do IBGE, o Banco Central, brapi.dev e CoinGecko. Os logs do servidor registam respostas HTTP 404 para as consultas atuais de IPCA e PIB do IBGE. A documentação oficial do IBGE confirma que a API v3 usa rotas no formato `/api/v3/agregados/{agregado}/periodos/{periodos}/variaveis/{variavel}` e também disponibiliza a consulta de variáveis por agregado em `/api/v3/agregados/{agregado}/variaveis/{variavel}`. Fonte consultada: https://servicodados.ibge.gov.br/api/docs/agregados?versao=3.

A página institucional do IPCA foi bloqueada pelo site para o navegador automatizado, mas a documentação técnica oficial do serviço de agregados ficou acessível. A implementação atual usa `periodos/-1/variavel/2063`, singular, enquanto o exemplo oficial usa a forma `periodos/{periodos}/variaveis/{variavel}`, plural. Isso é um candidato forte à causa dos 404 e será validado com chamadas HTTP reais antes da correção.

Também foi identificado um problema semântico no código: `getExchangeRate()` consulta a mesma série BCB usada para SELIC e multiplica o resultado por 0,98 para simular compra/venda; isso não é uma cotação cambial real e deve ser substituído por uma série/endpoint oficial de câmbio ou por uma API pública de câmbio claramente identificada. A série de CDI também precisa ser validada contra a documentação vigente do BCB.

## Testes HTTP reais

A base de dados respondeu com sucesso a `SELECT 1` e as tabelas principais estão acessíveis. A tabela `chatMessageFeedback` não existe no schema remoto, embora esteja presente em `drizzle/schema.ts` e no snapshot 0015.

Os serviços internos configurados responderam assim: o Forge base e o servidor OAuth retornam 404 na raiz, comportamento compatível com serviços sem rota pública na raiz; o portal OAuth retorna 200; o endpoint de analytics retorna 403 sem uma requisição autenticada específica; o logo CDN retorna 200; uma chamada autenticada ao Forge LLM retorna 200 com estrutura `choices`; e o presign de armazenamento retorna 200.

No IBGE, a rota antiga de IPCA retorna 404. A rota oficial v3 com `variaveis/63` retorna 200 e devolve a série no formato `serie` com o período como chave, por exemplo `202607: 0.07`. O metadata oficial da tabela 1737 confirma que a variável correta para variação mensal do IPCA é 63, não 2063. A consulta à tabela 1621 com variável 584 retorna 200, mas representa um índice de volume trimestral ajustado sazonalmente e pode devolver `..` para o último período; o código não pode tratá-lo como valor monetário em bilhões de reais.

No BCB, as séries 1, 12 e 10813 respondem 200. A documentação oficial consultada identifica 10813 como dólar americano de compra. A série 1 devolve atualmente 5,1639 e a 10813 devolve 5,1632, portanto a função de câmbio atual, que usa a série 1 como dólar, está semanticamente incorreta. A venda deve usar a série oficial correspondente de dólar de venda e compra deve usar 10813.

## Auditoria do servidor local

Os endpoints tRPC de validação de CPF e CNPJ respondem 200 com resultados corretos. Selic e CDI respondem 200. IPCA e PIB respondem 200 no tRPC, mas o payload é `null` porque o parser antigo não entende o formato atual do IBGE. A cotação USD responde 200, mas está errada semanticamente porque usa a série 1 do BCB e calcula compra por aproximação. A rota `trust.verify` responde 200, mas devolve valores fixos de reputação, resolução e reclamações, sem consultar uma fonte externa; isso não é uma conexão funcional e precisa ser substituído por resposta honesta de indisponibilidade ou por uma integração real autorizada.

O hook `useTrustVerification` chama `/api/trust/verify`, rota REST que não está registada no bootstrap do Express, em vez de chamar `api/trust.verify` via tRPC. Quando falha, o hook gera dados aleatórios/simulados. Esse fallback deve ser removido para que a interface nunca apresente reputação ou reclamações inventadas.

O hook `useBackendSync` também chama quatro rotas REST `/api/launches/...` que não existem no bootstrap atual; o código de produção usa routers tRPC, portanto esse hook está obsoleto e deve ser migrado ou isolado para não gerar 404 quando utilizado.

## Base de dados, autenticação e armazenamento

A página inicial responde 200. `auth.me` responde 200 sem sessão e devolve `null`, enquanto uma rota protegida (`launches.list`) responde 401 com a mensagem de autenticação esperada. O callback OAuth está registado e responde 400 quando chamado sem `code` e `state`, em vez de 404. O proxy `/manus-storage/...` está registado; uma chave inexistente chega ao armazenamento e devolve 403 do fornecedor, o que confirma que o proxy e a autenticação com Forge estão ativos.

As credenciais internas obrigatórias estão presentes. As credenciais opcionais de Twilio, SendGrid, brapi.dev e Google Places estão ausentes no ambiente atual. O código deve manter esses recursos explicitamente indisponíveis sem fingir sucesso; para os ativar de forma real, é necessária uma credencial válida do respetivo fornecedor ou uma integração por utilizador.

A cadeia de voz tem um defeito provável: `storagePut()` devolve uma URL relativa (`/manus-storage/...`) e `processVoiceInput()` passa essa URL relativa ao `fetch()` server-side de transcrição. O servidor não consegue resolver uma URL relativa sem origem; o fluxo deve pedir uma URL assinada absoluta através de `storageGetSignedUrl()` antes de chamar o serviço de transcrição.

## APIs externas e fontes de confiança

Os testes HTTP reais confirmam que o IBGE IPCA v3, IBGE tabela 1621, BCB séries 1/12/10813/10814 e CoinGecko respondem 200. O brapi.dev também responde 200 para uma cotação pública sem token, embora o código atual exija `apiKey` e portanto devolva `null` quando não recebe uma chave. Reclame Aqui e Trustpilot respondem 403 sem credencial; Google Places responde 200, mas a chave `demo` devolve resposta de erro/limitação e não pode ser usada como credencial válida.

A documentação oficial do BCB consultada confirma que a série SGS 1 é `Taxa de câmbio - Livre - Dólar americano (venda) - diário`. A série 10813 foi confirmada como dólar americano de compra, mas a sua disponibilidade começa em 26 de março de 2025. A série 10814 não deve ser usada como venda: o teste devolveu um valor negativo incompatível com cotação. A função de câmbio deve usar série 1 para venda e 10813 para compra, sem aproximação artificial.

## Voz

Uma chamada real ao endpoint autenticado do Forge para `v1/audio/transcriptions`, usando um WAV válido de 1 segundo, respondeu 200 com o contrato Whisper (`task`, `language`, `duration`, `text`, `segments`). O fornecedor de transcrição está operacional. No código do Lume, porém, a função `processVoiceInput()` precisa transformar o `key` devolvido por `storagePut()` numa URL assinada absoluta antes de chamar `transcribeAudio()`; os testes atuais mascaram esse problema ao devolver uma URL absoluta no mock.
