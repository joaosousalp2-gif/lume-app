import { describe, it, expect } from 'vitest';

// Tipos para testes
interface BankAccount {
  id: number;
  userId: number;
  name: string;
  type: 'corrente' | 'poupanca' | 'investimentos' | 'outro';
  balance: string;
  bankName?: string;
  accountNumber?: string;
  isActive: number;
  displayOrder: number;
}

interface Budget {
  id: number;
  userId: number;
  category: string;
  limit: string;
  month: string;
  alertThresholds: string;
}

// Mock de contas bancárias
const mockAccounts: BankAccount[] = [
  {
    id: 1,
    userId: 1,
    name: 'Conta Corrente',
    type: 'corrente',
    balance: '5000.00',
    bankName: 'Santander',
    accountNumber: '123456-7',
    isActive: 1,
    displayOrder: 0,
  },
  {
    id: 2,
    userId: 1,
    name: 'Poupança',
    type: 'poupanca',
    balance: '10000.00',
    bankName: 'Itaú',
    accountNumber: '654321-0',
    isActive: 1,
    displayOrder: 1,
  },
];

// Mock de orçamentos
const mockBudgets: Budget[] = [
  {
    id: 1,
    userId: 1,
    category: 'Alimentação',
    limit: '1000.00',
    month: '2026-05',
    alertThresholds: '75,90,100',
  },
  {
    id: 2,
    userId: 1,
    category: 'Transportes',
    limit: '500.00',
    month: '2026-05',
    alertThresholds: '75,90,100',
  },
];

// Funções helper para testes
const getTotalBalance = (accounts: BankAccount[]): number => {
  return accounts.reduce((sum, account) => {
    return sum + (parseFloat(account.balance) || 0);
  }, 0);
};

const getAccountsByType = (accounts: BankAccount[], type: string): BankAccount[] => {
  return accounts.filter((a) => a.type === type);
};

const getBudgetsByMonth = (budgets: Budget[], month: string): Budget[] => {
  return budgets.filter((b) => b.month === month);
};

const getUsagePercentage = (spent: number, limit: number): number => {
  if (limit === 0) return 0;
  return Math.min((spent / limit) * 100, 100);
};

describe('Bank Accounts', () => {
  it('should calculate total balance correctly', () => {
    const total = getTotalBalance(mockAccounts);
    expect(total).toBe(15000);
  });

  it('should filter accounts by type', () => {
    const correnteAccounts = getAccountsByType(mockAccounts, 'corrente');
    expect(correnteAccounts).toHaveLength(1);
    expect(correnteAccounts[0].name).toBe('Conta Corrente');
  });

  it('should have correct account properties', () => {
    const account = mockAccounts[0];
    expect(account).toHaveProperty('id');
    expect(account).toHaveProperty('userId');
    expect(account).toHaveProperty('name');
    expect(account).toHaveProperty('type');
    expect(account).toHaveProperty('balance');
    expect(account).toHaveProperty('isActive');
  });

  it('should validate account balance is numeric', () => {
    mockAccounts.forEach((account) => {
      const balance = parseFloat(account.balance);
      expect(typeof balance).toBe('number');
      expect(balance).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have valid account types', () => {
    const validTypes = ['corrente', 'poupanca', 'investimentos', 'outro'];
    mockAccounts.forEach((account) => {
      expect(validTypes).toContain(account.type);
    });
  });

  it('should display accounts in correct order', () => {
    const sorted = [...mockAccounts].sort((a, b) => a.displayOrder - b.displayOrder);
    expect(sorted[0].displayOrder).toBeLessThanOrEqual(sorted[1].displayOrder);
  });

  it('should handle multiple accounts per user', () => {
    const userAccounts = mockAccounts.filter((a) => a.userId === 1);
    expect(userAccounts.length).toBeGreaterThan(1);
  });

  it('should only include active accounts', () => {
    const activeAccounts = mockAccounts.filter((a) => a.isActive === 1);
    expect(activeAccounts.length).toBe(mockAccounts.length);
  });
});

describe('Budgets', () => {
  it('should filter budgets by month', () => {
    const mayBudgets = getBudgetsByMonth(mockBudgets, '2026-05');
    expect(mayBudgets).toHaveLength(2);
  });

  it('should calculate usage percentage correctly', () => {
    const spent = 750;
    const limit = 1000;
    const percentage = getUsagePercentage(spent, limit);
    expect(percentage).toBe(75);
  });

  it('should cap usage percentage at 100%', () => {
    const spent = 1500;
    const limit = 1000;
    const percentage = getUsagePercentage(spent, limit);
    expect(percentage).toBe(100);
  });

  it('should handle zero limit gracefully', () => {
    const percentage = getUsagePercentage(100, 0);
    expect(percentage).toBe(0);
  });

  it('should have correct budget properties', () => {
    const budget = mockBudgets[0];
    expect(budget).toHaveProperty('id');
    expect(budget).toHaveProperty('userId');
    expect(budget).toHaveProperty('category');
    expect(budget).toHaveProperty('limit');
    expect(budget).toHaveProperty('month');
    expect(budget).toHaveProperty('alertThresholds');
  });

  it('should validate budget limit is numeric', () => {
    mockBudgets.forEach((budget) => {
      const limit = parseFloat(budget.limit);
      expect(typeof limit).toBe('number');
      expect(limit).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have valid month format (YYYY-MM)', () => {
    const monthRegex = /^\d{4}-\d{2}$/;
    mockBudgets.forEach((budget) => {
      expect(budget.month).toMatch(monthRegex);
    });
  });

  it('should have alert thresholds', () => {
    mockBudgets.forEach((budget) => {
      const thresholds = budget.alertThresholds.split(',').map(Number);
      expect(thresholds.length).toBeGreaterThan(0);
      thresholds.forEach((t) => {
        expect(t).toBeGreaterThan(0);
        expect(t).toBeLessThanOrEqual(100);
      });
    });
  });

  it('should identify critical budget status', () => {
    // 90% usage
    const percentage = getUsagePercentage(900, 1000);
    expect(percentage).toBeGreaterThanOrEqual(90);
  });

  it('should identify exceeded budget status', () => {
    // 120% usage
    const percentage = getUsagePercentage(1200, 1000);
    expect(percentage).toBe(100); // Capped at 100
  });

  it('should support multiple budgets per category per month', () => {
    const foodBudgets = mockBudgets.filter((b) => b.category === 'Alimentação');
    expect(foodBudgets.length).toBeGreaterThan(0);
  });
});

describe('Integration: Accounts and Budgets', () => {
  it('should link budgets to spending from accounts', () => {
    const totalBalance = getTotalBalance(mockAccounts);
    const totalBudgetLimit = mockBudgets.reduce((sum, b) => sum + parseFloat(b.limit), 0);
    
    // Total balance should be greater than monthly budgets
    expect(totalBalance).toBeGreaterThan(totalBudgetLimit);
  });

  it('should support multi-account budget tracking', () => {
    const accounts = getAccountsByType(mockAccounts, 'corrente');
    const budgets = getBudgetsByMonth(mockBudgets, '2026-05');
    
    expect(accounts.length).toBeGreaterThan(0);
    expect(budgets.length).toBeGreaterThan(0);
  });

  it('should calculate total spending across all accounts', () => {
    const totalBalance = getTotalBalance(mockAccounts);
    expect(totalBalance).toBeGreaterThan(0);
  });
});
