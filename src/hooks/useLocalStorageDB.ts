import { useState, useEffect, useCallback } from "react";
import { getDB, setDB } from '../repositories/localStorageDB';

export function useLocalStorageDB<T>(
  characterId: string,
  objectType: string,
  initialValue: T
) {
  const [data, setData] = useState<T>(initialValue);

  useEffect(() => {
    let canceled = false;
    getDB().then((db) => {
      if (canceled) return;
      const stored = db[characterId]?.[objectType];
      if (stored !== undefined) setData(stored);
    });
    return () => {
      canceled = true;
    };
  }, [characterId, objectType]);

  const setValue = useCallback(
    async (value: T) => {
      setData(value);
      const db = await getDB();
      if (!db[characterId]) db[characterId] = {};
      db[characterId][objectType] = value;
      await setDB(db);
    },
    [characterId, objectType]
  );

  return [data, setValue] as const;
}