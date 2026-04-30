/*
 * Activity Log — Lume
 * Monitora atividades suspeitas e registra eventos
 */

export interface ActivityLog {
  id: string;
  type: "login" | "logout" | "launch_added" | "launch_deleted" | "launch_edited" | "goal_created" | "goal_deleted" | "data_exported" | "suspicious";
  description: string;
  timestamp: number;
  severity: "low" | "medium" | "high";
  details?: any;
}

export interface SuspiciousActivity {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  action?: string; // "block" | "warn" | "allow"
}

/**
 * Registra uma atividade no log
 */
export const logActivity = (activity: Omit<ActivityLog, "id" | "timestamp">): void => {
  try {
    const newActivity: ActivityLog = {
      ...activity,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    const logs = getActivityLogs();
    logs.push(newActivity);

    // Manter apenas últimos 1000 registros
    if (logs.length > 1000) {
      logs.shift();
    }

    localStorage.setItem("lume_activity_logs", JSON.stringify(logs));

    // Verificar atividades suspeitas
    checkSuspiciousActivity(newActivity);
  } catch (error) {
    console.error("Erro ao registrar atividade:", error);
  }
};

/**
 * Obtém todos os logs de atividade
 */
export const getActivityLogs = (): ActivityLog[] => {
  try {
    const logs = localStorage.getItem("lume_activity_logs");
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error("Erro ao obter logs de atividade:", error);
    return [];
  }
};

/**
 * Obtém logs de atividade de um período específico
 */
export const getActivityLogsByPeriod = (startDate: number, endDate: number): ActivityLog[] => {
  const logs = getActivityLogs();
  return logs.filter(log => log.timestamp >= startDate && log.timestamp <= endDate);
};

/**
 * Detecta atividades suspeitas
 */
export const checkSuspiciousActivity = (activity: ActivityLog): void => {
  const logs = getActivityLogs();
  const recentLogs = logs.slice(-20); // Últimos 20 registros

  // Verificar múltiplas exclusões em massa
  const recentDeletions = recentLogs.filter(l => l.type === "launch_deleted");
  if (recentDeletions.length >= 5) {
    recordSuspiciousActivity({
      type: "mass_deletion",
      description: `⚠️ Múltiplas exclusões detectadas: ${recentDeletions.length} lançamentos deletados nos últimos registros`,
      action: "warn",
    });
  }

  // Verificar múltiplas edições em curto período
  const recentEdits = recentLogs.filter(l => l.type === "launch_edited");
  if (recentEdits.length >= 10) {
    recordSuspiciousActivity({
      type: "rapid_edits",
      description: `⚠️ Múltiplas edições detectadas: ${recentEdits.length} lançamentos editados rapidamente`,
      action: "warn",
    });
  }

  // Verificar exportação de dados
  if (activity.type === "data_exported") {
    recordSuspiciousActivity({
      type: "data_export",
      description: `📊 Dados exportados: ${activity.description}`,
      action: "log",
    });
  }
};

/**
 * Registra uma atividade suspeita
 */
export const recordSuspiciousActivity = (activity: Omit<SuspiciousActivity, "id" | "timestamp">): void => {
  try {
    const newActivity: SuspiciousActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    const activities = getSuspiciousActivities();
    activities.push(newActivity);

    localStorage.setItem("lume_suspicious_activities", JSON.stringify(activities));
  } catch (error) {
    console.error("Erro ao registrar atividade suspeita:", error);
  }
};

/**
 * Obtém todas as atividades suspeitas
 */
export const getSuspiciousActivities = (): SuspiciousActivity[] => {
  try {
    const activities = localStorage.getItem("lume_suspicious_activities");
    return activities ? JSON.parse(activities) : [];
  } catch (error) {
    console.error("Erro ao obter atividades suspeitas:", error);
    return [];
  }
};

/**
 * Limpa logs antigos (mais de 30 dias)
 */
export const cleanOldLogs = (): void => {
  try {
    const logs = getActivityLogs();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentLogs = logs.filter(log => log.timestamp > thirtyDaysAgo);
    localStorage.setItem("lume_activity_logs", JSON.stringify(recentLogs));
  } catch (error) {
    console.error("Erro ao limpar logs antigos:", error);
  }
};
