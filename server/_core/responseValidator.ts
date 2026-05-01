/**
 * Response Validator - Ensures AI responses follow consultant guidelines
 * Prevents generic language, assumptions, and validates structure
 */

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  score: number; // 0-100
}

// Phrases to avoid (generic, motivational, emotional)
const BANNED_PHRASES = [
  /você está no caminho certo/i,
  /com carinho/i,
  /adorei sua pergunta/i,
  /você pode fazer/i,
  /registre seus gastos/i,
  /tenha disciplina/i,
  /boa sorte/i,
  /muito bom/i,
  /parabéns/i,
  /está indo bem/i,
  /continue assim/i,
  /é importante/i,
  /lembre-se/i,
  /não desista/i,
  /você consegue/i,
  /força/i,
];

// Assumptions to avoid (age, family, employment, etc)
const ASSUMPTION_PATTERNS = [
  /como você tem \d+ anos/i,
  /você provavelmente tem/i,
  /assumo que você/i,
  /você deve ser/i,
  /pessoas da sua idade/i,
  /dependentes/i,
  /você tem carro/i,
  /você tem filhos/i,
  /você é casado/i,
];

// Required structure elements
const REQUIRED_SECTIONS = [
  { pattern: /##\s*1\.\s*DIAGNÓSTICO|diagnóstico/i, name: "DIAGNÓSTICO" },
  { pattern: /##\s*2\.\s*RISCO|risco/i, name: "RISCO" },
  { pattern: /##\s*3\.\s*RECOMENDAÇÃO|recomendação/i, name: "RECOMENDAÇÃO" },
  { pattern: /##\s*4\.\s*AÇÕES|ações|ação/i, name: "AÇÕES PRÁTICAS" },
];

// Positive indicators (should have specific numbers and actions)
const POSITIVE_INDICATORS = [
  /R\$\s*\d+[.,]\d{2}/g, // Currency values
  /\d+%/g, // Percentages
  /hoje:/i, // Immediate action
  /esta semana:/i,
  /próximo mês:/i,
  /cancele/i, // Specific action
  /reduza/i,
  /aumente/i,
  /ajuste/i,
];

export function validateResponse(content: string): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Check for banned phrases
  for (const phrase of BANNED_PHRASES) {
    if (phrase.test(content)) {
      const match = content.match(phrase)?.[0];
      issues.push(`Frase genérica detectada: "${match}"`);
      score -= 10;
    }
  }

  // Check for assumptions
  for (const pattern of ASSUMPTION_PATTERNS) {
    if (pattern.test(content)) {
      const match = content.match(pattern)?.[0];
      issues.push(`Assunção detectada: "${match}"`);
      score -= 15;
    }
  }

  // Check for required structure
  const missingStructure: string[] = [];
  for (const section of REQUIRED_SECTIONS) {
    if (!section.pattern.test(content)) {
      missingStructure.push(section.name);
      score -= 20;
    }
  }

  if (missingStructure.length > 0) {
    issues.push(`Seções faltando: ${missingStructure.join(", ")}`);
  }

  // Check for specific numbers and actions
  const currencyMatches = content.match(/R\$\s*\d+[.,]\d{2}/g) || [];
  const percentageMatches = content.match(/\d+%/g) || [];
  const actionMatches = content.match(/hoje:|esta semana:|próximo mês:|cancele|reduza|aumente|ajuste/gi) || [];

  if (currencyMatches.length < 2) {
    warnings.push("Poucos valores específicos mencionados (esperado: mínimo 2)");
    score -= 5;
  }

  if (actionMatches.length < 2) {
    warnings.push("Poucas ações práticas específicas (esperado: mínimo 2)");
    score -= 5;
  }

  // Check response length (should be substantial)
  if (content.length < 300) {
    warnings.push("Resposta muito curta (esperado: mínimo 300 caracteres)");
    score -= 10;
  }

  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, score));

  return {
    isValid: issues.length === 0 && score >= 70,
    issues,
    warnings,
    score,
  };
}

export function formatValidationFeedback(validation: ValidationResult): string {
  if (validation.isValid) {
    return `✅ Resposta bem estruturada (Score: ${validation.score}/100)`;
  }

  let feedback = `⚠️ Problemas detectados (Score: ${validation.score}/100):\n`;

  if (validation.issues.length > 0) {
    feedback += `\nProblemas críticos:\n`;
    validation.issues.forEach(issue => {
      feedback += `- ${issue}\n`;
    });
  }

  if (validation.warnings.length > 0) {
    feedback += `\nAtenções:\n`;
    validation.warnings.forEach(warning => {
      feedback += `- ${warning}\n`;
    });
  }

  return feedback;
}
