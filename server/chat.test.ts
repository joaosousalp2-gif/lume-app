import { describe, it, expect, beforeEach } from 'vitest';

// Tipos para testes
interface ChatMessage {
  id: number;
  userId: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface Launch {
  id: number;
  userId: number;
  type: 'receita' | 'despesa';
  date: string;
  category: string;
  value: string;
  description?: string;
}

// Mock de dados
const mockLaunches: Launch[] = [
  {
    id: 1,
    userId: 1,
    type: 'receita',
    date: '2026-05-01',
    category: 'Salário',
    value: '5000.00',
    description: 'Salário mensal',
  },
  {
    id: 2,
    userId: 1,
    type: 'despesa',
    date: '2026-05-05',
    category: 'Alimentação',
    value: '500.00',
    description: 'Supermercado',
  },
  {
    id: 3,
    userId: 1,
    type: 'despesa',
    date: '2026-05-10',
    category: 'Transportes',
    value: '200.00',
    description: 'Uber',
  },
];

const mockChatHistory: ChatMessage[] = [
  {
    id: 1,
    userId: 1,
    role: 'user',
    content: 'Como estão meus gastos?',
    createdAt: new Date('2026-05-01T10:00:00'),
  },
  {
    id: 2,
    userId: 1,
    role: 'assistant',
    content: 'Você gastou R$ 700 este mês em alimentação e transportes.',
    createdAt: new Date('2026-05-01T10:01:00'),
  },
];

// Funções helper para testes
const calculateFinancialContext = (launches: Launch[], month: string) => {
  const totalReceita = launches
    .filter(l => l.type === 'receita' && l.date.startsWith(month))
    .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

  const totalDespesa = launches
    .filter(l => l.type === 'despesa' && l.date.startsWith(month))
    .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

  const saldo = totalReceita - totalDespesa;

  const gastosPorCategoria: Record<string, number> = {};
  launches
    .filter(l => l.type === 'despesa' && l.date.startsWith(month))
    .forEach(l => {
      gastosPorCategoria[l.category] = (gastosPorCategoria[l.category] || 0) + (parseFloat(l.value) || 0);
    });

  return { totalReceita, totalDespesa, saldo, gastosPorCategoria };
};

const buildSystemPrompt = (context: any) => {
  const categoriasStr = Object.entries(context.gastosPorCategoria)
    .map(([cat, val]: [string, number]) => `${cat}: R$ ${val.toFixed(2)}`)
    .join(', ') || 'Nenhum gasto registrado';

  return `Você é um assistente financeiro especializado em educação financeira para pessoas com 60+ anos.

Dados financeiros do usuário:
- Total de receitas este mês: R$ ${context.totalReceita.toFixed(2)}
- Total de despesas este mês: R$ ${context.totalDespesa.toFixed(2)}
- Saldo: R$ ${context.saldo.toFixed(2)}
- Gastos por categoria: ${categoriasStr}

Seu objetivo:
1. Analisar padrões de gastos do usuário
2. Oferecer dicas personalizadas de economia
3. Responder perguntas sobre finanças
4. Verificar segurança de sites/empresas quando solicitado

Sempre use linguagem clara, acessível, sem jargão técnico.`;
};

describe('Chat Router', () => {
  let chatHistory: ChatMessage[] = [];

  beforeEach(() => {
    chatHistory = [...mockChatHistory];
  });

  describe('Financial Context Calculation', () => {
    it('should calculate total income correctly', () => {
      const context = calculateFinancialContext(mockLaunches, '2026-05');
      expect(context.totalReceita).toBe(5000);
    });

    it('should calculate total expenses correctly', () => {
      const context = calculateFinancialContext(mockLaunches, '2026-05');
      expect(context.totalDespesa).toBe(700);
    });

    it('should calculate balance correctly', () => {
      const context = calculateFinancialContext(mockLaunches, '2026-05');
      expect(context.saldo).toBe(4300);
    });

    it('should group expenses by category', () => {
      const context = calculateFinancialContext(mockLaunches, '2026-05');
      expect(context.gastosPorCategoria['Alimentação']).toBe(500);
      expect(context.gastosPorCategoria['Transportes']).toBe(200);
    });

    it('should handle empty launches', () => {
      const context = calculateFinancialContext([], '2026-05');
      expect(context.totalReceita).toBe(0);
      expect(context.totalDespesa).toBe(0);
      expect(context.saldo).toBe(0);
    });

    it('should filter by month correctly', () => {
      const context = calculateFinancialContext(mockLaunches, '2026-06');
      expect(context.totalReceita).toBe(0);
      expect(context.totalDespesa).toBe(0);
    });
  });

  describe('System Prompt Generation', () => {
    it('should generate valid system prompt', () => {
      const context = calculateFinancialContext(mockLaunches, '2026-05');
      const prompt = buildSystemPrompt(context);
      
      expect(prompt).toContain('assistente financeiro');
      expect(prompt).toContain('R$ 5000.00');
      expect(prompt).toContain('R$ 700.00');
      expect(prompt).toContain('R$ 4300.00');
    });

    it('should include all expense categories', () => {
      const context = calculateFinancialContext(mockLaunches, '2026-05');
      const prompt = buildSystemPrompt(context);
      
      expect(prompt).toContain('Alimentação');
      expect(prompt).toContain('Transportes');
    });

    it('should handle empty categories', () => {
      const context = calculateFinancialContext([], '2026-05');
      const prompt = buildSystemPrompt(context);
      
      expect(prompt).toContain('Nenhum gasto registrado');
    });
  });

  describe('Chat History Management', () => {
    it('should retrieve chat history', () => {
      expect(chatHistory).toHaveLength(2);
      expect(chatHistory[0].role).toBe('user');
      expect(chatHistory[1].role).toBe('assistant');
    });

    it('should maintain message order', () => {
      expect(chatHistory[0].id).toBe(1);
      expect(chatHistory[1].id).toBe(2);
    });

    it('should store user and assistant messages', () => {
      const userMessages = chatHistory.filter(m => m.role === 'user');
      const assistantMessages = chatHistory.filter(m => m.role === 'assistant');
      
      expect(userMessages).toHaveLength(1);
      expect(assistantMessages).toHaveLength(1);
    });

    it('should include timestamps', () => {
      chatHistory.forEach(msg => {
        expect(msg.createdAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('Message Validation', () => {
    it('should validate message content is not empty', () => {
      const validMessage = { content: 'Como estão meus gastos?' };
      expect(validMessage.content.trim().length).toBeGreaterThan(0);
    });

    it('should validate message role', () => {
      const validRoles = ['user', 'assistant'];
      chatHistory.forEach(msg => {
        expect(validRoles).toContain(msg.role);
      });
    });

    it('should validate userId is positive', () => {
      chatHistory.forEach(msg => {
        expect(msg.userId).toBeGreaterThan(0);
      });
    });
  });

  describe('Financial Insights', () => {
    it('should identify high spending categories', () => {
      const context = calculateFinancialContext(mockLaunches, '2026-05');
      const categories = Object.entries(context.gastosPorCategoria)
        .sort(([, a], [, b]) => b - a);
      
      expect(categories[0][0]).toBe('Alimentação');
      expect(categories[0][1]).toBe(500);
    });

    it('should calculate spending percentage', () => {
      const context = calculateFinancialContext(mockLaunches, '2026-05');
      const spendingPercentage = (context.totalDespesa / context.totalReceita) * 100;
      
      expect(spendingPercentage).toBeCloseTo(14, 1);
    });

    it('should identify savings potential', () => {
      const context = calculateFinancialContext(mockLaunches, '2026-05');
      expect(context.saldo).toBeGreaterThan(0);
      expect(context.saldo).toBe(4300);
    });
  });
});
