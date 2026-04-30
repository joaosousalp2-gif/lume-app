/*
 * Backup & Sync — Lume
 * Backup automático e sincronização em nuvem
 */

export interface BackupData {
  id: string;
  timestamp: number;
  launches: any[];
  goals: any[];
  activityLogs: any[];
  version: string;
  deviceId: string;
}

export interface BackupConfig {
  autoBackupEnabled: boolean;
  backupFrequency: "daily" | "weekly" | "manual";
  lastBackupTime: number | null;
  cloudSyncEnabled: boolean;
  cloudProvider: "google_drive" | "onedrive" | "none";
}

const DEFAULT_CONFIG: BackupConfig = {
  autoBackupEnabled: true,
  backupFrequency: "daily",
  lastBackupTime: null,
  cloudSyncEnabled: false,
  cloudProvider: "none",
};

/**
 * Obtém configuração de backup
 */
export const getBackupConfig = (): BackupConfig => {
  try {
    const config = localStorage.getItem("lume_backup_config");
    return config ? JSON.parse(config) : DEFAULT_CONFIG;
  } catch (error) {
    console.error("Erro ao obter configuração de backup:", error);
    return DEFAULT_CONFIG;
  }
};

/**
 * Atualiza configuração de backup
 */
export const updateBackupConfig = (config: Partial<BackupConfig>): void => {
  try {
    const current = getBackupConfig();
    const updated = { ...current, ...config };
    localStorage.setItem("lume_backup_config", JSON.stringify(updated));
  } catch (error) {
    console.error("Erro ao atualizar configuração de backup:", error);
  }
};

/**
 * Cria um backup local dos dados
 */
export const createLocalBackup = (): BackupData => {
  try {
    const backup: BackupData = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      launches: JSON.parse(localStorage.getItem("lume_launches") || "[]"),
      goals: JSON.parse(localStorage.getItem("lume_goals") || "[]"),
      activityLogs: JSON.parse(localStorage.getItem("lume_activity_logs") || "[]"),
      version: "1.0.0",
      deviceId: getOrCreateDeviceId(),
    };

    // Armazenar backup local
    const backups = getLocalBackups();
    backups.push(backup);

    // Manter apenas últimos 10 backups
    if (backups.length > 10) {
      backups.shift();
    }

    localStorage.setItem("lume_backups", JSON.stringify(backups));

    // Atualizar tempo do último backup
    updateBackupConfig({ lastBackupTime: Date.now() });

    return backup;
  } catch (error) {
    console.error("Erro ao criar backup local:", error);
    return null as any;
  }
};

/**
 * Obtém todos os backups locais
 */
export const getLocalBackups = (): BackupData[] => {
  try {
    const backups = localStorage.getItem("lume_backups");
    return backups ? JSON.parse(backups) : [];
  } catch (error) {
    console.error("Erro ao obter backups locais:", error);
    return [];
  }
};

/**
 * Restaura dados de um backup
 */
export const restoreFromBackup = (backupId: string): boolean => {
  try {
    const backups = getLocalBackups();
    const backup = backups.find(b => b.id === backupId);

    if (!backup) {
      console.error("Backup não encontrado");
      return false;
    }

    // Restaurar dados
    localStorage.setItem("lume_launches", JSON.stringify(backup.launches));
    localStorage.setItem("lume_goals", JSON.stringify(backup.goals));
    localStorage.setItem("lume_activity_logs", JSON.stringify(backup.activityLogs));

    return true;
  } catch (error) {
    console.error("Erro ao restaurar backup:", error);
    return false;
  }
};

/**
 * Exporta backup como arquivo JSON
 */
export const exportBackupAsFile = (backupId: string): void => {
  try {
    const backups = getLocalBackups();
    const backup = backups.find(b => b.id === backupId);

    if (!backup) {
      console.error("Backup não encontrado");
      return;
    }

    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lume_backup_${backup.timestamp}.json`;
    link.click();
  } catch (error) {
    console.error("Erro ao exportar backup:", error);
  }
};

/**
 * Importa backup de um arquivo JSON
 */
export const importBackupFromFile = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const backup: BackupData = JSON.parse(content);

        if (restoreFromBackup(backup.id)) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Erro ao importar backup:", error);
      resolve(false);
    }
  });
};

/**
 * Obtém ou cria ID único do dispositivo
 */
export const getOrCreateDeviceId = (): string => {
  try {
    let deviceId = localStorage.getItem("lume_device_id");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("lume_device_id", deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error("Erro ao obter ID do dispositivo:", error);
    return "unknown_device";
  }
};

/**
 * Simula sincronização com nuvem (Google Drive/OneDrive)
 * Em produção, seria integrado com APIs reais
 */
export const syncToCloud = async (provider: "google_drive" | "onedrive"): Promise<boolean> => {
  try {
    const backup = createLocalBackup();

    // Simular upload para nuvem
    console.log(`Sincronizando backup ${backup.id} para ${provider}...`);

    // Em produção, aqui seria feita a chamada à API do provedor
    // await uploadToGoogleDrive(backup);
    // ou
    // await uploadToOneDrive(backup);

    updateBackupConfig({ cloudSyncEnabled: true, cloudProvider: provider });
    return true;
  } catch (error) {
    console.error("Erro ao sincronizar com nuvem:", error);
    return false;
  }
};

/**
 * Verifica se deve fazer backup automático
 */
export const shouldPerformAutoBackup = (): boolean => {
  try {
    const config = getBackupConfig();

    if (!config.autoBackupEnabled) {
      return false;
    }

    if (!config.lastBackupTime) {
      return true;
    }

    const now = Date.now();
    const timeSinceLastBackup = now - config.lastBackupTime;

    if (config.backupFrequency === "daily") {
      return timeSinceLastBackup > 24 * 60 * 60 * 1000; // 24 horas
    } else if (config.backupFrequency === "weekly") {
      return timeSinceLastBackup > 7 * 24 * 60 * 60 * 1000; // 7 dias
    }

    return false;
  } catch (error) {
    console.error("Erro ao verificar backup automático:", error);
    return false;
  }
};
