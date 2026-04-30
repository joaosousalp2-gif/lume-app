import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Launch {
  id: string;
  type: "receita" | "despesa";
  date: string;
  category: string;
  value: string;
  description: string;
  recurrence: string;
  endDate: string;
  timestamp: number;
}

export function useBackendSync(userId: string = "default-user") {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Carregar dados do backend ao montar
  useEffect(() => {
    loadFromBackend();
  }, [userId]);

  // Sincronizar com backend a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      syncToBackend();
    }, 30000);

    return () => clearInterval(interval);
  }, [launches, userId]);

  const loadFromBackend = async () => {
    try {
      setSyncing(true);
      const response = await fetch(`/api/launches/${userId}`);
      const data = await response.json();

      if (data.success) {
        setLaunches(data.data);
        localStorage.setItem("launches", JSON.stringify(data.data));
        setLastSync(new Date());
      }
    } catch (error) {
      console.error("Erro ao carregar do backend:", error);
      // Fallback para localStorage
      const stored = localStorage.getItem("launches");
      if (stored) {
        setLaunches(JSON.parse(stored));
      }
    } finally {
      setSyncing(false);
    }
  };

  const syncToBackend = async () => {
    try {
      const stored = localStorage.getItem("launches");
      if (!stored) return;

      const launches = JSON.parse(stored);
      const response = await fetch(`/api/launches/${userId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ launches }),
      });

      const data = await response.json();
      if (data.success) {
        setLastSync(new Date());
      }
    } catch (error) {
      console.error("Erro ao sincronizar com backend:", error);
    }
  };

  const addLaunch = async (launch: Omit<Launch, "id" | "timestamp">) => {
    try {
      const response = await fetch(`/api/launches/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(launch),
      });

      const data = await response.json();
      if (data.success) {
        const newLaunches = [...launches, data.data];
        setLaunches(newLaunches);
        localStorage.setItem("launches", JSON.stringify(newLaunches));
        window.dispatchEvent(new Event("launchesUpdated"));
        toast.success("Lançamento sincronizado com sucesso!");
        return data.data;
      }
    } catch (error) {
      console.error("Erro ao adicionar lançamento:", error);
      toast.error("Erro ao sincronizar lançamento");
    }
  };

  const deleteLaunch = async (launchId: string) => {
    try {
      const response = await fetch(`/api/launches/${userId}/${launchId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        const newLaunches = launches.filter((l) => l.id !== launchId);
        setLaunches(newLaunches);
        localStorage.setItem("launches", JSON.stringify(newLaunches));
        window.dispatchEvent(new Event("launchesUpdated"));
        toast.success("Lançamento removido com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao deletar lançamento:", error);
      toast.error("Erro ao remover lançamento");
    }
  };

  return {
    launches,
    syncing,
    lastSync,
    addLaunch,
    deleteLaunch,
    loadFromBackend,
    syncToBackend,
  };
}
