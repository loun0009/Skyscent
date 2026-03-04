import {createContext, useContext, useState,useEffect, useCallback, ReactNode} from "react";
import {getHistory, addToHistory,deleteHistoryEntry, clearHistory} from "../services/historyService";
import { HistoryEntry } from "../types";
import { Alert } from "react-native/Libraries/Alert/Alert";

interface HistoryContextType {
  history: HistoryEntry[];
  loading: boolean;
  addEntry: (
    perfumeId: number,
    temperature: number | null,
    weatherCondition: string | null,
    city: string | null
  ) => Promise<void>;
  removeEntry: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
  checkWornToday: (perfumeId: number) => boolean;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getHistory();
    setHistory(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  const addEntry = async (
    perfumeId: number,
    temperature: number | null,
    weatherCondition: string | null,
    city: string | null
  ) => {
    if (checkWornToday(perfumeId)) {
      Alert.alert("Déjà porté", "Vous avez déjà porté ce parfum aujourd'hui.");
      return;
    }
    await addToHistory(perfumeId, temperature, weatherCondition, city);
    await refresh(); // mise à jour partagée immédiate
  };

  const removeEntry = async (id: number) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
    await deleteHistoryEntry(id);
  };

  const clearAll = async () => {
    setHistory([]);
    await clearHistory();
  };

  const checkWornToday = (perfumeId: number): boolean => {
    const today = new Date().toDateString();
    return history.some((entry) => entry.perfume_id === perfumeId && new Date(entry.worn_at).toDateString() === today);
  };

  return (
    <HistoryContext.Provider
      value={{ history, loading, addEntry, removeEntry, clearAll, refresh, checkWornToday }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error("useHistory doit être utilisé dans un HistoryProvider");
  }
  return context;
};