import fs from "node:fs/promises";
import path from "node:path";

const IGNORED_ROOT_NAMES = new Set([
  ".git",
  "node_modules",
  "dist",
  "exports",
  ".tmp_restore",
  ".runtime-data",
  "runtime-data",
]);

function toPosixPath(value) {
  return String(value ?? "").replace(/\\/g, "/");
}

export function normalizeRelativePath(rootDir, targetPath) {
  const relativePath = path.relative(path.resolve(rootDir), path.resolve(targetPath));
  return toPosixPath(relativePath || ".");
}

function isEnvFile(relativePath) {
  if (relativePath === ".env") return true;
  if (relativePath === ".env.example") return false;
  return relativePath.startsWith(".env.");
}

export function isSensitiveArtifactPath(relativePath) {
  const normalized = toPosixPath(relativePath).replace(/^\.\/+/, "");
  if (!normalized || normalized === ".") return false;

  const segments = normalized.split("/").filter(Boolean);
  const basename = segments[segments.length - 1] || normalized;

  if (isEnvFile(normalized)) return true;
  if (basename === "auth-users.json" || basename === "auth-sessions.json") return true;
  if (basename.toLowerCase().endsWith(".zip")) return true;
  if (segments.includes("backups")) return true;
  if (segments[0] === "data" && normalized !== "data" && normalized !== "data/seeds") {
    return !normalized.startsWith("data/seeds/");
  }
  return false;
}

export function shouldIncludeInShareArtifact(relativePath) {
  const normalized = toPosixPath(relativePath).replace(/^\.\/+/, "");
  if (!normalized || normalized === ".") return true;

  const segments = normalized.split("/").filter(Boolean);
  const rootName = segments[0] || "";

  if (IGNORED_ROOT_NAMES.has(rootName)) return false;
  if (isSensitiveArtifactPath(normalized)) return false;
  return true;
}

async function walkEntries(rootDir, currentDir, results) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    const relativePath = normalizeRelativePath(rootDir, absolutePath);
    results.push({
      absolutePath,
      relativePath,
      isDirectory: entry.isDirectory(),
    });

    if (entry.isDirectory()) {
      await walkEntries(rootDir, absolutePath, results);
    }
  }
}

export async function listArtifactEntries(rootDir) {
  const results = [];
  await walkEntries(rootDir, path.resolve(rootDir), results);
  return results;
}

export async function findSensitiveArtifactPaths(rootDir) {
  const entries = await listArtifactEntries(rootDir);
  return entries
    .map((entry) => entry.relativePath)
    .filter((relativePath) => isSensitiveArtifactPath(relativePath))
    .sort((left, right) => left.localeCompare(right, "en"));
}

export async function assertArtifactHasNoSensitivePaths(rootDir) {
  const sensitivePaths = await findSensitiveArtifactPaths(rootDir);
  if (sensitivePaths.length === 0) return;

  const bulletList = sensitivePaths.map((item) => ` - ${item}`).join("\n");
  throw new Error(
    `Arquivos sensiveis encontrados no artefato em ${rootDir}:\n${bulletList}`
  );
}
