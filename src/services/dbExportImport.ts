import LZString from "lz-string";
import { getDB, setDB, type StoredData } from "../repositories/localStorageDB";

const SAVE_VERSION = 1;
const GAME_ID = "guthix-clicker";

// EXPORT DATABASE
export const exportDB = async (humanReadable = false) => {
  const db = await getDB();

  const savePackage = {
    meta: {
      version: SAVE_VERSION,
      exportedAt: Date.now(),
      game: GAME_ID,
      characterCount: Object.keys(db).length
    },
    data: db
  };

  let blob: Blob;

  if (humanReadable) {
    const dataStr = JSON.stringify(savePackage, null, 2);
    blob = new Blob([dataStr], { type: "application/json" });
  } else {
    const compressed = LZString.compressToUint8Array(
      JSON.stringify(savePackage)
    );

    blob = new Blob(
      [new Uint8Array(compressed)],
      { type: "application/octet-stream" }
    );
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  const date = new Date().toISOString().split("T")[0];

  a.href = url;
  a.download = humanReadable
    ? `clicker_save_${date}.json`
    : `clicker_save_${date}.bin`;

  a.click();
  URL.revokeObjectURL(url);
};

// IMPORT DATABASE
export const importDB = async (file: File) => {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result;

        let parsed;

        if (file.name.endsWith(".json")) {
          parsed = JSON.parse(content as string);
        } else {
          const uint = new Uint8Array(content as ArrayBuffer);
          const decompressed = LZString.decompressFromUint8Array(uint);
          parsed = JSON.parse(decompressed || "{}");
        }

        // Validate metadata
        if (!parsed.meta || !parsed.data) {
          throw new Error("Invalid save file format");
        }

        await setDB(parsed.data as StoredData);

        resolve();
      } catch (err) {
        reject(err);
      }
    };

    if (file.name.endsWith(".json")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};