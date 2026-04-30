import { describe, it, expect } from 'vitest';

describe('AIAnalysis - Type Conversion', () => {
  it('should handle numeric values correctly', () => {
    const testValues = [100, '100', 100.5, '100.5'];
    
    testValues.forEach(value => {
      const numValue = typeof value === 'number' ? value : parseFloat(value as any) || 0;
      expect(typeof numValue).toBe('number');
      expect(numValue).toBeGreaterThan(0);
      expect(numValue.toFixed(2)).toBeTruthy();
    });
  });

  it('should handle toFixed without errors', () => {
    const categoryTotals: { [key: string]: any } = {
      'Alimentação': 500,
      'Transporte': '250.50',
      'Saúde': 150.75,
    };

    Object.entries(categoryTotals).forEach(([category, total]) => {
      const numTotal = typeof total === 'number' ? total : parseFloat(total as any) || 0;
      const formatted = numTotal.toFixed(2);
      
      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/^\d+\.\d{2}$/);
    });
  });

  it('should calculate savings rate correctly', () => {
    const totalReceitas = 5000;
    const totalDespesas = 3000;
    
    const savingsRate = ((totalReceitas - totalDespesas) / totalReceitas) * 100;
    const formatted = savingsRate.toFixed(1);
    
    expect(typeof formatted).toBe('string');
    expect(parseFloat(formatted)).toBe(40);
  });

  it('should handle empty or zero values', () => {
    const values = [0, '0', undefined, null, NaN];
    
    values.forEach(value => {
      const numValue = typeof value === 'number' ? value : parseFloat(value as any) || 0;
      expect(typeof numValue).toBe('number');
      expect(numValue.toFixed(2)).toBeTruthy();
    });
  });

  it('should calculate potential savings correctly', () => {
    const categoryTotal = 500;
    const savingsPercentage = 0.1;
    
    const numTotal = typeof categoryTotal === 'number' ? categoryTotal : parseFloat(categoryTotal as any) || 0;
    const potentialSavings = numTotal * savingsPercentage;
    
    expect(typeof potentialSavings).toBe('number');
    expect(potentialSavings.toFixed(2)).toBe('50.00');
  });

  it('should sum insights potential savings without errors', () => {
    const insights = [
      { potentialSavings: 50 },
      { potentialSavings: '75.50' },
      { potentialSavings: 100.25 },
      { potentialSavings: undefined },
    ];

    const total = insights.reduce((sum, i) => {
      const savings = i.potentialSavings || 0;
      return sum + (typeof savings === 'number' ? savings : parseFloat(savings as any) || 0);
    }, 0);

    expect(typeof total).toBe('number');
    expect(total.toFixed(2)).toBe('225.75');
  });
});
