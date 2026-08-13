# Lume App - TODO

## Fase 1: Limpeza de Repositório
- [x] Remover arquivos PDF de documentação
- [x] Remover arquivos Markdown de notas não essenciais
- [x] Remover imports não utilizados
- [x] Consolidar helpers duplicados (storage.ts removido)
- [x] Remover componentes wrapper desnecessários

## Fase 2: Otimizações de Performance
- [x] Implementar lazy loading em Home.tsx para seções below-the-fold
- [x] Adicionar Suspense fallback com spinner
- [x] Validar que testes continuam passando (172 testes ✓)
- [x] Verificar TypeScript compilation (sem erros)

## Fase 3: Funcionalidades Principais
- [x] Metas de Economia com sincronização
- [x] Contas Bancárias Múltiplas
- [x] Orçamento Mensal Personalizado
- [x] Categorização Automática com IA
- [x] Regras Personalizadas
- [x] Agente Financeiro IA com chat inteligente
- [x] Análise Inteligente de Gastos
- [x] Sincronização centralizada entre seções
- [x] Acessibilidade WCAG 2.1 AA
- [x] Migração para Banco de Dados (tRPC sync)

## Fase 4: Integração com Bancos de Dados Públicos
- [x] Pesquisar e configurar APIs de Open Banking (Banco Central)
- [x] Implementar integração com dados de Fraude e validação de CPF/CNPJ
- [x] Implementar integração com Cotações (B3, Banco Central, CoinGecko)
- [x] Implementar integração com Dados Econômicos (IBGE, Banco Central)
- [x] Criar helpers para cache e sincronização de dados públicos
- [x] Adicionar UI para exibir dados de cotações e indicadores
- [x] Testar todas as integrações e validar dados
- [x] Salvar checkpoint com integrações públicas

## Fase 5: Segurança Avançada
- [x] Implementar 2FA com SMS (backup codes)
- [x] Implementar 2FA com Email (backup codes)
- [x] Implementar 2FA com Authenticator (TOTP)
- [x] Criptografar dados bancários (AES-256-GCM)
- [x] Criptografar transações financeiras (via encryptedFields)
- [x] Criptografar dados pessoais (CPF, endereço)
- [x] Implementar auditoria de login/logout
- [x] Criar router tRPC para gerenciar 2FA
- [x] Testar fluxo completo de 2FA (18 testes)
- [x] Salvar checkpoint com segurança

## Fase 6: Agente IA Avançado
- [x] Implementar recomendações de economia
- [x] Implementar recomendações de investimentos
- [x] Implementar detecção de fraude (padrões suspeitos)
- [x] Implementar planejamento financeiro personalizado
- [x] Criar endpoints para solicitar recomendações (sob demanda)
- [x] Integrar com LLM existente (invokeLLM)
- [x] Testar recomendações (214 testes)
- [x] Salvar checkpoint com IA avançada

## Fase 7: Testes, Analytics e Design System
- [x] Implementar Testes E2E com Playwright (auth, financial, API)
- [x] Implementar Analytics com Plausible (helper + script)
- [x] Implementar Design System com Storybook (Button, Card stories)
- [x] Adicionar scripts: test:e2e, storybook, build-storybook
- [x] Salvar checkpoint final

## Fase 8: Envio Real de SMS/Email e Testes E2E Expandidos
- [x] Implementar envio de SMS com Twilio (4 funções)
- [x] Implementar envio de Email com SendGrid (5 funções)
- [x] Expandir testes E2E para transações (8 testes)
- [x] Expandir testes E2E para 2FA (8 testes)
- [x] Expandir testes E2E para recomendações de IA (10 testes)
- [x] Testar e salvar checkpoint final

## Fase 9: Melhoria de UI/UX com Abas
- [x] Criar componente de abas reutilizável (3 variantes)
- [x] Refinar design visual (cores, espaçamento, tipografia)
- [x] Implementar abas nas seções principais (5 abas)
- [x] Otimizar responsividade e acessibilidade
- [x] Testar e salvar checkpoint final

## Fase 10: Sincronização, Dark Mode e Publicação
- [x] Sincronizar Navbar com sistema de abas (TabsContext)
- [x] Implementar dark mode toggle (ThemeToggle, ThemeContext)
- [x] Testar e salvar checkpoint final (214 testes passando)
- [x] Publicar alterações


## Auditoria e Correções (Fase 11)
- [x] BUG #1: Tabs.tsx não sincronizava com defaultTab (corrigido com useEffect)
- [x] BUG #2: Navbar.tsx não validava elemento antes de scroll (adicionado try-catch)
- [x] BUG #3: EconomicIndicators - API IBGE retorna 404 (tratamento gracioso implementado)
- [x] BUG #4: App.tsx comentário desatualizado (corrigido)
- [x] BUG #5: TabsProvider duplicado em main.tsx e App.tsx (removido de main.tsx)
- [x] Validação completa: 214 testes passando, 0 erros TypeScript


## Fase 12: Correção de Contraste e Legibilidade (WCAG 2.1 AA)
- [x] Auditoria completa de contraste em todos os componentes
- [x] Corrigir Cards (Dashboard) - texto sobre fundo
- [x] Corrigir Tabelas - header e linhas
- [x] Corrigir Formulários - labels e placeholders
- [x] Corrigir Botões - texto e hover states
- [x] Corrigir Mensagens - sucesso/erro/aviso
- [x] Corrigir Navegação - links e menu
- [x] Corrigir Chat - mensagens e timestamps
- [x] Validar com ferramentas de contraste (214 testes passando)
- [x] Testar com usuário 60+
- [x] Salvar checkpoint final


## Fase 13: Integração de 2FA no Fluxo de Login
- [x] Integrar 2FA ao fluxo de autenticação OAuth
- [x] Criar página de verificação de 2FA (TwoFactorVerification.tsx)
- [x] Implementar endpoints tRPC para 2FA (security router)
- [x] Adicionar UI para gerenciar 2FA no dashboard (TwoFactorSettings.tsx)
- [x] Testar fluxo completo de 2FA (214 testes passando)
- [x] Salvar checkpoint final


## Fase 14: Integração de 2FA ao Fluxo OAuth
- [x] Modificar fluxo OAuth para incluir estado de 2FA pendente
- [x] Criar middleware de verificação de 2FA (twoFAMiddleware.ts)
- [x] Implementar redirecionamento para página de 2FA
- [x] Criar endpoints tRPC para 2FA (auth2FA.ts router)
- [x] Testar fluxo completo de login com 2FA (214 testes passando)
- [x] Salvar checkpoint final

## Fase 15: Atualização de Status 2FA no Banco de Dados
- [x] Adicionar funções de atualização de 2FA no db.ts
- [x] Modificar endpoint tRPC verify para atualizar banco de dados
- [x] Adicionar endpoint disable para desabilitar 2FA
- [x] Testar fluxo completo com atualização (214 testes passando)
- [x] Salvar checkpoint final


## Fase 16: Configuração de Integrações por Usuário
- [x] Conectar TwoFactorVerification ao App.tsx
- [x] Adicionar tabela de integrações ao banco de dados (userIntegrations)
- [x] Criar componente de configuração de integrações
- [x] Criar endpoints tRPC para gerenciar integrações (integrationsRouter)
- [x] Integrar credenciais do usuário ao envio de SMS/Email
- [x] Testar fluxo completo com credenciais do usuário (227 testes passando)
- [x] Salvar checkpoint final e publicar para produção

## Fase 21: Sistema de Avaliação de Respostas do Agente de IA
- [x] Criar tabela chatMessageFeedback no banco de dados
- [x] Implementar endpoints tRPC para salvar feedback (saveFeedback, getStats, getRecent)
- [x] Adicionar botões "Útil" e "Não Útil" ao ChatAssistant.tsx
- [x] Implementar lógica de feedback com persistência
- [x] Registrar chatFeedbackRouter no appRouter
- [x] Testar sistema de avaliação (227 testes passando)
- [x] Criar dashboard de análise de feedback
- [x] Implementar recomendações baseadas em feedback

## Fase 22: Exportação de Chat em PDF
- [x] Criar módulo chatExport.ts com função exportChatToPDF
- [x] Corrigir tipos de PDFFont usando embedStandardFont
- [x] Criar router tRPC chatExportRouter com endpoints exportPDF e getExportStats
- [x] Registrar chatExportRouter no appRouter
- [x] Adicionar botão "Exportar PDF" ao ChatAssistant.tsx
- [x] Implementar lógica de download de PDF no cliente
- [x] Criar testes unitários para exportação (13 testes passando)
- [x] Validar fluxo completo de exportação
- [x] Salvar checkpoint final

## Fase 24: Exportação de Relatórios Financeiros Mensais em PDF
- [x] Criar módulo financialReports.ts com geração de PDFs
- [x] Implementar análise de gastos por categoria
- [x] Implementar comparação com períodos anteriores
- [x] Criar router tRPC financialReportsRouter
- [x] Implementar geração de recomendações personalizadas
- [x] Criar componente MonthlyReportExport.tsx e integrá-lo à Home
- [x] Adicionar testes unitários para relatórios com paginação e comparação (7 testes passando)
- [x] Validar fluxo completo de exportação e compilação sem erros
- [x] Salvar checkpoint final com funcionalidade completa

## Fase 25: Simplificação e Otimização da Experiência
- [x] Auditar componentes e identificar ações redundantes na interface
- [x] Simplificar MonthlyReportExport para uma ação principal e informação progressiva
- [x] Reduzir renderizações e consultas repetidas no frontend
- [x] Otimizar geração e transferência dos relatórios PDF com upload no armazenamento e URL de download
- [x] Reduzir ruído visual e carregamentos desnecessários na Home
- [x] Validar TypeScript, testes, build e navegação principal com teste dedicado de Navbar
- [x] Salvar checkpoint final da versão simplificada

## Fase 26: Reorganização para HTML, CSS e JavaScript/TypeScript Direto
- [x] Mapear componentes estáticos e separar de chamadas tRPC
- [x] Consolidar estilos globais e classes utilitárias no CSS (`index.css`)
- [x] Refatorar componentes visuais para HTML semântico limpo
- [x] Manter lógica de estado e interatividade com JavaScript/TypeScript direto
- [x] Validar testes, compilação TypeScript e build de produção
- [x] Salvar checkpoint final da arquitetura organizada

## Fase 27: Seções Reutilizáveis, Testes Visuais e Tutoriais Interativos
- [x] Extrair secções estáticas da Home para componentes HTML reutilizáveis
- [x] Adicionar testes visuais automatizados para desktop, tablet e mobile
- [x] Criar mini-tutoriais interativos em JavaScript puro
- [x] Integrar tutoriais na Home com estados acessíveis e opção de fechar
- [x] Validar TypeScript, testes, build e acessibilidade
- [x] Salvar checkpoint final das três melhorias

- [x] Extrair uma segunda secção estática relevante da Home (Footer) para componente semântico reutilizável
- [x] Reexecutar check, suíte de testes e testes visuais após essa extração

- [x] Adicionar teste Playwright dedicado de acessibilidade para HomeExplorer, Footer e TutorialOverlay
- [x] Executar e registrar a validação de acessibilidade junto com os testes finais

- [x] Cobrir no teste de acessibilidade o heading, tablist, tabs e painel ativo do HomeExplorer
- [x] Reexecutar a validação Playwright após ampliar a cobertura do HomeExplorer

## Fase 28: Conversação por Voz no Agente de IA (Áudio em Entrada e Saída)
- [x] Auditar helpers existentes de transcrição (`transcribeAudio`) e rotas de chat
- [x] Implementar endpoint tRPC para síntese de voz e rota voiceRouter integrada ao appRouter
- [x] Criar controlos de microfone (gravação webm + transcrição automática) e reprodução falada (SpeechSynthesis) no ChatAssistant
- [x] Integrar tratamento de permissões de microfone, feedback visual e testes unitários
- [x] Validar TypeScript, 246 testes passando e build de produção bem-sucedido

- [x] Inserir e verificar o botão de reprodução falada (Ouvir resposta) nas mensagens do assistente no ChatAssistant.tsx
- [x] Substituir server/voice.test.ts por testes reais do voiceRouter e processVoiceInput (mocks e tratamento de erro)
- [x] Refinar o tratamento de permissões e estados de gravação do microfone no ChatAssistant
- [x] Reexecutar check, testes completos e build após as melhorias de voz

- [x] Criar testes unitários reais para processVoiceInput e erros de transcrição em server/voice.test.ts
- [x] Adicionar verificação de suporte a MediaRecorder e limpeza de SpeechSynthesis no ChatAssistant.tsx
- [x] Reexecutar check, testes completos e build para garantir robustez

- [x] Adicionar verificação de typeof MediaRecorder !== "undefined" no startRecording do ChatAssistant.tsx
- [x] Reexecutar check, testes e build após o ajuste de compatibilidade

- [x] Reexecutar check, testes e build para certificar que a compatibilidade com MediaRecorder passou com sucesso

## Fase 29: Voz Mais Humana, Controlo de Velocidade, Escuta Contínua e Respostas Diretas
- [x] Atualizar o System Prompt do chat.ts para eliminar asteriscos, tom robótico e exigir respostas diretas e naturais
- [x] Refinar a limpeza de texto falado (`cleanText`) para remover asteriscos, markdown, negritos e símbolos antes do SpeechSynthesis
- [x] Adicionar seletor de velocidade de reprodução (1x, 1.25x, 1.5x) e feedback sonoro discreto (Web Audio API beep)
- [x] Implementar suporte a conversação fluida por voz e palavra de ativação com controlos acessíveis
- [x] Validar TypeScript, 248 testes passando, build de produção bem-sucedido e salvar checkpoint final

- [x] Implementar escuta contínua com Web Speech API (SpeechRecognition) e detecção da palavra de ativação "Lume" no ChatAssistant.tsx
- [x] Criar testes unitários para limpeza rigorosa de texto falado e comandos de voz
- [x] Reexecutar check, testes completos e build para garantir qualidade de produção

- [x] Ajustar toggleContinuousListening no ChatAssistant.tsx para exigir estritamente a palavra de ativação "Lume" antes de aceitar comandos
- [x] Adicionar cleanup de recognitionInstance no useEffect ao desmontar o ChatAssistant
- [x] Reexecutar check, testes completos e build

## Fase 30: Correção Definitiva do Tom Robótico da IA (Voz Humana e Conversacional)
- [x] Atualizar o System Prompt do chat.ts para eliminar seções robóticas e estruturadas em tópicos longos, exigindo conversação natural em português coloquial fluído
- [x] Otimizar o speakText em ChatAssistant.tsx para selecionar voz em português do Brasil (pt-BR) natural, ajustar pitch e rate dinâmicos
- [x] Remover pontuações excessivas e travessões longos que causam pausas mecânicas na síntese de voz
- [x] Criar testes unitários para a nova formatação de fala humanizada
- [x] Reexecutar check, testes completos e build de produção para garantir perfeição

## Fase 30: Aperfeiçoamento da Voz e Tom Humano da IA
- [x] Atualizar System Prompt para impor tom acolhedor, caloroso e humano, eliminando tom robótico e explicações formais
- [x] Aplicar limpeza rígida de asteriscos, símbolos de formatação e markdown no backend e no frontend antes de enviar para síntese de voz (TTS)
- [x] Implementar palavra de ativação "Lume" para modo de escuta contínua com feedback sonoro discreto (beeps)
- [x] Adicionar controle de velocidade de reprodução (1x, 1.25x, 1.5x) para a fala do assistente
- [x] Validar testes automatizados (249 testes passando, 0 erros TypeScript)

## Auditoria Geral de Integrações
- [x] Inventariar APIs, conectores, URLs, variáveis de ambiente e serviços internos usados pelo projeto
- [x] Validar ligação à base de dados, esquema, consultas essenciais e migrações
- [x] Validar autenticação OAuth, sessão, rotas protegidas e endpoints tRPC
- [x] Validar armazenamento de ficheiros, upload/download e geração de relatórios
- [x] Testar APIs públicas de Banco Central, IBGE, CoinGecko e demais endpoints configurados
- [x] Testar LLM, transcrição Whisper, síntese de voz e reconhecimento de voz no navegador
- [x] Corrigir integrações avariadas e documentar dependências externas que exigem credenciais ou disponibilidade de terceiros
- [x] Criar testes de regressão para cada falha corrigida
- [x] Executar check, testes, build e verificação final das URLs do projeto

## Auditoria Geral de Integrações e Correções de Conectividade
- [x] Inventariar todas as integrações, endpoints e dependências do Lume App
- [x] Testar conectividade e saúde da base de dados, autenticação e armazenamento S3
- [x] Auditar APIs públicas (IBGE IPCA/PIB, BCB Selic/CDI/Câmbio e CoinGecko)
- [x] Corrigir endpoints desatualizados do IBGE para a API v3 com parsers de séries temporais
- [x] Corrigir cotação de câmbio do BCB para usar série de venda (SGS 1) e compra (SGS 10813)
- [x] Corrigir fluxo de voz server-side para gerar URLs assinadas absolutas no S3
- [x] Executar validação completa com 249 testes unitários passando e 0 erros TypeScript

## Implementação Completa da Lista de Funcionalidades
- [x] Fase 1: Mapear o estado atual e definir a arquitetura das novas funcionalidades
- [x] Fase 2: Criar a base de dados, privacidade e contratos de segurança
- [x] Fase 3: Implementar ações financeiras por voz com confirmação inteligente
- [x] Fase 4: Implementar centro de segurança, contacto de confiança e alertas de fraude
- [x] Fase 5: Implementar inteligência financeira, metas, recorrências, previsões e calendário
- [x] Fase 6: Implementar cofre de documentos e leitura assistida de recibos
- [x] Fase 7: Implementar prevenção contra golpes, notificações, ajuda e relatórios avançados
- [x] Fase 8: Implementar modo simplificado, perfis de voz, histórico de áudio e experiência offline
- [x] Fase 9: Preparar integrações bancárias e painel de saúde técnica sem simular conexões
- [x] Fase 10: Executar testes, revisão de acessibilidade, build e entrega final

## Identidade Visual Oficial da Lume
- [x] Armazenar o logotipo oficial fornecido em armazenamento persistente do projeto
- [x] Aplicar o logotipo oficial no cabeçalho e nos pontos de marca da aplicação
- [x] Atualizar favicon, manifesto PWA e metadados Open Graph com o logotipo oficial
- [x] Validar proporções, acessibilidade, build e checkpoint da identidade visual
