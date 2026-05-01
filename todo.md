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

## Próximas Fases (Futuro)
- [ ] Segurança: 2FA, criptografia, auditoria
- [ ] Agente IA Avançado: recomendações proativas
- [ ] Testes E2E: Playwright
- [ ] Analytics: Plausible/Mixpanel
- [ ] Design System: Storybook
