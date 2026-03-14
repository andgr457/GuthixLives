import LZString from "lz-string";

export type StoredData = {
  [characterId: string]: {
    [objectType: string]: any;
  };
};

const STORAGE_KEY = "clickerDB";

// Async wrapper around localStorage
export const getDB = async (): Promise<StoredData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return resolve({});
      try {
        const decompressed = LZString.decompress(raw);
        resolve(decompressed ? JSON.parse(decompressed) : {});
      } catch {
        resolve({});
      }
    }, 0);
  });
};

export const setDB = async (data: StoredData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const compressed = LZString.compress(JSON.stringify(data));
      localStorage.setItem(STORAGE_KEY, compressed);
      resolve(true);
    }, 0);
  });
};

export const getCharacterData = async (
  characterId: string,
  objectType?: string
) => {
  const db = await getDB();
  const charData = db[characterId] || {};
  if (objectType) return charData[objectType] ?? null;
  return charData;
};