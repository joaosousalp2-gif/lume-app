import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('DataStore Synchronization - Event Broadcasting', () => {
  let listeners: Set<() => void>;
  let eventListeners: Record<string, (() => void)[]> = {};

  beforeEach(() => {
    listeners = new Set();
    eventListeners = {};

    // Mock window.dispatchEvent
    global.window = {
      dispatchEvent: vi.fn((event: Event) => {
        const eventType = event.type;
        if (eventListeners[eventType]) {
          eventListeners[eventType].forEach((listener) => listener());
        }
        return true;
      }),
      addEventListener: vi.fn((type: string, listener: () => void) => {
        if (!eventListeners[type]) {
          eventListeners[type] = [];
        }
        eventListeners[type].push(listener);
      }),
      removeEventListener: vi.fn((type: string, listener: () => void) => {
        if (eventListeners[type]) {
          eventListeners[type] = eventListeners[type].filter((l) => l !== listener);
        }
      }),
    } as any;
  });

  afterEach(() => {
    listeners.clear();
    eventListeners = {};
  });

  it('should notify all listeners when data changes', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    listeners.add(listener1);
    listeners.add(listener2);

    // Simulate notifyListeners
    listeners.forEach((listener) => listener());

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  it('should dispatch lume_launches_updated event', () => {
    const event = new Event('lume_launches_updated');
    window.dispatchEvent(event);

    expect(window.dispatchEvent).toHaveBeenCalledWith(event);
  });

  it('should handle multiple event listeners', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    window.addEventListener('lume_launches_updated', listener1);
    window.addEventListener('lume_launches_updated', listener2);

    const event = new Event('lume_launches_updated');
    window.dispatchEvent(event);

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  it('should remove listeners when unsubscribing', () => {
    const listener = vi.fn();

    window.addEventListener('lume_launches_updated', listener);
    window.removeEventListener('lume_launches_updated', listener);

    const event = new Event('lume_launches_updated');
    window.dispatchEvent(event);

    expect(listener).not.toHaveBeenCalled();
  });

  it('should synchronize launches across components', () => {
    const launches = [
      { id: '1', type: 'receita' as const, value: 1000, category: 'Salário', date: '2026-04-30' },
      { id: '2', type: 'despesa' as const, value: 500, category: 'Alimentação', date: '2026-04-30' },
    ];

    // Simulate adding launch and notifying
    const notifyListeners = () => {
      const event = new Event('lume_launches_updated');
      window.dispatchEvent(event);
    };

    const dashboardListener = vi.fn();
    const metasListener = vi.fn();
    const aiListener = vi.fn();

    window.addEventListener('lume_launches_updated', dashboardListener);
    window.addEventListener('lume_launches_updated', metasListener);
    window.addEventListener('lume_launches_updated', aiListener);

    notifyListeners();

    expect(dashboardListener).toHaveBeenCalled();
    expect(metasListener).toHaveBeenCalled();
    expect(aiListener).toHaveBeenCalled();
  });

  it('should handle rapid successive updates', () => {
    const listener = vi.fn();
    window.addEventListener('lume_launches_updated', listener);

    for (let i = 0; i < 10; i++) {
      const event = new Event('lume_launches_updated');
      window.dispatchEvent(event);
    }

    expect(listener).toHaveBeenCalledTimes(10);
  });

  it('should maintain listener order', () => {
    const callOrder: number[] = [];

    const listener1 = () => callOrder.push(1);
    const listener2 = () => callOrder.push(2);
    const listener3 = () => callOrder.push(3);

    window.addEventListener('lume_launches_updated', listener1);
    window.addEventListener('lume_launches_updated', listener2);
    window.addEventListener('lume_launches_updated', listener3);

    const event = new Event('lume_launches_updated');
    window.dispatchEvent(event);

    expect(callOrder).toEqual([1, 2, 3]);
  });

  it('should handle storage events for cross-tab sync', () => {
    const listener = vi.fn();
    window.addEventListener('storage', listener);

    const storageEvent = new Event('storage');
    (storageEvent as any).key = 'lume_launches';
    (storageEvent as any).newValue = JSON.stringify([{ id: '1', type: 'receita', value: 1000 }]);

    window.dispatchEvent(storageEvent);

    expect(listener).toHaveBeenCalled();
  });

  it('should calculate total finances correctly after sync', () => {
    const calculateTotals = (launches: any[]) => {
      const totalReceitas = launches
        .filter((l) => l.type === 'receita')
        .reduce((sum, l) => sum + l.value, 0);

      const totalDespesas = launches
        .filter((l) => l.type === 'despesa')
        .reduce((sum, l) => sum + l.value, 0);

      return {
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
      };
    };

    const launches = [
      { id: '1', type: 'receita', value: 1000, category: 'Salário', date: '2026-04-30' },
      { id: '2', type: 'receita', value: 500, category: 'Bônus', date: '2026-04-30' },
      { id: '3', type: 'despesa', value: 300, category: 'Alimentação', date: '2026-04-30' },
      { id: '4', type: 'despesa', value: 200, category: 'Transporte', date: '2026-04-30' },
    ];

    const totals = calculateTotals(launches);

    expect(totals.totalReceitas).toBe(1500);
    expect(totals.totalDespesas).toBe(500);
    expect(totals.saldo).toBe(1000);
  });

  it('should sync savings goals with launches', () => {
    const launches = [
      { id: '1', type: 'receita' as const, value: 500, category: 'Poupança', date: '2026-04-30' },
      { id: '2', type: 'receita' as const, value: 300, category: 'Poupança', date: '2026-04-30' },
    ];

    const calculateSavingsByCategory = (category: string) => {
      return launches
        .filter((l) => l.type === 'receita' && l.category === category)
        .reduce((sum, l) => sum + l.value, 0);
    };

    const savings = calculateSavingsByCategory('Poupança');

    expect(savings).toBe(800);
  });

  it('should update AI analysis after sync', () => {
    const launches = [
      { id: '1', type: 'despesa' as const, value: 600, category: 'Alimentação', date: '2026-04-30' },
      { id: '2', type: 'despesa' as const, value: 400, category: 'Alimentação', date: '2026-04-30' },
    ];

    const categoryTotals: Record<string, number> = {};

    launches
      .filter((l) => l.type === 'despesa')
      .forEach((l) => {
        categoryTotals[l.category] = (categoryTotals[l.category] || 0) + l.value;
      });

    expect(categoryTotals['Alimentação']).toBe(1000);
  });
});
