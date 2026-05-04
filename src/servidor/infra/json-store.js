import fsp from "node:fs/promises";

export function createJsonStore() {
  const cache = new Map();

  async function read(filePath, fallbackValue) {
    try {
      const stats = await fsp.stat(filePath);
      const cached = cache.get(filePath);
      if (cached && cached.mtimeMs === stats.mtimeMs) {
        return cached.value;
      }

      const raw = await fsp.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw);
      cache.set(filePath, {
        mtimeMs: stats.mtimeMs,
        value: parsed,
      });
      return parsed;
    } catch {
      return fallbackValue;
    }
  }

  async function write(filePath, value) {
    await fsp.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
    try {
      const stats = await fsp.stat(filePath);
      cache.set(filePath, {
        mtimeMs: stats.mtimeMs,
        value,
      });
    } catch {
      cache.delete(filePath);
    }
  }

  return { read, write };
}
