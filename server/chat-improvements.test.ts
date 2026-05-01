import { describe, it, expect } from 'vitest';
import { validateResponse, formatValidationFeedback } from './_core/responseValidator';

describe('Chat Improvements - Response Validator', () => {
  describe('Banned Phrases Detection', () => {
    it('should detect generic motivational phrases', () => {
      const response = "Você está no caminho certo! Continue assim com disciplina. Boa sorte!";
      const result = validateResponse(response);
      
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(100);
    });

    it('should detect emotional language', () => {
      const response = "Com carinho, recomendo que você registre seus gastos. Adorei sua pergunta!";
      const result = validateResponse(response);
      
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(100);
    });

    it('should allow professional language', () => {
      const response = `## 1. DIAGNÓSTICO
Você tem receita mensal de R$ 4.500 e gastos crescentes.

## 2. RISCO
Se isso continuar, seus gastos atingirão R$ 2.000 em 3 meses.

## 3. RECOMENDAÇÃO
Ajuste AGORA seus gastos com alimentação.

## 4. AÇÕES PRÁTICAS
1. Hoje: Cancele Spotify (R$ 15/mês)
2. Esta semana: Reduza restaurante para 2x por semana`;
      
      const result = validateResponse(response);
      expect(result.issues.length).toBe(0);
    });
  });

  describe('Assumption Detection', () => {
    it('should detect age assumptions', () => {
      const response = "Como você tem 65 anos, recomendo...";
      const result = validateResponse(response);
      
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should detect family assumptions', () => {
      const response = "Você provavelmente tem dependentes, então...";
      const result = validateResponse(response);
      
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should allow data-based statements', () => {
      const response = `## 1. DIAGNÓSTICO
Você mencionou despesas de saúde variáveis. Com base nos dados que você compartilhou, isso é preocupante.

## 2. RISCO
Se isso continuar, você não terá fundo de emergência.

## 3. RECOMENDAÇÃO
Crie fundo de emergência paralelo.

## 4. AÇÕES PRÁTICAS
Reserve R$ 100/mês para saúde`;
      
      const result = validateResponse(response);
      expect(result.issues.length).toBe(0);
    });
  });

  describe('Structure Validation', () => {
    it('should detect missing sections', () => {
      const response = `## 1. DIAGNÓSTICO
Seus gastos estão crescendo.

## 2. RISCO
Você pode ficar sem dinheiro.`;
      
      const result = validateResponse(response);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0]).toContain('Seções faltando');
    });

    it('should validate complete structure', () => {
      const response = `## 1. DIAGNÓSTICO
Receita R$ 4.500, despesa R$ 2.000.

## 2. RISCO
Tendência de crescimento 51% ao mês.

## 3. RECOMENDAÇÃO
Reduza gastos imediatamente.

## 4. AÇÕES PRÁTICAS
1. Cancele assinaturas (R$ 50/mês)
2. Reduza restaurante (R$ 150/mês)`;
      
      const result = validateResponse(response);
      expect(result.issues.length).toBe(0);
    });
  });

  describe('Specific Numbers and Actions', () => {
    it('should require currency values', () => {
      const response = `## 1. DIAGNÓSTICO
Seus gastos estão altos.

## 2. RISCO
Você pode ter problemas.

## 3. RECOMENDAÇÃO
Reduza gastos.

## 4. AÇÕES PRÁTICAS
Gaste menos`;
      
      const result = validateResponse(response);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(100);
    });

    it('should reward specific actions', () => {
      const response = `## 1. DIAGNÓSTICO
Receita R$ 4.500, despesa R$ 2.000 (44% do orçamento).

## 2. RISCO
Gastos crescem 51% ao mês. Em 3 meses, atingirão R$ 3.000.

## 3. RECOMENDAÇÃO
Ajuste hoje mesmo.

## 4. AÇÕES PRÁTICAS
1. Hoje: Cancele Spotify (R$ 15/mês)
2. Esta semana: Reduza restaurante (R$ 150/mês)
3. Próximo mês: Ajuste alimentação (R$ 200/mês)`;
      
      const result = validateResponse(response);
      expect(result.score).toBeGreaterThan(70);
    });
  });

  describe('Response Length', () => {
    it('should warn about very short responses', () => {
      const response = "Reduza seus gastos.";
      const result = validateResponse(response);
      
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should accept substantial responses', () => {
      const response = `## 1. DIAGNÓSTICO
Você tem receita mensal de aproximadamente R$ 4.500 (salário + freelance), mas seus gastos crescem todo mês. Alimentação subiu 51% em 2 meses, lazer subiu 117%. Você está poupando R$ 944/mês, mas a tendência é preocupante.

## 2. RISCO
Se essa tendência continuar, seus gastos com lazer, alimentação e compras podem chegar a R$ 2.000+/mês em 3 meses. Sua poupança cairá de R$ 944/mês para ~R$ 500/mês. Você não atingirá a meta de R$ 5.000. Além disso, não terá fundo de emergência para despesas de saúde inesperadas.

## 3. RECOMENDAÇÃO
Ajuste GRADUALMENTE começando AGORA. Você tem margem (R$ 944 vs R$ 556 necessário), mas a tendência de crescimento é real. Esperar 2 meses pode comprometer a meta.

## 4. AÇÕES PRÁTICAS
1. Hoje: Cancele Spotify (R$ 15/mês) - não impacta qualidade de vida
2. Esta semana: Defina limite de R$ 300 para compras online (economiza R$ 120/mês)
3. Próximas 2 semanas: Reduza restaurante para 2x por semana (economiza R$ 150/mês)
4. Próximo mês: Ajuste alimentação para R$ 500 (sua meta) (economiza R$ 180/mês)

RESULTADO: Economiza R$ 495/mês. Atinge a meta de R$ 5.000 com folga.
PARALELO: Reserve R$ 100/mês para fundo de emergência de saúde.`;
      
      const result = validateResponse(response);
      expect(result.warnings.filter(w => w.includes('curta'))).toHaveLength(0);
    });
  });

  describe('Validation Feedback', () => {
    it('should format valid response feedback', () => {
      const response = `## 1. DIAGNÓSTICO
Receita R$ 4.500, despesa R$ 2.000.

## 2. RISCO
Gastos crescem 51% ao mês.

## 3. RECOMENDAÇÃO
Reduza imediatamente.

## 4. AÇÕES PRÁTICAS
1. Hoje: Cancele Spotify (R$ 15/mês)
2. Esta semana: Reduza restaurante (R$ 150/mês)`;
      
      const result = validateResponse(response);
      const feedback = formatValidationFeedback(result);
      
      expect(feedback).toContain('✅');
    });

    it('should format invalid response feedback', () => {
      const response = "Você está no caminho certo! Boa sorte!";
      const result = validateResponse(response);
      const feedback = formatValidationFeedback(result);
      
      expect(feedback).toContain('⚠️');
      expect(feedback).toContain('Problemas');
    });
  });

  describe('Consultant Persona Validation', () => {
    it('should reward decisive language', () => {
      const response = `## 1. DIAGNÓSTICO
Situação clara: receita R$ 4.500, despesa R$ 2.000.

## 2. RISCO
Cenário negativo: gastos atingem R$ 3.000 em 3 meses.

## 3. RECOMENDAÇÃO
RECOMENDAÇÃO CLARA: Ajuste AGORA, não espere.

## 4. AÇÕES PRÁTICAS
1. Hoje: Cancele Spotify (R$ 15/mês)
2. Esta semana: Reduza restaurante (R$ 150/mês)`;
      
      const result = validateResponse(response);
      expect(result.score).toBeGreaterThan(70);
    });

    it('should penalize ambiguous language', () => {
      const response = `## 1. DIAGNÓSTICO
Seus gastos podem estar crescendo.

## 2. RISCO
Você pode ter problemas no futuro.

## 3. RECOMENDAÇÃO
Você pode fazer X ou Y, ambos são válidos.

## 4. AÇÕES PRÁTICAS
Talvez registre seus gastos`;
      
      const result = validateResponse(response);
      expect(result.score).toBeLessThan(70);
    });
  });
});
