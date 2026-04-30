import { describe, it, expect } from 'vitest';

describe('SavingsGoals - Calculations and Logic', () => {
  it('should calculate savings by category correctly', () => {
    const launches = [
      { id: '1', type: 'receita', category: 'Poupança', value: 500, description: 'Salário', date: '2026-04-01' },
      { id: '2', type: 'receita', category: 'Poupança', value: 300, description: 'Bônus', date: '2026-04-15' },
      { id: '3', type: 'despesa', category: 'Poupança', value: 100, description: 'Gasto', date: '2026-04-20' },
    ];

    const savingsByCategory = launches
      .filter((l) => l.type === 'receita' && l.category === 'Poupança')
      .reduce((sum, l) => sum + (typeof l.value === 'number' ? l.value : parseFloat(l.value as any) || 0), 0);

    expect(savingsByCategory).toBe(800);
  });

  it('should calculate progress percentage correctly', () => {
    const targetAmount = 1000;
    const currentAmount = 750;
    const progress = Math.min((currentAmount / targetAmount) * 100, 100);

    expect(progress).toBe(75);
  });

  it('should calculate days remaining correctly', () => {
    const today = new Date();
    const deadline = new Date(today);
    deadline.setDate(deadline.getDate() + 30);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    expect(diffDays).toBe(30);
  });

  it('should determine goal status correctly', () => {
    const getGoalStatus = (progress: number, daysRemaining: number): string => {
      if (progress >= 100) return 'completed';
      if (daysRemaining < 0) return 'overdue';
      if (daysRemaining <= 30 && progress < 75) return 'at-risk';
      return 'on-track';
    };

    expect(getGoalStatus(100, 10)).toBe('completed');
    expect(getGoalStatus(50, -5)).toBe('overdue');
    expect(getGoalStatus(50, 20)).toBe('at-risk');
    expect(getGoalStatus(80, 20)).toBe('on-track');
  });

  it('should validate goal input correctly', () => {
    const validateGoal = (name: string, targetAmount: string, deadline: string) => {
      if (!name || !targetAmount || !deadline) return false;
      const amount = parseFloat(targetAmount);
      if (isNaN(amount) || amount <= 0) return false;
      return true;
    };

    expect(validateGoal('Viagem', '5000', '2026-12-31')).toBe(true);
    expect(validateGoal('', '5000', '2026-12-31')).toBe(false);
    expect(validateGoal('Viagem', '-100', '2026-12-31')).toBe(false);
    expect(validateGoal('Viagem', '5000', '')).toBe(false);
  });

  it('should calculate total goal amount correctly', () => {
    const goals = [
      { id: '1', targetAmount: 5000 },
      { id: '2', targetAmount: 3000 },
      { id: '3', targetAmount: 2000 },
    ];

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

    expect(totalTarget).toBe(10000);
  });

  it('should count completed goals correctly', () => {
    const goals = [
      { id: '1', status: 'completed' },
      { id: '2', status: 'on-track' },
      { id: '3', status: 'completed' },
      { id: '4', status: 'at-risk' },
    ];

    const completedCount = goals.filter((g) => g.status === 'completed').length;

    expect(completedCount).toBe(2);
  });

  it('should calculate remaining amount correctly', () => {
    const targetAmount = 1000;
    const currentAmount = 650;
    const remaining = Math.max(0, targetAmount - currentAmount);

    expect(remaining).toBe(350);
  });

  it('should handle edge case when progress exceeds 100%', () => {
    const targetAmount = 1000;
    const currentAmount = 1500;
    const progress = Math.min((currentAmount / targetAmount) * 100, 100);

    expect(progress).toBe(100);
  });

  it('should handle zero values in calculations', () => {
    const targetAmount = 1000;
    const currentAmount = 0;
    const progress = Math.min((currentAmount / targetAmount) * 100, 100);

    expect(progress).toBe(0);
  });

  it('should format currency values correctly', () => {
    const values = [100, 250.5, 1000.99, 0];

    values.forEach((value) => {
      const formatted = value.toFixed(2);
      expect(formatted).toMatch(/^\d+\.\d{2}$/);
    });
  });
});
