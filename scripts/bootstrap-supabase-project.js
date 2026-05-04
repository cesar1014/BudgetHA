import { carregarVariaveisAmbiente } from "../src/servidor/config/ambiente.js";
carregarVariaveisAmbiente();
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  DATA_DIR,
  SOURCE_DATA_DIR,
  getAuthStoragePaths,
} from "../src/servidor/config/caminhos-runtime.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_PROJECTS_TABLE = process.env.SUPABASE_PROJECTS_TABLE || "projects";
const SUPABASE_TOPICOS_TABLE = process.env.SUPABASE_TOPICOS_TABLE || "topicos";
const SUPABASE_LANCAMENTOS_TABLE = process.env.SUPABASE_LANCAMENTOS_TABLE || "lancamentos";
const SUPABASE_APP_CONFIG_TABLE = process.env.SUPABASE_APP_CONFIG_TABLE || "app_config";
const SUPABASE_AUTH_SESSIONS_TABLE = process.env.SUPABASE_AUTH_SESSIONS_TABLE || "auth_sessions";
const APP_PROJECT_CODE = normalizeProjectCode(process.env.APP_PROJECT_CODE ?? "PEOCON");
const APP_PROJECT_NAME =
  String(process.env.APP_PROJECT_NAME ?? APP_PROJECT_CODE).trim() || APP_PROJECT_CODE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorias.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalizeProjectCode(value, fallback = "PEOCON") {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!normalized) return fallback;
  return normalized.slice(0, 64);
}

function round2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (typeof value !== "string") return NaN;
  const cleaned = value.trim().replace(/\./g, "").replace(",", ".");
  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? numeric : NaN;
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getAnoSemestre(dateIso) {
  const [anoText, mesText] = String(dateIso ?? "").split("-");
  const ano = Number(anoText);
  const mes = Number(mesText);
  return {
    ano: Number.isFinite(ano) ? ano : 0,
    semestre: mes <= 6 ? "S1" : "S2",
  };
}

async function readJsonSafe(filePath, fallbackValue) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

async function pickExistingPath(candidates) {
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try next candidate.
    }
  }
  return candidates[0];
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function upsertInChunks(table, rows, onConflict, chunkSize = 500) {
  if (!Array.isArray(rows) || rows.length === 0) return;
  const chunks = chunkArray(rows, chunkSize);
  for (const chunk of chunks) {
    const { error } = await supabase.from(table).upsert(chunk, { onConflict });
    if (error) {
      throw new Error(`[${table}] ${error.message}`);
    }
  }
}

function mapTopico(topico) {
  return {
    project_code: APP_PROJECT_CODE,
    id: String(topico?.id ?? "").trim(),
    nome: String(topico?.nome ?? "").trim(),
    grupo:
      String(topico?.grupo ?? "COMMUNICATIONS & PUBLICATIONS").trim() ||
      "COMMUNICATIONS & PUBLICATIONS",
    template_row: Number.isFinite(Number(topico?.templateRow)) ? Number(topico.templateRow) : null,
    incluir_no_resumo: Boolean(topico?.incluirNoResumo),
    permitir_lancamento: Boolean(topico?.permitirLancamento),
    ordem: Number.isFinite(Number(topico?.ordem)) ? Number(topico.ordem) : 0,
    orcamento_programa_brl: round2(Number(topico?.orcamentoProgramaBRL ?? 0)),
    updated_at: new Date().toISOString(),
  };
}

function mapLancamento(item) {
  const dataIso = String(item?.data ?? "");
  const fallback = isIsoDate(dataIso) ? getAnoSemestre(dataIso) : { ano: 0, semestre: "S1" };
  const semestreRaw = String(item?.semestre ?? "");
  const semestre = semestreRaw === "S1" || semestreRaw === "S2" ? semestreRaw : fallback.semestre;
  const ano = Number.isFinite(Number(item?.ano)) ? Number(item.ano) : fallback.ano;
  const valor = toNumber(item?.valor);

  return {
    id: String(item?.id ?? "").trim(),
    project_code: APP_PROJECT_CODE,
    topico_id: String(item?.topicoId ?? item?.topico_id ?? "").trim(),
    data: dataIso,
    descricao: String(item?.descricao ?? "").trim(),
    fornecedor: String(item?.fornecedor ?? "").trim(),
    responsavel: String(item?.responsavel ?? "").trim(),
    valor: Number.isFinite(valor) ? round2(valor) : 0,
    semestre,
    ano,
    criado_em: item?.criadoEm ?? item?.criado_em ?? new Date().toISOString(),
    atualizado_em: item?.atualizadoEm ?? item?.atualizado_em ?? new Date().toISOString(),
  };
}

function mapAuthSession(item) {
  const sessionId = String(item?.sessionId ?? item?.sid ?? "").trim();
  const username = String(item?.username ?? item?.u ?? "").trim();
  const role = String(item?.role ?? item?.r ?? "admin")
    .trim()
    .toLowerCase();
  const expiresAt = Number(item?.expiresAt ?? item?.exp);
  const createdAt = Number(item?.createdAt ?? Date.now());
  if (!sessionId || !username || !Number.isFinite(expiresAt)) return null;

  return {
    project_code: APP_PROJECT_CODE,
    session_id: sessionId,
    username,
    role: role === "admin" || role === "editor" || role === "viewer" ? role : "admin",
    expires_at: new Date(expiresAt).toISOString(),
    created_at: Number.isFinite(createdAt)
      ? new Date(createdAt).toISOString()
      : new Date().toISOString(),
  };
}

async function main() {
  const dataDir = DATA_DIR;
  const projectDir = path.join(dataDir, APP_PROJECT_CODE);
  const legacyProjectDir = path.join(dataDir, "projects", APP_PROJECT_CODE);
  const bundleProjectDir = path.join(SOURCE_DATA_DIR, APP_PROJECT_CODE);
  const legacyBundleProjectDir = path.join(SOURCE_DATA_DIR, "projects", APP_PROJECT_CODE);
  const authPaths = getAuthStoragePaths(dataDir);
  const topicosFile = await pickExistingPath([
    path.join(projectDir, "topicos.json"),
    path.join(legacyProjectDir, "topicos.json"),
    path.join(bundleProjectDir, "topicos.json"),
    path.join(legacyBundleProjectDir, "topicos.json"),
    path.join(dataDir, "topicos.json"),
    path.join(SOURCE_DATA_DIR, "topicos.json"),
  ]);
  const lancamentosFile = await pickExistingPath([
    path.join(projectDir, "lancamentos.json"),
    path.join(legacyProjectDir, "lancamentos.json"),
    path.join(bundleProjectDir, "lancamentos.json"),
    path.join(legacyBundleProjectDir, "lancamentos.json"),
    path.join(dataDir, "lancamentos.json"),
    path.join(SOURCE_DATA_DIR, "lancamentos.json"),
  ]);
  const appConfigFile = await pickExistingPath([
    path.join(projectDir, "app-config.json"),
    path.join(legacyProjectDir, "app-config.json"),
    path.join(bundleProjectDir, "app-config.json"),
    path.join(legacyBundleProjectDir, "app-config.json"),
    path.join(dataDir, "app-config.json"),
    path.join(SOURCE_DATA_DIR, "app-config.json"),
  ]);
  const authSessionsFile = await pickExistingPath([
    authPaths.sessionsFile,
    authPaths.legacySessionsFile,
    path.join(SOURCE_DATA_DIR, "auth-sessions.json"),
  ]);

  const [topicosRaw, lancamentosRaw, appConfigRaw, authSessionsRaw] = await Promise.all([
    readJsonSafe(topicosFile, []),
    readJsonSafe(lancamentosFile, []),
    readJsonSafe(appConfigFile, {}),
    readJsonSafe(authSessionsFile, []),
  ]);

  const topicos = (Array.isArray(topicosRaw) ? topicosRaw : [])
    .map(mapTopico)
    .filter((item) => item.id && item.nome);

  const lancamentos = (Array.isArray(lancamentosRaw) ? lancamentosRaw : [])
    .map(mapLancamento)
    .filter(
      (item) =>
        item.id && item.topico_id && isIsoDate(item.data) && item.descricao && item.valor > 0
    );

  const authSessions = (Array.isArray(authSessionsRaw) ? authSessionsRaw : [])
    .map(mapAuthSession)
    .filter(Boolean);

  const appConfig = {
    project_code: APP_PROJECT_CODE,
    team_hires_unlocked: Boolean(appConfigRaw?.teamHiresUnlocked),
    updated_at: new Date().toISOString(),
  };

  const { error: projectError } = await supabase.from(SUPABASE_PROJECTS_TABLE).upsert(
    {
      code: APP_PROJECT_CODE,
      name: APP_PROJECT_NAME,
      is_active: true,
    },
    { onConflict: "code" }
  );
  if (projectError) throw new Error(`[${SUPABASE_PROJECTS_TABLE}] ${projectError.message}`);

  await upsertInChunks(SUPABASE_TOPICOS_TABLE, topicos, "project_code,id", 200);
  await upsertInChunks(SUPABASE_LANCAMENTOS_TABLE, lancamentos, "project_code,id", 500);

  const { error: appConfigError } = await supabase
    .from(SUPABASE_APP_CONFIG_TABLE)
    .upsert(appConfig, { onConflict: "project_code" });
  if (appConfigError) throw new Error(`[${SUPABASE_APP_CONFIG_TABLE}] ${appConfigError.message}`);

  const { error: deleteSessionsError } = await supabase
    .from(SUPABASE_AUTH_SESSIONS_TABLE)
    .delete()
    .eq("project_code", APP_PROJECT_CODE);
  if (deleteSessionsError)
    throw new Error(`[${SUPABASE_AUTH_SESSIONS_TABLE}] ${deleteSessionsError.message}`);

  if (authSessions.length > 0) {
    await upsertInChunks(
      SUPABASE_AUTH_SESSIONS_TABLE,
      authSessions,
      "project_code,session_id",
      500
    );
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        projectCode: APP_PROJECT_CODE,
        imported: {
          topicos: topicos.length,
          lancamentos: lancamentos.length,
          authSessions: authSessions.length,
          teamHiresUnlocked: appConfig.team_hires_unlocked,
        },
        tables: {
          projects: SUPABASE_PROJECTS_TABLE,
          topicos: SUPABASE_TOPICOS_TABLE,
          lancamentos: SUPABASE_LANCAMENTOS_TABLE,
          appConfig: SUPABASE_APP_CONFIG_TABLE,
          authSessions: SUPABASE_AUTH_SESSIONS_TABLE,
        },
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
