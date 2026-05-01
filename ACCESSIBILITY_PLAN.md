# Plano de Acessibilidade - Lume App (WCAG 2.1 AA)

## Objetivo
Garantir que o Lume App seja acessível para todos os usuários, incluindo pessoas com deficiências visuais, auditivas, motoras e cognitivas.

## Padrão: WCAG 2.1 Nível AA

---

## 1. AUDITORIA ATUAL

### Problemas Identificados

#### 1.1 Leitores de Tela (ARIA)
- [ ] Faltam `aria-label` em botões de ícone
- [ ] Faltam `aria-describedby` em campos de entrada
- [ ] Faltam `role` em elementos customizados
- [ ] Faltam `aria-live` em notificações
- [ ] Faltam `aria-expanded` em menus

#### 1.2 Contraste de Cores
- [ ] Verificar contraste mínimo 4.5:1 para texto normal
- [ ] Verificar contraste mínimo 3:1 para texto grande
- [ ] Verificar contraste em modo claro e escuro

#### 1.3 Navegação por Teclado
- [ ] Verificar ordem de tabulação (tabindex)
- [ ] Verificar foco visível em todos os elementos interativos
- [ ] Verificar atalhos de teclado (Enter, Escape, Arrow keys)
- [ ] Verificar skip links

#### 1.4 Estrutura Semântica
- [ ] Verificar uso correto de headings (h1, h2, h3)
- [ ] Verificar uso de `<main>`, `<nav>`, `<aside>`, `<footer>`
- [ ] Verificar lista de links em navegação

#### 1.5 Formulários
- [ ] Verificar labels associados aos inputs
- [ ] Verificar mensagens de erro acessíveis
- [ ] Verificar validação em tempo real com feedback

#### 1.6 Imagens e Ícones
- [ ] Verificar `alt` text em todas as imagens
- [ ] Verificar ícones com `aria-label`
- [ ] Verificar SVGs com `<title>` e `<desc>`

---

## 2. IMPLEMENTAÇÕES NECESSÁRIAS

### 2.1 ARIA Labels e Roles

#### Botões de Ícone
```tsx
// ❌ Antes
<button><Plus /></button>

// ✅ Depois
<button aria-label="Adicionar novo lançamento">
  <Plus />
</button>
```

#### Campos de Entrada
```tsx
// ❌ Antes
<input type="text" placeholder="Descrição" />

// ✅ Depois
<label htmlFor="description">Descrição</label>
<input 
  id="description" 
  type="text" 
  aria-describedby="description-help"
/>
<span id="description-help">Máximo 100 caracteres</span>
```

#### Notificações
```tsx
// ✅ Adicionar aria-live
<div aria-live="polite" aria-atomic="true">
  Lançamento adicionado com sucesso!
</div>
```

#### Menus
```tsx
// ✅ Adicionar aria-expanded
<button aria-expanded={isOpen} aria-haspopup="menu">
  Menu
</button>
```

### 2.2 Contraste de Cores

#### Mínimos Exigidos
- **Texto Normal:** 4.5:1
- **Texto Grande (18pt+):** 3:1
- **Componentes UI:** 3:1

#### Verificação
- Usar ferramentas: WebAIM Contrast Checker, axe DevTools
- Testar em modo claro e escuro
- Testar com simuladores de daltonismo

### 2.3 Navegação por Teclado

#### Ordem de Tabulação
```tsx
// ✅ Usar tabindex com cuidado
<button tabIndex={0}>Primeiro</button>
<button tabIndex={0}>Segundo</button>
<button tabIndex={0}>Terceiro</button>
```

#### Foco Visível
```css
/* ✅ Sempre manter foco visível */
button:focus-visible {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}
```

#### Atalhos de Teclado
- **Enter:** Ativar botão
- **Escape:** Fechar modal/menu
- **Arrow Up/Down:** Navegar em listas
- **Tab:** Próximo elemento
- **Shift+Tab:** Elemento anterior

### 2.4 Estrutura Semântica

#### Layout Correto
```tsx
// ✅ Usar elementos semânticos
<header>
  <nav aria-label="Navegação principal">...</nav>
</header>
<main>
  <section aria-labelledby="section-title">
    <h2 id="section-title">Lançamentos</h2>
    ...
  </section>
</main>
<footer>...</footer>
```

#### Headings Hierárquicos
```tsx
// ✅ Ordem correta: h1 → h2 → h3
<h1>Lume - Finanças</h1>
<h2>Dashboard</h2>
<h3>Receitas do Mês</h3>
```

### 2.5 Formulários Acessíveis

#### Labels Associados
```tsx
// ✅ Sempre usar htmlFor
<label htmlFor="amount">Valor</label>
<input id="amount" type="number" />
```

#### Mensagens de Erro
```tsx
// ✅ Usar aria-invalid e aria-describedby
<input 
  id="email" 
  type="email" 
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <span id="email-error" role="alert">
    Email inválido
  </span>
)}
```

### 2.6 Imagens e Ícones

#### Alt Text
```tsx
// ✅ Descrever conteúdo e função
<img 
  src="chart.png" 
  alt="Gráfico de gastos por categoria nos últimos 3 meses"
/>

// ✅ Ícones decorativos
<span aria-hidden="true">★</span>

// ✅ Ícones funcionais
<button aria-label="Deletar lançamento">
  <Trash />
</button>
```

---

## 3. MODO DE ALTO CONTRASTE

### Implementação
```css
/* ✅ Respeitar preferência do sistema */
@media (prefers-contrast: more) {
  body {
    --color-text: #000;
    --color-bg: #fff;
    --color-border: #000;
  }
}
```

### Tema Escuro Acessível
```css
/* ✅ Contraste adequado em modo escuro */
@media (prefers-color-scheme: dark) {
  body {
    background: #000;
    color: #fff;
  }
  
  button {
    border: 2px solid #fff;
  }
}
```

---

## 4. TESTES DE ACESSIBILIDADE

### Ferramentas Automáticas
- [ ] axe DevTools (Chrome extension)
- [ ] WAVE (Web Accessibility Evaluation Tool)
- [ ] Lighthouse (Chrome DevTools)
- [ ] Pa11y (CLI tool)

### Testes Manuais
- [ ] Navegar com teclado apenas (sem mouse)
- [ ] Testar com leitor de tela (NVDA, JAWS, VoiceOver)
- [ ] Testar com simulador de daltonismo
- [ ] Testar com zoom 200%
- [ ] Testar com modo de alto contraste

### Testes com Usuários
- [ ] Testar com usuários com deficiência visual
- [ ] Testar com usuários com deficiência motora
- [ ] Testar com usuários com deficiência auditiva
- [ ] Testar com usuários com deficiência cognitiva

---

## 5. CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: ARIA Labels
- [ ] Adicionar `aria-label` em todos os botões de ícone
- [ ] Adicionar `aria-describedby` em campos de entrada
- [ ] Adicionar `aria-live` em notificações
- [ ] Adicionar `aria-expanded` em menus
- [ ] Adicionar `role` em elementos customizados

### Fase 2: Contraste de Cores
- [ ] Verificar contraste em modo claro
- [ ] Verificar contraste em modo escuro
- [ ] Ajustar cores se necessário
- [ ] Testar com simulador de daltonismo

### Fase 3: Navegação por Teclado
- [ ] Verificar ordem de tabulação
- [ ] Adicionar foco visível em todos os elementos
- [ ] Implementar atalhos de teclado
- [ ] Adicionar skip links

### Fase 4: Estrutura Semântica
- [ ] Usar elementos semânticos corretos
- [ ] Verificar hierarquia de headings
- [ ] Adicionar landmarks (`<main>`, `<nav>`, etc)
- [ ] Verificar lista de links em navegação

### Fase 5: Formulários
- [ ] Associar labels aos inputs
- [ ] Adicionar mensagens de erro acessíveis
- [ ] Implementar validação com feedback

### Fase 6: Imagens e Ícones
- [ ] Adicionar `alt` text em todas as imagens
- [ ] Adicionar `aria-label` em ícones funcionais
- [ ] Adicionar `aria-hidden` em ícones decorativos

### Fase 7: Modo de Alto Contraste
- [ ] Implementar media query `prefers-contrast`
- [ ] Implementar media query `prefers-color-scheme`
- [ ] Testar com modo de alto contraste ativado

### Fase 8: Testes
- [ ] Executar ferramentas automáticas
- [ ] Testar com teclado
- [ ] Testar com leitor de tela
- [ ] Testar com zoom 200%
- [ ] Testar com simulador de daltonismo

---

## 6. REFERÊNCIAS

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [Deque University](https://dequeuniversity.com/)

---

## 7. MÉTRICAS DE SUCESSO

- [ ] Score Lighthouse Accessibility ≥ 90
- [ ] Zero erros críticos em axe DevTools
- [ ] Navegação completa com teclado
- [ ] Compatibilidade com leitores de tela
- [ ] Contraste mínimo 4.5:1 em todo o site
- [ ] Modo de alto contraste funcionando
- [ ] Feedback positivo de usuários com deficiência
