import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Perfume } from "../types";
import { getCollection, addToCollection, removeFromCollection, addManyToCollection } from "../services/collectionService";

interface CollectionContextType {
  collection: Perfume[];
  loading: boolean;
  isInCollection: (perfumeId: number) => boolean;
  addToMyCollection: (perfumeId: number) => Promise<void>;
  removeFromMyCollection: (perfumeId: number) => Promise<void>;
  toggleCollection: (perfumeId: number) => Promise<void>;
  addMany: (perfumeIds: number[]) => Promise<void>;
  refresh: () => Promise<void>;
}

const CollectionContext = createContext<CollectionContextType | null>(null);

export const CollectionProvider = ({ children }: { children: ReactNode }) => {
  const [collection, setCollection] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getCollection();
    setCollection(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  const isInCollection = (perfumeId: number): boolean =>
    collection.some((p) => p.id === perfumeId);

  const addToMyCollection = async (perfumeId: number) => {
    await addToCollection(perfumeId);
    await refresh();
  };

  const removeFromMyCollection = async (perfumeId: number) => {
    setCollection((prev) => prev.filter((p) => p.id !== perfumeId));
    await removeFromCollection(perfumeId);
  };

  const toggleCollection = async (perfumeId: number) => {
    if (isInCollection(perfumeId)) {
      await removeFromMyCollection(perfumeId);
    } else {
      await addToMyCollection(perfumeId);
    }
  };

  const addMany = async (perfumeIds: number[]) => {
    await addManyToCollection(perfumeIds);
    await refresh();
  };

  return (
    <CollectionContext.Provider
      value={{
        collection, loading, isInCollection,
        addToMyCollection, removeFromMyCollection,
        toggleCollection, addMany, refresh,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = (): CollectionContextType => {
  const context = useContext(CollectionContext);
  if (!context) throw new Error("useCollection doit être utilisé dans un CollectionProvider");
  return context;
};