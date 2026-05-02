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
