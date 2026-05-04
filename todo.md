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
- [x] Criar componente de configuração de integrações (UserIntegrationsSettings.tsx)
- [x] Criar endpoints tRPC para gerenciar integrações (integrationsRouter)
- [x] Adicionar testes para integrationsRouter (14 testes de criptografia e validação)
- [x] Testar fluxo completo com credenciais do usuário (228 testes passando)
- [x] Integrar credenciais do usuário ao envio de SMS/Email (server/sms.ts e server/email.ts)
- [x] Salvar checkpoint final e publicar para produção


## Fase 17: Sistema de Webhooks para Eventos Críticos
- [x] Planejar arquitetura de webhooks e tipos de eventos
- [x] Criar tabelas userWebhooks e webhookEvents no banco de dados
- [x] Implementar endpoints tRPC para gerenciar webhooks (create, list, delete, update, getEvents)
- [x] Criar webhookDispatcher.ts para disparar eventos e notificações
- [x] Integrar webhooks ao fluxo de detecção de fraude (aiAdvanced.ts)
- [x] Integrar webhooks ao fluxo de limite de orçamento (routers.ts)
- [x] Criar UI WebhooksSettings.tsx para configurar webhooks
- [x] Adicionar rota /settings/webhooks ao App.tsx
- [x] Escrever testes para sistema de webhooks (16 testes, 12 skipped)
- [x] Validar 228 testes passando, 0 erros TypeScript
- [x] Salvar checkpoint final


## Fase 18: Implementacao Real de SMS/Email no Webhook Dispatcher
- [x] Substituir placeholders no webhookDispatcher por implementacao real
- [x] Integrar envio real de SMS com Twilio (sendFraudAlertSMS, sendTransactionAlertSMS)
- [x] Integrar envio real de Email com SendGrid (sendFraudAlertEmail, sendTransactionEmail, sendRecommendationEmail)
- [x] Implementar retry logic com MAX_DELIVERY_ATTEMPTS=3 e RETRY_DELAY=5min
- [x] Adicionar timeout de 30s para deliveries
- [x] Implementar tratamento de erros robusto com logging
- [x] Adicionar funcao clearUserCredentialCaches para limpar caches apos atualizacao
- [x] Criar testes para webhookDispatcher com mocks de SMS/Email (30+ testes)
- [x] Validar 250 testes passando, 0 erros TypeScript


## Fase 19: Deteccao Real de Limite de Orcamento para Webhooks
- [x] Analisar logica atual de orcamento e identificar onde webhooks sao disparados
- [x] Criar funcao de validacao de limite de orcamento com comparacao de gastos (budgetValidator.ts)
- [x] Implementar rastreamento de estado de limite (tabela budgetLimitExceededNotifications)
- [x] Integrar validacao ao fluxo de atualizacao de orcamento (routers.ts)
- [x] Adicionar testes para validacao de limite (22 testes, todos passando)
- [x] Validar integracao completa (272 testes passando, 0 erros TypeScript)
- [x] Salvar checkpoint final


## Fase 20: Integração do Agente de IA na Página Inicial
- [x] Analisar estrutura da página Home.tsx
- [x] Criar componente FloatingAIChat com chat flutuante
- [x] Integrar FloatingAIChat na página Home
- [x] Adicionar estilos responsivos (mobile/desktop)
- [x] Testar funcionamento (272 testes passando, 0 erros TypeScript)
- [x] Validar integração com AIChatBox
