import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
export const SOURCE_DATA_DIR = path.join(PROJECT_ROOT, "data");
export const SEEDS_DATA_DIR = path.join(SOURCE_DATA_DIR, "seeds");

function resolveDefaultRuntimeDataDir() {
  if (process.env.VERCEL) {
    return "/tmp/site-relatorio-data";
  }

  if (process.platform === "win32") {
    const localAppData =
      process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
    return path.join(localAppData, "site-relatorio");
  }

  const xdgDataHome = process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share");
  return path.join(xdgDataHome, "site-relatorio");
}

const configuredDataDir = String(process.env.DATA_DIR ?? "").trim();

export const DATA_DIR = configuredDataDir
  ? path.resolve(configuredDataDir)
  : resolveDefaultRuntimeDataDir();

export const AUTH_DATA_DIR = path.join(DATA_DIR, "auth");
export const BACKUPS_DATA_DIR = path.join(DATA_DIR, "backups");

export function getAuthStoragePaths(runtimeDataDir = DATA_DIR) {
  const resolvedRuntimeDir = path.resolve(runtimeDataDir);
  const authDataDir = path.join(resolvedRuntimeDir, "auth");

  return {
    authDataDir,
    usersFile: path.join(authDataDir, "auth-users.json"),
    sessionsFile: path.join(authDataDir, "auth-sessions.json"),
    legacyUsersFile: path.join(resolvedRuntimeDir, "auth-users.json"),
    legacySessionsFile: path.join(resolvedRuntimeDir, "auth-sessions.json"),
  };
}

export function isPathInside(parentPath, childPath) {
  const relativePath = path.relative(path.resolve(parentPath), path.resolve(childPath));
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}
