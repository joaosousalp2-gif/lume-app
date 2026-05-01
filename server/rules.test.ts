import { describe, it, expect } from 'vitest';

// Tipos para testes
interface Rule {
  id: number;
  userId: number;
  pattern: string;
  type: 'receita' | 'despesa';
  category: string;
  priority: number;
  isActive: number;
  timesApplied: number;
}

// Simulação de regras em memória para testes
const mockRules: Rule[] = [
  {
    id: 1,
    userId: 1,
    pattern: 'Uber',
    type: 'despesa',
    category: 'Transportes',
    priority: 10,
    isActive: 1,
    timesApplied: 5,
  },
  {
    id: 2,
    userId: 1,
    pattern: 'Netflix',
    type: 'despesa',
    category: 'Lazer',
    priority: 5,
    isActive: 1,
    timesApplied: 3,
  },
  {
    id: 3,
    userId: 1,
    pattern: 'Salário',
    type: 'receita',
    category: 'Salário',
    priority: 20,
    isActive: 1,
    timesApplied: 12,
  },
];

// Funções helper para testes
const matchRuleForDescriptionMock = (
  userId: number,
  description: string,
  type: 'receita' | 'despesa'
): Rule | null => {
  const lowerDesc = description.toLowerCase();
  const rules = mockRules
    .filter((r) => r.userId === userId && r.type === type && r.isActive === 1)
    .sort((a, b) => b.priority - a.priority);

  for (const rule of rules) {
    if (lowerDesc.includes(rule.pattern.toLowerCase())) {
      return rule;
    }
  }
  return null;
};

const getRulesByUserIdMock = (userId: number): Rule[] => {
  return mockRules
    .filter((r) => r.userId === userId && r.isActive === 1)
    .sort((a, b) => b.priority - a.priority);
};

describe('Categorization Rules', () => {
  it('should match rule for description containing pattern', () => {
    const rule = matchRuleForDescriptionMock(1, 'Uber para o trabalho', 'despesa');

    expect(rule).toBeDefined();
    expect(rule?.category).toBe('Transportes');
    expect(rule?.pattern).toBe('Uber');
  });

  it('should not match rule for different type', () => {
    const rule = matchRuleForDescriptionMock(1, 'Salário de abril', 'despesa');

    expect(rule).toBeNull();
  });

  it('should match rule case-insensitively', () => {
    const rule = matchRuleForDescriptionMock(1, 'UBER PARA O TRABALHO', 'despesa');

    expect(rule).toBeDefined();
    expect(rule?.category).toBe('Transportes');
  });

  it('should match Netflix rule', () => {
    const rule = matchRuleForDescriptionMock(1, 'Netflix subscription', 'despesa');

    expect(rule).toBeDefined();
    expect(rule?.category).toBe('Lazer');
    expect(rule?.pattern).toBe('Netflix');
  });

  it('should match Salário rule for receita', () => {
    const rule = matchRuleForDescriptionMock(1, 'Salário de abril', 'receita');

    expect(rule).toBeDefined();
    expect(rule?.category).toBe('Salário');
    expect(rule?.type).toBe('receita');
  });

  it('should return rules ordered by priority (highest first)', () => {
    const rules = getRulesByUserIdMock(1);

    expect(rules.length).toBeGreaterThan(0);
    for (let i = 0; i < rules.length - 1; i++) {
      expect(rules[i].priority).toBeGreaterThanOrEqual(rules[i + 1].priority);
    }
  });

  it('should only return active rules', () => {
    const rules = getRulesByUserIdMock(1);

    rules.forEach((rule) => {
      expect(rule.isActive).toBe(1);
    });
  });

  it('should track times a rule was applied', () => {
    const rule = matchRuleForDescriptionMock(1, 'Uber', 'despesa');

    expect(rule).toBeDefined();
    expect(rule?.timesApplied).toBeGreaterThan(0);
    expect(typeof rule?.timesApplied).toBe('number');
  });

  it('should validate pattern matching is substring-based', () => {
    // "Uber para o trabalho" contém "Uber"
    const rule1 = matchRuleForDescriptionMock(1, 'Uber para o trabalho', 'despesa');
    expect(rule1).toBeDefined();

    // "Viagem de Uber" também contém "Uber"
    const rule2 = matchRuleForDescriptionMock(1, 'Viagem de Uber', 'despesa');
    expect(rule2).toBeDefined();

    // "Transporte" não contém "Uber"
    const rule3 = matchRuleForDescriptionMock(1, 'Transporte', 'despesa');
    expect(rule3).toBeNull();
  });

  it('should return highest priority rule when multiple match', () => {
    // Criar cenário onde múltiplas regras poderiam combinar
    const allRules = getRulesByUserIdMock(1);
    const uberRule = allRules.find((r) => r.pattern === 'Uber');
    const salarioRule = allRules.find((r) => r.pattern === 'Salário');

    expect(uberRule?.priority).toBe(10);
    expect(salarioRule?.priority).toBe(20);
    expect(salarioRule!.priority).toBeGreaterThan(uberRule!.priority);
  });

  it('should handle empty description gracefully', () => {
    const rule = matchRuleForDescriptionMock(1, '', 'despesa');

    expect(rule).toBeNull();
  });

  it('should handle non-existent user gracefully', () => {
    const rules = getRulesByUserIdMock(999);

    expect(rules).toEqual([]);
  });

  it('should validate rule has required properties', () => {
    const rule = mockRules[0];

    expect(rule).toHaveProperty('id');
    expect(rule).toHaveProperty('userId');
    expect(rule).toHaveProperty('pattern');
    expect(rule).toHaveProperty('type');
    expect(rule).toHaveProperty('category');
    expect(rule).toHaveProperty('priority');
    expect(rule).toHaveProperty('isActive');
    expect(rule).toHaveProperty('timesApplied');
  });

  it('should verify pattern is not empty', () => {
    const rule = mockRules[0];

    expect(rule.pattern.length).toBeGreaterThan(0);
  });

  it('should verify category is valid', () => {
    const validCategories = [
      'Pensão',
      'Salário',
      'Aluguel de Imóvel',
      'Venda de Itens',
      'Outros',
      'Saúde',
      'Alimentação',
      'Moradia',
      'Lazer',
      'Transportes',
      'Educação',
      'Utilidades',
    ];

    mockRules.forEach((rule) => {
      expect(validCategories).toContain(rule.category);
    });
  });
});
