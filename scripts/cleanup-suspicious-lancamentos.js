import { carregarVariaveisAmbiente } from "../src/servidor/config/ambiente.js";
carregarVariaveisAmbiente();
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { BACKUPS_DATA_DIR, DATA_DIR } from "../src/servidor/config/caminhos-runtime.js";

const APPLY = process.argv.includes("--apply");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_LANCAMENTOS_TABLE = process.env.SUPABASE_LANCAMENTOS_TABLE || "lancamentos";
const APP_PROJECT_CODE = normalizeProjectCode(process.env.APP_PROJECT_CODE ?? "PEOCON");

function normalizeProjectCode(value, fallback = "PEOCON") {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!normalized) return fallback;
  return normalized.slice(0, 64);
}

function isSuspiciousDescricao(descricao) {
  const text = String(descricao ?? "");
  if (/^[\s\t]*[=+\-@]/.test(text)) return true;
  if (text.length > 500) return true;
  if (/hyperlink\s*\(/i.test(text)) return true;
  return false;
}

async function readJsonSafe(filePath, fallbackValue) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

async function cleanupLocal() {
  const dataDir = DATA_DIR;
  const lancamentosFile = path.join(dataDir, "lancamentos.json");
  const rows = await readJsonSafe(lancamentosFile, []);
  const list = Array.isArray(rows) ? rows : [];
  const suspicious = list.filter((item) => isSuspiciousDescricao(item?.descricao));
  const cleaned = list.filter((item) => !isSuspiciousDescricao(item?.descricao));

  if (APPLY && suspicious.length > 0) {
    const backupPath = path.join(
      BACKUPS_DATA_DIR,
      `lancamentos.cleanup-backup.${new Date().toISOString().replace(/[:.]/g, "-")}.json`
    );
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.writeFile(backupPath, JSON.stringify(list, null, 2), "utf8");
    await fs.writeFile(lancamentosFile, JSON.stringify(cleaned, null, 2), "utf8");
    return {
      total: list.length,
      suspicious: suspicious.length,
      cleaned: cleaned.length,
      backupPath,
    };
  }

  return {
    total: list.length,
    suspicious: suspicious.length,
    cleaned: cleaned.length,
    backupPath: null,
  };
}

async function cleanupSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { configured: false, totalFetched: 0, suspicious: 0, removed: 0 };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let data;
  let error;
  ({ data, error } = await supabase
    .from(SUPABASE_LANCAMENTOS_TABLE)
    .select("id, descricao")
    .eq("project_code", APP_PROJECT_CODE)
    .limit(5000));

  if (error && String(error.code ?? "") === "42703") {
    ({ data, error } = await supabase
      .from(SUPABASE_LANCAMENTOS_TABLE)
      .select("id, descricao")
      .limit(5000));
  }

  if (error) {
    throw new Error(`[${SUPABASE_LANCAMENTOS_TABLE}] ${error.message}`);
  }

  const rows = data ?? [];
  const suspicious = rows.filter((row) => isSuspiciousDescricao(row?.descricao));
  const ids = suspicious.map((row) => row.id).filter(Boolean);

  if (APPLY && ids.length > 0) {
    let deleteError;
    ({ error: deleteError } = await supabase
      .from(SUPABASE_LANCAMENTOS_TABLE)
      .delete()
      .eq("project_code", APP_PROJECT_CODE)
      .in("id", ids));

    if (deleteError && String(deleteError.code ?? "") === "42703") {
      ({ error: deleteError } = await supabase
        .from(SUPABASE_LANCAMENTOS_TABLE)
        .delete()
        .in("id", ids));
    }

    if (deleteError) {
      throw new Error(`[${SUPABASE_LANCAMENTOS_TABLE}] ${deleteError.message}`);
    }
  }

  return {
    configured: true,
    totalFetched: rows.length,
    suspicious: ids.length,
    removed: APPLY ? ids.length : 0,
  };
}

async function main() {
  const [localResult, supabaseResult] = await Promise.all([cleanupLocal(), cleanupSupabase()]);
  console.log(
    JSON.stringify(
      {
        apply: APPLY,
        projectCode: APP_PROJECT_CODE,
        local: localResult,
        supabase: supabaseResult,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
