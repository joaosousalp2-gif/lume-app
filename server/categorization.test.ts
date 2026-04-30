import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  suggestCategory,
  PREDEFINED_CATEGORIES,
  isValidCategory,
  getAvailableCategories,
  extractUserCategoryPreferences,
} from './_core/categorization';

// Mock da função invokeLLM
vi.mock('./_core/llm', () => ({
  invokeLLM: vi.fn(async (params: any) => {
    // Simular resposta da IA
    const description = params.messages[1].content;
    const type = description.includes('receita') ? 'receita' : 'despesa';

    let suggestion = {
      category: 'Outros',
      confidence: 0.5,
      reasoning: 'Categoria padrão',
    };

    // Lógica simples para simular categorização
    if (description.toLowerCase().includes('salário') || description.toLowerCase().includes('bonus')) {
      suggestion = {
        category: 'Salário',
        confidence: 0.95,
        reasoning: 'Menção de salário detectada',
      };
    } else if (description.toLowerCase().includes('comida') || description.toLowerCase().includes('supermercado')) {
      suggestion = {
        category: 'Alimentação',
        confidence: 0.9,
        reasoning: 'Menção de alimentos detectada',
      };
    } else if (description.toLowerCase().includes('uber') || description.toLowerCase().includes('ônibus')) {
      suggestion = {
        category: 'Transportes',
        confidence: 0.85,
        reasoning: 'Menção de transporte detectada',
      };
    } else if (description.toLowerCase().includes('médico') || description.toLowerCase().includes('farmácia')) {
      suggestion = {
        category: 'Saúde',
        confidence: 0.88,
        reasoning: 'Menção de saúde detectada',
      };
    }

    return {
      choices: [
        {
          message: {
            content: JSON.stringify(suggestion),
          },
        },
      ],
    };
  }),
}));

describe('AI Categorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should suggest category for salary receipt', async () => {
    const suggestion = await suggestCategory('Salário de abril', 'receita');

    expect(suggestion).toBeDefined();
    expect(suggestion.category).toBe('Salário');
    expect(suggestion.confidence).toBeGreaterThan(0.8);
    expect(suggestion.reasoning).toBeDefined();
  });

  it('should suggest category for food expense', async () => {
    const suggestion = await suggestCategory('Compras no supermercado', 'despesa');

    expect(suggestion).toBeDefined();
    expect(suggestion.category).toBe('Alimentação');
    expect(suggestion.confidence).toBeGreaterThan(0.8);
  });

  it('should suggest category for transportation expense', async () => {
    const suggestion = await suggestCategory('Uber para o trabalho', 'despesa');

    expect(suggestion).toBeDefined();
    expect(suggestion.category).toBe('Transportes');
    expect(suggestion.confidence).toBeGreaterThan(0.8);
  });

  it('should suggest category for health expense', async () => {
    const suggestion = await suggestCategory('Consulta com médico', 'despesa');

    expect(suggestion).toBeDefined();
    expect(suggestion.category).toBe('Saúde');
    expect(suggestion.confidence).toBeGreaterThan(0.8);
  });

  it('should return confidence between 0 and 1', async () => {
    const suggestion = await suggestCategory('Descrição aleatória', 'despesa');

    expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
    expect(suggestion.confidence).toBeLessThanOrEqual(1);
  });

  it('should validate category for receita type', () => {
    const validCategories = getAvailableCategories('receita');

    expect(isValidCategory('Salário', 'receita')).toBe(true);
    expect(isValidCategory('Pensão', 'receita')).toBe(true);
    expect(isValidCategory('Alimentação', 'receita')).toBe(false);
    expect(validCategories).toContain('Salário');
    expect(validCategories).not.toContain('Alimentação');
  });

  it('should validate category for despesa type', () => {
    const validCategories = getAvailableCategories('despesa');

    expect(isValidCategory('Alimentação', 'despesa')).toBe(true);
    expect(isValidCategory('Saúde', 'despesa')).toBe(true);
    expect(isValidCategory('Salário', 'despesa')).toBe(false);
    expect(validCategories).toContain('Alimentação');
    expect(validCategories).not.toContain('Salário');
  });

  it('should return all available categories for receita', () => {
    const categories = getAvailableCategories('receita');

    expect(categories).toEqual(PREDEFINED_CATEGORIES.receita);
    expect(categories).toContain('Salário');
    expect(categories).toContain('Pensão');
  });

  it('should return all available categories for despesa', () => {
    const categories = getAvailableCategories('despesa');

    expect(categories).toEqual(PREDEFINED_CATEGORIES.despesa);
    expect(categories).toContain('Alimentação');
    expect(categories).toContain('Saúde');
  });

  it('should extract user category preferences from launches', () => {
    const launches = [
      {
        category: 'Salário',
        description: 'Salário de abril',
        type: 'receita' as const,
      },
      {
        category: 'Salário',
        description: 'Bônus',
        type: 'receita' as const,
      },
      {
        category: 'Alimentação',
        description: 'Supermercado',
        type: 'despesa' as const,
      },
      {
        category: 'Alimentação',
        description: 'Restaurante',
        type: 'despesa' as const,
      },
    ];

    const preferences = extractUserCategoryPreferences(launches);

    expect(preferences['receita:Salário']).toEqual(['Salário de abril', 'Bônus']);
    expect(preferences['despesa:Alimentação']).toEqual(['Supermercado', 'Restaurante']);
    expect(Object.keys(preferences).length).toBe(2);
  });

  it('should handle empty launches for preferences', () => {
    const preferences = extractUserCategoryPreferences([]);

    expect(Object.keys(preferences).length).toBe(0);
  });

  it('should ensure suggested category is in valid list', async () => {
    const suggestion = await suggestCategory('Descrição aleatória', 'despesa');
    const validCategories = getAvailableCategories('despesa');

    expect(validCategories).toContain(suggestion.category);
  });

  it('should handle multiple launches with same category', () => {
    const launches = [
      {
        category: 'Alimentação',
        description: 'Supermercado 1',
        type: 'despesa' as const,
      },
      {
        category: 'Alimentação',
        description: 'Supermercado 2',
        type: 'despesa' as const,
      },
      {
        category: 'Alimentação',
        description: 'Restaurante',
        type: 'despesa' as const,
      },
    ];

    const preferences = extractUserCategoryPreferences(launches);

    expect(preferences['despesa:Alimentação']).toHaveLength(3);
    expect(preferences['despesa:Alimentação']).toContain('Supermercado 1');
    expect(preferences['despesa:Alimentação']).toContain('Supermercado 2');
    expect(preferences['despesa:Alimentação']).toContain('Restaurante');
  });

  it('should return default category on error', async () => {
    // Testar que em caso de erro, retorna 'Outros'
    const suggestion = await suggestCategory('', 'despesa');

    expect(suggestion.category).toBeDefined();
    expect(getAvailableCategories('despesa')).toContain(suggestion.category);
  });
});
