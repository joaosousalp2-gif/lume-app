# Agente Financeiro IA - Funcionalidades a Implementar

## Resumo
Adicionar módulo de chat inteligente ao site Lume que permite usuários conversar com uma IA sobre suas finanças pessoais.

## O que precisa ser feito:

### 1. Schema Drizzle
- [ ] Criar tabela `chatHistory` com campos:
  - id (autoincrement, primaryKey)
  - userId (foreign key para users)
  - role (enum: "user" | "assistant")
  - content (text)
  - createdAt (timestamp)

### 2. Query Helpers (server/db.ts)
- [ ] `saveChatMessage(userId, role, content)` - Salvar mensagem no banco
- [ ] `getChatHistory(userId, limit=50)` - Retornar últimas N mensagens
- [ ] `clearChatHistory(userId)` - Limpar histórico

### 3. Router tRPC (server/routers.ts)
- [ ] `chat.sendMessage` - Mutation para enviar mensagem
  - Input: { message: string }
  - Lógica:
    1. Buscar lançamentos do usuário com `getLaunchesById(userId)`
    2. Compilar contexto financeiro (total receita, despesa, saldo, gastos por categoria)
    3. Buscar histórico de chat com `getChatHistory(userId, 10)`
    4. Chamar LLM com systemPrompt + contexto + histórico
    5. Salvar mensagem do usuário e resposta da IA
    6. Retornar resposta
- [ ] `chat.getHistory` - Query para obter histórico
- [ ] `chat.clearHistory` - Mutation para limpar histórico

### 4. System Prompt para LLM
Você é um assistente financeiro especializado em educação financeira para pessoas com 60+ anos.

Dados financeiros do usuário:
- Total de receitas este mês: $X
- Total de despesas este mês: $Y
- Saldo: $Z
- Gastos por categoria: [lista]

Seu objetivo:
1. Analisar padrões de gastos do usuário
2. Oferecer dicas personalizadas de economia
3. Responder perguntas sobre finanças
4. Verificar segurança de sites/empresas quando solicitado

Sempre use linguagem clara, acessível, sem jargão técnico.

### 5. Componente React (client/src/pages/ChatAssistant.tsx)
- [ ] Exibir histórico de mensagens
- [ ] Input de texto para enviar mensagens
- [ ] Indicador de carregamento
- [ ] Renderizar markdown com streamdown
- [ ] Botões de ação rápida:
  - "Analisar gastos"
  - "Dicas de economia"
  - "Verificar segurança"

### 6. Rota no App.tsx
- [ ] Adicionar rota `/dashboard/chat` com componente ChatAssistant

### 7. Verificação de Confiabilidade (Opcional)
- [ ] Se usuário mencionar empresa no chat:
  - Detectar automaticamente
  - Chamar `trustApiService.verifyCompany(companyName)`
  - Incluir resultado na resposta da IA

## Design
- Paleta Lume: azul (#2563EB), verde (#22C55E), amarelo (#FACC15)
- Tipografia: Poppins 700 títulos, Nunito 400 body (18px+)
- Componentes shadcn/ui: Card, Button, Input, Dialog
- Acessível para 60+ anos (contraste alto, texto grande)

## Checklist de Implementação
- [ ] Criar schema chatHistory e rodar migração
- [ ] Implementar query helpers em server/db.ts
- [ ] Implementar router chat em server/routers.ts
- [ ] Criar componente ChatAssistant.tsx
- [ ] Adicionar rota em App.tsx
- [ ] Testar fluxo completo (enviar mensagem → receber resposta)
- [ ] Testar histórico (carregar mensagens anteriores)
- [ ] Testar verificação de confiabilidade (opcional)
- [ ] Vitest para routers tRPC

## Notas Importantes
- Usar `protectedProcedure` (requer autenticação)
- Reutilizar `getLaunchesById()` que já existe
- Usar `invokeLLM()` helper do Manus
- Limitar histórico a 50 mensagens para performance
- Rate limit: máx 10 mensagens/minuto por usuário
