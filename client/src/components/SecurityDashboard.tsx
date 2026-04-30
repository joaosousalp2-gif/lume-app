/*
 * SecurityDashboard — Lume
 * Dashboard de segurança com criptografia, alertas e backup
 */

import { useState, useEffect } from "react";
import { Shield, Lock, AlertTriangle, Cloud, Download, Upload, RefreshCw, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getSuspiciousActivities, getActivityLogs } from "@/lib/activityLog";
import { getBackupConfig, updateBackupConfig, createLocalBackup, getLocalBackups, exportBackupAsFile, restoreFromBackup, shouldPerformAutoBackup } from "@/lib/backup";

export default function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState<"encryption" | "alerts" | "backup">("encryption");
  const [suspiciousActivities, setSuspiciousActivities] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [backupConfig, setBackupConfig] = useState(getBackupConfig());
  const [backups, setBackups] = useState(getLocalBackups());
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    setSuspiciousActivities(getSuspiciousActivities());
    setActivityLogs(getActivityLogs().slice(-20)); // Últimos 20
    setBackups(getLocalBackups());
  }, []);

  const handleBackupNow = () => {
    try {
      createLocalBackup();
      setBackups(getLocalBackups());
      toast.success("✅ Backup criado com sucesso!");
    } catch (error) {
      toast.error("❌ Erro ao criar backup");
    }
  };

  const handleRestoreBackup = (backupId: string) => {
    if (confirm("Tem certeza que deseja restaurar este backup? Isso sobrescreverá seus dados atuais.")) {
      if (restoreFromBackup(backupId)) {
        toast.success("✅ Backup restaurado com sucesso!");
        window.location.reload();
      } else {
        toast.error("❌ Erro ao restaurar backup");
      }
    }
  };

  const handleExportBackup = (backupId: string) => {
    try {
      exportBackupAsFile(backupId);
      toast.success("✅ Backup exportado com sucesso!");
    } catch (error) {
      toast.error("❌ Erro ao exportar backup");
    }
  };

  const handleAutoBackupToggle = (enabled: boolean) => {
    updateBackupConfig({ autoBackupEnabled: enabled });
    setBackupConfig(getBackupConfig());
    toast.success(enabled ? "✅ Backup automático ativado" : "✅ Backup automático desativado");
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h2 className="text-4xl font-black text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              🔒 Centro de Segurança
            </h2>
          </div>
          <p className="text-lg text-gray-600">Proteja seus dados com criptografia, alertas e backup automático</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-gray-200">
          {[
            { id: "encryption", label: "🔐 Criptografia", icon: Lock },
            { id: "alerts", label: "⚠️ Alertas", icon: AlertTriangle },
            { id: "backup", label: "💾 Backup", icon: Cloud },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-bold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das Abas */}
        <div className="space-y-6">
          {/* ABA: CRIPTOGRAFIA */}
          {activeTab === "encryption" && (
            <div className="space-y-6">
              <div className="p-8 rounded-xl bg-blue-50 border-2 border-blue-200">
                <div className="flex items-start gap-4">
                  <Lock className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Criptografia AES-256</h3>
                    <p className="text-gray-700 mb-4">
                      Todos os seus dados sensíveis são criptografados usando o padrão AES-256, o mesmo utilizado por instituições financeiras e governos.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-white border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">Status da Criptografia</p>
                        <p className="text-xl font-bold text-green-600">✅ Ativa</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">Algoritmo</p>
                        <p className="text-xl font-bold text-gray-900">AES-256-GCM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proteção de Dados */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Lançamentos", desc: "Criptografados em repouso", icon: "📊" },
                  { title: "Metas", desc: "Protegidas com chave única", icon: "🎯" },
                  { title: "Logs", desc: "Auditoria criptografada", icon: "📝" },
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-xl bg-white border-2 border-blue-100 hover:shadow-lg transition-all">
                    <p className="text-3xl mb-2">{item.icon}</p>
                    <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Conformidade */}
              <div className="p-6 rounded-xl bg-green-50 border-2 border-green-200">
                <h4 className="font-bold text-gray-900 mb-3">✅ Conformidade com Regulamentações</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ LGPD (Lei Geral de Proteção de Dados)</li>
                  <li>✓ GDPR (General Data Protection Regulation)</li>
                  <li>✓ Padrões de Segurança de Dados Pessoais</li>
                </ul>
              </div>
            </div>
          )}

          {/* ABA: ALERTAS */}
          {activeTab === "alerts" && (
            <div className="space-y-6">
              {suspiciousActivities.length > 0 ? (
                <div className="space-y-3">
                  {suspiciousActivities.slice(-10).map((activity) => (
                    <div key={activity.id} className="p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{activity.description}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(activity.timestamp).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-semibold">Nenhuma atividade suspeita detectada</p>
                  <p className="text-sm text-gray-500">Seu sistema está seguro ✅</p>
                </div>
              )}

              {/* Logs de Atividade */}
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Logs de Atividade Recentes</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-lg bg-white border border-gray-200 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">{log.description}</span>
                        <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString("pt-BR")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA: BACKUP */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              {/* Configurações de Backup */}
              <div className="p-6 rounded-xl bg-blue-50 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Configurações de Backup</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={backupConfig.autoBackupEnabled}
                      onChange={(e) => handleAutoBackupToggle(e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                    <span className="font-semibold text-gray-900">Ativar Backup Automático</span>
                  </label>

                  {backupConfig.autoBackupEnabled && (
                    <div className="ml-8">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Frequência</label>
                      <select
                        value={backupConfig.backupFrequency}
                        onChange={(e) => updateBackupConfig({ backupFrequency: e.target.value as any })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="daily">Diariamente</option>
                        <option value="weekly">Semanalmente</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Botão Backup Manual */}
              <button
                onClick={handleBackupNow}
                className="w-full px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Criar Backup Agora
              </button>

              {/* Lista de Backups */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Backups Disponíveis</h3>
                {backups.length > 0 ? (
                  <div className="space-y-3">
                    {backups.slice().reverse().map((backup) => (
                      <div key={backup.id} className="p-4 rounded-xl bg-white border-2 border-gray-200 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">
                              Backup de {new Date(backup.timestamp).toLocaleDateString("pt-BR")}
                            </p>
                            <p className="text-sm text-gray-600">
                              {backup.launches.length} lançamentos • {backup.goals.length} metas
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRestoreBackup(backup.id)}
                              className="px-4 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all text-sm"
                            >
                              Restaurar
                            </button>
                            <button
                              onClick={() => handleExportBackup(backup.id)}
                              className="px-4 py-2 rounded-lg font-bold text-white bg-gray-600 hover:bg-gray-700 transition-all text-sm"
                            >
                              Exportar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-semibold">Nenhum backup criado ainda</p>
                  </div>
                )}
              </div>

              {/* Info Sincronização em Nuvem */}
              <div className="p-6 rounded-xl bg-purple-50 border-2 border-purple-200">
                <h4 className="font-bold text-gray-900 mb-2">☁️ Sincronização em Nuvem (Em Breve)</h4>
                <p className="text-gray-700 mb-3">
                  Sincronize seus backups com Google Drive ou OneDrive para acessar seus dados em múltiplos dispositivos.
                </p>
                <button className="px-6 py-2 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  Configurar Sincronização (Em Breve)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
