# Ideias de Design — Site Lume

## Contexto
Site de apresentação do aplicativo Lume: gestão financeira e prevenção de golpes para pessoas com mais de 60 anos. O design precisa transmitir confiança, clareza, acessibilidade e modernidade — sem ser condescendente.

---

<response>
<probability>0.07</probability>
<idea>

**Design Movement:** Modernismo Humanista — clareza funcional com calor humano

**Core Principles:**
1. Tipografia generosa e hierarquia visual clara — textos grandes, espaçamento amplo
2. Cores com propósito emocional: azul para confiança, verde para prosperidade, amarelo para atenção
3. Layout assimétrico com âncoras visuais fortes (ícones grandes, blocos de cor)
4. Acessibilidade como estética — contraste elevado como escolha de design, não concessão

**Color Philosophy:**
- Fundo branco puro (#FFFFFF) com seções alternadas em azul profundo (#2563EB) e verde (#22C55E)
- Amarelo (#FACC15) como acento de atenção e energia
- Roxo (#7C3AED) para elementos de inovação
- Cinza escuro (#374151) para textos — legibilidade máxima

**Layout Paradigm:**
- Hero assimétrico: texto à esquerda, mockup do app à direita com fundo colorido recortado
- Seções de features em grid 2-col com ícones grandes e descrições concisas
- Cards elevados com sombra suave para cada funcionalidade principal
- Navegação fixa no topo com fundo translúcido

**Signature Elements:**
1. Lâmpada estilizada como símbolo recorrente — no logo, nos ícones, nos separadores de seção
2. Ondas suaves como divisores de seção (SVG) em vez de linhas retas
3. Badges coloridos para categorias de funcionalidades

**Interaction Philosophy:**
- Scroll suave com fade-in de elementos ao entrar na viewport
- Botões com hover de elevação (transform + shadow)
- Tabs interativas na seção de funcionalidades

**Animation:**
- Entrada de elementos: fade-up com 0.3s delay escalonado
- Hover em cards: translateY(-4px) + box-shadow intensificado
- Logo: brilho pulsante suave no ícone da lâmpada

**Typography System:**
- Display: Poppins 700/800 — títulos de seção e hero
- Body: Nunito 400/600 — textos corridos e descrições
- Tamanho mínimo: 18px para body, 32px+ para títulos
- Hierarquia: H1 56px, H2 40px, H3 28px, body 18px

</idea>
</response>

<response>
<probability>0.06</probability>
<idea>

**Design Movement:** Neo-Brutalismo Suave — estrutura ousada com paleta amigável

**Core Principles:**
1. Bordas visíveis e sombras sólidas (sem blur) criam estrutura clara
2. Tipografia extra-bold como elemento visual dominante
3. Blocos de cor sólida como backgrounds de seção
4. Grid irregular com elementos que "quebram" o alinhamento intencionalmente

**Color Philosophy:**
- Fundo creme (#FFFBF0) como base quente e acolhedora
- Azul (#2563EB) e Verde (#22C55E) como cores primárias de bloco
- Amarelo (#FACC15) como cor de destaque e energia
- Sombras em preto sólido (#000000) para profundidade sem blur

**Layout Paradigm:**
- Hero com título gigante que ocupa 60% da tela, mockup flutuante com borda preta
- Features em cards com borda 2px preta e sombra offset
- Seções alternadas com fundos coloridos sólidos

**Signature Elements:**
1. Bordas pretas de 2-3px em todos os cards e botões
2. Sombras offset (4px 4px 0 black) como assinatura visual
3. Ícones em estilo outline com stroke bold

**Interaction Philosophy:**
- Hover em botões: sombra offset aumenta (6px 6px 0 black)
- Hover em cards: leve rotação (1-2deg) + sombra maior
- Transições rápidas (0.15s) para sensação de responsividade

**Animation:**
- Entrada: slide-in lateral com bounce suave
- Botões: pressão visual no click (translateY 2px)
- Números/stats: contador animado ao entrar na viewport

**Typography System:**
- Display: Nunito 900 — títulos com peso máximo
- Body: Nunito 500 — textos com boa legibilidade
- Tamanho mínimo: 18px body, 48px+ títulos
- Uso de uppercase em labels e badges

</idea>
</response>

<response>
<probability>0.08</probability>
<idea>

**Design Movement:** Minimalismo Cálido — espaço generoso com toques de cor estratégicos

**Core Principles:**
1. Espaço em branco como elemento de design principal — respiração visual
2. Uma cor de destaque por seção — nunca mais de duas cores simultâneas
3. Tipografia como âncora visual — tamanhos contrastantes criam hierarquia
4. Ícones grandes e ilustrativos como substitutos de imagens complexas

**Color Philosophy:**
- Fundo off-white (#F8FAFC) para suavidade sem frieza
- Azul (#2563EB) como cor primária de ação e confiança
- Verde (#22C55E) exclusivo para elementos financeiros positivos
- Amarelo (#FACC15) exclusivo para alertas e segurança
- Máximo 2 cores por seção para evitar sobrecarga visual

**Layout Paradigm:**
- Hero centralizado mas com mockup inclinado 5deg para dinamismo
- Features em lista vertical com ícones grandes à esquerda
- Seções com padding generoso (120px top/bottom)
- Footer rico com links organizados em colunas

**Signature Elements:**
1. Gradientes sutis de fundo (branco para azul muito claro)
2. Ícones em círculos coloridos com 64px de diâmetro
3. Linha decorativa colorida sob títulos de seção

**Interaction Philosophy:**
- Hover suave em todos os elementos interativos
- Scroll parallax leve no hero
- Indicadores de progresso em seções longas

**Animation:**
- Fade-in suave (0.4s) para todos os elementos
- Parallax no hero: fundo move a 0.5x velocidade do scroll
- Contadores animados para estatísticas

**Typography System:**
- Display: Poppins 700 — títulos limpos e modernos
- Body: Poppins 400/500 — consistência total
- Tamanho mínimo: 18px body, 40px títulos
- Line-height generoso: 1.8 para body

</idea>
</response>

---

## Design Escolhido: Modernismo Humanista (Opção 1)

Escolhido por combinar melhor com o público-alvo (60+): tipografia generosa com Poppins/Nunito, layout assimétrico dinâmico mas não confuso, cores com propósito emocional claro, e acessibilidade elevada como princípio de design.
