/**
 * DataSyncModal - Modal para sincronizar dados do localStorage com BD
 * Mostra progresso, erros e permite ao usuário sincronizar dados
 */

import { useState, useEffect } from "react";
import { useDataSync } from "@/hooks/useDataSync";
import { Cloud, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataSyncModal({ isOpen, onClose }: DataSyncModalProps) {
  const { syncStatus, syncAllData, hasDataToSync, getDataToSyncCount } = useDataSync();
  const [dataCount, setDataCount] = useState(0);

  useEffect(() => {
    if (isOpen && hasDataToSync()) {
      setDataCount(getDataToSyncCount());
    }
  }, [isOpen, hasDataToSync, getDataToSyncCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="sync-modal-title">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Cloud className="w-6 h-6 text-blue-600" aria-hidden="true" />
          <h2 id="sync-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
            Sincronizar Dados
          </h2>
        </div>

        {/* Content */}
        {!syncStatus.isComplete ? (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Você tem <strong>{dataCount} itens</strong> para sincronizar com o servidor.
            </p>

            {syncStatus.isLoading && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Loader className="w-4 h-4 animate-spin text-blue-600" aria-hidden="true" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Sincronizando... {syncStatus.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${syncStatus.progress}%` }}
                    role="progressbar"
                    aria-valuenow={syncStatus.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-200 mt-1">
                  {syncStatus.syncedItems} de {syncStatus.totalItems} itens sincronizados
                </p>
              </div>
            )}

            {/* Errors */}
            {syncStatus.errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-200">Erros encontrados:</p>
                    <ul className="text-xs text-red-800 dark:text-red-300 mt-1 space-y-1">
                      {syncStatus.errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                disabled={syncStatus.isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => syncAllData()}
                disabled={syncStatus.isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {syncStatus.isLoading ? "Sincronizando..." : "Sincronizar Agora"}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="text-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Sincronização Concluída!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {syncStatus.errors.length === 0
                  ? `Todos os ${syncStatus.syncedItems} itens foram sincronizados com sucesso.`
                  : `${syncStatus.syncedItems} itens sincronizados com ${syncStatus.errors.length} erros.`}
              </p>
            </div>

            {syncStatus.lastSyncedAt && (
              <p className="text-xs text-gray-700 dark:text-gray-200 text-center mb-4">
                Última sincronização: {new Date(syncStatus.lastSyncedAt).toLocaleString("pt-BR")}
              </p>
            )}

            <Button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Fechar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
