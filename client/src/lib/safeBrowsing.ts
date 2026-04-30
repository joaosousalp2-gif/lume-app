/*
 * Safe Browsing Service — Lume
 * Integração com Google Safe Browsing API (versão simulada)
 * Detecta phishing, malware, software indesejado e sites fraudulentos
 */

export interface SafeBrowsingResult {
  url: string;
  safe: boolean;
  threat: string;
  threatType?: "MALWARE" | "SOCIAL_ENGINEERING" | "UNWANTED_SOFTWARE" | "POTENTIALLY_HARMFUL_APPLICATION";
  timestamp: string;
  confidence: number; // 0-100
  details?: string;
}

// Base de dados simulada de URLs maliciosas conhecidas
const KNOWN_MALICIOUS_URLS = [
  { pattern: /phishing/i, threat: "SOCIAL_ENGINEERING", detail: "Site de phishing detectado" },
  { pattern: /malware/i, threat: "MALWARE", detail: "Site com malware detectado" },
  { pattern: /trojan/i, threat: "MALWARE", detail: "Site com trojan detectado" },
  { pattern: /ransomware/i, threat: "MALWARE", detail: "Site com ransomware detectado" },
  { pattern: /fake-bank/i, threat: "SOCIAL_ENGINEERING", detail: "Falsificação de banco detectada" },
  { pattern: /fake-paypal/i, threat: "SOCIAL_ENGINEERING", detail: "Falsificação de PayPal detectada" },
  { pattern: /fake-amazon/i, threat: "SOCIAL_ENGINEERING", detail: "Falsificação de Amazon detectada" },
  { pattern: /suspicious-offer/i, threat: "SOCIAL_ENGINEERING", detail: "Oferta suspeita detectada" },
  { pattern: /crypto-scam/i, threat: "SOCIAL_ENGINEERING", detail: "Golpe de criptomoeda detectado" },
  { pattern: /lottery-scam/i, threat: "SOCIAL_ENGINEERING", detail: "Golpe de loteria detectado" },
  { pattern: /unwanted-software/i, threat: "UNWANTED_SOFTWARE", detail: "Software indesejado detectado" },
  { pattern: /adware/i, threat: "UNWANTED_SOFTWARE", detail: "Adware detectado" },
];

// Padrões de URLs suspeitas (heurística)
const SUSPICIOUS_PATTERNS = [
  { pattern: /bit\.ly|tinyurl|short\.link/i, reason: "URL encurtada (pode ocultar destino real)" },
  { pattern: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i, reason: "URL com IP direto (suspeito)" },
  { pattern: /xn--/i, reason: "Domínio IDN (pode ser falsificação de marca)" },
  { pattern: /[0O][1l][0O][1l]/i, reason: "Caracteres confusos (O/0, l/1)" },
];

/**
 * Valida e normaliza uma URL
 */
function normalizeUrl(url: string): string {
  try {
    // Se não tiver protocolo, adiciona https://
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch {
    throw new Error("URL inválida");
  }
}

/**
 * Verifica se uma URL está na base de dados de URLs maliciosas conhecidas
 */
function checkKnownMalicious(url: string): { threat: string; detail: string } | null {
  for (const item of KNOWN_MALICIOUS_URLS) {
    if (item.pattern.test(url)) {
      return {
        threat: item.threat,
        detail: item.detail,
      };
    }
  }
  return null;
}

/**
 * Verifica padrões suspeitos na URL
 */
function checkSuspiciousPatterns(url: string): string[] {
  const suspicions: string[] = [];
  for (const item of SUSPICIOUS_PATTERNS) {
    if (item.pattern.test(url)) {
      suspicions.push(item.reason);
    }
  }
  return suspicions;
}

/**
 * Extrai o domínio de uma URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

/**
 * Verifica reputação do domínio (simulado)
 * Em produção, isso seria uma chamada real à API
 */
async function checkDomainReputation(domain: string): Promise<{ safe: boolean; confidence: number }> {
  // Simular latência de rede
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Domínios conhecidos como seguros
  const safeDomains = [
    "google.com",
    "facebook.com",
    "amazon.com",
    "github.com",
    "stackoverflow.com",
    "wikipedia.org",
    "youtube.com",
    "twitter.com",
    "linkedin.com",
  ];

  if (safeDomains.some((safe) => domain.includes(safe))) {
    return { safe: true, confidence: 99 };
  }

  // Domínios conhecidos como perigosos
  const dangerousDomains = [
    "phishing-site.com",
    "malware-download.com",
    "fake-bank.net",
    "trojan-host.org",
  ];

  if (dangerousDomains.some((dangerous) => domain.includes(dangerous))) {
    return { safe: false, confidence: 98 };
  }

  // Para domínios desconhecidos, usar heurística
  // Domínios muito novos (sem pontos extras) podem ser suspeitos
  const partCount = domain.split(".").length;
  if (partCount < 2) {
    return { safe: false, confidence: 60 };
  }

  // Domínios com muitos subdomínios podem ser suspeitos
  if (partCount > 4) {
    return { safe: false, confidence: 65 };
  }

  // Caso padrão: considerar seguro com confiança média
  return { safe: true, confidence: 75 };
}

/**
 * Função principal de verificação de links
 * Simula a integração com Google Safe Browsing API
 */
export async function checkUrlSafety(url: string): Promise<SafeBrowsingResult> {
  try {
    // Normalizar URL
    const normalizedUrl = normalizeUrl(url);

    // Verificar URLs maliciosas conhecidas
    const knownMalicious = checkKnownMalicious(normalizedUrl);
    if (knownMalicious) {
      return {
        url: normalizedUrl,
        safe: false,
        threat: knownMalicious.threat,
        threatType: knownMalicious.threat as any,
        timestamp: new Date().toLocaleString("pt-BR"),
        confidence: 99,
        details: knownMalicious.detail,
      };
    }

    // Verificar padrões suspeitos
    const suspicions = checkSuspiciousPatterns(normalizedUrl);
    if (suspicions.length > 0) {
      return {
        url: normalizedUrl,
        safe: false,
        threat: "POTENTIALLY_HARMFUL_APPLICATION",
        threatType: "POTENTIALLY_HARMFUL_APPLICATION",
        timestamp: new Date().toLocaleString("pt-BR"),
        confidence: 70,
        details: `Padrões suspeitos detectados: ${suspicions.join(", ")}`,
      };
    }

    // Verificar reputação do domínio
    const domain = extractDomain(normalizedUrl);
    const reputationCheck = await checkDomainReputation(domain);

    if (!reputationCheck.safe) {
      return {
        url: normalizedUrl,
        safe: false,
        threat: "SOCIAL_ENGINEERING",
        threatType: "SOCIAL_ENGINEERING",
        timestamp: new Date().toLocaleString("pt-BR"),
        confidence: reputationCheck.confidence,
        details: "Domínio com reputação suspeita",
      };
    }

    // URL segura
    return {
      url: normalizedUrl,
      safe: true,
      threat: "SAFE",
      timestamp: new Date().toLocaleString("pt-BR"),
      confidence: reputationCheck.confidence,
      details: "URL verificada e segura",
    };
  } catch (error) {
    return {
      url: url,
      safe: false,
      threat: "INVALID_URL",
      timestamp: new Date().toLocaleString("pt-BR"),
      confidence: 0,
      details: `Erro ao verificar URL: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

/**
 * Verifica múltiplas URLs em lote
 */
export async function checkUrlsBatch(urls: string[]): Promise<SafeBrowsingResult[]> {
  return Promise.all(urls.map((url) => checkUrlSafety(url)));
}

/**
 * Obtém informações detalhadas sobre uma ameaça
 */
export function getThreatInfo(threatType: string): { name: string; description: string; icon: string } {
  const threatInfo: Record<string, { name: string; description: string; icon: string }> = {
    MALWARE: {
      name: "Malware",
      description: "Software malicioso que pode danificar seu dispositivo ou roubar dados",
      icon: "🦠",
    },
    SOCIAL_ENGINEERING: {
      name: "Phishing / Engenharia Social",
      description: "Site falso que tenta roubar suas informações pessoais ou financeiras",
      icon: "🎣",
    },
    UNWANTED_SOFTWARE: {
      name: "Software Indesejado",
      description: "Software que pode modificar suas configurações ou exibir anúncios",
      icon: "⚠️",
    },
    POTENTIALLY_HARMFUL_APPLICATION: {
      name: "Aplicação Potencialmente Prejudicial",
      description: "Aplicação que pode ter comportamento suspeito ou prejudicial",
      icon: "⚠️",
    },
    INVALID_URL: {
      name: "URL Inválida",
      description: "A URL fornecida não é válida ou está malformada",
      icon: "❌",
    },
    SAFE: {
      name: "Seguro",
      description: "Esta URL foi verificada e é segura para acessar",
      icon: "✅",
    },
  };

  return threatInfo[threatType] || threatInfo["INVALID_URL"];
}
