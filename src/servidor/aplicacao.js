import express from "express";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";
import { fileURLToPath } from "node:url";
import { v4 as uuidv4 } from "uuid";
import PDFDocument from "pdfkit";
import XlsxPopulate from "xlsx-populate";
import { createClient } from "@supabase/supabase-js";
import {
  createPbkdf2Credential,
  normalizeAuthCredential,
  safeEqualText,
  verifyPassword,
} from "./modulos/autenticacao/senhas.js";
import {
  parseFilters,
  filtrarLancamentos,
  montarResumo,
  getPeriodoEfetivo,
} from "./modulos/relatorios/nucleo-relatorios.js";
import { registerAuthRoutes } from "./modulos/autenticacao/rotas.js";
import { registerAdminRoutes } from "./modulos/administracao/rotas.js";
import {
  createApiOriginGuardMiddleware,
  createSecurityHeadersMiddleware,
} from "./middleware/seguranca.js";
import {
  AUTH_DATA_DIR,
  DATA_DIR,
  PROJECT_ROOT,
  SEEDS_DATA_DIR,
  SOURCE_DATA_DIR,
  getAuthStoragePaths,
  isPathInside,
} from "./config/caminhos-runtime.js";
import { registerProjectRoutes } from "./modulos/projetos/rotas.js";
import { createJsonStore } from "./infra/json-store.js";

const __filename = fileURLToPath(import.meta.url);
// Mantem caminhos como public/, templates/ e data/ apontando para a raiz do projeto.
const __dirname = PROJECT_ROOT;

const PORT = process.env.PORT || 3000;
const BUNDLE_DATA_DIR = SOURCE_DATA_DIR;
const LEGACY_PROJECTS_DATA_DIR = path.join(DATA_DIR, "projects");
const LEGACY_BUNDLE_PROJECTS_DATA_DIR = path.join(BUNDLE_DATA_DIR, "projects");
const LEGACY_TOPICOS_FILE = path.join(DATA_DIR, "topicos.json");
const LEGACY_LANCAMENTOS_FILE = path.join(DATA_DIR, "lancamentos.json");
const LEGACY_PENDING_SYNC_FILE = path.join(DATA_DIR, "lancamentos-pending-sync.json");
const LEGACY_APP_CONFIG_FILE = path.join(DATA_DIR, "app-config.json");
const AUTH_STORAGE_PATHS = getAuthStoragePaths(DATA_DIR);
const AUTH_SESSION_STORE_FILE = AUTH_STORAGE_PATHS.sessionsFile;
const AUTH_USERS_STORE_FILE = AUTH_STORAGE_PATHS.usersFile;
const LEGACY_AUTH_SESSION_STORE_FILE = AUTH_STORAGE_PATHS.legacySessionsFile;
const LEGACY_AUTH_USERS_STORE_FILE = AUTH_STORAGE_PATHS.legacyUsersFile;
const LEGACY_TOPICOS_BUNDLE_FILE = path.join(BUNDLE_DATA_DIR, "topicos.json");
const LEGACY_LANCAMENTOS_BUNDLE_FILE = path.join(BUNDLE_DATA_DIR, "lancamentos.json");
const LEGACY_APP_CONFIG_BUNDLE_FILE = path.join(BUNDLE_DATA_DIR, "app-config.json");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_LANCAMENTOS_TABLE = process.env.SUPABASE_LANCAMENTOS_TABLE || "lancamentos";
const SUPABASE_TOPICOS_TABLE = process.env.SUPABASE_TOPICOS_TABLE || "topicos";
const SUPABASE_APP_CONFIG_TABLE = process.env.SUPABASE_APP_CONFIG_TABLE || "app_config";
const SUPABASE_AUTH_SESSIONS_TABLE = process.env.SUPABASE_AUTH_SESSIONS_TABLE || "auth_sessions";
const SUPABASE_AUDIT_LOG_TABLE = process.env.SUPABASE_AUDIT_LOG_TABLE || "audit_log";
const SUPABASE_PROJECTS_TABLE = process.env.SUPABASE_PROJECTS_TABLE || "projects";
const SUPABASE_DEPARTMENTS_TABLE = process.env.SUPABASE_DEPARTMENTS_TABLE || "departments";
const SUPABASE_APP_USERS_TABLE = process.env.SUPABASE_APP_USERS_TABLE || "app_users";
const SUPABASE_PROJECT_MEMBERSHIPS_TABLE =
  process.env.SUPABASE_PROJECT_MEMBERSHIPS_TABLE || "project_memberships";
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const APP_PROJECT_CODE = normalizeProjectCode(process.env.APP_PROJECT_CODE ?? "PEOCON");
const PROJECT_DEFINITIONS = {
  PEOCON: {
    code: "PEOCON",
    name: "PEOCON",
    brandName: "Fundação Pio XII",
    templateFile: path.join(__dirname, "templates", "fundacao-template.xlsx"),
    excelMode: "legacy-single-sheet",
    primarySheetName: "Expenditure",
    exportFilePrefix: "Fundacao_Expenditure_Atualizado",
  },
  FELLOW: {
    code: "FELLOW",
    name: "FELLOW",
    brandName: "Fellow",
    templateFile: path.join(__dirname, "templates", "fellow-template.xlsx"),
    excelMode: "multi-sheet",
    primarySheetName: "Expenditures",
    groupSheetMap: {
      PERSONNEL: "Expenditures",
      "DIRECT COSTS": "Expenditures",
      "INFRASTRUCTURE AND EQUIPMENT": "Equipment",
    },
    sheetDateCells: [
      { sheet: "Expenditures", fromCell: "G4", toCell: "G7" },
      { sheet: "Equipment", fromCell: "G4", toCell: "G7" },
    ],
    exportFilePrefix: "FELLOW_Expenditures_Atualizado",
  },
};
const runtimeKnownProjectCodes = new Set([APP_PROJECT_CODE, ...Object.keys(PROJECT_DEFINITIONS)]);
const PENDING_SYNC_INTERVAL_MS = 30_000;
const AUTH_USERS_JSON = String(process.env.APP_LOGIN_USERS_JSON ?? "").trim();
const LEGACY_AUTH_USERNAME = String(process.env.APP_LOGIN_USER ?? "").trim();
const LEGACY_AUTH_PASSWORD = String(process.env.APP_LOGIN_PASSWORD ?? "");
const AUTH_COOKIE_NAME = "peocon_session";
const AUTH_SESSION_TTL_MS = Math.max(60_000, Number(process.env.AUTH_SESSION_TTL_MS ?? 43_200_000));
const AUTH_MAX_ACTIVE_SESSIONS = Math.max(
  100,
  Number(process.env.AUTH_MAX_ACTIVE_SESSIONS ?? 2000)
);
const AUTH_TOKEN_SECRET = String(process.env.AUTH_TOKEN_SECRET ?? "").trim();
const ALLOW_INSECURE_DEV_AUTH_SECRET = process.env.ALLOW_INSECURE_DEV_AUTH_SECRET === "true";
const IS_PRODUCTION_ENV = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
const ACTIVE_AUTH_TOKEN_SECRET = AUTH_TOKEN_SECRET || crypto.randomBytes(48).toString("hex");
const LOGIN_RATE_WINDOW_MS = Math.max(10_000, Number(process.env.LOGIN_RATE_WINDOW_MS ?? 600_000));
const LOGIN_RATE_MAX_ATTEMPTS = Math.max(1, Number(process.env.LOGIN_RATE_MAX_ATTEMPTS ?? 8));
const LOGIN_RATE_MAX_ATTEMPTS_PER_USER = Math.max(
  1,
  Number(process.env.LOGIN_RATE_MAX_ATTEMPTS_PER_USER ?? LOGIN_RATE_MAX_ATTEMPTS)
);
const LOGIN_RATE_GLOBAL_WINDOW_MS = Math.max(
  10_000,
  Number(process.env.LOGIN_RATE_GLOBAL_WINDOW_MS ?? LOGIN_RATE_WINDOW_MS)
);
const LOGIN_RATE_MAX_ATTEMPTS_GLOBAL = Math.max(
  1,
  Number(process.env.LOGIN_RATE_MAX_ATTEMPTS_GLOBAL ?? 100)
);
const LOGIN_RATE_MAX_TRACKED_KEYS = Math.max(
  1000,
  Number(process.env.LOGIN_RATE_MAX_TRACKED_KEYS ?? 5000)
);
const TRUST_PROXY_RAW = process.env.TRUST_PROXY ?? "0";
const AUTH_ROLE_ADMIN = "admin";
const AUTH_ROLE_EDITOR = "editor";
const AUTH_ROLE_VIEWER = "viewer";
const AUTH_ALLOWED_ROLES = new Set([AUTH_ROLE_ADMIN, AUTH_ROLE_EDITOR, AUTH_ROLE_VIEWER]);
const AUTH_ACCOUNT_TYPE_USER = "user";
const AUTH_ACCOUNT_TYPE_PROJECT = "project";
const AUTH_ALLOWED_ACCOUNT_TYPES = new Set([AUTH_ACCOUNT_TYPE_USER, AUTH_ACCOUNT_TYPE_PROJECT]);
const FIELD_LIMITS = {
  topicoNome: 120,
  topicoGrupo: 80,
  descricao: 500,
  fornecedor: 160,
  responsavel: 160,
};
const PROJECT_CATEGORY_MAX_LENGTH = 80;
const PROJECT_CATEGORIES_MAX_ITEMS = 24;
const PDF_EXPORT_MAX_ITEMS = Math.max(1, Number(process.env.PDF_EXPORT_MAX_ITEMS ?? 1200));
const PDF_TEXT_MAX_CHARS = Math.max(20, Number(process.env.PDF_TEXT_MAX_CHARS ?? 180));
const TEAM_HIRES_UNLOCKED_DEFAULT = process.env.TEAM_HIRES_UNLOCKED === "true";
const GROUP_LABELS_PT = {
  "TEAM HIRES": "Contratacoes da Equipe",
  PERSONNEL: "Pessoal",
  "DIRECT COSTS": "Custos Diretos",
  "COMMUNICATIONS & PUBLICATIONS": "Comunicacao e Publicacoes",
  "THIRD PARTY SERVICES": "Servicos de Terceiros",
  "INFRASTRUCTURE & EQUIPMENT": "Infraestrutura e Equipamentos",
  "INFRASTRUCTURE AND EQUIPMENT": "Infraestrutura e Equipamentos",
};
const TOPIC_LABELS_PT = {
  "Nurse 1": "Enfermeiro 1",
  "Nurse 2": "Enfermeiro 2",
  "Project Coordinator": "Coordenador do Projeto",
  "Administrative Assistant 1": "Assistente Administrativo 1",
  "Administrative Assistant 2": "Assistente Administrativo 2",
  "Medical resident grant": "Residencia medica",
  "Nursing resident grant": "Residencia em enfermagem",
  "Administrative assistant salary": "Assistente administrativo",
  "Project coordinator salary": "Coordenador de projeto",
  "Audiovisual salary": "Audiovisual",
  "Nurse salary": "Enfermeiro",
  "Operational fees (PG Lato Sensu/COREME)": "Custos operacionais (PG Lato Sensu/COREME)",
  "Infrastructure and equipement": "Infraestrutura e equipamentos",
  "Infrastructure and equipment": "Infraestrutura e equipamentos",
  "Transportation/operational reserve - External internships":
    "Transporte/reserva operacional - Estagios externos",
  "Advertising fees (Marketing/press)": "Publicidade (Marketing/imprensa)",
  "Scientific and cultural events fee (Harena)": "Eventos cientificos e culturais (Harena)",
  "Resident support fee": "Apoio ao residente",
  Computer: "Computador",
  "Didactic Material": "Material Didatico",
  Publications: "Publicacoes",
  "Technical Equipment & Infrastructure": "Equipamentos Tecnicos e Infraestrutura",
  "Team Transportation & Meals": "Transporte e Alimentacao da Equipe",
  "Events & Conferences": "Eventos e Conferencias",
  "Just Mine": "Just Mine",
  "External Consultant": "Consultor Externo",
  "Digital Marketing": "Marketing Digital",
};
const TOPICO_ORCAMENTO_BRL_PADRAO = {
  "nurse-1": 268981,
  "nurse-2": 112076,
  "project-coordinator": 75679,
  "administrative-assistant-1": 66243,
  "administrative-assistant-2": 62931,
  computer: 18251,
  "didactic-material": 30000,
  publications: 25000,
  "technical-equipment-infrastructure": 50000,
  "team-transportation-meals": 30000,
  "events-conferences": 60000,
  "just-mine": 100000,
  "external-consultant": 30000,
  "digital-marketing": 20000,
};

const DEFAULT_SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "style-src-attr 'none'",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data:",
  "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
].join("; ");

function normalizeProjectCode(value, fallback = "PEOCON") {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!normalized) return fallback;
  return normalized.slice(0, 64);
}

function registerProjectCode(projectCode) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, "");
  if (!normalizedProjectCode) return "";
  runtimeKnownProjectCodes.add(normalizedProjectCode);
  return normalizedProjectCode;
}

function registerProjectCodes(projectCodes = []) {
  const normalizedCodes = normalizeProjectCodesList(projectCodes, []);
  normalizedCodes.forEach((projectCode) => {
    runtimeKnownProjectCodes.add(projectCode);
  });
  return getKnownProjectCodes();
}

function getKnownProjectCodes() {
  return [...runtimeKnownProjectCodes];
}

function resolveProjectCodeForUser(username, explicitProjectCode = "") {
  const explicit = normalizeProjectCode(explicitProjectCode, "");
  if (explicit) return explicit;

  const normalizedUsername = normalizeProjectCode(username, "");
  if (normalizedUsername && PROJECT_DEFINITIONS[normalizedUsername]) {
    return normalizedUsername;
  }
  return APP_PROJECT_CODE;
}

function getProjectScopedLoginProjectCode(username, allowedProjects = []) {
  const normalizedUsernameProjectCode = normalizeProjectCode(username, "");
  if (!normalizedUsernameProjectCode) return "";

  const knownProjectCodes = new Set([...getKnownProjectCodes(), ...listAllActiveProjectsCached()]);
  if (!knownProjectCodes.has(normalizedUsernameProjectCode)) return "";

  const normalizedAllowedProjects = normalizeProjectCodesList(allowedProjects, []);
  if (!normalizedAllowedProjects.includes(normalizedUsernameProjectCode)) return "";
  return normalizedUsernameProjectCode;
}

function getProjectDefinition(projectCode = APP_PROJECT_CODE) {
  const normalized = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  const known = PROJECT_DEFINITIONS[normalized];
  if (known) return known;
  return {
    code: normalized,
    name: normalized,
    brandName: normalized,
    templateFile: PROJECT_DEFINITIONS[APP_PROJECT_CODE]?.templateFile,
    excelMode: "legacy-single-sheet",
    primarySheetName: "Expenditure",
    exportFilePrefix: `${normalized}_Expenditure_Atualizado`,
  };
}

function getLegacyProjectStoragePaths(projectCode = APP_PROJECT_CODE) {
  const normalized = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  if (normalized === APP_PROJECT_CODE) {
    return {
      projectCode: normalized,
      dataDir: DATA_DIR,
      topicosFile: LEGACY_TOPICOS_FILE,
      lancamentosFile: LEGACY_LANCAMENTOS_FILE,
      pendingSyncFile: LEGACY_PENDING_SYNC_FILE,
      appConfigFile: LEGACY_APP_CONFIG_FILE,
      topicosBundleFile: LEGACY_TOPICOS_BUNDLE_FILE,
      lancamentosBundleFile: LEGACY_LANCAMENTOS_BUNDLE_FILE,
      appConfigBundleFile: LEGACY_APP_CONFIG_BUNDLE_FILE,
    };
  }

  const dataDir = path.join(LEGACY_PROJECTS_DATA_DIR, normalized);
  const bundleDir = path.join(LEGACY_BUNDLE_PROJECTS_DATA_DIR, normalized);
  return {
    projectCode: normalized,
    dataDir,
    topicosFile: path.join(dataDir, "topicos.json"),
    lancamentosFile: path.join(dataDir, "lancamentos.json"),
    pendingSyncFile: path.join(dataDir, "lancamentos-pending-sync.json"),
    appConfigFile: path.join(dataDir, "app-config.json"),
    topicosBundleFile: path.join(bundleDir, "topicos.json"),
    lancamentosBundleFile: path.join(bundleDir, "lancamentos.json"),
    appConfigBundleFile: path.join(bundleDir, "app-config.json"),
  };
}

function getProjectSeedPaths(projectCode = APP_PROJECT_CODE) {
  const normalized = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  const seedDir = path.join(SEEDS_DATA_DIR, normalized);
  return {
    projectCode: normalized,
    dataDir: seedDir,
    topicosFile: path.join(seedDir, "topicos.json"),
    appConfigFile: path.join(seedDir, "app-config.json"),
  };
}

function listProjectSeedTemplateSources(projectCode = APP_PROJECT_CODE) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  const candidateCodes = [
    normalizedProjectCode,
    APP_PROJECT_CODE,
    ...getKnownProjectCodes(),
  ];
  const seen = new Set();

  return candidateCodes
    .map((candidateCode) => normalizeProjectCode(candidateCode, ""))
    .filter((candidateCode) => {
      if (!candidateCode || seen.has(candidateCode)) return false;
      seen.add(candidateCode);
      return true;
    })
    .map((candidateCode) => ({
      projectCode: candidateCode,
      ...getProjectSeedPaths(candidateCode),
    }));
}

function resolveProjectSeedTemplateSource(projectCode = APP_PROJECT_CODE) {
  return (
    listProjectSeedTemplateSources(projectCode).find(
      (candidate) =>
        fs.existsSync(candidate?.topicosFile) || fs.existsSync(candidate?.appConfigFile)
    ) ?? null
  );
}

function getProjectStoragePaths(projectCode = APP_PROJECT_CODE) {
  const normalized = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  const dataDir = path.join(DATA_DIR, normalized);
  const bundleDir = path.join(BUNDLE_DATA_DIR, normalized);
  return {
    projectCode: normalized,
    dataDir,
    topicosFile: path.join(dataDir, "topicos.json"),
    lancamentosFile: path.join(dataDir, "lancamentos.json"),
    pendingSyncFile: path.join(dataDir, "lancamentos-pending-sync.json"),
    appConfigFile: path.join(dataDir, "app-config.json"),
    topicosBundleFile: path.join(bundleDir, "topicos.json"),
    lancamentosBundleFile: path.join(bundleDir, "lancamentos.json"),
    appConfigBundleFile: path.join(bundleDir, "app-config.json"),
    seeds: getProjectSeedPaths(normalized),
    legacy: getLegacyProjectStoragePaths(normalized),
  };
}

function parseTrustProxySetting(rawValue) {
  const normalized = String(rawValue ?? "")
    .trim()
    .toLowerCase();
  if (!normalized || normalized === "0" || normalized === "false" || normalized === "off")
    return false;
  if (normalized === "true" || normalized === "on") return true;

  const numeric = Number(normalized);
  if (Number.isInteger(numeric) && numeric >= 0) return numeric;

  if (["loopback", "linklocal", "uniquelocal"].includes(normalized)) return normalized;
  return normalized;
}

function normalizeAuthRole(roleValue, fallbackRole = AUTH_ROLE_ADMIN) {
  const normalized = String(roleValue ?? "")
    .trim()
    .toLowerCase();
  if (!normalized) return fallbackRole;
  if (AUTH_ALLOWED_ROLES.has(normalized)) return normalized;
  return fallbackRole;
}

function normalizeAccountType(value, fallback = AUTH_ACCOUNT_TYPE_USER) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (AUTH_ALLOWED_ACCOUNT_TYPES.has(normalized)) return normalized;
  return fallback;
}

function normalizeAuthUsername(value) {
  return String(value ?? "").trim();
}

function normalizeLoginIdentifier(value) {
  return normalizeAuthUsername(value).toLowerCase();
}

function normalizeProjectCodesList(value, fallbackList = []) {
  const sourceValues = Array.isArray(value) ? value : [value];
  const merged = [
    ...sourceValues,
    ...(Array.isArray(fallbackList) ? fallbackList : [fallbackList]),
  ];
  const normalized = merged.map((item) => normalizeProjectCode(item, "")).filter(Boolean);
  if (normalized.length === 0) return [];
  return [...new Set(normalized)];
}

function normalizeProjectCategoriesInput(value, fallback = []) {
  const primaryValues = Array.isArray(value)
    ? value
    : value == null
      ? []
      : String(value).split(/[,\n;]+/g);
  const fallbackValues = Array.isArray(fallback) ? fallback : [fallback];
  const mergedValues = [...primaryValues, ...fallbackValues];

  const normalized = [];
  const seen = new Set();
  for (const item of mergedValues) {
    const candidate = String(item ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, PROJECT_CATEGORY_MAX_LENGTH);
    if (!candidate) continue;

    const dedupeKey = candidate.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    normalized.push(candidate);

    if (normalized.length >= PROJECT_CATEGORIES_MAX_ITEMS) break;
  }
  return normalized;
}

const PROJECT_STATUS_VALUES = new Set(["ativo", "inativo", "concluido"]);

function normalizeProjectStatus(value, fallback = "ativo") {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (PROJECT_STATUS_VALUES.has(normalized)) return normalized;
  return fallback;
}

function pickDefaultProjectCode(allowedProjects, explicitProjectCode = "") {
  const normalizedAllowed = normalizeProjectCodesList(allowedProjects, []);
  if (normalizedAllowed.length === 0) return "";

  const explicit = normalizeProjectCode(explicitProjectCode, "");
  if (explicit && normalizedAllowed.includes(explicit)) {
    return explicit;
  }
  return normalizedAllowed[0];
}

function ensureUniqueAuthUserIds(users) {
  const used = new Set();
  return (Array.isArray(users) ? users : []).map((user) => {
    const baseId = slugifyId(user?.id || user?.username || "user", "user").slice(0, 80);
    let id = baseId;
    let suffix = 2;
    while (used.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    used.add(id);
    return { ...user, id };
  });
}

function normalizeRolesByProject(raw) {
  if (!raw || typeof raw !== "object") return {};
  const result = {};
  for (const [key, value] of Object.entries(raw)) {
    const code = normalizeProjectCode(key, "");
    if (!code) continue;
    result[code] = normalizeAuthRole(value, AUTH_ROLE_VIEWER);
  }
  return result;
}

function normalizeAuthUserDefinition(rawUser = {}, options = {}) {
  const allowPlaintextPassword = options.allowPlaintextPassword !== false;
  const sourceLabel = String(options.sourceLabel ?? "Credencial").trim() || "Credencial";
  const normalizedUsername = normalizeAuthUsername(rawUser?.username);
  if (!normalizedUsername) return null;

  let normalizedCredential = normalizeAuthCredential(
    rawUser?.password,
    rawUser?.passwordHash ?? rawUser?.hash
  );
  if (!normalizedCredential) return null;

  let passwordMigratedToHash = false;
  if (!String(normalizedCredential).startsWith("pbkdf2$")) {
    if (!allowPlaintextPassword) {
      throw new Error(
        `${sourceLabel} aceita apenas passwordHash PBKDF2. Remova passwords em texto puro.`
      );
    }
    normalizedCredential = createPbkdf2Credential(normalizedCredential);
    passwordMigratedToHash = true;
  }

  const normalizedRole = normalizeAuthRole(rawUser?.role, AUTH_ROLE_ADMIN);
  const inputRolesByProject = normalizeRolesByProject(rawUser?.rolesByProject);
  const allowedFromRoles = Object.keys(inputRolesByProject);
  const allowedProjects = normalizeProjectCodesList(
    allowedFromRoles.length > 0
      ? allowedFromRoles
      : (rawUser?.allowedProjects ?? rawUser?.projects),
    [resolveProjectCodeForUser(normalizedUsername, rawUser?.projectCode)]
  );
  const ensuredAllowedProjects = allowedProjects.length > 0 ? allowedProjects : [APP_PROJECT_CODE];
  const rolesByProject = { ...inputRolesByProject };
  for (const projectCode of ensuredAllowedProjects) {
    if (!rolesByProject[projectCode]) {
      rolesByProject[projectCode] = normalizedRole;
    }
  }
  const defaultProjectCode = pickDefaultProjectCode(
    ensuredAllowedProjects,
    rawUser?.defaultProjectCode ?? rawUser?.projectCode
  );
  const normalizedAccountType = normalizeAccountType(rawUser?.accountType, AUTH_ACCOUNT_TYPE_USER);
  const isSuperAdmin = rawUser?.isSuperAdmin === true;
  const accountType =
    !isSuperAdmin &&
    normalizedAccountType === AUTH_ACCOUNT_TYPE_PROJECT &&
    ensuredAllowedProjects.length === 1
      ? AUTH_ACCOUNT_TYPE_PROJECT
      : AUTH_ACCOUNT_TYPE_USER;

  const nowIso = new Date().toISOString();
  const createdAtRaw = Date.parse(String(rawUser?.createdAt ?? ""));
  const updatedAtRaw = Date.parse(String(rawUser?.updatedAt ?? ""));
  const resetAtRaw = Date.parse(String(rawUser?.lastPasswordResetAt ?? ""));

  return {
    id: String(rawUser?.id ?? "").trim() || slugifyId(normalizedUsername, "user"),
    username: normalizedUsername,
    passwordHash: normalizedCredential,
    role: normalizedRole,
    isActive: rawUser?.isActive !== false,
    isSuperAdmin: accountType === AUTH_ACCOUNT_TYPE_PROJECT ? false : isSuperAdmin,
    accountType,
    allowedProjects: ensuredAllowedProjects,
    rolesByProject,
    defaultProjectCode,
    createdAt: Number.isFinite(createdAtRaw) ? new Date(createdAtRaw).toISOString() : nowIso,
    updatedAt: Number.isFinite(updatedAtRaw) ? new Date(updatedAtRaw).toISOString() : nowIso,
    lastPasswordResetAt: Number.isFinite(resetAtRaw)
      ? new Date(resetAtRaw).toISOString()
      : passwordMigratedToHash
        ? nowIso
        : null,
  };
}

function parseAuthUsersFromConfig() {
  const parsedUsers = [];
  const normalizeEnvUser = (rawUser) =>
    normalizeAuthUserDefinition(rawUser, {
      allowPlaintextPassword: false,
      sourceLabel: "APP_LOGIN_USERS_JSON",
    });

  if (AUTH_USERS_JSON) {
    let parsed;
    try {
      parsed = JSON.parse(AUTH_USERS_JSON);
    } catch (error) {
      throw new Error(`APP_LOGIN_USERS_JSON inválido: ${error?.message || error}`);
    }

    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        const normalized = normalizeEnvUser({
          id: entry?.id,
          username: entry?.username,
          password: entry?.password,
          passwordHash: entry?.passwordHash ?? entry?.hash,
          role: entry?.role,
          isSuperAdmin: entry?.isSuperAdmin,
          accountType: entry?.accountType,
          allowedProjects: entry?.allowedProjects ?? entry?.projects,
          rolesByProject: entry?.rolesByProject,
          projectCode: entry?.projectCode,
          defaultProjectCode: entry?.defaultProjectCode,
          isActive: entry?.isActive,
          createdAt: entry?.createdAt,
          updatedAt: entry?.updatedAt,
          lastPasswordResetAt: entry?.lastPasswordResetAt,
        });
        if (normalized) parsedUsers.push(normalized);
      }
    } else if (parsed && typeof parsed === "object") {
      for (const [username, value] of Object.entries(parsed)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const normalized = normalizeEnvUser({
            id: value.id,
            username,
            password: value.password,
            passwordHash: value.passwordHash ?? value.hash,
            role: value.role,
            isSuperAdmin: value.isSuperAdmin,
            accountType: value.accountType,
            allowedProjects: value.allowedProjects ?? value.projects,
            rolesByProject: value.rolesByProject,
            projectCode: value.projectCode,
            defaultProjectCode: value.defaultProjectCode,
            isActive: value.isActive,
            createdAt: value.createdAt,
            updatedAt: value.updatedAt,
            lastPasswordResetAt: value.lastPasswordResetAt,
          });
          if (normalized) parsedUsers.push(normalized);
          continue;
        }

        const normalized = normalizeEnvUser({
          username,
          password: value,
          role: AUTH_ROLE_ADMIN,
          projectCode: resolveProjectCodeForUser(username),
        });
        if (normalized) parsedUsers.push(normalized);
      }
    } else {
      throw new Error("APP_LOGIN_USERS_JSON deve ser um objeto ou lista de usuários.");
    }
  }

  if (parsedUsers.length === 0 && (LEGACY_AUTH_USERNAME || LEGACY_AUTH_PASSWORD)) {
    if (IS_PRODUCTION_ENV) {
      throw new Error(
        "APP_LOGIN_USER/APP_LOGIN_PASSWORD nao sao permitidos em producao. Use APP_LOGIN_USERS_JSON com passwordHash PBKDF2."
      );
    }

    console.warn(
      "[auth] APP_LOGIN_USER/APP_LOGIN_PASSWORD sao legados e aceitos apenas fora de producao. Migre para APP_LOGIN_USERS_JSON com passwordHash."
    );

    const legacyUser = normalizeAuthUserDefinition(
      {
        username: LEGACY_AUTH_USERNAME,
        password: LEGACY_AUTH_PASSWORD,
        role: AUTH_ROLE_ADMIN,
        allowedProjects: [APP_PROJECT_CODE],
        defaultProjectCode: APP_PROJECT_CODE,
      },
      {
        allowPlaintextPassword: true,
        sourceLabel: "APP_LOGIN_PASSWORD",
      }
    );
    if (legacyUser) parsedUsers.push(legacyUser);
  }

  const deduplicated = new Map();
  for (const entry of parsedUsers) {
    const normalizedKey = normalizeLoginIdentifier(entry.username);
    if (!normalizedKey) continue;
    if (!deduplicated.has(normalizedKey)) {
      deduplicated.set(normalizedKey, entry);
    }
  }

  return ensureUniqueAuthUserIds([...deduplicated.values()]);
}

function ensureRequiredAuthUsers(users) {
  return ensureUniqueAuthUserIds(Array.isArray(users) ? users : []);
}

function shouldRejectWeakAuthTokenSecret(secret) {
  const normalized = String(secret ?? "").trim();
  if (!normalized) return true;
  if (normalized.length < 32) return true;

  const folded = normalized.toLowerCase();
  return (
    folded.includes("coloque_uma_chave") ||
    folded.includes("change_me") ||
    folded.includes("changeme") ||
    folded.includes("example") ||
    folded === "secret"
  );
}

function ensureSecureStartupConfiguration() {
  if (IS_PRODUCTION_ENV && ALLOW_INSECURE_DEV_AUTH_SECRET) {
    throw new Error(
      "ALLOW_INSECURE_DEV_AUTH_SECRET=true nao e permitido em producao. Configure AUTH_TOKEN_SECRET corretamente."
    );
  }

  if (IS_PRODUCTION_ENV && isPathInside(PROJECT_ROOT, DATA_DIR)) {
    throw new Error(
      `DATA_DIR inseguro para producao: ${DATA_DIR}. Use um diretorio de runtime fora do repositorio versionado.`
    );
  }

  if (AUTH_TOKEN_SECRET && IS_PRODUCTION_ENV && shouldRejectWeakAuthTokenSecret(AUTH_TOKEN_SECRET)) {
    throw new Error(
      "AUTH_TOKEN_SECRET fraco ou placeholder em producao. Use um segredo aleatorio com pelo menos 32 caracteres."
    );
  }
}

function ensureAuthUsersAvailable() {
  if (authUsers.length > 0) return false;

  if (IS_PRODUCTION_ENV) {
    throw new Error(
      "Nenhum usuario de login configurado. Use APP_LOGIN_USERS_JSON com passwordHash PBKDF2, auth-users.json em DATA_DIR/auth ou app_users no Supabase."
    );
  }

  const devPassword = crypto.randomBytes(12).toString("base64url");
  authUsers = [
    normalizeAuthUserDefinition({
      id: "admin",
      username: "admin",
      password: devPassword,
      role: AUTH_ROLE_ADMIN,
      allowedProjects: getKnownProjectCodes(),
      defaultProjectCode: APP_PROJECT_CODE,
      isActive: true,
    }),
  ];
  console.warn(
    `[auth] Nenhum usuario configurado. Usuario temporario gerado para dev: admin / ${devPassword}`
  );
  return true;
}

let authUsers = ensureRequiredAuthUsers(parseAuthUsersFromConfig());
const TRUST_PROXY_SETTING = parseTrustProxySetting(TRUST_PROXY_RAW);
const TRUST_PROXY_ENABLED = TRUST_PROXY_SETTING !== false;

if ((SUPABASE_URL && !SUPABASE_SERVICE_ROLE_KEY) || (!SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)) {
  console.warn(
    "[config] SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem ser definidos juntos. Usando armazenamento local."
  );
}

if (TRUST_PROXY_ENABLED && process.env.VERCEL !== "1") {
  console.warn(
    "[security] TRUST_PROXY habilitado fora da Vercel. Configure somente atras de proxy confiavel para evitar spoof de IP."
  );
}

console.info(`[config] Projeto ativo: ${APP_PROJECT_CODE}`);

ensureSecureStartupConfiguration();

if (
  authUsers.length === 0 &&
  !fs.existsSync(AUTH_USERS_STORE_FILE) &&
  !fs.existsSync(LEGACY_AUTH_USERS_STORE_FILE) &&
  !SUPABASE_ENABLED
) {
  if (IS_PRODUCTION_ENV) {
    throw new Error(
      "Nenhum usuário de login configurado. Defina APP_LOGIN_USERS_JSON ou APP_LOGIN_USER/APP_LOGIN_PASSWORD."
    );
  }

  const devPassword = crypto.randomBytes(12).toString("base64url");
  authUsers = [
    normalizeAuthUserDefinition({
      id: "admin",
      username: "admin",
      password: devPassword,
      role: AUTH_ROLE_ADMIN,
      allowedProjects: getKnownProjectCodes(),
      defaultProjectCode: APP_PROJECT_CODE,
      isActive: true,
    }),
  ];
  console.warn(
    `[auth] Nenhum usuário configurado. Usuário temporário gerado para dev: admin / ${devPassword}`
  );
}

if (!AUTH_TOKEN_SECRET) {
  if (IS_PRODUCTION_ENV || !ALLOW_INSECURE_DEV_AUTH_SECRET) {
    throw new Error(
      "AUTH_TOKEN_SECRET não definido. Configure uma string longa e aleatória. Em ambiente local, só use fallback se ALLOW_INSECURE_DEV_AUTH_SECRET=true."
    );
  }
  console.warn(
    "[auth] AUTH_TOKEN_SECRET não definido. Usando segredo temporário aleatório para a sessão local por ALLOW_INSECURE_DEV_AUTH_SECRET=true."
  );
}

const supabase = SUPABASE_ENABLED
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

const app = express();
const requestProjectContext = new AsyncLocalStorage();
let isSyncingPendingOps = false;
let pendingSyncIntervalHandle = null;
const loginRateIpMap = new Map();
const loginRateUserMap = new Map();
let loginRateGlobalRecord = {
  windowStart: Date.now(),
  count: 0,
};
const jsonStore = createJsonStore();
const authSessions = new Map();
let authSessionPersistQueue = Promise.resolve();
let authUsersPersistQueue = Promise.resolve();
const supabaseWarningCache = new Set();
const supabaseRuntimeState = {
  warningCount: 0,
  degraded: false,
  lastErrorAt: null,
  lastErrorScope: "",
  lastErrorMessage: "",
  lastSuccessAt: null,
};
const supabaseProjectEnsured = new Set();
let supabaseProjectCodeSupported = true;
const teamHiresUnlockedByProject = new Map();

app.set("trust proxy", TRUST_PROXY_SETTING);
app.use(express.json({ limit: "256kb" }));

function getAuthUserByUsername(username) {
  const normalizedLogin = normalizeLoginIdentifier(username);
  if (!normalizedLogin) return null;
  return (
    authUsers.find((item) => normalizeLoginIdentifier(item?.username) === normalizedLogin) ?? null
  );
}

function getAuthUserById(userId) {
  const normalizedId = String(userId ?? "").trim();
  if (!normalizedId) return null;
  return authUsers.find((item) => String(item?.id ?? "").trim() === normalizedId) ?? null;
}

function getAllowedProjectsFromUser(user) {
  if (user?.isSuperAdmin) {
    return listAllActiveProjectsCached();
  }
  const normalizedAllowed = normalizeProjectCodesList(user?.allowedProjects ?? user?.projects, []);
  const accountType = normalizeAccountType(user?.accountType, AUTH_ACCOUNT_TYPE_USER);
  if (accountType === AUTH_ACCOUNT_TYPE_PROJECT) {
    const defaultProjectCode = pickDefaultProjectCode(normalizedAllowed, user?.defaultProjectCode);
    return defaultProjectCode ? [defaultProjectCode] : [];
  }
  return normalizedAllowed;
}

function getEffectiveRoleForUserProject(
  user,
  projectCode,
  fallbackRole = normalizeAuthRole(user?.role, AUTH_ROLE_VIEWER)
) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, "");
  const normalizedFallback = normalizeAuthRole(fallbackRole, AUTH_ROLE_VIEWER);
  if (!normalizedProjectCode) return normalizedFallback;
  return normalizeAuthRole(user?.rolesByProject?.[normalizedProjectCode], normalizedFallback);
}

function getAllowedProjectsFromSession(session) {
  const sessionAllowed = normalizeProjectCodesList(
    session?.allowedProjects ?? session?.projects,
    []
  );
  const user = getAuthUserByUsername(session?.username);
  const userAllowed = getAllowedProjectsFromUser(user);
  if (userAllowed.length > 0) {
    if (sessionAllowed.length === 0) return userAllowed;

    const intersection = sessionAllowed.filter((projectCode) => userAllowed.includes(projectCode));
    if (intersection.length > 0) return intersection;
    return userAllowed;
  }

  if (sessionAllowed.length > 0) return sessionAllowed;

  const explicitProject = normalizeProjectCode(
    session?.activeProjectCode ?? session?.projectCode,
    ""
  );
  if (explicitProject) return [explicitProject];

  return [];
}

function isProjectAllowedForSession(session, projectCode) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, "");
  if (!normalizedProjectCode) return false;
  const user = getAuthUserByUsername(session?.username);
  if (user?.isSuperAdmin) {
    return listAllActiveProjectsCached().includes(normalizedProjectCode);
  }
  const allowedProjects = getAllowedProjectsFromSession(session);
  return allowedProjects.includes(normalizedProjectCode);
}

function getProjectCodeFromSession(session) {
  const explicitProject = normalizeProjectCode(
    session?.activeProjectCode ?? session?.projectCode,
    ""
  );
  if (explicitProject && isProjectAllowedForSession(session, explicitProject)) {
    return explicitProject;
  }
  const allowedProjects = getAllowedProjectsFromSession(session);
  if (allowedProjects.length === 1) {
    return allowedProjects[0];
  }
  return "";
}

function buildProjectAccessList(user, projectCodes = []) {
  const normalizedProjects = normalizeProjectCodesList(projectCodes, []);
  const isSuperAdmin = user?.isSuperAdmin === true;

  return normalizedProjects.map((projectCode) => {
    const role = getEffectiveRoleForUserProject(
      user,
      projectCode,
      isSuperAdmin ? AUTH_ROLE_ADMIN : user?.role
    );
    return {
      projectCode,
      role,
      permissions: getRolePermissions(role, { isSuperAdmin }),
    };
  });
}

function getAccessContextFromSession(session) {
  if (!session) return null;

  const user = getAuthUserByUsername(session?.username);
  const isSuperAdmin = user?.isSuperAdmin === true;
  const accountType = normalizeAccountType(
    user?.accountType ?? session?.accountType,
    AUTH_ACCOUNT_TYPE_USER
  );
  const allowedProjects = getAllowedProjectsFromSession(session);
  const activeProjectCode = getProjectCodeFromSession(session);
  const requiresProjectSelection = allowedProjects.length > 1 && !activeProjectCode;
  const fallbackRole = normalizeAuthRole(session?.role ?? user?.role, AUTH_ROLE_VIEWER);
  const role = activeProjectCode
    ? getEffectiveRoleForUserProject(user, activeProjectCode, fallbackRole)
    : allowedProjects.length === 1
      ? getEffectiveRoleForUserProject(user, allowedProjects[0], fallbackRole)
      : fallbackRole;
  const permissions = getRolePermissions(role, { isSuperAdmin });

  return {
    authenticated: true,
    user,
    username: String(session?.username ?? ""),
    role,
    permissions,
    isSuperAdmin,
    accountType,
    allowedProjects,
    activeProjectCode,
    requiresProjectSelection,
    projectAccess: buildProjectAccessList(user, allowedProjects),
    session: {
      ...session,
      role,
      accountType,
      allowedProjects,
      activeProjectCode,
      requiresProjectSelection,
      permissions,
    },
  };
}

function getAccessContextFromRequest(req) {
  if (req && Object.prototype.hasOwnProperty.call(req, "_authAccessContextCache")) {
    return req._authAccessContextCache;
  }

  const accessContext = getAccessContextFromSession(getAuthSessionFromRequest(req));
  if (req) {
    req._authAccessContextCache = accessContext;
  }
  return accessContext;
}

function isProjectSelectionRequired(session) {
  if (!session) return false;
  const allowedProjects = getAllowedProjectsFromSession(session);
  if (allowedProjects.length <= 1) return false;
  const activeProjectCode = getProjectCodeFromSession(session);
  return !activeProjectCode;
}

function sanitizeAuthUserForList(user) {
  if (!user) return null;
  return {
    id: String(user.id ?? ""),
    username: String(user.username ?? ""),
    role: normalizeAuthRole(user.role, AUTH_ROLE_VIEWER),
    isActive: user.isActive !== false,
    isSuperAdmin: user.isSuperAdmin === true,
    accountType: normalizeAccountType(user.accountType, AUTH_ACCOUNT_TYPE_USER),
    allowedProjects: getAllowedProjectsFromUser(user),
    rolesByProject: user.rolesByProject ?? {},
    defaultProjectCode: pickDefaultProjectCode(
      getAllowedProjectsFromUser(user),
      user.defaultProjectCode
    ),
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
    lastPasswordResetAt: user.lastPasswordResetAt ?? null,
  };
}

function serializeAuthUsers() {
  return ensureUniqueAuthUserIds(authUsers).map((user) => ({
    id: String(user.id ?? ""),
    username: String(user.username ?? ""),
    passwordHash: String(user.passwordHash ?? ""),
    role: normalizeAuthRole(user.role, AUTH_ROLE_ADMIN),
    isActive: user.isActive !== false,
    isSuperAdmin: user.isSuperAdmin === true,
    accountType: normalizeAccountType(user.accountType, AUTH_ACCOUNT_TYPE_USER),
    allowedProjects: getAllowedProjectsFromUser(user),
    rolesByProject: user.rolesByProject ?? {},
    defaultProjectCode: pickDefaultProjectCode(
      getAllowedProjectsFromUser(user),
      user.defaultProjectCode
    ),
    createdAt: user.createdAt ?? new Date().toISOString(),
    updatedAt: user.updatedAt ?? new Date().toISOString(),
    lastPasswordResetAt: user.lastPasswordResetAt ?? null,
  }));
}

function schedulePersistAuthUsers() {
  const snapshot = serializeAuthUsers();
  authUsersPersistQueue = authUsersPersistQueue
    .catch(() => {})
    .then(async () => {
      await writeJson(AUTH_USERS_STORE_FILE, snapshot);
      await persistAuthUsersToSupabase(snapshot);
    });
  return authUsersPersistQueue;
}

function setAuthUsers(nextUsers) {
  const normalizedUsers = ensureRequiredAuthUsers(
    (Array.isArray(nextUsers) ? nextUsers : [])
      .map((user) => normalizeAuthUserDefinition(user))
      .filter(Boolean)
  );
  authUsers = ensureUniqueAuthUserIds(normalizedUsers);
  registerProjectCodes(
    authUsers.flatMap((user) => normalizeProjectCodesList(user?.allowedProjects ?? user?.projects, []))
  );
}

async function loadAuthUsersFromDisk() {
  const fromDisk = await readJson(AUTH_USERS_STORE_FILE, null);
  if (Array.isArray(fromDisk) && fromDisk.length > 0) {
    setAuthUsers(fromDisk);
  } else {
    setAuthUsers(parseAuthUsersFromConfig());
  }
  await schedulePersistAuthUsers();
}

function getActiveProjectCode() {
  const scoped = requestProjectContext.getStore()?.projectCode;
  return normalizeProjectCode(scoped, APP_PROJECT_CODE);
}

function getProjectName(projectCode = getActiveProjectCode()) {
  return getProjectDefinition(projectCode).name;
}

function getProjectBrandName(projectCode = getActiveProjectCode()) {
  return getProjectDefinition(projectCode).brandName || getProjectName(projectCode);
}

function getProjectSummary(projectCode) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, "");
  if (!normalizedProjectCode) return null;
  return {
    code: normalizedProjectCode,
    name: getProjectName(normalizedProjectCode),
    brandName: getProjectBrandName(normalizedProjectCode),
  };
}

function getProjectSummaries(projectCodes) {
  return normalizeProjectCodesList(projectCodes, [])
    .map((projectCode) => getProjectSummary(projectCode))
    .filter(Boolean);
}

function isMissingSupabaseColumn(error, columnName) {
  const code = String(error?.code ?? "");
  const message = String(error?.message ?? "").toLowerCase();
  const normalizedColumn = String(columnName ?? "").toLowerCase();
  if (code === "42703") return message.includes(normalizedColumn);
  return message.includes(normalizedColumn) && message.includes("column");
}

function buildFallbackProjectCatalog(projectCodes = []) {
  return normalizeProjectCodesList(projectCodes, []).map((projectCode) => ({
    code: projectCode,
    name: getProjectName(projectCode),
    brandName: getProjectBrandName(projectCode),
    status: "ativo",
    isActive: true,
    department: "",
  }));
}

async function getProjectCatalog(projectCodes = []) {
  const normalizedCodes = normalizeProjectCodesList(projectCodes, []);
  if (normalizedCodes.length === 0) return [];

  const fallbackList = buildFallbackProjectCatalog(normalizedCodes);
  const fallbackByCode = new Map(fallbackList.map((project) => [project.code, project]));
  if (!SUPABASE_ENABLED || !supabase) {
    return fallbackList.sort((a, b) =>
      String(a.name ?? "").localeCompare(String(b.name ?? ""), "pt-BR")
    );
  }

  try {
    let includeStatus = true;
    let includeDepartment = true;
    let includeBrandName = true;
    let data = [];
    let error = null;

    while (true) {
      const fields = ["code", "name", "is_active"];
      if (includeStatus) fields.push("status");
      if (includeDepartment) fields.push("department");
      if (includeBrandName) fields.push("brand_name");

      const response = await supabase
        .from(SUPABASE_PROJECTS_TABLE)
        .select(fields.join(", "))
        .in("code", normalizedCodes)
        .order("name", { ascending: true });

      data = response?.data;
      error = response?.error;

      if (!error) break;
      if (includeStatus && isMissingSupabaseColumn(error, "status")) {
        includeStatus = false;
        continue;
      }
      if (includeDepartment && isMissingSupabaseColumn(error, "department")) {
        includeDepartment = false;
        continue;
      }
      if (includeBrandName && isMissingSupabaseColumn(error, "brand_name")) {
        includeBrandName = false;
        continue;
      }
      break;
    }

    if (error) {
      warnSupabaseOnce("projects catalog", error);
      return fallbackList.sort((a, b) =>
        String(a.name ?? "").localeCompare(String(b.name ?? ""), "pt-BR")
      );
    }

    const rowsByCode = new Map();
    for (const row of data ?? []) {
      const code = normalizeProjectCode(row?.code, "");
      if (!code || !fallbackByCode.has(code)) continue;

      const fallback = fallbackByCode.get(code);
      const department = String(row?.department ?? "").trim();
      const status = normalizeProjectStatus(
        row?.status,
        row?.is_active === false ? "inativo" : "ativo"
      );
      const name = String(row?.name ?? fallback?.name ?? code).trim() || code;
      const brandName =
        String(row?.brand_name ?? "").trim() ||
        String(fallback?.brandName ?? "").trim() ||
        name;

      rowsByCode.set(code, {
        code,
        name,
        brandName,
        status,
        isActive: status === "ativo",
        department,
      });
    }

    const merged = normalizedCodes
      .map(
        (code) =>
          rowsByCode.get(code) ?? fallbackByCode.get(code) ?? buildFallbackProjectCatalog([code])[0]
      )
      .filter(Boolean)
      .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""), "pt-BR"));

    return merged;
  } catch (error) {
    warnSupabaseOnce("projects catalog error", error);
    return fallbackList.sort((a, b) =>
      String(a.name ?? "").localeCompare(String(b.name ?? ""), "pt-BR")
    );
  }
}

function getTemplateFileForProject(projectCode = getActiveProjectCode()) {
  return getProjectDefinition(projectCode).templateFile;
}

function normalizeWorkbookSheetName(value, fallback = "") {
  const fallbackText = String(fallback ?? "").trim();
  if (typeof value === "string") {
    const text = value.trim();
    if (!text || text === "[object Object]") return fallbackText;
    return text;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    const text = String(value).trim();
    return text || fallbackText;
  }
  if (!value) {
    return fallbackText;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = normalizeWorkbookSheetName(item, "");
      if (resolved) return resolved;
    }
    return fallbackText;
  }

  if (typeof value === "object") {
    const candidateKeys = ["sheet", "name", "value", "title", "tab"];
    for (const key of candidateKeys) {
      const resolved = normalizeWorkbookSheetName(value?.[key], "");
      if (resolved) return resolved;
    }
    return fallbackText;
  }

  const text = String(value ?? "").trim();
  if (!text || text === "[object Object]") return fallbackText;
  return text;
}

function resolveTemplateSheetForTopico(topico, projectDefinition = getProjectDefinition()) {
  const explicitSheet = normalizeWorkbookSheetName(topico?.templateSheet, "");
  if (explicitSheet) return explicitSheet;

  const groupName = String(topico?.grupo ?? "").trim();
  const groupSheetMap = projectDefinition?.groupSheetMap ?? {};
  const normalizedGroupName = normalizeTopicoGroupName(groupName, groupName);
  const mappedSheet = normalizeWorkbookSheetName(
    groupSheetMap[groupName] ??
      groupSheetMap[normalizedGroupName] ??
      groupSheetMap[groupLabelPt(normalizedGroupName)] ??
      "",
    ""
  );
  if (mappedSheet) return mappedSheet;

  return normalizeWorkbookSheetName(projectDefinition?.primarySheetName, "Expenditure");
}

function markSupabaseProjectCodeAsUnsupported() {
  supabaseProjectCodeSupported = false;
}

function canUseSupabaseForProject(projectCode = getActiveProjectCode()) {
  if (!SUPABASE_ENABLED) return false;
  if (!supabaseProjectCodeSupported) {
    return shouldAllowLegacySupabaseFallback(projectCode);
  }
  return true;
}

function shouldAllowLegacySupabaseFallback(projectCode = getActiveProjectCode()) {
  return normalizeProjectCode(projectCode, APP_PROJECT_CODE) === APP_PROJECT_CODE;
}

function getTeamHiresUnlocked(projectCode = getActiveProjectCode()) {
  const normalized = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  if (!teamHiresUnlockedByProject.has(normalized)) {
    teamHiresUnlockedByProject.set(normalized, TEAM_HIRES_UNLOCKED_DEFAULT);
  }
  return Boolean(teamHiresUnlockedByProject.get(normalized));
}

function setTeamHiresUnlocked(projectCode, value) {
  const normalized = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  teamHiresUnlockedByProject.set(normalized, Boolean(value));
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }

  if (typeof value !== "string") {
    return NaN;
  }

  const cleaned = value.trim().replace(/\./g, "").replace(",", ".");
  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? numeric : NaN;
}

function slugifyId(value, fallback = "topico") {
  const text = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return text || fallback;
}

function makeUniqueId(seed, usedIds) {
  const base = slugifyId(seed);
  if (!usedIds.has(base)) return base;
  let suffix = 2;
  while (usedIds.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getAnoSemestre(dateIso) {
  const [anoText, mesText] = dateIso.split("-");
  const ano = Number(anoText);
  const mes = Number(mesText);
  const semestre = mes <= 6 ? "S1" : "S2";
  return { ano, semestre };
}

function formatDateBr(dateIso) {
  if (!isIsoDate(dateIso)) return "";
  const [ano, mes, dia] = dateIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

function getRolePermissions(roleValue, options = {}) {
  const role = normalizeAuthRole(roleValue, AUTH_ROLE_VIEWER);
  const isSuperAdmin = Boolean(options.isSuperAdmin);
  return {
    role,
    canWriteLancamentos: role === AUTH_ROLE_ADMIN || role === AUTH_ROLE_EDITOR,
    canManageConfig: role === AUTH_ROLE_ADMIN,
    canViewDiagnostics: role === AUTH_ROLE_ADMIN,
    canManageUsers: isSuperAdmin,
  };
}

function isSuperAdminSession(session) {
  const user = getAuthUserByUsername(session?.username);
  return user?.isSuperAdmin === true;
}

// --- Active projects cache (30s TTL) ---
let _activeProjectsCache = null;
let _activeProjectsCacheTs = 0;
const ACTIVE_PROJECTS_CACHE_TTL_MS = 30_000;

function listAllActiveProjectsCached() {
  const now = Date.now();
  if (_activeProjectsCache && now - _activeProjectsCacheTs < ACTIVE_PROJECTS_CACHE_TTL_MS) {
    return _activeProjectsCache;
  }
  // Synchronous fallback: use known project codes + in-memory overrides
  const known = getKnownProjectCodes();
  _activeProjectsCache = known;
  _activeProjectsCacheTs = now;
  return known;
}

async function listAllActiveProjects() {
  if (!SUPABASE_ENABLED) {
    return getKnownProjectCodes();
  }
  try {
    let { data, error } = await supabase
      .from(SUPABASE_PROJECTS_TABLE)
      .select("code, name, status, is_active")
      .order("name", { ascending: true });

    if (error && String(error?.code ?? "") === "42703") {
      const legacy = await supabase
        .from(SUPABASE_PROJECTS_TABLE)
        .select("code, name, is_active")
        .order("name", { ascending: true });
      data = legacy?.data;
      error = legacy?.error;
    }

    if (error) {
      warnSupabaseOnce("projects list", error);
      return getKnownProjectCodes();
    }

    const codes = (data ?? [])
      .filter((row) => {
        const status = normalizeProjectStatus(
          row?.status,
          row?.is_active === false ? "inativo" : "ativo"
        );
        return status === "ativo";
      })
      .map((row) => String(row.code ?? "").trim())
      .filter(Boolean);

    registerProjectCodes(codes);
    markSupabaseHealthy();
    const merged = codes.length > 0 ? [...new Set(codes)] : getKnownProjectCodes();
    _activeProjectsCache = merged;
    _activeProjectsCacheTs = Date.now();
    return merged;
  } catch (err) {
    warnSupabaseOnce("projects list error", err);
    return getKnownProjectCodes();
  }
}

function invalidateActiveProjectsCache() {
  _activeProjectsCache = null;
  _activeProjectsCacheTs = 0;
}

function normalizeRateUserKey(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return normalized || "__anonymous__";
}

function validateBoundedString(value, { fieldLabel, required = false, maxLength }) {
  const text = String(value ?? "").trim();
  if (required && !text) {
    return { ok: false, error: `${fieldLabel} e obrigatorio.` };
  }
  if (maxLength && text.length > maxLength) {
    return { ok: false, error: `${fieldLabel} excede o limite de ${maxLength} caracteres.` };
  }
  return { ok: true, value: text };
}

function truncateText(text, maxLength = PDF_TEXT_MAX_CHARS) {
  const normalized = String(text ?? "");
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1))}⬦`;
}

function hasSpreadsheetFormulaPrefix(value) {
  return /^[\s\t]*[=+\-@]/.test(String(value ?? ""));
}

function sanitizeCsvCell(value) {
  const text = String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  if (/^[\s\t]*[=+\-@]/.test(text)) {
    return `'${text}`;
  }
  return text;
}

function csvEscape(value) {
  const text = sanitizeCsvCell(value);
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function isSupabaseSchemaError(error) {
  const code = String(error?.code ?? "");
  const message = String(error?.message ?? "").toLowerCase();
  if (code === "42P01" || code === "42703") return true;
  return (
    message.includes("does not exist") || message.includes("relation") || message.includes("column")
  );
}

function markSupabaseHealthy() {
  if (!SUPABASE_ENABLED) return;
  supabaseRuntimeState.lastSuccessAt = new Date().toISOString();
}

function getSupabaseRuntimeSummary() {
  return {
    enabled: SUPABASE_ENABLED,
    status: !SUPABASE_ENABLED ? "disabled" : supabaseRuntimeState.degraded ? "degraded" : "online",
    degraded: supabaseRuntimeState.degraded,
    warningCount: supabaseRuntimeState.warningCount,
    lastErrorAt: supabaseRuntimeState.lastErrorAt,
    lastErrorScope: supabaseRuntimeState.lastErrorScope,
    lastErrorMessage: supabaseRuntimeState.lastErrorMessage,
    lastSuccessAt: supabaseRuntimeState.lastSuccessAt,
    projectCodeSupported: supabaseProjectCodeSupported,
  };
}

function warnSupabaseOnce(scope, error) {
  const errorKey = `${scope}:${String(error?.code ?? "")}:${String(error?.message ?? error)}`;
  if (supabaseWarningCache.has(errorKey)) return;
  supabaseWarningCache.add(errorKey);
  supabaseRuntimeState.warningCount += 1;
  supabaseRuntimeState.degraded = true;
  supabaseRuntimeState.lastErrorAt = new Date().toISOString();
  supabaseRuntimeState.lastErrorScope = String(scope ?? "");
  supabaseRuntimeState.lastErrorMessage = String(error?.message ?? error ?? "");
  console.warn(`[supabase] ${scope}: ${error?.message || error}`);
}

function isMissingAccountTypeColumnError(error) {
  const message = String(error?.message ?? "").toLowerCase();
  return message.includes("account_type") && message.includes("column");
}

function authCookieBaseParts(req) {
  const parts = ["Path=/", "HttpOnly", "SameSite=Lax"];
  if (process.env.NODE_ENV === "production" || req.secure) parts.push("Secure");
  return parts;
}

function parseCookies(headerValue) {
  if (!headerValue || typeof headerValue !== "string") return {};
  return headerValue.split(";").reduce((acc, rawPart) => {
    const [rawKey, ...rest] = rawPart.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join("=") || "");
    return acc;
  }, {});
}

function getAuthSecretValue() {
  return ACTIVE_AUTH_TOKEN_SECRET;
}

function signAuthPayload(encodedPayload) {
  return crypto
    .createHmac("sha256", getAuthSecretValue())
    .update(encodedPayload)
    .digest("base64url");
}

function createAuthSessionToken(session) {
  const payload = {
    v: 2,
    u: session.username,
    sid: session.sessionId,
    exp: session.expiresAt,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signAuthPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function normalizeAuthSessionRecord(record) {
  const sessionId = String(record?.sessionId ?? record?.sid ?? "").trim();
  const username = String(record?.username ?? record?.u ?? "").trim();
  const user = getAuthUserByUsername(username);
  const role = normalizeAuthRole(record?.role ?? record?.r ?? user?.role, AUTH_ROLE_VIEWER);
  const expiresAt = Number(record?.expiresAt ?? record?.exp);
  const createdAt = Number(record?.createdAt ?? Date.now());
  const userAllowed = getAllowedProjectsFromUser(user);
  const sessionAllowed = normalizeProjectCodesList(
    [
      ...(Array.isArray(record?.allowedProjects) ? record.allowedProjects : []),
      ...(Array.isArray(record?.projects) ? record.projects : []),
      record?.projectCode,
      record?.p,
    ],
    []
  );
  let allowedProjects = sessionAllowed.length > 0 ? sessionAllowed : [APP_PROJECT_CODE];
  if (userAllowed.length > 0) {
    if (sessionAllowed.length === 0) {
      allowedProjects = userAllowed;
    } else {
      const intersection = sessionAllowed.filter((projectCode) =>
        userAllowed.includes(projectCode)
      );
      allowedProjects = intersection.length > 0 ? intersection : userAllowed;
    }
  }

  const explicitActiveProjectCode = normalizeProjectCode(
    record?.activeProjectCode ?? record?.projectCode ?? record?.p,
    ""
  );
  const activeProjectCode =
    explicitActiveProjectCode && allowedProjects.includes(explicitActiveProjectCode)
      ? explicitActiveProjectCode
      : allowedProjects.length === 1
        ? allowedProjects[0]
        : "";
  const requiresProjectSelection = allowedProjects.length > 1 && !activeProjectCode;

  if (!sessionId || !username || !Number.isFinite(expiresAt)) return null;
  return {
    sessionId,
    username,
    role,
    allowedProjects,
    activeProjectCode,
    requiresProjectSelection,
    expiresAt,
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
  };
}

function serializeAuthSessions() {
  return [...authSessions.values()].map((session) => ({
    sessionId: session.sessionId,
    username: session.username,
    role: session.role,
    allowedProjects: normalizeProjectCodesList(session.allowedProjects, []),
    activeProjectCode: normalizeProjectCode(session.activeProjectCode, ""),
    requiresProjectSelection: Boolean(session.requiresProjectSelection),
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
  }));
}

function pruneExpiredAuthSessions(now = Date.now()) {
  let changed = false;
  for (const [sessionId, session] of authSessions.entries()) {
    if (!session || !Number.isFinite(session.expiresAt) || session.expiresAt <= now) {
      authSessions.delete(sessionId);
      changed = true;
    }
  }
  return changed;
}

function enforceAuthSessionLimit() {
  if (authSessions.size <= AUTH_MAX_ACTIVE_SESSIONS) return false;

  const sessions = [...authSessions.values()].sort((a, b) => {
    if (a.expiresAt !== b.expiresAt) return a.expiresAt - b.expiresAt;
    return a.createdAt - b.createdAt;
  });

  const overflow = authSessions.size - AUTH_MAX_ACTIVE_SESSIONS;
  for (let index = 0; index < overflow; index += 1) {
    authSessions.delete(sessions[index].sessionId);
  }

  return overflow > 0;
}

function schedulePersistAuthSessions() {
  const snapshot = serializeAuthSessions();
  authSessionPersistQueue = authSessionPersistQueue
    .catch(() => {})
    .then(async () => {
      await writeJson(AUTH_SESSION_STORE_FILE, snapshot);
      if (SUPABASE_ENABLED) {
        try {
          await persistAuthSessionsToSupabase(snapshot);
        } catch (error) {
          warnSupabaseOnce("falha ao persistir sessoes", error);
        }
      }
    });
  return authSessionPersistQueue;
}

async function loadAuthSessionsFromDisk() {
  let raw = null;
  if (SUPABASE_ENABLED) {
    try {
      raw = await loadAuthSessionsFromSupabase();
    } catch (error) {
      warnSupabaseOnce("falha ao carregar sessoes", error);
      raw = null;
    }
  }

  if (!Array.isArray(raw)) {
    raw = await readJson(AUTH_SESSION_STORE_FILE, []);
  }

  authSessions.clear();

  if (Array.isArray(raw)) {
    for (const item of raw) {
      const normalized = normalizeAuthSessionRecord(item);
      if (normalized) {
        authSessions.set(normalized.sessionId, normalized);
      }
    }
  }

  const changed = pruneExpiredAuthSessions() || enforceAuthSessionLimit();
  if (changed) {
    await schedulePersistAuthSessions();
  } else if (SUPABASE_ENABLED) {
    await writeJson(AUTH_SESSION_STORE_FILE, serializeAuthSessions());
  }
}

function parseAuthSessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) return null;

  const expectedSignature = signAuthPayload(encodedPayload);
  if (!safeEqualText(expectedSignature, providedSignature)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  const username = String(payload?.u ?? "").trim();
  const sessionId = String(payload?.sid ?? "").trim();
  const expiresAt = Number(payload?.exp);
  if (!username || !sessionId || !Number.isFinite(expiresAt)) return null;

  if (expiresAt <= Date.now()) {
    if (authSessions.delete(sessionId)) {
      schedulePersistAuthSessions().catch(() => {});
    }
    return null;
  }

  const storedSession = authSessions.get(sessionId);
  if (!storedSession) return null;
  if (normalizeLoginIdentifier(storedSession.username) !== normalizeLoginIdentifier(username))
    return null;
  if (storedSession.expiresAt !== expiresAt) return null;
  if (storedSession.expiresAt <= Date.now()) return null;
  return getAccessContextFromSession(storedSession)?.session ?? null;
}

function cleanupRateMap(map, windowMs) {
  const now = Date.now();
  for (const [key, record] of map.entries()) {
    if (!record || now - record.windowStart > windowMs) {
      map.delete(key);
    }
  }
}

function cleanupGlobalRateRecord() {
  const now = Date.now();
  if (now - loginRateGlobalRecord.windowStart > LOGIN_RATE_GLOBAL_WINDOW_MS) {
    loginRateGlobalRecord = {
      windowStart: now,
      count: 0,
    };
  }
}

function registerFailureInMap(map, key, windowMs) {
  const now = Date.now();
  const current = map.get(key);
  if (!current || now - current.windowStart > windowMs) {
    map.set(key, { count: 1, windowStart: now });
  } else {
    current.count += 1;
    map.set(key, current);
  }

  if (map.size <= LOGIN_RATE_MAX_TRACKED_KEYS) return;

  const sortedKeys = [...map.entries()]
    .sort((a, b) => Number(a[1]?.windowStart ?? 0) - Number(b[1]?.windowStart ?? 0))
    .slice(0, map.size - LOGIN_RATE_MAX_TRACKED_KEYS)
    .map(([itemKey]) => itemKey);

  for (const itemKey of sortedKeys) {
    map.delete(itemKey);
  }
}

function registerGlobalLoginFailure() {
  const now = Date.now();
  if (now - loginRateGlobalRecord.windowStart > LOGIN_RATE_GLOBAL_WINDOW_MS) {
    loginRateGlobalRecord = {
      windowStart: now,
      count: 1,
    };
    return;
  }
  loginRateGlobalRecord.count += 1;
}

function getRequestIp(req) {
  return String(req.ip || req.socket?.remoteAddress || "unknown");
}

function isLoginRateLimited(req, username) {
  cleanupRateMap(loginRateIpMap, LOGIN_RATE_WINDOW_MS);
  cleanupRateMap(loginRateUserMap, LOGIN_RATE_WINDOW_MS);
  cleanupGlobalRateRecord();

  const ip = getRequestIp(req);
  const userKey = normalizeRateUserKey(username);
  const ipAttempts = Number(loginRateIpMap.get(ip)?.count ?? 0);
  const userAttempts = Number(loginRateUserMap.get(userKey)?.count ?? 0);
  const globalAttempts = Number(loginRateGlobalRecord.count ?? 0);

  return (
    ipAttempts >= LOGIN_RATE_MAX_ATTEMPTS ||
    userAttempts >= LOGIN_RATE_MAX_ATTEMPTS_PER_USER ||
    globalAttempts >= LOGIN_RATE_MAX_ATTEMPTS_GLOBAL
  );
}

function registerLoginAttempt(req, username, success) {
  const ip = getRequestIp(req);
  const userKey = normalizeRateUserKey(username);
  if (success) {
    loginRateIpMap.delete(ip);
    loginRateUserMap.delete(userKey);
    return;
  }

  registerFailureInMap(loginRateIpMap, ip, LOGIN_RATE_WINDOW_MS);
  registerFailureInMap(loginRateUserMap, userKey, LOGIN_RATE_WINDOW_MS);
  registerGlobalLoginFailure();
}

function getAuthTokenFromRequest(req) {
  const cookies = parseCookies(req.headers?.cookie);
  return cookies[AUTH_COOKIE_NAME] || "";
}

function getAuthSessionFromRequest(req) {
  if (req && Object.prototype.hasOwnProperty.call(req, "_authSessionCache")) {
    return req._authSessionCache;
  }

  const token = getAuthTokenFromRequest(req);
  const parsed = token ? parseAuthSessionToken(token) : null;

  if (req) {
    req._authSessionCache = parsed;
  }
  return parsed;
}

function isAuthenticatedRequest(req) {
  return Boolean(getAuthSessionFromRequest(req));
}

function setAuthCookie(req, res, token) {
  const maxAgeSeconds = Math.floor(AUTH_SESSION_TTL_MS / 1000);
  const parts = [...authCookieBaseParts(req), `Max-Age=${maxAgeSeconds}`];
  res.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; ${parts.join("; ")}`
  );
}

function clearAuthCookie(req, res) {
  const parts = [...authCookieBaseParts(req), "Max-Age=0"];
  res.setHeader("Set-Cookie", `${AUTH_COOKIE_NAME}=; ${parts.join("; ")}`);
}

async function createAuthSession(account) {
  pruneExpiredAuthSessions();

  const allowedCandidates = normalizeProjectCodesList(account?.allowedProjects, []);
  const accountType = normalizeAccountType(account?.accountType, AUTH_ACCOUNT_TYPE_USER);
  const userForPerms = getAuthUserByUsername(account?.username);
  const projectScopedLoginCode =
    account?.isSuperAdmin === true
      ? ""
      : getProjectScopedLoginProjectCode(account?.username, allowedCandidates);
  const preferredProjectCode = normalizeProjectCode(
    pickDefaultProjectCode(
      allowedCandidates,
      account?.defaultProjectCode || projectScopedLoginCode || account?.projectCode
    ),
    ""
  );

  let allowedProjects = projectScopedLoginCode
    ? [projectScopedLoginCode]
    : allowedCandidates.length > 0
      ? allowedCandidates
      : [APP_PROJECT_CODE];

  if (accountType === AUTH_ACCOUNT_TYPE_PROJECT && account?.isSuperAdmin !== true) {
    allowedProjects = [preferredProjectCode || allowedProjects[0] || APP_PROJECT_CODE];
  }

  const activeProjectCode = allowedProjects.length === 1 ? allowedProjects[0] : "";
  const now = Date.now();
  const effectiveRole = activeProjectCode
    ? getEffectiveRoleForUserProject(
        userForPerms,
        activeProjectCode,
        normalizeAuthRole(account?.role, AUTH_ROLE_VIEWER)
      )
    : normalizeAuthRole(account?.role, AUTH_ROLE_VIEWER);
  const session = {
    sessionId: uuidv4(),
    username: account.username,
    role: effectiveRole,
    accountType,
    allowedProjects,
    activeProjectCode,
    requiresProjectSelection: allowedProjects.length > 1 && !activeProjectCode,
    expiresAt: now + AUTH_SESSION_TTL_MS,
    createdAt: now,
  };

  authSessions.set(session.sessionId, session);
  const trimmed = enforceAuthSessionLimit();
  if (trimmed || authSessions.size > 0) {
    await schedulePersistAuthSessions();
  }

  return {
    token: createAuthSessionToken(session),
    session: {
      ...session,
      permissions: getRolePermissions(session.role, { isSuperAdmin: userForPerms?.isSuperAdmin }),
    },
  };
}

async function setActiveProjectForSession(sessionId, projectCode) {
  const normalizedSessionId = String(sessionId ?? "").trim();
  if (!normalizedSessionId) return null;

  const session = authSessions.get(normalizedSessionId);
  if (!session) return null;

  const normalizedProjectCode = normalizeProjectCode(projectCode, "");
  if (!normalizedProjectCode) return null;
  if (!isProjectAllowedForSession(session, normalizedProjectCode)) return null;

  const user = getAuthUserByUsername(session?.username);
  const effectiveRole =
    user?.isSuperAdmin === true
      ? getEffectiveRoleForUserProject(user, normalizedProjectCode, AUTH_ROLE_ADMIN)
      : getEffectiveRoleForUserProject(
          user,
          normalizedProjectCode,
          normalizeAuthRole(session?.role, AUTH_ROLE_VIEWER)
        );

  const updatedSession = {
    ...session,
    role: effectiveRole,
    activeProjectCode: normalizedProjectCode,
    requiresProjectSelection: false,
  };
  authSessions.set(normalizedSessionId, updatedSession);
  await schedulePersistAuthSessions();

  return {
    token: createAuthSessionToken(updatedSession),
    session: {
      ...updatedSession,
      permissions: getRolePermissions(updatedSession.role, { isSuperAdmin: user?.isSuperAdmin }),
    },
  };
}

function authenticateUser(username, password) {
  const normalizedLogin = normalizeLoginIdentifier(username);
  if (!normalizedLogin) return null;

  const account = authUsers.find(
    (candidate) =>
      candidate?.isActive !== false &&
      normalizeLoginIdentifier(candidate?.username) === normalizedLogin
  );
  if (!account) return null;

  const credential = String(account.passwordHash ?? account.password ?? "");
  if (!verifyPassword(password, credential)) {
    return null;
  }

  const allowedProjects = getAllowedProjectsFromUser(account);
  registerProjectCodes(allowedProjects);

  return {
    id: String(account.id ?? ""),
    username: String(account.username ?? ""),
    role: normalizeAuthRole(account.role, AUTH_ROLE_VIEWER),
    accountType: normalizeAccountType(account.accountType, AUTH_ACCOUNT_TYPE_USER),
    isSuperAdmin: account.isSuperAdmin === true,
    allowedProjects,
    defaultProjectCode: pickDefaultProjectCode(allowedProjects, account.defaultProjectCode),
  };
}

function expectedRequestOrigin(req) {
  const host = req.get("x-forwarded-host") || req.get("host");
  if (!host) return null;

  const forwardedProto = req.get("x-forwarded-proto");
  const protocol = forwardedProto ? forwardedProto.split(",")[0].trim() : req.protocol || "http";
  return `${protocol}://${host}`;
}

function isTrustedRequestOrigin(req) {
  const candidate = req.get("origin") || req.get("referer");
  const hasSessionCookie = Boolean(getAuthTokenFromRequest(req));
  if (!candidate) return !hasSessionCookie;

  const expectedOrigin = expectedRequestOrigin(req);
  if (!expectedOrigin) return false;

  try {
    return new URL(candidate).origin === expectedOrigin;
  } catch {
    return false;
  }
}

async function removeAuthSessionByRequest(req) {
  const session = getAuthSessionFromRequest(req);
  if (!session?.sessionId) return false;

  const removed = authSessions.delete(session.sessionId);
  req._authSessionCache = null;
  req._authAccessContextCache = null;
  if (removed) {
    await schedulePersistAuthSessions();
  }
  return removed;
}

async function synchronizeAuthSessionsForUser(username, { revoke = false } = {}) {
  const normalizedLogin = normalizeLoginIdentifier(username);
  if (!normalizedLogin) return 0;

  const user = getAuthUserByUsername(username);
  let updatedCount = 0;
  let changed = false;

  for (const [sessionId, session] of authSessions.entries()) {
    if (normalizeLoginIdentifier(session?.username) !== normalizedLogin) continue;

    if (revoke || !user || user.isActive === false) {
      authSessions.delete(sessionId);
      updatedCount += 1;
      changed = true;
      continue;
    }

    const allowedProjects = getAllowedProjectsFromUser(user);
    const currentActive = normalizeProjectCode(session?.activeProjectCode, "");
    const nextActiveProjectCode =
      currentActive && allowedProjects.includes(currentActive)
        ? currentActive
        : allowedProjects.length === 1
          ? allowedProjects[0]
          : "";
    const nextRole = nextActiveProjectCode
      ? getEffectiveRoleForUserProject(user, nextActiveProjectCode, user?.role)
      : allowedProjects.length === 1
        ? getEffectiveRoleForUserProject(user, allowedProjects[0], user?.role)
        : normalizeAuthRole(user.role, AUTH_ROLE_VIEWER);
    const requiresProjectSelection = allowedProjects.length > 1 && !nextActiveProjectCode;
    const allowedUnchanged =
      normalizeProjectCodesList(session?.allowedProjects, []).join(",") ===
      allowedProjects.join(",");

    if (
      allowedUnchanged &&
      session.role === nextRole &&
      normalizeProjectCode(session?.activeProjectCode, "") === nextActiveProjectCode &&
      Boolean(session?.requiresProjectSelection) === requiresProjectSelection
    ) {
      continue;
    }

    authSessions.set(sessionId, {
      ...session,
      role: nextRole,
      allowedProjects,
      activeProjectCode: nextActiveProjectCode,
      requiresProjectSelection,
    });
    updatedCount += 1;
    changed = true;
  }

  if (changed) {
    await schedulePersistAuthSessions();
  }

  return updatedCount;
}

function requireActiveProjectSelection(req, res, next) {
  const session = getAuthSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Nao autenticado. Faca login para continuar." });
    return;
  }

  const allowedProjects = getAllowedProjectsFromSession(session);
  if (allowedProjects.length === 0) {
    res.status(403).json({ error: "Usuario sem acesso a projetos ativos." });
    return;
  }

  const activeProjectCode = getProjectCodeFromSession(session);
  if (!activeProjectCode || isProjectSelectionRequired(session)) {
    res.status(409).json({
      code: "PROJECT_SELECTION_REQUIRED",
      error: "Selecione um projeto para continuar.",
      allowedProjects: getProjectSummaries(allowedProjects),
    });
    return;
  }

  next();
}

function requireAnyRole(allowedRoles) {
  const allowed = new Set(allowedRoles.map((role) => normalizeAuthRole(role, AUTH_ROLE_VIEWER)));

  return (req, res, next) => {
    const accessContext = getAccessContextFromRequest(req);
    if (!accessContext?.authenticated) {
      res.status(401).json({ error: "Nao autenticado. Faca login para continuar." });
      return;
    }
    if (!allowed.has(accessContext.role)) {
      res.status(403).json({ error: "Sem permissão para executar esta operação." });
      return;
    }
    next();
  };
}

function groupLabelPt(name) {
  const normalized = normalizeTopicoGroupName(name, "SEM GRUPO");
  return GROUP_LABELS_PT[normalized] || normalized;
}

function normalizeTextFold(value) {
  return String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const GROUP_KEY_BY_FOLDED = new Map(
  Object.entries(GROUP_LABELS_PT).flatMap(([key, label]) => {
    const keyFolded = normalizeTextFold(key);
    const labelFolded = normalizeTextFold(label);
    return [
      [keyFolded, key],
      [labelFolded, key],
    ];
  })
);

function normalizeTopicoGroupName(groupName, fallback = "COMMUNICATIONS & PUBLICATIONS") {
  const text = String(groupName ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (!text) return fallback;
  return GROUP_KEY_BY_FOLDED.get(normalizeTextFold(text)) || text;
}

function isTeamHiresGroupName(groupName) {
  return normalizeTopicoGroupName(groupName, "") === "TEAM HIRES";
}

function topicLabelPt(name) {
  return TOPIC_LABELS_PT[name] || name;
}

function canLancarNoTopico(topico) {
  if (!topico) return false;
  if (topico.permitirLancamento) return true;
  return getTeamHiresUnlocked() && isTeamHiresGroupName(topico.grupo);
}

function topicoPublico(topico) {
  return {
    ...topico,
    permitirLancamentoEfetivo: canLancarNoTopico(topico),
  };
}

function topicoFromSupabase(row) {
  if (!row) return null;
  const id = String(row.id ?? "").trim();
  if (!id) return null;
  const orcamento = toNumber(row.orcamento_programa_brl);
  return {
    id,
    nome: String(row.nome ?? "").trim(),
    grupo: normalizeTopicoGroupName(row.grupo, "COMMUNICATIONS & PUBLICATIONS"),
    templateRow: Number.isFinite(Number(row.template_row)) ? Number(row.template_row) : null,
    incluirNoResumo: row.incluir_no_resumo !== false,
    permitirLancamento: row.permitir_lancamento !== false,
    ordem: Number.isFinite(Number(row.ordem)) ? Number(row.ordem) : 0,
    orcamentoProgramaBRL: Number.isFinite(orcamento)
      ? round2(orcamento)
      : Number(TOPICO_ORCAMENTO_BRL_PADRAO[id] ?? 0),
  };
}

function topicoToSupabase(topico, projectCode = getActiveProjectCode()) {
  return {
    project_code: normalizeProjectCode(projectCode, APP_PROJECT_CODE),
    id: String(topico.id ?? "").trim(),
    nome: String(topico.nome ?? "").trim(),
    grupo: normalizeTopicoGroupName(topico.grupo, "COMMUNICATIONS & PUBLICATIONS"),
    template_row: Number.isFinite(Number(topico.templateRow)) ? Number(topico.templateRow) : null,
    incluir_no_resumo: Boolean(topico.incluirNoResumo),
    permitir_lancamento: Boolean(topico.permitirLancamento),
    ordem: Number.isFinite(Number(topico.ordem)) ? Number(topico.ordem) : 0,
    orcamento_programa_brl: round2(Number(topico.orcamentoProgramaBRL ?? 0)),
    updated_at: new Date().toISOString(),
  };
}

function authSessionFromSupabase(row) {
  if (!row) return null;
  return normalizeAuthSessionRecord({
    activeProjectCode: row.active_project_code ?? row.project_code,
    allowedProjects: row.allowed_projects,
    requiresProjectSelection: row.requires_project_selection,
    projectCode: row.project_code,
    sessionId: row.session_id,
    username: row.username,
    role: row.role,
    expiresAt: Date.parse(String(row.expires_at ?? "")),
    createdAt: Date.parse(String(row.created_at ?? "")),
  });
}

function authSessionToSupabase(session) {
  const allowedCandidates = normalizeProjectCodesList(session.allowedProjects, []);
  const allowedProjects = allowedCandidates.length > 0 ? allowedCandidates : [APP_PROJECT_CODE];
  const activeProjectCode = normalizeProjectCode(session.activeProjectCode, "");
  return {
    project_code: activeProjectCode || allowedProjects[0] || APP_PROJECT_CODE,
    session_id: String(session.sessionId),
    username: String(session.username),
    role: normalizeAuthRole(session.role, AUTH_ROLE_VIEWER),
    allowed_projects: allowedProjects,
    active_project_code: activeProjectCode || null,
    requires_project_selection: Boolean(session.requiresProjectSelection),
    expires_at: new Date(Number(session.expiresAt)).toISOString(),
    created_at: new Date(Number(session.createdAt)).toISOString(),
  };
}

function appConfigFromSupabase(row) {
  if (!row) return null;
  return {
    teamHiresUnlocked: Boolean(row.team_hires_unlocked),
  };
}

function appConfigToSupabase(projectCode = getActiveProjectCode()) {
  return {
    project_code: normalizeProjectCode(projectCode, APP_PROJECT_CODE),
    team_hires_unlocked: Boolean(getTeamHiresUnlocked(projectCode)),
    updated_at: new Date().toISOString(),
  };
}

function lancamentoFromSupabase(row) {
  if (!row) return null;
  const valor = toNumber(row.valor);
  const ano = Number(row.ano);
  const fallbackDate = String(row.data ?? "");
  const fallback = isIsoDate(fallbackDate)
    ? getAnoSemestre(fallbackDate)
    : { ano: 0, semestre: "S1" };

  return {
    id: String(row.id),
    topicoId: String(row.topico_id ?? ""),
    data: fallbackDate,
    descricao: String(row.descricao ?? ""),
    fornecedor: String(row.fornecedor ?? ""),
    responsavel: String(row.responsavel ?? ""),
    valor: Number.isFinite(valor) ? round2(valor) : 0,
    semestre: row.semestre === "S1" || row.semestre === "S2" ? row.semestre : fallback.semestre,
    ano: Number.isFinite(ano) ? ano : fallback.ano,
    criadoEm: row.criado_em ? new Date(row.criado_em).toISOString() : null,
    atualizadoEm: row.atualizado_em ? new Date(row.atualizado_em).toISOString() : null,
  };
}

function lancamentoToSupabase(lancamento, projectCode = getActiveProjectCode()) {
  return {
    id: lancamento.id,
    project_code: normalizeProjectCode(projectCode, APP_PROJECT_CODE),
    topico_id: lancamento.topicoId,
    data: lancamento.data,
    descricao: lancamento.descricao,
    fornecedor: lancamento.fornecedor ?? "",
    responsavel: lancamento.responsavel ?? "",
    valor: round2(lancamento.valor),
    semestre: lancamento.semestre,
    ano: lancamento.ano,
    criado_em: lancamento.criadoEm ?? new Date().toISOString(),
    atualizado_em: lancamento.atualizadoEm ?? new Date().toISOString(),
  };
}

async function ensureSupabaseProjectRow(projectCode = getActiveProjectCode()) {
  if (!SUPABASE_ENABLED) return;
  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  if (supabaseProjectEnsured.has(normalizedProjectCode)) return;

  try {
    const payload = {
      code: normalizedProjectCode,
      name: getProjectName(normalizedProjectCode),
      is_active: true,
    };
    const { error } = await supabase
      .from(SUPABASE_PROJECTS_TABLE)
      .upsert(payload, { onConflict: "code" });
    if (error) {
      if (isSupabaseSchemaError(error)) {
        warnSupabaseOnce("projects table indisponivel", error);
        return;
      }
      throw new Error(error.message);
    }
    supabaseProjectEnsured.add(normalizedProjectCode);
  } catch (error) {
    warnSupabaseOnce("falha ao registrar projeto", error);
  }
}

async function persistTopicosToSupabase(topicos, projectCode = getActiveProjectCode()) {
  if (!canUseSupabaseForProject(projectCode)) return true;
  if (!Array.isArray(topicos)) return false;

  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  await ensureSupabaseProjectRow(normalizedProjectCode);

  const payload = topicos
    .map((topico) => topicoToSupabase(topico, normalizedProjectCode))
    .filter((item) => item.id);
  const { data: existingRows, error: existingError } = await supabase
    .from(SUPABASE_TOPICOS_TABLE)
    .select("id")
    .eq("project_code", normalizedProjectCode);

  if (existingError) {
    if (isSupabaseSchemaError(existingError)) {
      markSupabaseProjectCodeAsUnsupported();
      if (!shouldAllowLegacySupabaseFallback(normalizedProjectCode)) {
        return true;
      }
      warnSupabaseOnce("topicos table indisponivel", existingError);
      return false;
    }
    throw new Error(existingError.message);
  }

  if (payload.length > 0) {
    const { error } = await supabase
      .from(SUPABASE_TOPICOS_TABLE)
      .upsert(payload, { onConflict: "project_code,id" });

    if (error) {
      if (isSupabaseSchemaError(error)) {
        markSupabaseProjectCodeAsUnsupported();
        if (!shouldAllowLegacySupabaseFallback(normalizedProjectCode)) {
          return true;
        }
        warnSupabaseOnce("topicos table indisponivel", error);
        return false;
      }
      throw new Error(error.message);
    }
  }

  const existingIds = new Set(
    (existingRows ?? []).map((row) => String(row.id ?? "").trim()).filter(Boolean)
  );
  const desiredIds = new Set(payload.map((row) => String(row.id)));
  const idsToDelete = [...existingIds].filter((id) => !desiredIds.has(id));

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from(SUPABASE_TOPICOS_TABLE)
      .delete()
      .eq("project_code", normalizedProjectCode)
      .in("id", idsToDelete);

    if (deleteError) {
      if (isSupabaseSchemaError(deleteError)) {
        markSupabaseProjectCodeAsUnsupported();
        if (!shouldAllowLegacySupabaseFallback(normalizedProjectCode)) {
          return true;
        }
        warnSupabaseOnce("topicos table indisponivel", deleteError);
        return false;
      }
      throw new Error(deleteError.message);
    }
  }

  return true;
}

async function loadTopicosFromSupabase(projectCode = getActiveProjectCode()) {
  if (!canUseSupabaseForProject(projectCode)) return null;

  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  await ensureSupabaseProjectRow(normalizedProjectCode);

  const { data, error } = await supabase
    .from(SUPABASE_TOPICOS_TABLE)
    .select("*")
    .eq("project_code", normalizedProjectCode)
    .order("ordem", { ascending: true });

  if (error) {
    if (isSupabaseSchemaError(error)) {
      markSupabaseProjectCodeAsUnsupported();
      if (!shouldAllowLegacySupabaseFallback(normalizedProjectCode)) {
        return [];
      }
      warnSupabaseOnce("topicos table indisponivel", error);
      return null;
    }
    throw new Error(error.message);
  }

  return (data ?? []).map(topicoFromSupabase).filter(Boolean);
}

async function loadAppConfigFromSupabase(projectCode = getActiveProjectCode()) {
  if (!canUseSupabaseForProject(projectCode)) return null;

  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  await ensureSupabaseProjectRow(normalizedProjectCode);

  const { data, error } = await supabase
    .from(SUPABASE_APP_CONFIG_TABLE)
    .select("project_code, team_hires_unlocked")
    .eq("project_code", normalizedProjectCode)
    .maybeSingle();

  if (error) {
    if (isSupabaseSchemaError(error)) {
      markSupabaseProjectCodeAsUnsupported();
      if (!shouldAllowLegacySupabaseFallback(normalizedProjectCode)) {
        return null;
      }
      warnSupabaseOnce("app_config table indisponivel", error);
      return null;
    }
    throw new Error(error.message);
  }

  return appConfigFromSupabase(data);
}

async function persistAppConfigToSupabase(projectCode = getActiveProjectCode()) {
  if (!canUseSupabaseForProject(projectCode)) return true;

  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  await ensureSupabaseProjectRow(normalizedProjectCode);

  const { error } = await supabase
    .from(SUPABASE_APP_CONFIG_TABLE)
    .upsert(appConfigToSupabase(normalizedProjectCode), { onConflict: "project_code" });

  if (error) {
    if (isSupabaseSchemaError(error)) {
      markSupabaseProjectCodeAsUnsupported();
      if (!shouldAllowLegacySupabaseFallback(normalizedProjectCode)) {
        return true;
      }
      warnSupabaseOnce("app_config table indisponivel", error);
      return false;
    }
    throw new Error(error.message);
  }

  return true;
}

async function loadAuthUsersFromSupabase() {
  if (!SUPABASE_ENABLED) return null;
  try {
    let { data: usersData, error: usersError } = await supabase
      .from(SUPABASE_APP_USERS_TABLE)
      .select(
        "id, username, password_hash, role, is_active, is_super_admin, account_type, default_project_code, created_at, updated_at, last_password_reset_at"
      );

    if (usersError && isMissingAccountTypeColumnError(usersError)) {
      const legacy = await supabase
        .from(SUPABASE_APP_USERS_TABLE)
        .select(
          "id, username, password_hash, role, is_active, is_super_admin, default_project_code, created_at, updated_at, last_password_reset_at"
        );
      usersData = legacy?.data;
      usersError = legacy?.error;
    }

    if (usersError) {
      if (isSupabaseSchemaError(usersError)) {
        warnSupabaseOnce("app_users table indisponivel", usersError);
        return null;
      }
      throw new Error(usersError.message);
    }
    if (!Array.isArray(usersData) || usersData.length === 0) return null;

    const { data: membershipsData } = await supabase
      .from(SUPABASE_PROJECT_MEMBERSHIPS_TABLE)
      .select("user_id, project_code, role");
    const memberships = Array.isArray(membershipsData) ? membershipsData : [];
    const membershipsByUser = new Map();
    for (const m of memberships) {
      const uid = String(m.user_id ?? "");
      if (!membershipsByUser.has(uid)) membershipsByUser.set(uid, {});
      const code = normalizeProjectCode(m.project_code, "");
      if (code) membershipsByUser.get(uid)[code] = normalizeAuthRole(m.role, AUTH_ROLE_VIEWER);
    }

    markSupabaseHealthy();
    return usersData.map((row) => {
      const uid = String(row.id ?? "");
      const rolesByProject = membershipsByUser.get(uid) ?? {};
      const allowedProjects = Object.keys(rolesByProject);
      return {
        id: uid,
        username: String(row.username ?? ""),
        passwordHash: String(row.password_hash ?? ""),
        role: normalizeAuthRole(row.role, AUTH_ROLE_VIEWER),
        isActive: row.is_active !== false,
        isSuperAdmin: row.is_super_admin === true,
        accountType: normalizeAccountType(row.account_type, AUTH_ACCOUNT_TYPE_USER),
        allowedProjects: allowedProjects.length > 0 ? allowedProjects : [APP_PROJECT_CODE],
        rolesByProject,
        defaultProjectCode: String(row.default_project_code ?? ""),
        createdAt: row.created_at ?? null,
        updatedAt: row.updated_at ?? null,
        lastPasswordResetAt: row.last_password_reset_at ?? null,
      };
    });
  } catch (err) {
    warnSupabaseOnce("loadAuthUsersFromSupabase error", err);
    return null;
  }
}

async function persistAuthUsersToSupabase(snapshot) {
  if (!SUPABASE_ENABLED) return false;
  if (!Array.isArray(snapshot)) return true;
  try {
    const referencedProjectCodes = new Set();
    for (const user of snapshot) {
      for (const projectCode of normalizeProjectCodesList(user?.allowedProjects ?? user?.projects, [])) {
        referencedProjectCodes.add(projectCode);
      }
      for (const projectCode of Object.keys(user?.rolesByProject ?? {})) {
        const normalizedProjectCode = normalizeProjectCode(projectCode, "");
        if (normalizedProjectCode) referencedProjectCodes.add(normalizedProjectCode);
      }
      const defaultProjectCode = normalizeProjectCode(user?.defaultProjectCode, "");
      if (defaultProjectCode) referencedProjectCodes.add(defaultProjectCode);
    }
    for (const projectCode of referencedProjectCodes) {
      await ensureSupabaseProjectRow(projectCode);
    }

    const usersPayload = snapshot.map((u) => ({
      id: String(u.id ?? ""),
      username: String(u.username ?? ""),
      password_hash: String(u.passwordHash ?? ""),
      role: normalizeAuthRole(u.role, AUTH_ROLE_VIEWER),
      is_active: u.isActive !== false,
      is_super_admin: u.isSuperAdmin === true,
      account_type: normalizeAccountType(u.accountType, AUTH_ACCOUNT_TYPE_USER),
      default_project_code: String(u.defaultProjectCode ?? "") || null,
      updated_at: new Date().toISOString(),
    }));

    let { error: upsertError } = await supabase
      .from(SUPABASE_APP_USERS_TABLE)
      .upsert(usersPayload, { onConflict: "id" });

    if (upsertError && isMissingAccountTypeColumnError(upsertError)) {
      const legacyUsersPayload = usersPayload.map((row) => {
        const legacy = { ...row };
        delete legacy.account_type;
        return legacy;
      });
      const legacy = await supabase
        .from(SUPABASE_APP_USERS_TABLE)
        .upsert(legacyUsersPayload, { onConflict: "id" });
      upsertError = legacy?.error ?? null;
    }

    if (upsertError) {
      if (isSupabaseSchemaError(upsertError)) {
        warnSupabaseOnce("app_users upsert indisponivel", upsertError);
        return false;
      }
      throw new Error(upsertError.message);
    }

    // Persist memberships: delete all then insert
    const allUserIds = snapshot.map((u) => String(u.id ?? "")).filter(Boolean);
    if (allUserIds.length > 0) {
      await supabase.from(SUPABASE_PROJECT_MEMBERSHIPS_TABLE).delete().in("user_id", allUserIds);
    }
    const membershipsPayload = [];
    for (const u of snapshot) {
      const rbp = u.rolesByProject ?? {};
      for (const [code, role] of Object.entries(rbp)) {
        membershipsPayload.push({
          user_id: String(u.id ?? ""),
          project_code: code,
          role: normalizeAuthRole(role, AUTH_ROLE_VIEWER),
        });
      }
    }
    if (membershipsPayload.length > 0) {
      const { error: mError } = await supabase
        .from(SUPABASE_PROJECT_MEMBERSHIPS_TABLE)
        .insert(membershipsPayload);
      if (mError && !isSupabaseSchemaError(mError)) {
        console.warn("[admin] Falha ao persistir memberships:", mError.message);
      }
    }
    markSupabaseHealthy();
    return true;
  } catch (err) {
    warnSupabaseOnce("persistAuthUsersToSupabase error", err);
    return false;
  }
}

async function loadAuthSessionsFromSupabase() {
  if (!SUPABASE_ENABLED) return null;

  let { data, error } = await supabase
    .from(SUPABASE_AUTH_SESSIONS_TABLE)
    .select(
      "project_code, session_id, username, role, allowed_projects, active_project_code, requires_project_selection, expires_at, created_at"
    );

  if (error && isSupabaseSchemaError(error)) {
    ({ data, error } = await supabase
      .from(SUPABASE_AUTH_SESSIONS_TABLE)
      .select("project_code, session_id, username, role, expires_at, created_at"));
  }

  if (error) {
    if (isSupabaseSchemaError(error)) {
      warnSupabaseOnce("auth_sessions table indisponivel", error);
      return null;
    }
    throw new Error(error.message);
  }

  markSupabaseHealthy();
  return (data ?? []).map(authSessionFromSupabase).filter(Boolean);
}

async function persistAuthSessionsToSupabase(snapshot) {
  if (!SUPABASE_ENABLED) return false;

  if (!Array.isArray(snapshot)) return true;

  for (const projectCode of getKnownProjectCodes()) {
    await ensureSupabaseProjectRow(projectCode);
    const clearError = await supabase
      .from(SUPABASE_AUTH_SESSIONS_TABLE)
      .delete()
      .eq("project_code", projectCode);

    if (clearError.error) {
      if (isSupabaseSchemaError(clearError.error)) {
        warnSupabaseOnce("auth_sessions table indisponivel", clearError.error);
        return false;
      }
      throw new Error(clearError.error.message);
    }
  }

  const payload = snapshot.map(authSessionToSupabase);
  if (payload.length === 0) return true;

  let { error } = await supabase.from(SUPABASE_AUTH_SESSIONS_TABLE).insert(payload);
  if (error && isSupabaseSchemaError(error)) {
    const legacyPayload = payload.map((row) => {
      const legacyRow = { ...row };
      delete legacyRow.allowed_projects;
      delete legacyRow.active_project_code;
      delete legacyRow.requires_project_selection;
      return legacyRow;
    });
    ({ error } = await supabase.from(SUPABASE_AUTH_SESSIONS_TABLE).insert(legacyPayload));
  }
  if (error) {
    if (isSupabaseSchemaError(error)) {
      warnSupabaseOnce("auth_sessions table indisponivel", error);
      return false;
    }
    throw new Error(error.message);
  }

  markSupabaseHealthy();
  return true;
}

async function writeAuditLog(
  req,
  action,
  entityType,
  entityId,
  beforeData = null,
  afterData = null
) {
  if (!SUPABASE_ENABLED) return;
  const session = getAuthSessionFromRequest(req);
  const projectCode = getProjectCodeFromSession(session) || APP_PROJECT_CODE;
  const payload = {
    project_code: projectCode,
    actor_username: String(session?.username ?? "system"),
    actor_role: String(session?.role ?? "system"),
    action: String(action ?? "unknown"),
    entity_type: String(entityType ?? "unknown"),
    entity_id: String(entityId ?? ""),
    before_data: beforeData ?? null,
    after_data: afterData ?? null,
    created_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from(SUPABASE_AUDIT_LOG_TABLE).insert(payload);
    if (error) {
      if (isSupabaseSchemaError(error)) {
        warnSupabaseOnce("audit_log table indisponivel", error);
        return;
      }
      throw new Error(error.message);
    }
  } catch (error) {
    warnSupabaseOnce("falha ao gravar auditoria", error);
  }
}

async function copyBundleFileIfMissing(targetPath, sourcePath) {
  if (fs.existsSync(targetPath)) return false;
  if (!sourcePath || !fs.existsSync(sourcePath)) return false;
  if (path.resolve(targetPath) === path.resolve(sourcePath)) return false;
  await fsp.copyFile(sourcePath, targetPath);
  return true;
}

async function copyFirstAvailableFileIfMissing(targetPath, sourceCandidates = []) {
  if (fs.existsSync(targetPath)) return false;
  const sources = Array.isArray(sourceCandidates) ? sourceCandidates : [sourceCandidates];
  for (const sourcePath of sources) {
    const copied = await copyBundleFileIfMissing(targetPath, sourcePath);
    if (copied) return true;
  }
  return false;
}

async function migrateLegacyProjectStorage(projectCode) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  const paths = getProjectStoragePaths(normalizedProjectCode);
  const legacy = paths.legacy;
  if (!legacy) return;

  await fsp.mkdir(paths.dataDir, { recursive: true });

  const migrations = [
    { target: paths.topicosFile, legacy: legacy.topicosFile },
    { target: paths.lancamentosFile, legacy: legacy.lancamentosFile },
    { target: paths.pendingSyncFile, legacy: legacy.pendingSyncFile },
    { target: paths.appConfigFile, legacy: legacy.appConfigFile },
  ];

  for (const item of migrations) {
    if (fs.existsSync(item.target)) continue;
    if (!item.legacy || !fs.existsSync(item.legacy)) continue;
    if (path.resolve(item.target) === path.resolve(item.legacy)) continue;
    await fsp.copyFile(item.legacy, item.target);
  }
}

async function ensureProjectStorage(projectCode) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  const paths = getProjectStoragePaths(normalizedProjectCode);
  const seeds = paths.seeds;
  const legacy = paths.legacy;
  const templateSource = resolveProjectSeedTemplateSource(normalizedProjectCode);
  await fsp.mkdir(paths.dataDir, { recursive: true });
  await migrateLegacyProjectStorage(normalizedProjectCode);

  if (!fs.existsSync(paths.topicosFile)) {
    const copied = await copyFirstAvailableFileIfMissing(paths.topicosFile, [
      seeds?.topicosFile,
      templateSource?.projectCode !== normalizedProjectCode ? templateSource?.topicosFile : null,
      paths.topicosBundleFile,
      legacy?.topicosBundleFile,
    ]);
    if (!copied) {
      await writeJson(paths.topicosFile, []);
    }
  }

  if (!fs.existsSync(paths.lancamentosFile)) {
    const copied = await copyFirstAvailableFileIfMissing(paths.lancamentosFile, [
      paths.lancamentosBundleFile,
      legacy?.lancamentosBundleFile,
    ]);
    if (!copied) {
      await writeJson(paths.lancamentosFile, []);
    }
  }

  if (!fs.existsSync(paths.pendingSyncFile)) {
    await writeJson(paths.pendingSyncFile, []);
  }

  if (!fs.existsSync(paths.appConfigFile)) {
    const copied = await copyFirstAvailableFileIfMissing(paths.appConfigFile, [
      seeds?.appConfigFile,
      templateSource?.projectCode !== normalizedProjectCode ? templateSource?.appConfigFile : null,
      paths.appConfigBundleFile,
      legacy?.appConfigBundleFile,
    ]);
    if (!copied) {
      await writeJson(paths.appConfigFile, {
        teamHiresUnlocked: TEAM_HIRES_UNLOCKED_DEFAULT,
      });
    }
  }
}

async function bootstrapProjectRuntime(projectCode) {
  const normalizedProjectCode = registerProjectCode(projectCode);
  if (!normalizedProjectCode) return null;

  const templateSource = resolveProjectSeedTemplateSource(normalizedProjectCode);
  await ensureProjectStorage(normalizedProjectCode);
  await ensureSupabaseProjectRow(normalizedProjectCode);

  const topicos = await getTopicos(normalizedProjectCode);
  await loadTeamHiresConfig(normalizedProjectCode);
  await saveTeamHiresConfig(normalizedProjectCode);
  triggerPendingSync(normalizedProjectCode);

  return {
    projectCode: normalizedProjectCode,
    topicosCount: Array.isArray(topicos) ? topicos.length : 0,
    templateSourceProjectCode: templateSource?.projectCode ?? normalizedProjectCode,
    teamHiresUnlocked: getTeamHiresUnlocked(normalizedProjectCode),
  };
}

async function migrateLegacyAuthStorage() {
  await fsp.mkdir(AUTH_DATA_DIR, { recursive: true });

  const migrations = [
    { target: AUTH_SESSION_STORE_FILE, legacy: LEGACY_AUTH_SESSION_STORE_FILE },
    { target: AUTH_USERS_STORE_FILE, legacy: LEGACY_AUTH_USERS_STORE_FILE },
  ];

  for (const item of migrations) {
    if (fs.existsSync(item.target)) continue;
    if (!item.legacy || !fs.existsSync(item.legacy)) continue;
    if (path.resolve(item.target) === path.resolve(item.legacy)) continue;
    await fsp.copyFile(item.legacy, item.target);
  }
}

async function ensureStorage() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await migrateLegacyAuthStorage();
  await fsp.mkdir(AUTH_DATA_DIR, { recursive: true });

  if (!fs.existsSync(AUTH_SESSION_STORE_FILE)) {
    await writeJson(AUTH_SESSION_STORE_FILE, []);
  }
  if (!fs.existsSync(AUTH_USERS_STORE_FILE)) {
    await writeJson(AUTH_USERS_STORE_FILE, []);
  }

  // Load from disk first
  await loadAuthUsersFromDisk();
  const diskUsers = [...authUsers];

  // Then load from Supabase and merge (newest updatedAt wins per user id)
  const supabaseUsers = await loadAuthUsersFromSupabase();
  if (Array.isArray(supabaseUsers) && supabaseUsers.length > 0) {
    const merged = new Map();
    for (const u of diskUsers) merged.set(u.id, u);
    for (const u of supabaseUsers) {
      const existing = merged.get(u.id);
      if (!existing) {
        merged.set(u.id, u);
      } else {
        const existingTs = Date.parse(existing.updatedAt) || 0;
        const incomingTs = Date.parse(u.updatedAt) || 0;
        if (incomingTs > existingTs) merged.set(u.id, u);
      }
    }
    const mergedList = [...merged.values()];
    setAuthUsers(mergedList);
    await writeJson(AUTH_USERS_STORE_FILE, serializeAuthUsers());
    await persistAuthUsersToSupabase(serializeAuthUsers());
    console.info(`[auth] ${mergedList.length} usuarios (merge disco+Supabase).`);
  }

  if (ensureAuthUsersAvailable()) {
    await schedulePersistAuthUsers();
  }

  // Refresh active projects cache from DB
  await listAllActiveProjects();

  const knownProjectCodes = getKnownProjectCodes();
  for (const projectCode of knownProjectCodes) {
    await ensureProjectStorage(projectCode);
    await ensureSupabaseProjectRow(projectCode);
    await loadTeamHiresConfig(projectCode);
  }

  await loadAuthSessionsFromDisk();
}

async function readJson(filePath, fallbackValue) {
  return jsonStore.read(filePath, fallbackValue);
}

async function writeJson(filePath, value) {
  await jsonStore.write(filePath, value);
}

async function readLocalLancamentos(projectCode = getActiveProjectCode()) {
  const paths = getProjectStoragePaths(projectCode);
  const lancamentos = await readJson(paths.lancamentosFile, []);
  return Array.isArray(lancamentos) ? lancamentos : [];
}

async function writeLocalLancamentos(lancamentos, projectCode = getActiveProjectCode()) {
  const paths = getProjectStoragePaths(projectCode);
  await writeJson(paths.lancamentosFile, Array.isArray(lancamentos) ? lancamentos : []);
}

async function readPendingSyncQueue(projectCode = getActiveProjectCode()) {
  const paths = getProjectStoragePaths(projectCode);
  const queue = await readJson(paths.pendingSyncFile, []);
  return Array.isArray(queue) ? queue : [];
}

async function writePendingSyncQueue(queue, projectCode = getActiveProjectCode()) {
  const paths = getProjectStoragePaths(projectCode);
  await writeJson(paths.pendingSyncFile, Array.isArray(queue) ? queue : []);
}

async function enqueuePendingSyncOperation(
  type,
  lancamentoId,
  payload = null,
  errorMessage = "",
  projectCode = getActiveProjectCode()
) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  if (!canUseSupabaseForProject(normalizedProjectCode)) return;

  const queue = await readPendingSyncQueue(normalizedProjectCode);
  queue.push({
    id: uuidv4(),
    projectCode: normalizedProjectCode,
    type,
    lancamentoId,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    lastError: errorMessage ? String(errorMessage) : "",
  });
  await writePendingSyncQueue(queue, normalizedProjectCode);
  console.warn(
    `[sync] Operacao pendente registrada projeto=${normalizedProjectCode} type=${type} lancamentoId=${lancamentoId} pendentes=${queue.length}`
  );
}

function applyPendingQueueToLancamentos(
  baseLancamentos,
  queue,
  projectCode = getActiveProjectCode()
) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  const map = new Map((baseLancamentos ?? []).map((item) => [item.id, item]));

  for (const op of queue ?? []) {
    if (!op || !op.type) continue;
    if (op.projectCode && op.projectCode !== normalizedProjectCode) continue;
    if ((op.type === "create" || op.type === "update") && op.payload?.id) {
      map.set(op.payload.id, op.payload);
      continue;
    }
    if (op.type === "delete" && op.lancamentoId) {
      map.delete(op.lancamentoId);
    }
  }

  return [...map.values()].sort((a, b) => String(b.data).localeCompare(String(a.data)));
}

async function syncPendingOpsToSupabase(projectCode = APP_PROJECT_CODE) {
  if (!canUseSupabaseForProject(projectCode)) return { synced: 0, pending: 0, skipped: true };
  if (isSyncingPendingOps) return { synced: 0, pending: 0, skipped: true };

  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  isSyncingPendingOps = true;
  try {
    const queue = await readPendingSyncQueue(normalizedProjectCode);
    if (queue.length === 0) return { synced: 0, pending: 0, skipped: false };

    for (let index = 0; index < queue.length; index += 1) {
      const op = queue[index];
      try {
        if (op.type === "create" || op.type === "update") {
          if (!op.payload) {
            throw new Error("Payload ausente para operacao create/update.");
          }
          let { error } = await supabase
            .from(SUPABASE_LANCAMENTOS_TABLE)
            .upsert(lancamentoToSupabase(op.payload, normalizedProjectCode), {
              onConflict: "project_code,id",
            });
          if (error && isSupabaseSchemaError(error)) {
            markSupabaseProjectCodeAsUnsupported();
            if (!shouldAllowLegacySupabaseFallback(normalizedProjectCode)) {
              throw new Error(
                "Supabase legado sem coluna project_code. Projeto isolado mantido em arquivo local."
              );
            }
            warnSupabaseOnce("sync pendencias em modo legado", error);
            const legacyPayload = { ...lancamentoToSupabase(op.payload, normalizedProjectCode) };
            delete legacyPayload.project_code;
            ({ error } = await supabase
              .from(SUPABASE_LANCAMENTOS_TABLE)
              .upsert(legacyPayload, { onConflict: "id" }));
          }
          if (error) {
            throw new Error(error.message);
          }
        } else if (op.type === "delete") {
          let { error } = await supabase
            .from(SUPABASE_LANCAMENTOS_TABLE)
            .delete()
            .eq("id", op.lancamentoId)
            .eq("project_code", normalizedProjectCode);
          if (error && isSupabaseSchemaError(error)) {
            markSupabaseProjectCodeAsUnsupported();
            if (!shouldAllowLegacySupabaseFallback(normalizedProjectCode)) {
              throw new Error(
                "Supabase legado sem coluna project_code. Projeto isolado mantido em arquivo local."
              );
            }
            warnSupabaseOnce("sync delete pendencias em modo legado", error);
            ({ error } = await supabase
              .from(SUPABASE_LANCAMENTOS_TABLE)
              .delete()
              .eq("id", op.lancamentoId));
          }
          if (error) {
            throw new Error(error.message);
          }
        } else {
          throw new Error(`Tipo de operação inválido: ${op.type}`);
        }
      } catch (error) {
        const pendingCurrent = queue.slice(index);
        pendingCurrent[0] = {
          ...pendingCurrent[0],
          retryCount: Number(pendingCurrent[0].retryCount ?? 0) + 1,
          lastError: String(error?.message || error),
        };
        await writePendingSyncQueue(pendingCurrent, normalizedProjectCode);
        console.warn(
          `[sync] Falha ao processar pendencia projeto=${normalizedProjectCode} type=${op.type} lancamentoId=${op.lancamentoId} erro=${error?.message || error}`
        );
        return { synced: index, pending: pendingCurrent.length, skipped: false };
      }
    }

    await writePendingSyncQueue([], normalizedProjectCode);
    console.info(
      `[sync] Pendencias sincronizadas com sucesso projeto=${normalizedProjectCode}: ${queue.length}`
    );
    return { synced: queue.length, pending: 0, skipped: false };
  } finally {
    isSyncingPendingOps = false;
  }
}

function triggerPendingSync(projectCode = APP_PROJECT_CODE) {
  if (!canUseSupabaseForProject(projectCode)) return;
  syncPendingOpsToSupabase(projectCode).catch((error) => {
    console.warn(
      `[sync] Erro no sincronizador projeto=${normalizeProjectCode(projectCode, APP_PROJECT_CODE)}: ${error?.message || error}`
    );
  });
}

function ensurePendingSyncWorker() {
  if (!SUPABASE_ENABLED || pendingSyncIntervalHandle) return;
  pendingSyncIntervalHandle = setInterval(() => {
    for (const projectCode of getKnownProjectCodes()) {
      triggerPendingSync(projectCode);
    }
  }, PENDING_SYNC_INTERVAL_MS);
  pendingSyncIntervalHandle.unref?.();
}

async function loadTeamHiresConfig(projectCode = getActiveProjectCode()) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  const paths = getProjectStoragePaths(normalizedProjectCode);

  if (canUseSupabaseForProject(normalizedProjectCode)) {
    try {
      const configFromSupabase = await loadAppConfigFromSupabase(normalizedProjectCode);
      if (typeof configFromSupabase?.teamHiresUnlocked === "boolean") {
        setTeamHiresUnlocked(normalizedProjectCode, configFromSupabase.teamHiresUnlocked);
        await writeJson(paths.appConfigFile, {
          teamHiresUnlocked: getTeamHiresUnlocked(normalizedProjectCode),
        });
        return;
      }
    } catch (error) {
      warnSupabaseOnce("falha ao carregar app_config", error);
    }
  }

  const configFromFile = await readJson(paths.appConfigFile, {});
  if (typeof configFromFile?.teamHiresUnlocked === "boolean") {
    setTeamHiresUnlocked(normalizedProjectCode, configFromFile.teamHiresUnlocked);
    return;
  }
  setTeamHiresUnlocked(normalizedProjectCode, TEAM_HIRES_UNLOCKED_DEFAULT);
}

async function saveTeamHiresConfig(projectCode = getActiveProjectCode()) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  const paths = getProjectStoragePaths(normalizedProjectCode);

  if (canUseSupabaseForProject(normalizedProjectCode)) {
    const persisted = await persistAppConfigToSupabase(normalizedProjectCode);
    if (!persisted) {
      throw new Error(
        `Persistencia de configuracao no Supabase indisponivel. Configure a tabela ${SUPABASE_APP_CONFIG_TABLE}.`
      );
    }
  }
  await writeJson(paths.appConfigFile, {
    teamHiresUnlocked: getTeamHiresUnlocked(normalizedProjectCode),
  });
}

function normalizeTopicosList(topicos) {
  return [...(Array.isArray(topicos) ? topicos : [])]
    .map((topico) => ({
      ...topico,
      orcamentoProgramaBRL: Number(
        topico.orcamentoProgramaBRL ?? TOPICO_ORCAMENTO_BRL_PADRAO[topico.id] ?? 0
      ),
    }))
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
}

async function getTopicos(projectCode = getActiveProjectCode()) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  const paths = getProjectStoragePaths(normalizedProjectCode);

  if (canUseSupabaseForProject(normalizedProjectCode)) {
    try {
      const fromSupabase = await loadTopicosFromSupabase(normalizedProjectCode);
      if (Array.isArray(fromSupabase) && fromSupabase.length > 0) {
        const normalized = normalizeTopicosList(fromSupabase);
        await writeJson(paths.topicosFile, normalized);
        return normalized;
      }

      const topicosLocal = normalizeTopicosList(await readJson(paths.topicosFile, []));
      if (topicosLocal.length > 0) {
        const persisted = await persistTopicosToSupabase(topicosLocal, normalizedProjectCode);
        if (persisted) {
          return topicosLocal;
        }
      }
    } catch (error) {
      warnSupabaseOnce("falha ao carregar topicos", error);
    }
  }

  const topicos = await readJson(paths.topicosFile, []);
  return normalizeTopicosList(topicos);
}

async function persistTopicos(topicos, projectCode = getActiveProjectCode()) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  const paths = getProjectStoragePaths(normalizedProjectCode);
  const normalized = normalizeTopicosList(topicos);
  if (canUseSupabaseForProject(normalizedProjectCode)) {
    const persisted = await persistTopicosToSupabase(normalized, normalizedProjectCode);
    if (!persisted) {
      throw new Error(
        `Persistencia de topicos no Supabase indisponivel. Configure a tabela ${SUPABASE_TOPICOS_TABLE}.`
      );
    }
  }
  await writeJson(paths.topicosFile, normalized);
  return normalized;
}

async function getLancamentos(projectCode = getActiveProjectCode()) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  if (canUseSupabaseForProject(normalizedProjectCode)) {
    try {
      let { data, error } = await supabase
        .from(SUPABASE_LANCAMENTOS_TABLE)
        .select("*")
        .eq("project_code", normalizedProjectCode)
        .order("data", { ascending: false });

      if (error && isSupabaseSchemaError(error)) {
        markSupabaseProjectCodeAsUnsupported();
        if (!shouldAllowLegacySupabaseFallback(normalizedProjectCode)) {
          throw new Error(
            "Supabase legado sem coluna project_code. Projeto isolado mantido em arquivo local."
          );
        }
        warnSupabaseOnce("lancamentos sem coluna project_code (modo legado)", error);
        ({ data, error } = await supabase
          .from(SUPABASE_LANCAMENTOS_TABLE)
          .select("*")
          .order("data", { ascending: false }));
      }

      if (error) {
        throw new Error(
          `Erro ao consultar Supabase (${SUPABASE_LANCAMENTOS_TABLE}): ${error.message}`
        );
      }

      const fromSupabase = (data ?? []).map(lancamentoFromSupabase).filter(Boolean);
      const queue = await readPendingSyncQueue(normalizedProjectCode);
      const merged = applyPendingQueueToLancamentos(fromSupabase, queue, normalizedProjectCode);
      await writeLocalLancamentos(merged, normalizedProjectCode);
      triggerPendingSync(normalizedProjectCode);
      return merged;
    } catch (error) {
      console.warn(`[lancamentos] Fallback para arquivo local: ${error?.message || error}`);
    }
  }

  return readLocalLancamentos(normalizedProjectCode);
}

async function getLancamentoById(id, projectCode = getActiveProjectCode()) {
  const lancamentos = await getLancamentos(projectCode);
  return lancamentos.find((item) => item.id === id) ?? null;
}

async function insertLancamento(lancamento, projectCode = getActiveProjectCode()) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  const lancamentos = await readLocalLancamentos(normalizedProjectCode);
  lancamentos.push(lancamento);
  await writeLocalLancamentos(lancamentos, normalizedProjectCode);

  if (!canUseSupabaseForProject(normalizedProjectCode)) {
    return { item: lancamento, syncStatus: "synced" };
  }

  try {
    const payload = lancamentoToSupabase(lancamento, normalizedProjectCode);
    let { data, error } = await supabase
      .from(SUPABASE_LANCAMENTOS_TABLE)
      .insert(payload)
      .select("*")
      .single();

    if (error && isSupabaseSchemaError(error)) {
      markSupabaseProjectCodeAsUnsupported();
      if (!shouldAllowLegacySupabaseFallback(normalizedProjectCode)) {
        throw new Error(
          "Supabase legado sem coluna project_code. Projeto isolado mantido em arquivo local."
        );
      }
      warnSupabaseOnce("insert lancamento em modo legado", error);
      const legacyPayload = { ...payload };
      delete legacyPayload.project_code;
      ({ data, error } = await supabase
        .from(SUPABASE_LANCAMENTOS_TABLE)
        .insert(legacyPayload)
        .select("*")
        .single());
    }

    if (error) {
      throw new Error(error.message);
    }

    triggerPendingSync(normalizedProjectCode);
    return { item: lancamentoFromSupabase(data) ?? lancamento, syncStatus: "synced" };
  } catch (error) {
    if (!canUseSupabaseForProject(normalizedProjectCode)) {
      return { item: lancamento, syncStatus: "synced" };
    }
    await enqueuePendingSyncOperation(
      "create",
      lancamento.id,
      lancamento,
      error?.message || error,
      normalizedProjectCode
    );
    triggerPendingSync(normalizedProjectCode);
    return {
      item: lancamento,
      syncStatus: "pending",
      syncMessage:
        "Falha temporaria no banco. Lancamento salvo localmente e pendente de sincronizacao.",
    };
  }
}

async function updateLancamentoById(id, lancamento, projectCode = getActiveProjectCode()) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  const lancamentos = await readLocalLancamentos(normalizedProjectCode);
  const index = lancamentos.findIndex((item) => item.id === id);
  if (index === -1) return { item: null, syncStatus: "synced" };
  lancamentos[index] = lancamento;
  await writeLocalLancamentos(lancamentos, normalizedProjectCode);

  if (!canUseSupabaseForProject(normalizedProjectCode)) {
    return { item: lancamentos[index], syncStatus: "synced" };
  }

  try {
    const payload = lancamentoToSupabase(lancamento, normalizedProjectCode);
    let { data, error } = await supabase
      .from(SUPABASE_LANCAMENTOS_TABLE)
      .upsert(payload, { onConflict: "project_code,id" })
      .select("*")
      .maybeSingle();

    if (error && isSupabaseSchemaError(error)) {
      markSupabaseProjectCodeAsUnsupported();
      if (!shouldAllowLegacySupabaseFallback(normalizedProjectCode)) {
        throw new Error(
          "Supabase legado sem coluna project_code. Projeto isolado mantido em arquivo local."
        );
      }
      warnSupabaseOnce("upsert lancamento em modo legado", error);
      const legacyPayload = { ...payload };
      delete legacyPayload.project_code;
      ({ data, error } = await supabase
        .from(SUPABASE_LANCAMENTOS_TABLE)
        .upsert(legacyPayload, { onConflict: "id" })
        .select("*")
        .maybeSingle());
    }

    if (error) {
      throw new Error(error.message);
    }

    triggerPendingSync(normalizedProjectCode);
    return { item: data ? lancamentoFromSupabase(data) : lancamento, syncStatus: "synced" };
  } catch (error) {
    if (!canUseSupabaseForProject(normalizedProjectCode)) {
      return { item: lancamento, syncStatus: "synced" };
    }
    await enqueuePendingSyncOperation(
      "update",
      id,
      lancamento,
      error?.message || error,
      normalizedProjectCode
    );
    triggerPendingSync(normalizedProjectCode);
    return {
      item: lancamento,
      syncStatus: "pending",
      syncMessage:
        "Falha temporaria no banco. Alteracao salva localmente e pendente de sincronizacao.",
    };
  }
}

async function deleteLancamentoById(id, projectCode = getActiveProjectCode()) {
  const normalizedProjectCode = normalizeProjectCode(projectCode, APP_PROJECT_CODE);
  const lancamentos = await readLocalLancamentos(normalizedProjectCode);
  const filtered = lancamentos.filter((item) => item.id !== id);
  if (filtered.length === lancamentos.length) return { removed: false, syncStatus: "synced" };
  await writeLocalLancamentos(filtered, normalizedProjectCode);

  if (!canUseSupabaseForProject(normalizedProjectCode)) {
    return { removed: true, syncStatus: "synced" };
  }

  try {
    let { error } = await supabase
      .from(SUPABASE_LANCAMENTOS_TABLE)
      .delete()
      .eq("id", id)
      .eq("project_code", normalizedProjectCode);

    if (error && isSupabaseSchemaError(error)) {
      markSupabaseProjectCodeAsUnsupported();
      if (!shouldAllowLegacySupabaseFallback(normalizedProjectCode)) {
        throw new Error(
          "Supabase legado sem coluna project_code. Projeto isolado mantido em arquivo local."
        );
      }
      warnSupabaseOnce("delete lancamento em modo legado", error);
      ({ error } = await supabase.from(SUPABASE_LANCAMENTOS_TABLE).delete().eq("id", id));
    }

    if (error) {
      throw new Error(error.message);
    }
    triggerPendingSync(normalizedProjectCode);
    return { removed: true, syncStatus: "synced" };
  } catch (error) {
    if (!canUseSupabaseForProject(normalizedProjectCode)) {
      return { removed: true, syncStatus: "synced" };
    }
    await enqueuePendingSyncOperation(
      "delete",
      id,
      null,
      error?.message || error,
      normalizedProjectCode
    );
    triggerPendingSync(normalizedProjectCode);
    return {
      removed: true,
      syncStatus: "pending",
      syncMessage: "Falha temporaria no banco. Exclusao registrada e pendente de sincronizacao.",
    };
  }
}

function parseJsonBody(req, res) {
  if (!req.body || typeof req.body !== "object") {
    res.status(400).json({ error: "Corpo da requisição inválido." });
    return null;
  }
  return req.body;
}

function normalizeAllowedProjectsInput(value, fallback = []) {
  const knownProjects = new Set([...getKnownProjectCodes(), ...listAllActiveProjectsCached()]);
  const normalized = normalizeProjectCodesList(value, []).filter((projectCode) =>
    knownProjects.has(projectCode)
  );
  if (normalized.length > 0) {
    return [...new Set(normalized)];
  }
  const fallbackNormalized = normalizeProjectCodesList(fallback, []).filter((projectCode) =>
    knownProjects.has(projectCode)
  );
  return [...new Set(fallbackNormalized)];
}

function validateAuthUserPasswordInput(rawPassword) {
  const password = String(rawPassword ?? "");
  if (!password) {
    return { ok: false, error: "Senha obrigatoria." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Senha deve ter ao menos 8 caracteres." };
  }
  return { ok: true, value: password };
}

app.use(
  createSecurityHeadersMiddleware({
    defaultSecurityHeaders: DEFAULT_SECURITY_HEADERS,
    contentSecurityPolicy: CONTENT_SECURITY_POLICY,
    shouldEnableHsts: (req) => process.env.NODE_ENV === "production" || req.secure,
  })
);

app.use(
  createApiOriginGuardMiddleware({
    isTrustedRequestOrigin,
  })
);

app.use((req, _res, next) => {
  const session = getAuthSessionFromRequest(req);
  const projectCode = getProjectCodeFromSession(session);
  requestProjectContext.run({ projectCode }, () => {
    next();
  });
});

registerAuthRoutes(app, {
  sendLoginFile: (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
  },
  getAuthSessionFromRequest,
  getAccessContextFromSession,
  getRolePermissions,
  getAllowedProjectsFromSession,
  getProjectCodeFromSession,
  getProjectSummaries,
  isProjectSelectionRequired,
  getProjectName,
  getProjectBrandName,
  parseJsonBody,
  isLoginRateLimited,
  authenticateUser,
  registerLoginAttempt,
  createAuthSession,
  setActiveProjectForSession,
  setAuthCookie,
  writeAuditLog,
  removeAuthSessionByRequest,
  clearAuthCookie,
  isSuperAdminSession,
  getAuthUserByUsername,
  authUsers: () => authUsers,
  setAuthUsers,
  schedulePersistAuthUsers,
  synchronizeAuthSessionsForUser,
  normalizeLoginIdentifier,
  normalizeAuthUserDefinition,
  validateBoundedString,
  validateAuthUserPasswordInput,
  createPbkdf2Credential,
});

// --- requireSuperAdmin middleware ---
function requireSuperAdmin(req, res, next) {
  const accessContext = getAccessContextFromRequest(req);
  if (!accessContext?.authenticated) {
    res.status(401).json({ error: "Nao autenticado. Faca login para continuar." });
    return;
  }
  if (!accessContext.isSuperAdmin) {
    res.status(403).json({ error: "Acesso restrito a administradores globais." });
    return;
  }
  next();
}

registerAdminRoutes(app, {
  getAuthSessionFromRequest,
  getAuthUserByUsername,
  getAuthUserById,
  getAllowedProjectsFromUser,
  sanitizeAuthUserForList,
  normalizeAuthUserDefinition,
  normalizeAllowedProjectsInput,
  normalizeProjectCode,
  normalizeAuthRole,
  normalizeAccountType,
  normalizeLoginIdentifier,
  normalizeProjectCodesList,
  normalizeProjectCategoriesInput,
  pickDefaultProjectCode,
  slugifyId,
  createPbkdf2Credential,
  validateBoundedString,
  validateAuthUserPasswordInput,
  parseJsonBody,
  setAuthUsers,
  schedulePersistAuthUsers,
  synchronizeAuthSessionsForUser,
  writeAuditLog,
  requireSuperAdmin,
  registerProjectCode,
  bootstrapProjectRuntime,
  listAllActiveProjects,
  invalidateActiveProjectsCache,
  ensureSupabaseProjectRow,
  getKnownProjectCodes,
  getProjectSummaries,
  normalizeRolesByProject,
  supabase,
  SUPABASE_ENABLED,
  SUPABASE_PROJECTS_TABLE,
  SUPABASE_DEPARTMENTS_TABLE,
  APP_PROJECT_CODE,
  AUTH_ROLE_ADMIN,
  AUTH_ROLE_VIEWER,
  authUsers: () => authUsers,
});

app.use((req, res, next) => {
  const openPath =
    req.path === "/login" ||
    req.path === "/login.html" ||
    req.path === "/login.js" ||
    req.path === "/early-theme.js" ||
    req.path === "/app/api-client.js" ||
    req.path === "/encoding-guard.js" ||
    req.path === "/styles.css" ||
    req.path === "/peocon-mark.svg" ||
    req.path.startsWith("/api/auth/");

  if (openPath) {
    next();
    return;
  }

  if (isAuthenticatedRequest(req)) {
    next();
    return;
  }

  if (req.path.startsWith("/api/")) {
    res.status(401).json({ error: "Nao autenticado. Faca login para continuar." });
    return;
  }

  res.redirect("/login");
});

app.get("/hub", (req, res) => {
  const session = getAuthSessionFromRequest(req);
  if (!session) {
    res.redirect("/login");
    return;
  }
  const allowedProjects = getAllowedProjectsFromSession(session);
  if (Array.isArray(allowedProjects) && allowedProjects.length <= 1) {
    res.redirect("/");
    return;
  }
  res.sendFile(path.join(__dirname, "public", "hub.html"));
});

app.get("/hub.html", (_req, res) => {
  res.redirect("/hub");
});

app.get("/admin", (req, res) => {
  const session = getAuthSessionFromRequest(req);
  if (!session) {
    res.redirect("/login");
    return;
  }
  if (!isSuperAdminSession(session)) {
    res.redirect("/");
    return;
  }
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/admin.html", (_req, res) => {
  res.redirect("/admin");
});

registerProjectRoutes(app, {
  getAuthSessionFromRequest,
  getAccessContextFromRequest,
  getAllowedProjectsFromSession,
  getProjectCatalog,
  getProjectCodeFromSession,
  isCatalogWritable: () => Boolean(SUPABASE_ENABLED && supabase),
});

app.get("/api/admin/users", requireSuperAdmin, (_req, res) => {
  const users = authUsers
    .map((user) => sanitizeAuthUserForList(user))
    .filter(Boolean)
    .sort((a, b) => String(a.username).localeCompare(String(b.username)));

  res.json({
    users,
    projects: getProjectSummaries(getKnownProjectCodes()),
  });
});

app.post("/api/admin/users", requireSuperAdmin, async (req, res) => {
  const body = parseJsonBody(req, res);
  if (!body) return;

  const usernameValidation = validateBoundedString(body.username, {
    fieldLabel: "Username",
    required: true,
    maxLength: 120,
  });
  if (!usernameValidation.ok) {
    res.status(400).json({ error: usernameValidation.error });
    return;
  }
  const username = usernameValidation.value;
  const normalizedUsernameKey = normalizeLoginIdentifier(username);
  const alreadyExists = authUsers.some(
    (user) => normalizeLoginIdentifier(user?.username) === normalizedUsernameKey
  );
  if (alreadyExists) {
    res.status(409).json({ error: "Já existe um usuário com este username." });
    return;
  }

  const passwordValidation = validateAuthUserPasswordInput(body.password);
  if (!passwordValidation.ok) {
    res.status(400).json({ error: passwordValidation.error });
    return;
  }

  const allowedProjects = normalizeAllowedProjectsInput(body.allowedProjects ?? body.projects, [
    APP_PROJECT_CODE,
  ]);
  if (allowedProjects.length === 0) {
    res.status(400).json({ error: "Informe ao menos um projeto permitido." });
    return;
  }

  const nowIso = new Date().toISOString();
  const normalized = normalizeAuthUserDefinition({
    id: body.id ?? slugifyId(username, "user"),
    username,
    password: passwordValidation.value,
    role: normalizeAuthRole(body.role, AUTH_ROLE_VIEWER),
    isActive: body.isActive !== false,
    allowedProjects,
    defaultProjectCode: pickDefaultProjectCode(allowedProjects, body.defaultProjectCode),
    createdAt: nowIso,
    updatedAt: nowIso,
    lastPasswordResetAt: nowIso,
  });

  if (!normalized) {
    res.status(400).json({ error: "Dados de usuário inválidos." });
    return;
  }

  setAuthUsers([...authUsers, normalized]);
  await schedulePersistAuthUsers();
  const created = getAuthUserByUsername(username);
  await writeAuditLog(
    req,
    "admin.user.create",
    "auth_user",
    normalized.id,
    null,
    sanitizeAuthUserForList(created)
  );
  res.status(201).json({
    ok: true,
    user: sanitizeAuthUserForList(created),
  });
});

app.put("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
  const body = parseJsonBody(req, res);
  if (!body) return;

  const userId = String(req.params.id ?? "").trim();
  const current = getAuthUserById(userId);
  if (!current) {
    res.status(404).json({ error: "Usuario nao encontrado." });
    return;
  }

  const nextAllowedProjects =
    body.allowedProjects !== undefined || body.projects !== undefined
      ? normalizeAllowedProjectsInput(body.allowedProjects ?? body.projects, [])
      : getAllowedProjectsFromUser(current);
  if (nextAllowedProjects.length === 0) {
    res.status(400).json({ error: "Informe ao menos um projeto permitido." });
    return;
  }

  const passwordProvided = typeof body.password === "string" && body.password.length > 0;
  let nextPasswordHash = String(current.passwordHash ?? "");
  let nextPasswordResetAt = current.lastPasswordResetAt ?? null;

  if (passwordProvided) {
    const passwordValidation = validateAuthUserPasswordInput(body.password);
    if (!passwordValidation.ok) {
      res.status(400).json({ error: passwordValidation.error });
      return;
    }
    nextPasswordHash = createPbkdf2Credential(passwordValidation.value);
    nextPasswordResetAt = new Date().toISOString();
  }

  const nowIso = new Date().toISOString();
  const normalized = normalizeAuthUserDefinition({
    ...current,
    role: body.role !== undefined ? normalizeAuthRole(body.role, current.role) : current.role,
    isActive: body.isActive !== undefined ? body.isActive === true : current.isActive !== false,
    allowedProjects: nextAllowedProjects,
    defaultProjectCode: pickDefaultProjectCode(
      nextAllowedProjects,
      body.defaultProjectCode ?? current.defaultProjectCode
    ),
    passwordHash: nextPasswordHash,
    updatedAt: nowIso,
    lastPasswordResetAt: nextPasswordResetAt,
  });
  if (!normalized) {
    res.status(400).json({ error: "Dados de usuário inválidos." });
    return;
  }

  const snapshotBefore = sanitizeAuthUserForList(current);
  const updatedUsers = authUsers.map((item) => (String(item?.id) === userId ? normalized : item));
  setAuthUsers(updatedUsers);
  await schedulePersistAuthUsers();
  await synchronizeAuthSessionsForUser(normalized.username, {
    revoke: normalized.isActive === false || passwordProvided,
  });

  const updated = getAuthUserById(userId) ?? getAuthUserByUsername(normalized.username);
  await writeAuditLog(
    req,
    "admin.user.update",
    "auth_user",
    userId,
    snapshotBefore,
    sanitizeAuthUserForList(updated)
  );
  res.json({
    ok: true,
    user: sanitizeAuthUserForList(updated),
  });
});

app.use((req, res, next) => {
  const apiPath = String(req.path ?? "");
  const needsActiveProject =
    apiPath === "/api/filtros" ||
    apiPath === "/api/resumo" ||
    apiPath.startsWith("/api/topicos") ||
    apiPath.startsWith("/api/lancamentos") ||
    apiPath.startsWith("/api/export/") ||
    apiPath.startsWith("/api/config/topicos-travados");

  if (!needsActiveProject) {
    next();
    return;
  }

  requireActiveProjectSelection(req, res, next);
});

app.use(
  express.static(path.join(__dirname, "public"), {
    etag: true,
    maxAge: 0,
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-store");
        return;
      }
      if (/\.js$/i.test(filePath)) {
        // Evita stale bundle no cliente apos restart/deploy local.
        res.setHeader("Cache-Control", "no-store");
        return;
      }
      if (/\.(css|svg)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }
    },
  })
);

app.get("/api/topicos", async (_req, res) => {
  const topicos = await getTopicos();
  res.json(topicos.map(topicoPublico));
});

app.post("/api/topicos", requireAnyRole([AUTH_ROLE_ADMIN]), async (req, res) => {
  const body = parseJsonBody(req, res);
  if (!body) return;

  const topicos = await getTopicos();
  const nomeValidation = validateBoundedString(body.nome, {
    fieldLabel: "Nome do topico",
    required: true,
    maxLength: FIELD_LIMITS.topicoNome,
  });
  if (!nomeValidation.ok) {
    res.status(400).json({ error: nomeValidation.error });
    return;
  }
  const nome = nomeValidation.value;

  const grupoValidation = validateBoundedString(body.grupo ?? "COMMUNICATIONS & PUBLICATIONS", {
    fieldLabel: "Grupo",
    required: true,
    maxLength: FIELD_LIMITS.topicoGrupo,
  });
  if (!grupoValidation.ok) {
    res.status(400).json({ error: grupoValidation.error });
    return;
  }
  const grupo = normalizeTopicoGroupName(
    grupoValidation.value || "COMMUNICATIONS & PUBLICATIONS",
    "COMMUNICATIONS & PUBLICATIONS"
  );
  const orcamentoProgramaBRL = toNumber(body.orcamentoProgramaBRL);
  if (!Number.isFinite(orcamentoProgramaBRL) || orcamentoProgramaBRL < 0) {
    res.status(400).json({ error: "Orçamento inválido." });
    return;
  }

  const incluirNoResumo = body.incluirNoResumo !== undefined ? Boolean(body.incluirNoResumo) : true;
  const permitirLancamento =
    body.permitirLancamento !== undefined
      ? Boolean(body.permitirLancamento)
      : !isTeamHiresGroupName(grupo);

  const usedIds = new Set(topicos.map((item) => String(item.id)));
  const requestedId = String(body.id ?? "").trim();
  const id = requestedId ? makeUniqueId(requestedId, usedIds) : makeUniqueId(nome, usedIds);
  const maxOrdem = topicos.reduce((acc, item) => Math.max(acc, Number(item.ordem ?? 0)), 0);
  const ordem = Number.isFinite(Number(body.ordem)) ? Number(body.ordem) : maxOrdem + 1;
  const templateRow = Number.isFinite(Number(body.templateRow)) ? Number(body.templateRow) : null;

  const novoTopico = {
    id,
    nome,
    grupo,
    templateRow,
    incluirNoResumo,
    permitirLancamento,
    ordem,
    orcamentoProgramaBRL: round2(orcamentoProgramaBRL),
  };

  topicos.push(novoTopico);
  try {
    await persistTopicos(topicos);
  } catch (error) {
    res.status(503).json({ error: error?.message || "Falha ao persistir topicos." });
    return;
  }
  await writeAuditLog(req, "topico.create", "topico", novoTopico.id, null, novoTopico);
  res.status(201).json(topicoPublico(novoTopico));
});

app.put("/api/topicos/:id", requireAnyRole([AUTH_ROLE_ADMIN]), async (req, res) => {
  const body = parseJsonBody(req, res);
  if (!body) return;

  const topicos = await getTopicos();
  const index = topicos.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Tópico nao encontrado." });
    return;
  }

  const atual = topicos[index];

  const nomeValidation = validateBoundedString(body.nome !== undefined ? body.nome : atual.nome, {
    fieldLabel: "Nome do topico",
    required: true,
    maxLength: FIELD_LIMITS.topicoNome,
  });
  if (!nomeValidation.ok) {
    res.status(400).json({ error: nomeValidation.error });
    return;
  }
  const nome = nomeValidation.value;

  const grupoValidation = validateBoundedString(
    body.grupo !== undefined ? body.grupo : (atual.grupo ?? "COMMUNICATIONS & PUBLICATIONS"),
    {
      fieldLabel: "Grupo",
      required: true,
      maxLength: FIELD_LIMITS.topicoGrupo,
    }
  );
  if (!grupoValidation.ok) {
    res.status(400).json({ error: grupoValidation.error });
    return;
  }
  const grupo = normalizeTopicoGroupName(
    grupoValidation.value || "COMMUNICATIONS & PUBLICATIONS",
    "COMMUNICATIONS & PUBLICATIONS"
  );

  const orcamentoInput =
    body.orcamentoProgramaBRL !== undefined
      ? body.orcamentoProgramaBRL
      : atual.orcamentoProgramaBRL;
  const orcamentoProgramaBRL = toNumber(orcamentoInput);
  if (!Number.isFinite(orcamentoProgramaBRL) || orcamentoProgramaBRL < 0) {
    res.status(400).json({ error: "Orçamento inválido." });
    return;
  }

  const incluirNoResumo =
    body.incluirNoResumo !== undefined
      ? Boolean(body.incluirNoResumo)
      : Boolean(atual.incluirNoResumo);
  const permitirLancamento = isTeamHiresGroupName(grupo)
    ? false
    : body.permitirLancamento !== undefined
      ? Boolean(body.permitirLancamento)
      : Boolean(atual.permitirLancamento);

  const atualizado = {
    ...atual,
    nome,
    grupo,
    orcamentoProgramaBRL: round2(orcamentoProgramaBRL),
    incluirNoResumo,
    permitirLancamento,
  };
  topicos[index] = atualizado;

  try {
    await persistTopicos(topicos);
  } catch (error) {
    res.status(503).json({ error: error?.message || "Falha ao persistir topicos." });
    return;
  }
  await writeAuditLog(req, "topico.update", "topico", atualizado.id, atual, atualizado);
  res.json(topicoPublico(atualizado));
});

app.delete("/api/topicos/:id", requireAnyRole([AUTH_ROLE_ADMIN]), async (req, res) => {
  const topicId = String(req.params.id ?? "").trim();
  if (!topicId) {
    res.status(400).json({ error: "Tópico inválido." });
    return;
  }

  const [topicos, lancamentos] = await Promise.all([getTopicos(), getLancamentos()]);
  const index = topicos.findIndex((item) => item.id === topicId);
  if (index === -1) {
    res.status(404).json({ error: "Tópico nao encontrado." });
    return;
  }

  const linkedCount = lancamentos.reduce(
    (count, item) => count + (String(item?.topicoId ?? "") === topicId ? 1 : 0),
    0
  );
  if (linkedCount > 0) {
    res.status(409).json({
      error: `Não ? possível remover. Este tópico possui ${linkedCount} lançamento(s) vinculado(s).`,
    });
    return;
  }

  const removedTopic = topicos[index];
  topicos.splice(index, 1);
  try {
    await persistTopicos(topicos);
  } catch (error) {
    res.status(503).json({ error: error?.message || "Falha ao persistir topicos." });
    return;
  }

  await writeAuditLog(req, "topico.delete", "topico", topicId, removedTopic, null);
  res.json({ ok: true, removedId: topicId });
});

app.get("/api/filtros", async (_req, res) => {
  const lancamentos = await getLancamentos();
  const anoAtual = new Date().getFullYear();
  const anos = [...new Set(lancamentos.map((item) => Number(item.ano)).filter(Number.isFinite))];
  anos.push(anoAtual);
  anos.sort((a, b) => a - b);

  res.json({
    anos: [...new Set(anos)],
    anoAtual,
  });
});

app.get("/api/config/topicos-travados", (_req, res) => {
  const projectCode = getActiveProjectCode();
  res.json({
    teamHiresUnlocked: getTeamHiresUnlocked(projectCode),
  });
});

async function updateTeamHiresLock(req, res) {
  const body = parseJsonBody(req, res);
  if (!body) return;
  if (typeof body.teamHiresUnlocked !== "boolean") {
    res.status(400).json({ error: "teamHiresUnlocked deve ser booleano." });
    return;
  }

  const projectCode = getActiveProjectCode();
  const previous = getTeamHiresUnlocked(projectCode);
  setTeamHiresUnlocked(projectCode, body.teamHiresUnlocked);
  try {
    await saveTeamHiresConfig(projectCode);
  } catch (error) {
    console.error("[config] Falha ao persistir topicos-travados:", error?.message || error);
    setTeamHiresUnlocked(projectCode, previous);
    res.status(503).json({ error: "Falha ao salvar configuracao. Tente novamente." });
    return;
  }
  await writeAuditLog(
    req,
    "config.team_hires_lock.update",
    "app_config",
    projectCode,
    { teamHiresUnlocked: previous },
    { teamHiresUnlocked: getTeamHiresUnlocked(projectCode) }
  );
  res.json({
    teamHiresUnlocked: getTeamHiresUnlocked(projectCode),
  });
}

app.put("/api/config/topicos-travados", requireAnyRole([AUTH_ROLE_ADMIN]), updateTeamHiresLock);
app.post("/api/config/topicos-travados", requireAnyRole([AUTH_ROLE_ADMIN]), updateTeamHiresLock);

app.get("/api/lancamentos", async (req, res) => {
  const [topicos, lancamentos] = await Promise.all([getTopicos(), getLancamentos()]);
  const topicosMap = new Map(topicos.map((t) => [t.id, t]));
  const filters = parseFilters(req.query);

  const filtrados = filtrarLancamentos(lancamentos, filters)
    .map((item) => ({
      ...item,
      topicoNome: topicosMap.get(item.topicoId)?.nome ?? "Tópico removido",
    }))
    .sort((a, b) => b.data.localeCompare(a.data));

  res.json({
    total: filtrados.length,
    items: filtrados,
  });
});

app.post(
  "/api/lancamentos",
  requireAnyRole([AUTH_ROLE_ADMIN, AUTH_ROLE_EDITOR]),
  async (req, res) => {
    const body = parseJsonBody(req, res);
    if (!body) return;

    const topicos = await getTopicos();
    const topicoIdValidation = validateBoundedString(body.topicoId, {
      fieldLabel: "Tópico",
      required: true,
      maxLength: 80,
    });
    if (!topicoIdValidation.ok) {
      res.status(400).json({ error: topicoIdValidation.error });
      return;
    }
    const topicoId = topicoIdValidation.value;
    const topico = topicos.find((item) => item.id === topicoId);

    if (!topico || !canLancarNoTopico(topico)) {
      res.status(400).json({ error: "Tópico inválido ou bloqueado." });
      return;
    }

    if (!isIsoDate(body.data)) {
      res.status(400).json({ error: "Data invalida. Use YYYY-MM-DD." });
      return;
    }

    const descricaoValidation = validateBoundedString(body.descricao, {
      fieldLabel: "Descricao",
      required: true,
      maxLength: FIELD_LIMITS.descricao,
    });
    if (!descricaoValidation.ok) {
      res.status(400).json({ error: descricaoValidation.error });
      return;
    }
    const descricao = descricaoValidation.value;
    if (hasSpreadsheetFormulaPrefix(descricao)) {
      res.status(400).json({ error: "Descricao nao pode iniciar com formula de planilha." });
      return;
    }

    const valor = toNumber(body.valor);
    if (!Number.isFinite(valor) || valor <= 0) {
      res.status(400).json({ error: "Valor inválido." });
      return;
    }

    const fornecedorValidation = validateBoundedString(body.fornecedor ?? "", {
      fieldLabel: "Fornecedor",
      maxLength: FIELD_LIMITS.fornecedor,
    });
    if (!fornecedorValidation.ok) {
      res.status(400).json({ error: fornecedorValidation.error });
      return;
    }

    const responsavelValidation = validateBoundedString(body.responsavel ?? "", {
      fieldLabel: "Responsavel",
      maxLength: FIELD_LIMITS.responsavel,
    });
    if (!responsavelValidation.ok) {
      res.status(400).json({ error: responsavelValidation.error });
      return;
    }

    const fornecedor = fornecedorValidation.value;
    const responsavel = responsavelValidation.value;
    const { ano, semestre } = getAnoSemestre(body.data);

    const novo = {
      id: uuidv4(),
      topicoId,
      data: body.data,
      descricao,
      fornecedor,
      responsavel,
      valor: round2(valor),
      semestre,
      ano,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    const result = await insertLancamento(novo);
    await writeAuditLog(
      req,
      "lancamento.create",
      "lancamento",
      result.item?.id ?? novo.id,
      null,
      result.item ?? novo
    );
    res.status(201).json({
      ...result.item,
      syncStatus: result.syncStatus,
      syncMessage: result.syncMessage ?? null,
    });
  }
);

app.put(
  "/api/lancamentos/:id",
  requireAnyRole([AUTH_ROLE_ADMIN, AUTH_ROLE_EDITOR]),
  async (req, res) => {
    const body = parseJsonBody(req, res);
    if (!body) return;

    const [topicos, existente] = await Promise.all([
      getTopicos(),
      getLancamentoById(req.params.id),
    ]);

    if (!existente) {
      res.status(404).json({ error: "Lancamento nao encontrado." });
      return;
    }

    const topicoIdValidation = validateBoundedString(
      body.topicoId !== undefined ? body.topicoId : existente.topicoId,
      {
        fieldLabel: "Tópico",
        required: true,
        maxLength: 80,
      }
    );
    if (!topicoIdValidation.ok) {
      res.status(400).json({ error: topicoIdValidation.error });
      return;
    }
    const topicoId = topicoIdValidation.value;
    const topico = topicos.find((item) => item.id === topicoId);
    if (!topico || !canLancarNoTopico(topico)) {
      res.status(400).json({ error: "Tópico inválido ou bloqueado." });
      return;
    }

    const data = body.data ?? existente.data;
    if (!isIsoDate(data)) {
      res.status(400).json({ error: "Data invalida. Use YYYY-MM-DD." });
      return;
    }

    const descricaoValidation = validateBoundedString(
      body.descricao !== undefined ? body.descricao : existente.descricao,
      {
        fieldLabel: "Descricao",
        required: true,
        maxLength: FIELD_LIMITS.descricao,
      }
    );
    if (!descricaoValidation.ok) {
      res.status(400).json({ error: descricaoValidation.error });
      return;
    }
    const descricao = descricaoValidation.value;
    if (hasSpreadsheetFormulaPrefix(descricao)) {
      res.status(400).json({ error: "Descricao nao pode iniciar com formula de planilha." });
      return;
    }

    const valor = body.valor !== undefined ? toNumber(body.valor) : existente.valor;
    if (!Number.isFinite(valor) || valor <= 0) {
      res.status(400).json({ error: "Valor inválido." });
      return;
    }

    const fornecedorValidation = validateBoundedString(
      body.fornecedor !== undefined ? body.fornecedor : (existente.fornecedor ?? ""),
      {
        fieldLabel: "Fornecedor",
        maxLength: FIELD_LIMITS.fornecedor,
      }
    );
    if (!fornecedorValidation.ok) {
      res.status(400).json({ error: fornecedorValidation.error });
      return;
    }

    const responsavelValidation = validateBoundedString(
      body.responsavel !== undefined ? body.responsavel : (existente.responsavel ?? ""),
      {
        fieldLabel: "Responsavel",
        maxLength: FIELD_LIMITS.responsavel,
      }
    );
    if (!responsavelValidation.ok) {
      res.status(400).json({ error: responsavelValidation.error });
      return;
    }

    const { ano, semestre } = getAnoSemestre(data);

    const atualizado = {
      ...existente,
      topicoId,
      data,
      descricao,
      fornecedor: fornecedorValidation.value,
      responsavel: responsavelValidation.value,
      valor: round2(valor),
      ano,
      semestre,
      atualizadoEm: new Date().toISOString(),
    };

    const result = await updateLancamentoById(req.params.id, atualizado);
    if (!result.item) {
      res.status(404).json({ error: "Lancamento nao encontrado." });
      return;
    }
    await writeAuditLog(
      req,
      "lancamento.update",
      "lancamento",
      req.params.id,
      existente,
      result.item
    );
    res.json({
      ...result.item,
      syncStatus: result.syncStatus,
      syncMessage: result.syncMessage ?? null,
    });
  }
);

app.delete(
  "/api/lancamentos/:id",
  requireAnyRole([AUTH_ROLE_ADMIN, AUTH_ROLE_EDITOR]),
  async (req, res) => {
    const existente = await getLancamentoById(req.params.id);
    const result = await deleteLancamentoById(req.params.id);
    if (!result.removed) {
      res.status(404).json({ error: "Lancamento nao encontrado." });
      return;
    }
    await writeAuditLog(req, "lancamento.delete", "lancamento", req.params.id, existente, null);
    res.status(204).end();
  }
);

app.get("/api/resumo", async (req, res) => {
  const [topicos, lancamentos] = await Promise.all([getTopicos(), getLancamentos()]);
  const filters = parseFilters(req.query);
  const resumo = montarResumo(topicos, lancamentos, filters);

  res.json({
    filtros: filters,
    ...resumo,
  });
});

app.get("/api/topicos/:id/detalhes", async (req, res) => {
  const [topicos, lancamentos] = await Promise.all([getTopicos(), getLancamentos()]);
  const topico = topicos.find((item) => item.id === req.params.id);

  if (!topico) {
    res.status(404).json({ error: "Tópico nao encontrado." });
    return;
  }

  const filters = parseFilters(req.query);
  filters.topicoId = topico.id;

  const filtrados = filtrarLancamentos(lancamentos, filters).sort((a, b) =>
    b.data.localeCompare(a.data)
  );
  const total = round2(filtrados.reduce((sum, item) => sum + item.valor, 0));

  res.json({
    topico,
    filtros: filters,
    total,
    items: filtrados,
  });
});

app.get("/api/export/csv", async (req, res) => {
  const [topicos, lancamentos] = await Promise.all([getTopicos(), getLancamentos()]);
  const topicosOrdenados = [...topicos].sort(
    (a, b) =>
      (a.ordem ?? 0) - (b.ordem ?? 0) || String(a.nome ?? "").localeCompare(String(b.nome ?? ""))
  );
  const topicosMap = new Map(topicosOrdenados.map((topico) => [topico.id, topico]));
  const filters = parseFilters(req.query);

  const linhas = filtrarLancamentos(lancamentos, filters).sort((a, b) =>
    a.data.localeCompare(b.data)
  );
  const header = [
    "Tópico",
    "Data",
    "Descricao",
    "Fornecedor",
    "Responsavel",
    "Valor",
    "Semestre",
    "Ano",
  ];

  const body = linhas.map((item) => [
    topicLabelPt(topicosMap.get(item.topicoId)?.nome ?? item.topicoId),
    item.data,
    item.descricao,
    item.fornecedor ?? "",
    item.responsavel ?? "",
    item.valor.toFixed(2),
    item.semestre,
    String(item.ano),
  ]);

  const resumo = montarResumo(topicosOrdenados, lancamentos, filters);
  const resumoByTopico = new Map(resumo.rows.map((row) => [row.topicoId, row]));
  const resumoHeader = [
    "Tópico",
    "Grupo",
    "Orcamento",
    "Despesas Anteriores",
    "Despesas Periodo",
    "Despesas Totais",
    "Saldo",
    "% Execucao",
  ];

  const resumoBody = topicosOrdenados
    .filter((topico) => topico?.incluirNoResumo !== false)
    .map((topico) => {
      const resumoRow = resumoByTopico.get(topico.id);
      const orcamento = round2(
        Number(resumoRow?.orcamentoProgramaBRL ?? topico.orcamentoProgramaBRL ?? 0)
      );
      const anteriores = round2(Number(resumoRow?.despesasAnteriores ?? 0));
      const periodo = round2(Number(resumoRow?.despesasPeriodo ?? 0));
      const total = round2(Number(resumoRow?.despesasAteData ?? anteriores + periodo));
      const saldo = round2(Number(resumoRow?.saldoRemanescente ?? orcamento - total));
      const percentual = orcamento > 0 ? round2((total / orcamento) * 100) : total > 0 ? 999 : 0;

      return [
        topicLabelPt(topico?.nome ?? topico.id),
        groupLabelPt(topico?.grupo || "SEM GRUPO"),
        orcamento.toFixed(2),
        anteriores.toFixed(2),
        periodo.toFixed(2),
        total.toFixed(2),
        saldo.toFixed(2),
        percentual.toFixed(2),
      ];
    });

  const csvRows = [header, ...body, [], ["Resumo por Tópico"], resumoHeader, ...resumoBody];
  const csv = csvRows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const fileName = `lancamentos_${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(`\uFEFF${csv}`);
});

app.get("/api/export/pdf", async (req, res) => {
  const [topicos, lancamentos] = await Promise.all([getTopicos(), getLancamentos()]);
  const filters = parseFilters(req.query);

  const filtrados = filtrarLancamentos(lancamentos, filters).sort((a, b) =>
    a.data.localeCompare(b.data)
  );
  if (filtrados.length > PDF_EXPORT_MAX_ITEMS) {
    res.status(413).json({
      error: `Exportacao PDF limitada a ${PDF_EXPORT_MAX_ITEMS} lancamentos por vez. Refine os filtros.`,
    });
    return;
  }
  const topicosOrdenados = [...topicos].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  const topicosResumo = topicosOrdenados.filter((topico) => topico?.incluirNoResumo !== false);
  const groupOrder = ["TEAM HIRES", "COMMUNICATIONS & PUBLICATIONS", "THIRD PARTY SERVICES"];

  const lancamentosPorTopico = new Map();
  for (const item of filtrados) {
    if (!lancamentosPorTopico.has(item.topicoId)) {
      lancamentosPorTopico.set(item.topicoId, []);
    }
    lancamentosPorTopico.get(item.topicoId).push(item);
  }

  const topicosPorGrupo = new Map();
  for (const topico of topicosResumo) {
    const groupName = topico.grupo || "SEM GRUPO";
    if (!topicosPorGrupo.has(groupName)) {
      topicosPorGrupo.set(groupName, []);
    }
    topicosPorGrupo.get(groupName).push(topico);
  }

  const gruposExtras = [...topicosPorGrupo.keys()]
    .filter((groupName) => !groupOrder.includes(groupName))
    .sort((a, b) => a.localeCompare(b));
  const gruposOrdenados = [
    ...groupOrder.filter((groupName) => topicosPorGrupo.has(groupName)),
    ...gruposExtras,
  ];

  const resumoTopicos = new Map();
  for (const topico of topicosResumo) {
    const items = lancamentosPorTopico.get(topico.id) ?? [];
    const totalS1 = round2(
      items.filter((item) => item.semestre === "S1").reduce((sum, item) => sum + item.valor, 0)
    );
    const totalS2 = round2(
      items.filter((item) => item.semestre === "S2").reduce((sum, item) => sum + item.valor, 0)
    );
    const total = round2(totalS1 + totalS2);

    resumoTopicos.set(topico.id, {
      totalS1,
      totalS2,
      total,
      quantidade: items.length,
    });
  }

  const resumoGrupos = gruposOrdenados.map((grupo) => {
    const topicosDoGrupo = topicosPorGrupo.get(grupo) ?? [];
    const totalS1 = round2(
      topicosDoGrupo.reduce((sum, topico) => sum + (resumoTopicos.get(topico.id)?.totalS1 ?? 0), 0)
    );
    const totalS2 = round2(
      topicosDoGrupo.reduce((sum, topico) => sum + (resumoTopicos.get(topico.id)?.totalS2 ?? 0), 0)
    );
    const total = round2(totalS1 + totalS2);
    const quantidadeLancamentos = topicosDoGrupo.reduce(
      (sum, topico) => sum + (resumoTopicos.get(topico.id)?.quantidade ?? 0),
      0
    );

    return {
      grupo,
      totalS1,
      totalS2,
      total,
      quantidadeLancamentos,
      quantidadeTopicos: topicosDoGrupo.length,
    };
  });
  const resumoGrupoMap = new Map(resumoGrupos.map((row) => [row.grupo, row]));
  const totalGeral = round2(resumoGrupos.reduce((sum, row) => sum + row.total, 0));

  const fileName = `relatorio_${new Date().toISOString().slice(0, 10)}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  const doc = new PDFDocument({ size: "A4", margin: 36 });
  doc.pipe(res);

  const palette = {
    topBar: "#123a43",
    topBarSoft: "#d4e6ea",
    sectionBar: "#1f5f70",
    groupBar: "#2a7f92",
    topicBar: "#eff5f8",
    cardBg: "#f5f9fc",
    cardBorder: "#d4e1ea",
    tableHeaderBg: "#e8eff5",
    tableHeaderText: "#173042",
    rowAlt: "#f9fcff",
    border: "#d9e3ea",
    text: "#1f2f3a",
    textMuted: "#5a6f7d",
  };

  const marginX = doc.page.margins.left;
  const marginBottom = doc.page.margins.bottom;
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - marginX * 2;
  const generatedAt = new Date().toLocaleString("pt-BR");
  let pageNumber = 1;
  const periodoEfetivo = getPeriodoEfetivo(filters, filtrados);
  const periodLabel = periodoEfetivo.label;

  function drawPageHeader(cover = false) {
    if (cover) {
      doc.save();
      doc.rect(0, 0, pageWidth, 98).fill(palette.topBar);
      doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(19)
        .text("Relatório Financeiro por Grupo e Tópico", marginX, 30, {
          width: contentWidth,
          lineBreak: false,
          ellipsis: true,
        });
      doc
        .fillColor(palette.topBarSoft)
        .font("Helvetica")
        .fontSize(10)
        .text("Fundacao Pio XII", marginX, 57, {
          width: contentWidth,
          lineBreak: false,
        });
      doc.fontSize(8).text(`Gerado em ${generatedAt}`, marginX, 73, {
        width: contentWidth - 80,
        lineBreak: false,
      });
      doc.font("Helvetica-Bold").text(`Página ${pageNumber}`, marginX, 73, {
        width: contentWidth,
        align: "right",
        lineBreak: false,
      });
      doc.restore();
      doc.y = 110;
      return;
    }

    doc.save();
    doc.rect(0, 0, pageWidth, 34).fill(palette.topBar);
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Relatório Financeiro por Grupo e Tópico", marginX, 12, {
        width: contentWidth - 90,
        lineBreak: false,
        ellipsis: true,
      });
    doc
      .fillColor(palette.topBarSoft)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(`Página ${pageNumber}`, marginX, 12, {
        width: contentWidth,
        align: "right",
        lineBreak: false,
      });
    doc.restore();
    doc.y = 44;
  }

  function addPage() {
    doc.addPage();
    pageNumber += 1;
    drawPageHeader(false);
  }

  function ensureSpace(requiredHeight, onPageBreak) {
    if (doc.y + requiredHeight <= doc.page.height - marginBottom) return;
    addPage();
    if (onPageBreak) onPageBreak();
  }

  function drawSectionTitle(title) {
    ensureSpace(30);
    const y = doc.y;
    doc.roundedRect(marginX, y, contentWidth, 22, 5).fill(palette.sectionBar);
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(title, marginX + 10, y + 7, {
        width: contentWidth - 20,
        lineBreak: false,
        ellipsis: true,
      });
    doc.y = y + 30;
  }

  function drawMetaCards() {
    const cards = [
      { label: "Ano", value: filters.ano ?? "Todos" },
      { label: "Semestre", value: filters.semestre ?? "Todos" },
      { label: "Periodo", value: periodLabel },
      {
        label: "Lancamentos",
        value: `${filtrados.length} itens | Total ${formatCurrency(totalGeral)}`,
      },
    ];

    const gap = 8;
    const cardHeight = 46;
    const cardWidth = (contentWidth - gap * (cards.length - 1)) / cards.length;
    ensureSpace(cardHeight + 10);
    const baseY = doc.y;

    for (let index = 0; index < cards.length; index += 1) {
      const card = cards[index];
      const x = marginX + index * (cardWidth + gap);
      doc
        .roundedRect(x, baseY, cardWidth, cardHeight, 5)
        .fillAndStroke(palette.cardBg, palette.cardBorder);
      doc
        .fillColor(palette.textMuted)
        .font("Helvetica")
        .fontSize(7)
        .text(card.label, x + 8, baseY + 8, {
          width: cardWidth - 16,
          lineBreak: false,
          ellipsis: true,
        });
      doc
        .fillColor(palette.text)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(card.value, x + 8, baseY + 20, {
          width: cardWidth - 16,
          lineBreak: false,
          ellipsis: true,
        });
    }

    doc.y = baseY + cardHeight + 12;
  }

  function drawTableHeader(columns) {
    const height = 20;
    ensureSpace(height + 1);
    const y = doc.y;
    doc.rect(marginX, y, contentWidth, height).fill(palette.tableHeaderBg);

    let x = marginX;
    doc.fillColor(palette.tableHeaderText).font("Helvetica-Bold").fontSize(8);
    for (const col of columns) {
      doc.text(col.label, x + 4, y + 6, {
        width: col.width - 8,
        align: col.align ?? "left",
        lineBreak: false,
        ellipsis: true,
      });
      x += col.width;
      doc
        .moveTo(x, y)
        .lineTo(x, y + height)
        .lineWidth(0.4)
        .strokeColor(palette.border)
        .stroke();
    }
    doc.rect(marginX, y, contentWidth, height).lineWidth(0.5).strokeColor(palette.border).stroke();
    doc.y = y + height;
  }

  function drawTableRow(columns, values, options = {}) {
    const height = options.height ?? 18;
    ensureSpace(height + 1, options.onPageBreak);
    const y = doc.y;

    if (options.fill) {
      doc.rect(marginX, y, contentWidth, height).fill(options.fill);
    }

    let x = marginX;
    doc
      .fillColor(options.textColor ?? palette.text)
      .font(options.bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(options.fontSize ?? 8);

    for (let index = 0; index < columns.length; index += 1) {
      const col = columns[index];
      const value = String(values[index] ?? "");
      doc.text(value, x + 4, y + 5, {
        width: col.width - 8,
        align: col.align ?? "left",
        lineBreak: false,
        ellipsis: true,
      });
      x += col.width;
      doc
        .moveTo(x, y)
        .lineTo(x, y + height)
        .lineWidth(0.35)
        .strokeColor(palette.border)
        .stroke();
    }

    doc.rect(marginX, y, contentWidth, height).lineWidth(0.35).strokeColor(palette.border).stroke();
    doc.y = y + height;
  }

  function drawGroupHeader(groupName, groupStats, compact = false) {
    const height = compact ? 20 : 22;
    ensureSpace(height + 6);
    const y = doc.y;
    doc
      .roundedRect(marginX, y, contentWidth, height, 5)
      .fill(compact ? "#327f90" : palette.groupBar);
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(compact ? 8 : 9)
      .text(groupName, marginX + 10, y + (compact ? 6 : 7), {
        width: contentWidth - 220,
        lineBreak: false,
        ellipsis: true,
      });
    doc.text(
      `Tópicos ${groupStats.quantidadeTopicos} | Lanc. ${groupStats.quantidadeLancamentos} | Total ${formatCurrency(
        groupStats.total
      )}`,
      marginX + 210,
      y + (compact ? 6 : 7),
      {
        width: contentWidth - 220,
        align: "right",
        lineBreak: false,
        ellipsis: true,
      }
    );
    doc.y = y + height + 6;
  }

  function drawTopicHeader(groupName, topicoNome, stats, compact = false) {
    const height = compact ? 18 : 20;
    ensureSpace(height + 4);
    const y = doc.y;
    doc
      .roundedRect(marginX, y, contentWidth, height, 4)
      .fill(compact ? "#f4f8fb" : palette.topicBar);
    doc
      .fillColor(palette.text)
      .font("Helvetica-Bold")
      .fontSize(compact ? 8 : 9)
      .text(topicoNome, marginX + 8, y + (compact ? 5 : 6), {
        width: contentWidth - 220,
        lineBreak: false,
        ellipsis: true,
      });
    doc
      .fillColor(palette.textMuted)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(
        `S1 ${formatCurrency(stats.totalS1)} | S2 ${formatCurrency(stats.totalS2)} | Total ${formatCurrency(
          stats.total
        )}`,
        marginX + 210,
        y + (compact ? 5 : 6),
        {
          width: contentWidth - 220,
          align: "right",
          lineBreak: false,
          ellipsis: true,
        }
      );

    if (compact) {
      doc
        .fillColor(palette.textMuted)
        .font("Helvetica")
        .fontSize(7)
        .text(groupName, marginX + 8, y + 13, {
          width: contentWidth - 16,
          lineBreak: false,
          ellipsis: true,
        });
      doc.y = y + height + 5;
      return;
    }

    doc.y = y + height + 4;
  }

  drawPageHeader(true);
  drawMetaCards();

  drawSectionTitle("Resumo por Grupo");
  const groupColumns = [
    { label: "Grupo", width: contentWidth - 334 },
    { label: "S1", width: 92, align: "right" },
    { label: "S2", width: 92, align: "right" },
    { label: "Total", width: 100, align: "right" },
    { label: "Lanc.", width: 50, align: "right" },
  ];
  drawTableHeader(groupColumns);

  resumoGrupos.forEach((row, index) => {
    drawTableRow(
      groupColumns,
      [
        groupLabelPt(row.grupo),
        formatCurrency(row.totalS1),
        formatCurrency(row.totalS2),
        formatCurrency(row.total),
        String(row.quantidadeLancamentos),
      ],
      { fill: index % 2 === 0 ? "#ffffff" : palette.rowAlt }
    );
  });

  drawTableRow(
    groupColumns,
    [
      "TOTAL GERAL",
      formatCurrency(resumoGrupos.reduce((sum, row) => sum + row.totalS1, 0)),
      formatCurrency(resumoGrupos.reduce((sum, row) => sum + row.totalS2, 0)),
      formatCurrency(totalGeral),
      String(filtrados.length),
    ],
    { fill: "#edf4fa", bold: true }
  );

  doc.moveDown(0.4);
  drawSectionTitle("Detalhamento por Grupo > Tópico > Lancamentos");

  const detailColumns = [
    { label: "Data", width: 64 },
    { label: "Descricao", width: 160 },
    { label: "Fornecedor", width: 84 },
    { label: "Responsavel", width: 84 },
    { label: "Sem", width: 40, align: "center" },
    { label: "Valor", width: 91, align: "right" },
  ];

  for (const groupName of gruposOrdenados) {
    const groupStats = resumoGrupoMap.get(groupName);
    const topicosDoGrupo = topicosPorGrupo.get(groupName) ?? [];
    const groupDisplay = truncateText(groupLabelPt(groupName), 90);
    drawGroupHeader(groupDisplay, groupStats);

    for (const topico of topicosDoGrupo) {
      const stats = resumoTopicos.get(topico.id) ?? {
        totalS1: 0,
        totalS2: 0,
        total: 0,
        quantidade: 0,
      };
      const items = lancamentosPorTopico.get(topico.id) ?? [];
      const topicDisplay = truncateText(topicLabelPt(topico.nome), 90);
      drawTopicHeader(groupDisplay, topicDisplay, stats);

      if (items.length === 0) {
        ensureSpace(16);
        const y = doc.y;
        doc
          .fillColor(palette.textMuted)
          .font("Helvetica-Oblique")
          .fontSize(8)
          .text("Sem lancamentos para este topico nos filtros selecionados.", marginX + 10, y + 1, {
            width: contentWidth - 20,
          });
        doc.y = y + 15;
        doc.moveDown(0.25);
        continue;
      }

      drawTableHeader(detailColumns);

      items.forEach((item, index) => {
        drawTableRow(
          detailColumns,
          [
            formatDateBr(item.data),
            truncateText(item.descricao, PDF_TEXT_MAX_CHARS),
            truncateText(item.fornecedor || "-", 70),
            truncateText(item.responsavel || "-", 70),
            item.semestre,
            formatCurrency(item.valor),
          ],
          {
            fill: index % 2 === 0 ? "#ffffff" : palette.rowAlt,
            onPageBreak: () => {
              drawGroupHeader(groupDisplay, groupStats, true);
              drawTopicHeader(groupDisplay, `${topicDisplay} (continua)`, stats, true);
              drawTableHeader(detailColumns);
            },
          }
        );
      });

      doc.moveDown(0.3);
    }

    doc.moveDown(0.4);
  }

  doc.end();
});

app.get("/api/export/excel", async (req, res) => {
  const projectCode = getActiveProjectCode();
  const projectDefinition = getProjectDefinition(projectCode);
  const templateFile = getTemplateFileForProject(projectCode);

  if (!templateFile || !fs.existsSync(templateFile)) {
    const templateName = path.basename(String(templateFile || "template.xlsx"));
    res.status(500).json({ error: `Template Excel nao encontrado em templates/${templateName}` });
    return;
  }

  const [topicos, lancamentos] = await Promise.all([
    getTopicos(projectCode),
    getLancamentos(projectCode),
  ]);
  const filters = parseFilters(req.query);
  const lancamentosFiltrados = filtrarLancamentos(lancamentos, filters);
  const periodoEfetivo = getPeriodoEfetivo(filters, lancamentosFiltrados);
  const resumo = montarResumo(topicos, lancamentos, filters);
  const resumoByTopico = new Map(resumo.rows.map((row) => [row.topicoId, row]));

  const workbook = await XlsxPopulate.fromFileAsync(templateFile);

  function buildResumoMetric(topico, resumoRow) {
    const budget = round2(
      Number(resumoRow?.orcamentoProgramaBRL ?? topico.orcamentoProgramaBRL ?? 0)
    );
    const prior = round2(Number(resumoRow?.despesasAnteriores ?? 0));
    const current = round2(Number(resumoRow?.despesasPeriodo ?? 0));
    const total = round2(Number(resumoRow?.despesasAteData ?? prior + current));
    const balance = round2(Number(resumoRow?.saldoRemanescente ?? budget - total));
    const percent = budget > 0 ? round2((total / budget) * 100) : total > 0 ? 999 : 0;
    return { budget, prior, current, total, balance, percent };
  }

  function writeMetricOnRow(sheet, rowNumber, metric) {
    sheet.cell(`B${rowNumber}`).value(metric.budget);
    sheet.cell(`C${rowNumber}`).value(metric.prior);
    sheet.cell(`D${rowNumber}`).value(metric.current);
    sheet.cell(`E${rowNumber}`).formula(`+C${rowNumber}+D${rowNumber}`);
    sheet.cell(`F${rowNumber}`).formula(`+B${rowNumber}-E${rowNumber}`);
    sheet.cell(`G${rowNumber}`).formula(`IF(B${rowNumber}=0,0,E${rowNumber}/B${rowNumber}*100)`);
  }

  function clearMetricRow(sheet, rowNumber) {
    sheet.range(`B${rowNumber}:G${rowNumber}`).value([[null, null, null, null, null, null]]);
  }

  function applyDateRangeOnSheet(sheet, fromCell = "G4", toCell = "G7") {
    if (periodoEfetivo.inicio) {
      sheet.cell(fromCell).value(new Date(`${periodoEfetivo.inicio}T00:00:00`));
    } else {
      sheet.cell(fromCell).value(null);
    }

    if (periodoEfetivo.fim) {
      sheet.cell(toCell).value(new Date(`${periodoEfetivo.fim}T00:00:00`));
    } else {
      sheet.cell(toCell).value(null);
    }
  }

  if (projectDefinition.excelMode === "multi-sheet") {
    const mappedIncludedBySheet = new Map();
    const mappedExcludedBySheet = new Map();

    for (const topico of topicos) {
      const templateRow = Number.isFinite(Number(topico?.templateRow))
        ? Number(topico.templateRow)
        : null;
      if (!templateRow || templateRow <= 0) continue;

      const sheetName = resolveTemplateSheetForTopico(topico, projectDefinition);
      if (!sheetName) continue;

      const targetMap =
        topico?.incluirNoResumo !== false ? mappedIncludedBySheet : mappedExcludedBySheet;
      if (!targetMap.has(sheetName)) {
        targetMap.set(sheetName, []);
      }
      targetMap.get(sheetName).push({ ...topico, templateRow });
    }

    const referencedSheets = new Set([
      ...mappedIncludedBySheet.keys(),
      ...mappedExcludedBySheet.keys(),
      ...(projectDefinition.sheetDateCells ??
        [].map((entry) => normalizeWorkbookSheetName(entry?.sheet ?? entry, "")).filter(Boolean)),
      normalizeWorkbookSheetName(projectDefinition.primarySheetName, ""),
    ]);

    for (const rawSheetName of referencedSheets) {
      const sheetName = normalizeWorkbookSheetName(rawSheetName, "");
      if (!sheetName) continue;
      const sheet = workbook.sheet(sheetName);
      if (!sheet) {
        res.status(500).json({
          error: `Aba ${sheetName} nao encontrada no template ${path.basename(templateFile)}.`,
        });
        return;
      }

      for (const topico of mappedIncludedBySheet.get(sheetName) ?? []) {
        const resumoRow = resumoByTopico.get(topico.id);
        const metric = buildResumoMetric(topico, resumoRow);
        writeMetricOnRow(sheet, topico.templateRow, metric);
      }

      for (const topico of mappedExcludedBySheet.get(sheetName) ?? []) {
        clearMetricRow(sheet, topico.templateRow);
      }
    }

    const dateTargets =
      Array.isArray(projectDefinition.sheetDateCells) && projectDefinition.sheetDateCells.length > 0
        ? projectDefinition.sheetDateCells
        : [
            {
              sheet: normalizeWorkbookSheetName(projectDefinition.primarySheetName, "Expenditure"),
              fromCell: "G4",
              toCell: "G7",
            },
          ];

    for (const target of dateTargets) {
      const sheetName = normalizeWorkbookSheetName(target?.sheet ?? target, "");
      if (!sheetName) continue;
      const sheet = workbook.sheet(sheetName);
      if (!sheet) continue;
      applyDateRangeOnSheet(
        sheet,
        String(target?.fromCell ?? "G4"),
        String(target?.toCell ?? "G7")
      );
    }
  } else {
    const primarySheetName = normalizeWorkbookSheetName(
      projectDefinition.primarySheetName,
      "Expenditure"
    );
    const sheet = workbook.sheet(primarySheetName);
    if (!sheet) {
      res.status(500).json({
        error: `Aba ${primarySheetName} nao encontrada no template ${path.basename(templateFile)}.`,
      });
      return;
    }

    const mappedIncluded = [];
    const mappedExcluded = [];
    const extrasIncluded = [];

    for (const topico of topicos) {
      const incluirNoResumo = topico?.incluirNoResumo !== false;
      const templateRow = Number.isFinite(Number(topico?.templateRow))
        ? Number(topico.templateRow)
        : null;

      if (templateRow && templateRow > 0) {
        if (incluirNoResumo) {
          mappedIncluded.push({ ...topico, templateRow });
        } else {
          mappedExcluded.push({ ...topico, templateRow });
        }
        continue;
      }

      if (incluirNoResumo) {
        extrasIncluded.push(topico);
      }
    }

    for (const topico of mappedIncluded) {
      const row = topico.templateRow;
      const resumoRow = resumoByTopico.get(topico.id);
      const metric = buildResumoMetric(topico, resumoRow);
      writeMetricOnRow(sheet, row, metric);
    }

    for (const topico of mappedExcluded) {
      clearMetricRow(sheet, topico.templateRow);
    }

    const TABLE_COLUMNS = ["A", "B", "C", "D", "E", "F", "G"];
    const EXTRA_START_ROW = 31;
    const BASE_TOTAL_ROW = 32;

    const extraTemplateStyleIds = TABLE_COLUMNS.map(
      (col) => sheet.cell(`${col}${EXTRA_START_ROW}`)._styleId
    );
    const extraTemplateRowHeight = sheet.row(EXTRA_START_ROW).height();
    const totalTemplateStyleIds = TABLE_COLUMNS.map(
      (col) => sheet.cell(`${col}${BASE_TOTAL_ROW}`)._styleId
    );
    const totalTemplateRowHeight = sheet.row(BASE_TOTAL_ROW).height();
    const totalTemplateLabel = sheet.cell(`A${BASE_TOTAL_ROW}`).value();

    function clearRowCells(rowNumber) {
      sheet
        .range(`A${rowNumber}:G${rowNumber}`)
        .value([[null, null, null, null, null, null, null]]);
    }

    function copyRowCells(sourceRow, targetRow) {
      for (const col of TABLE_COLUMNS) {
        const sourceCell = sheet.cell(`${col}${sourceRow}`);
        const targetCell = sheet.cell(`${col}${targetRow}`);
        targetCell._styleId = sourceCell._styleId;
        const formula = sourceCell.formula();
        if (formula && formula !== "SHARED") {
          targetCell.formula(formula);
        } else {
          targetCell.value(sourceCell.value());
        }
      }

      const sourceRowHeight = sheet.row(sourceRow).height();
      if (sourceRowHeight !== undefined && sourceRowHeight !== null) {
        sheet.row(targetRow).height(sourceRowHeight);
      }
    }

    function applyExtraTemplateRow(rowNumber) {
      for (let i = 0; i < TABLE_COLUMNS.length; i += 1) {
        sheet.cell(`${TABLE_COLUMNS[i]}${rowNumber}`)._styleId = extraTemplateStyleIds[i];
      }
      if (extraTemplateRowHeight !== undefined && extraTemplateRowHeight !== null) {
        sheet.row(rowNumber).height(extraTemplateRowHeight);
      }
    }

    function applyTotalTemplateRow(rowNumber) {
      for (let i = 0; i < TABLE_COLUMNS.length; i += 1) {
        sheet.cell(`${TABLE_COLUMNS[i]}${rowNumber}`)._styleId = totalTemplateStyleIds[i];
      }
      if (totalTemplateRowHeight !== undefined && totalTemplateRowHeight !== null) {
        sheet.row(rowNumber).height(totalTemplateRowHeight);
      }
    }

    // A linha 31 ja existe no template para overflow.
    // Quando houver mais de 1 topico extra, deslocamos o bloco abaixo (total + certificacao)
    // para abrir espaco e listar cada topico extra em sua propria linha na Expenditure.
    const extraOverflowRows = Math.max(0, extrasIncluded.length - 1);
    if (extraOverflowRows > 0) {
      const movableStartRow = BASE_TOTAL_ROW + 1;
      const usedRange = sheet.usedRange();
      const usedEndRow = Math.max(
        movableStartRow,
        Number(usedRange?.endCell()?.rowNumber?.() ?? 44),
        44
      );

      for (let row = usedEndRow; row >= movableStartRow; row -= 1) {
        copyRowCells(row, row + extraOverflowRows);
      }
      for (let row = movableStartRow; row < movableStartRow + extraOverflowRows; row += 1) {
        clearRowCells(row);
      }
    }

    if (extrasIncluded.length === 0) {
      clearRowCells(EXTRA_START_ROW);
    } else {
      extrasIncluded.forEach((topico, index) => {
        const row = EXTRA_START_ROW + index;
        applyExtraTemplateRow(row);
        clearRowCells(row);

        const resumoRow = resumoByTopico.get(topico.id);
        const metric = buildResumoMetric(topico, resumoRow);
        sheet.cell(`A${row}`).value(String(topico?.nome ?? topico?.id ?? "Tópico extra"));
        writeMetricOnRow(sheet, row, metric);
      });
    }

    const totalRow = BASE_TOTAL_ROW + extraOverflowRows;
    const totalStartRow = 14;
    const totalEndRow = totalRow - 1;
    applyTotalTemplateRow(totalRow);
    sheet.cell(`A${totalRow}`).value(totalTemplateLabel ?? "Total Budget and Expenditure");
    sheet.cell(`B${totalRow}`).formula(`SUM(B${totalStartRow}:B${totalEndRow})`);
    sheet.cell(`C${totalRow}`).formula(`SUM(C${totalStartRow}:C${totalEndRow})`);
    sheet.cell(`D${totalRow}`).formula(`SUM(D${totalStartRow}:D${totalEndRow})`);
    sheet.cell(`E${totalRow}`).formula(`SUM(E${totalStartRow}:E${totalEndRow})`);
    sheet.cell(`F${totalRow}`).formula(`SUM(F${totalStartRow}:F${totalEndRow})`);
    sheet.cell(`G${totalRow}`).formula(`IF(B${totalRow}=0,0,E${totalRow}/B${totalRow}*100)`);

    let extrasSheet = workbook.sheet("Tópicos Extras");
    if (!extrasSheet) {
      extrasSheet = workbook.addSheet("Tópicos Extras");
    }

    if (extrasSheet.usedRange()) {
      extrasSheet.usedRange().clear();
    }

    extrasSheet
      .range("A1:H1")
      .value([
        [
          "Tópico",
          "Grupo",
          "Orcamento",
          "Despesas Anteriores",
          "Despesas Periodo",
          "Despesas Totais",
          "Saldo",
          "% Execucao",
        ],
      ]);

    if (extrasIncluded.length === 0) {
      extrasSheet.cell("A2").value("Sem topicos extras incluidos no resumo.");
    } else {
      extrasIncluded.forEach((topico, index) => {
        const rowIndex = index + 2;
        const resumoRow = resumoByTopico.get(topico.id);
        const metric = buildResumoMetric(topico, resumoRow);
        extrasSheet
          .range(`A${rowIndex}:H${rowIndex}`)
          .value([
            [
              String(topico?.nome ?? topico?.id ?? ""),
              String(topico?.grupo ?? ""),
              metric.budget,
              metric.prior,
              metric.current,
              metric.total,
              metric.balance,
              metric.percent,
            ],
          ]);
      });
    }

    applyDateRangeOnSheet(sheet, "G4", "G7");
  }

  const output = await workbook.outputAsync();
  const rawPrefix = String(
    projectDefinition.exportFilePrefix ?? `${projectCode}_Expenditure_Atualizado`
  );
  const safePrefix = rawPrefix.replace(/[^A-Za-z0-9._-]+/g, "_");
  const fileName = `${safePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(Buffer.from(output));
});

app.get("/api/health", (req, res) => {
  const accessContext = getAccessContextFromRequest(req);
  const diagnosticsAllowed = Boolean(accessContext?.permissions?.canViewDiagnostics);
  const projectCode = accessContext?.activeProjectCode ?? "";

  if (!diagnosticsAllowed) {
    res.json({ ok: true });
    return;
  }

  res.json({
    ok: true,
    projectCode,
    access: {
      username: accessContext?.username ?? "",
      role: accessContext?.role ?? AUTH_ROLE_VIEWER,
      isSuperAdmin: accessContext?.isSuperAdmin === true,
      allowedProjects: accessContext?.allowedProjects ?? [],
      requiresProjectSelection: accessContext?.requiresProjectSelection === true,
    },
    runtime: {
      persistenceMode: SUPABASE_ENABLED
        ? getSupabaseRuntimeSummary().status === "degraded"
          ? "supabase_degradado"
          : "supabase"
        : "arquivo_local",
      trustProxy: TRUST_PROXY_SETTING,
      knownProjects: getKnownProjectCodes(),
      activeProjectsCache: listAllActiveProjectsCached(),
    },
    supabase: getSupabaseRuntimeSummary(),
    tabelas: SUPABASE_ENABLED
      ? {
          lancamentos: SUPABASE_LANCAMENTOS_TABLE,
          topicos: SUPABASE_TOPICOS_TABLE,
          appConfig: SUPABASE_APP_CONFIG_TABLE,
          authSessions: SUPABASE_AUTH_SESSIONS_TABLE,
          auditLog: SUPABASE_AUDIT_LOG_TABLE,
        }
      : null,
  });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Rota de API nao encontrada." });
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

export async function createServerApp() {
  await ensureStorage();
  ensurePendingSyncWorker();
  for (const projectCode of getKnownProjectCodes()) {
    triggerPendingSync(projectCode);
  }
  return app;
}

export async function startServer(port = PORT) {
  await ensureStorage();
  ensurePendingSyncWorker();
  for (const projectCode of getKnownProjectCodes()) {
    triggerPendingSync(projectCode);
  }
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Servidor iniciado em http://localhost:${port}`);
      resolve(server);
    });
  });
}

export { bootstrapProjectRuntime, getKnownProjectCodes, getSupabaseRuntimeSummary };

const currentFile = path.resolve(fileURLToPath(import.meta.url));
const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (currentFile === entryFile) {
  await startServer(PORT);
}
