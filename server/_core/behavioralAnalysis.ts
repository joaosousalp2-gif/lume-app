/**
 * Behavioral Analysis - Implements 50/50 technical + behavioral recommendations
 * Focuses on psychological sustainability, not just mathematical optimization
 */

export interface BehavioralRecommendation {
  phase1: Phase;
  phase2: Phase;
  phase3: Phase;
  totalSavings: number;
  psychologicalNotes: string;
}

export interface Phase {
  name: string;
  duration: string;
  actions: Action[];
  subtotalSavings: number;
  psychologicalBenefit: string;
}

export interface Action {
  title: string;
  what: string; // O quê fazer (técnico)
  why: string; // Por quê funciona (comportamento)
  how: string; // Como manter (comportamento)
  savingsPerMonth: number;
  difficulty: "fácil" | "moderada" | "difícil";
}

/**
 * Analyze spending patterns and generate behavioral recommendations
 */
export function generateBehavioralRecommendation(
  currentSpending: Record<string, number>,
  targetSavings: number,
  userContext: {
    hasEmergencyFund: boolean;
    incomeVariability: "estável" | "variável";
    healthExpenses: number;
  }
): BehavioralRecommendation {
  // Phase 1: Easy wins (low effort, high impact)
  const phase1: Phase = {
    name: "Ganhe Confiança",
    duration: "Semana 1-2",
    actions: generatePhase1Actions(currentSpending),
    subtotalSavings: 0,
    psychologicalBenefit: "Você economiza sem sofrimento, ganha momentum",
  };
  phase1.subtotalSavings = phase1.actions.reduce((sum, a) => sum + a.savingsPerMonth, 0);

  // Phase 2: Moderate adjustments (establish control)
  const phase2: Phase = {
    name: "Estabeleça Controle",
    duration: "Semana 3-6",
    actions: generatePhase2Actions(currentSpending, phase1.subtotalSavings),
    subtotalSavings: 0,
    psychologicalBenefit: "Você controla gastos, não se sente privado",
  };
  phase2.subtotalSavings = phase2.actions.reduce((sum, a) => sum + a.savingsPerMonth, 0);

  // Phase 3: Consolidate habits (if needed)
  const phase3: Phase = {
    name: "Consolide Hábitos",
    duration: "Semana 7+",
    actions: generatePhase3Actions(currentSpending, phase1.subtotalSavings + phase2.subtotalSavings, targetSavings),
    subtotalSavings: 0,
    psychologicalBenefit: "Mudança virou hábito, não sacrifício",
  };
  phase3.subtotalSavings = phase3.actions.reduce((sum, a) => sum + a.savingsPerMonth, 0);

  const totalSavings = phase1.subtotalSavings + phase2.subtotalSavings + phase3.subtotalSavings;

  // Add emergency fund note if missing
  let psychologicalNotes = "";
  if (!userContext.hasEmergencyFund) {
    psychologicalNotes += "⚠️ PARALELO: Enquanto economiza para meta, reserve R$ 100/mês para fundo de emergência. Isso reduz impacto de despesas inesperadas (como saúde).\n";
  }
  if (userContext.incomeVariability === "variável") {
    psychologicalNotes += "⚠️ Sua renda é variável. Recomendações usam receita média. Meses com receita baixa, reduza ritmo de economia.\n";
  }
  if (userContext.healthExpenses > 200) {
    psychologicalNotes += "⚠️ Suas despesas de saúde são altas e impredizíveis. Fundo de emergência é CRÍTICO para você.\n";
  }

  return {
    phase1,
    phase2,
    phase3,
    totalSavings,
    psychologicalNotes,
  };
}

function generatePhase1Actions(spending: Record<string, number>): Action[] {
  const actions: Action[] = [];

  // Easy win: Cancel unnecessary subscriptions
  if (spending["Assinaturas"] && spending["Assinaturas"] > 10) {
    actions.push({
      title: "Cancele assinatura desnecessária",
      what: "Remova uma assinatura (ex: Spotify, se tem Netflix)",
      why: "Nenhum sacrifício real, você tem alternativa",
      how: "Faça hoje, em 2 minutos",
      savingsPerMonth: 15,
      difficulty: "fácil",
    });
  }

  // Easy win: Set spending limit on impulse category
  if (spending["Compras Online"] && spending["Compras Online"] > 300) {
    actions.push({
      title: "Defina limite de compras online",
      what: "Coloque limite em R$ 300 (vs R$ 420)",
      why: "Suas compras crescem impulsivamente, precisa de controle",
      how: "Use alarme no celular, pergunte 'preciso ou quero?'",
      savingsPerMonth: 120,
      difficulty: "fácil",
    });
  }

  // Easy win: Cancel duplicate services
  if (spending["Academia"] && spending["Academia"] > 100) {
    actions.push({
      title: "Avalie se usa todas as assinaturas",
      what: "Teste 1 mês sem uma assinatura",
      why: "Muitas pessoas pagam por serviços que não usam",
      how: "Escolha qual menos usa, cancele e teste",
      savingsPerMonth: 50,
      difficulty: "fácil",
    });
  }

  return actions.slice(0, 2); // Max 2 easy actions
}

function generatePhase2Actions(spending: Record<string, number>, phase1Savings: number): Action[] {
  const actions: Action[] = [];

  // Moderate: Reduce restaurant spending
  if (spending["Restaurante"] && spending["Restaurante"] > 400) {
    const reduction = Math.min(150, spending["Restaurante"] * 0.25);
    actions.push({
      title: "Reduza restaurante para 2x por semana",
      what: "Planeje 2 saídas na semana, cozinhe nos outros dias",
      why: "Você gasta muito, pode reduzir sem sofrer",
      how: "Planeje refeições, compre ingredientes baratos",
      savingsPerMonth: reduction,
      difficulty: "moderada",
    });
  }

  // Moderate: Optimize grocery spending
  if (spending["Alimentação"] && spending["Alimentação"] > 400) {
    const reduction = Math.min(180, spending["Alimentação"] * 0.25);
    actions.push({
      title: "Otimize compras de alimentação",
      what: "Compre genéricos, planeje refeições, evite desperdício",
      why: "Sua meta é R$ 500, dados mostram que é possível",
      how: "Faça lista antes de ir ao mercado, compare preços",
      savingsPerMonth: reduction,
      difficulty: "moderada",
    });
  }

  return actions.slice(0, 2); // Max 2 moderate actions
}

function generatePhase3Actions(spending: Record<string, number>, phase1And2Savings: number, targetSavings: number): Action[] {
  const actions: Action[] = [];
  const remainingSavingsNeeded = Math.max(0, targetSavings - phase1And2Savings);

  if (remainingSavingsNeeded > 0) {
    // Difficult: Reduce entertainment/leisure
    if (spending["Lazer"] && spending["Lazer"] > 300) {
      const reduction = Math.min(remainingSavingsNeeded, spending["Lazer"] * 0.2);
      actions.push({
        title: "Reduza gastos com lazer",
        what: "Escolha atividades mais baratas ou gratuitas",
        why: "Você já fez cortes fáceis, agora otimize lazer",
        how: "Pesquise atividades gratuitas na sua cidade",
        savingsPerMonth: reduction,
        difficulty: "difícil",
      });
    }
  }

  return actions;
}

/**
 * Generate monitoring checklist for behavioral tracking
 */
export function generateMonitoringChecklist(phases: Phase[]): string {
  let checklist = "## MONITORAMENTO COMPORTAMENTAL\n\n";

  checklist += "**Semana 2:** Você economizou R$ " + phases[0].subtotalSavings + " sem sofrimento?\n";
  checklist += "→ SIM: Passe para Fase 2 com confiança\n";
  checklist += "→ NÃO: Fique mais tempo em Fase 1, ganhe momentum\n\n";

  checklist += "**Semana 4:** Você mantém os limites estabelecidos?\n";
  checklist += "→ SIM: Você tem controle, continue\n";
  checklist += "→ NÃO: Aumentar limites é OK, não desista\n\n";

  checklist += "**Semana 6:** Você sente controle ou privação?\n";
  checklist += "→ CONTROLE: Você está pronto para Fase 3\n";
  checklist += "→ PRIVAÇÃO: Reduza ritmo, fique mais tempo em Fase 2\n\n";

  checklist += "**Sinais de alerta:**\n";
  checklist += "- Você desistiu? Volte para Fase 1, ganhe confiança novamente\n";
  checklist += "- Você se sente muito privado? Aumentar alguns limites é OK\n";
  checklist += "- Você quer fazer mais? Ótimo, mas não pule etapas\n";

  return checklist;
}
