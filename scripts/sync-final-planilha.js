import "dotenv/config";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v4 as uuidv4 } from "uuid";
import ExcelJS from "exceljs";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const DEFAULT_WORKBOOK_PATH =
  "C:\\Users\\User\\Downloads\\Fundacao_Expenditure_Atualizado_2026-02-16 (2).xlsx";
const WORKBOOK_PATH = process.argv[2] || DEFAULT_WORKBOOK_PATH;
const WORKBOOK_SHEET = "Expenditure";

const DATA_DIR = path.join(rootDir, "data");
const TOPICOS_FILE = path.join(DATA_DIR, "topicos.json");
const LANCAMENTOS_FILE = path.join(DATA_DIR, "lancamentos.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_LANCAMENTOS_TABLE = process.env.SUPABASE_LANCAMENTOS_TABLE || "lancamentos";
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

const IMPORT_TAG = "IMPORT_PLANILHA_FINAL";
const TOPIC_START_ROW = 15;
const TOPIC_END_ROW = 30;
const GROUP_HEADER_START_ROW = 14;

const GROUP_HEADER_MAP = new Map([
  ["TEAM HIRES", "TEAM HIRES"],
  ["COMMUNICATIONS & PUBLICATIONS", "COMMUNICATIONS & PUBLICATIONS"],
  ["THIRD PARTY SERVICES", "THIRD PARTY SERVICES"],
]);

function pad2(value) {
  return String(value).padStart(2, "0");
}

function toIsoDateUtc(date) {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function excelSerialToIsoDateUtc(serial) {
  const excelEpochMs = Date.UTC(1899, 11, 30);
  const ms = excelEpochMs + Math.round(Number(serial) * 86400000);
  return toIsoDateUtc(new Date(ms));
}

function parsePossibleDateTextToIso(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const mmddyy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (mmddyy) {
    const month = Number(mmddyy[1]);
    const day = Number(mmddyy[2]);
    let year = Number(mmddyy[3]);
    if (year < 100) year += 2000;
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return toIsoDateUtc(parsed);
  }

  return null;
}

function dateCellToIsoDateUtc(cell) {
  const value = cell?.value;
  if (value instanceof Date) return toIsoDateUtc(value);

  if (typeof value === "number" && Number.isFinite(value)) {
    return excelSerialToIsoDateUtc(value);
  }

  if (value && typeof value === "object" && "result" in value && value.result instanceof Date) {
    return toIsoDateUtc(value.result);
  }

  if (value && typeof value === "object" && "result" in value && typeof value.result === "number") {
    return excelSerialToIsoDateUtc(value.result);
  }

  const parsedFromText = parsePossibleDateTextToIso(cell?.text);
  if (parsedFromText) return parsedFromText;

  throw new Error(`Nao foi possivel ler data da celula ${cell?.address || "desconhecida"}.`);
}

function round2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }

  if (typeof value === "string") {
    const cleaned = value.trim().replace(/\./g, "").replace(",", ".");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  if (value && typeof value === "object" && "result" in value) {
    return toNumber(value.result);
  }

  return NaN;
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value, fallback = "topico") {
  const slug = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function makeUniqueId(seed, usedIds) {
  const base = slugify(seed);
  if (!usedIds.has(base)) return base;

  let suffix = 2;
  while (usedIds.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function getAnoSemestre(dateIso) {
  const [anoText, mesText] = dateIso.split("-");
  const ano = Number(anoText);
  const mes = Number(mesText);
  return { ano, semestre: mes <= 6 ? "S1" : "S2" };
}

function dateMinusOneIso(dateIso) {
  const base = new Date(`${dateIso}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() - 1);
  return toIsoDateUtc(base);
}

function canonicalGroupHeader(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fsp.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fsp.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

async function ensureBackupDir() {
  await fsp.mkdir(BACKUP_DIR, { recursive: true });
}

async function backupFile(filePath, suffix) {
  if (!fs.existsSync(filePath)) return null;
  const fileName = path.basename(filePath, path.extname(filePath));
  const backupPath = path.join(BACKUP_DIR, `${fileName}.${suffix}${path.extname(filePath)}`);
  await fsp.copyFile(filePath, backupPath);
  return backupPath;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function buildSheetRows(worksheet) {
  let currentGroup = "";
  const rows = [];

  for (let row = GROUP_HEADER_START_ROW; row <= TOPIC_END_ROW; row += 1) {
    const nome = String(worksheet.getCell(`A${row}`).text ?? "").trim();
    if (!nome) continue;

    const maybeGroup = GROUP_HEADER_MAP.get(canonicalGroupHeader(nome));
    if (maybeGroup) {
      currentGroup = maybeGroup;
      continue;
    }

    if (row < TOPIC_START_ROW) continue;

    const orcamento = toNumber(
      worksheet.getCell(`B${row}`).value ?? worksheet.getCell(`B${row}`).text
    );
    if (!Number.isFinite(orcamento)) continue;

    const anterior = toNumber(
      worksheet.getCell(`C${row}`).value ?? worksheet.getCell(`C${row}`).text
    );
    const periodo = toNumber(
      worksheet.getCell(`D${row}`).value ?? worksheet.getCell(`D${row}`).text
    );

    rows.push({
      row,
      nome,
      grupo: currentGroup,
      orcamentoProgramaBRL: round2(orcamento),
      gastoAnterior: round2(Number.isFinite(anterior) ? anterior : 0),
      gastoPeriodo: round2(Number.isFinite(periodo) ? periodo : 0),
    });
  }

  return rows;
}

function mergeTopicos(existingTopicos, sheetRows) {
  const existingByCanonicalName = new Map(
    existingTopicos.map((topico) => [normalizeText(topico.nome), topico])
  );
  const usedIds = new Set(existingTopicos.map((topico) => String(topico.id)));

  const mappedFromSheet = [];
  const mappedIds = new Set();

  for (const [index, row] of sheetRows.entries()) {
    const existing = existingByCanonicalName.get(normalizeText(row.nome));
    const isTeamHires = row.grupo === "TEAM HIRES";

    const topico = existing
      ? { ...existing }
      : {
          id: makeUniqueId(row.nome, usedIds),
          templateRow: row.row,
        };

    usedIds.add(topico.id);
    mappedIds.add(topico.id);

    topico.nome = row.nome;
    topico.grupo = row.grupo || topico.grupo || "COMMUNICATIONS & PUBLICATIONS";
    topico.templateRow = row.row;
    topico.incluirNoResumo = !isTeamHires;
    topico.permitirLancamento = !isTeamHires;
    topico.ordem = index + 1;
    topico.orcamentoProgramaBRL = round2(row.orcamentoProgramaBRL);

    mappedFromSheet.push(topico);
  }

  const extras = existingTopicos
    .filter((topico) => !mappedIds.has(topico.id))
    .map((topico, index) => ({
      ...topico,
      ordem: mappedFromSheet.length + index + 1,
    }));

  return [...mappedFromSheet, ...extras];
}

function buildLancamentosFromSheetRows(sheetRows, topicosByCanonicalName, fromIso, toIso) {
  const previousDayIso = dateMinusOneIso(fromIso);
  const nowIso = new Date().toISOString();
  const lancamentos = [];
  const expectedByTopico = new Map();

  for (const row of sheetRows) {
    const topico = topicosByCanonicalName.get(normalizeText(row.nome));
    if (!topico) {
      throw new Error(`Topico nao encontrado apos merge: ${row.nome}`);
    }

    const expected = round2((row.gastoAnterior || 0) + (row.gastoPeriodo || 0));
    expectedByTopico.set(topico.id, expected);

    if (row.gastoAnterior > 0) {
      const { ano, semestre } = getAnoSemestre(previousDayIso);
      lancamentos.push({
        id: uuidv4(),
        topicoId: topico.id,
        data: previousDayIso,
        descricao: "Saldo anterior importado da planilha final",
        fornecedor: IMPORT_TAG,
        responsavel: IMPORT_TAG,
        valor: round2(row.gastoAnterior),
        semestre,
        ano,
        criadoEm: nowIso,
        atualizadoEm: nowIso,
      });
    }

    if (row.gastoPeriodo > 0) {
      const { ano, semestre } = getAnoSemestre(toIso);
      lancamentos.push({
        id: uuidv4(),
        topicoId: topico.id,
        data: toIso,
        descricao: "Gasto do periodo importado da planilha final",
        fornecedor: IMPORT_TAG,
        responsavel: IMPORT_TAG,
        valor: round2(row.gastoPeriodo),
        semestre,
        ano,
        criadoEm: nowIso,
        atualizadoEm: nowIso,
      });
    }
  }

  return { lancamentos, expectedByTopico };
}

function validateTotals(lancamentos, expectedByTopico) {
  const actualByTopico = new Map();

  for (const item of lancamentos) {
    actualByTopico.set(
      item.topicoId,
      round2((actualByTopico.get(item.topicoId) ?? 0) + Number(item.valor || 0))
    );
  }

  const mismatches = [];
  for (const [topicoId, expected] of expectedByTopico.entries()) {
    const actual = round2(actualByTopico.get(topicoId) ?? 0);
    if (Math.abs(expected - actual) >= 0.01) {
      mismatches.push({ topicoId, expected, actual });
    }
  }

  if (mismatches.length > 0) {
    const details = mismatches
      .map((row) => `${row.topicoId}: esperado ${row.expected}, atual ${row.actual}`)
      .join("; ");
    throw new Error(`Falha na validacao dos totais por topico: ${details}`);
  }
}

function lancamentoToSupabase(item) {
  return {
    id: item.id,
    topico_id: item.topicoId,
    data: item.data,
    descricao: item.descricao,
    fornecedor: item.fornecedor ?? "",
    responsavel: item.responsavel ?? "",
    valor: round2(item.valor),
    semestre: item.semestre,
    ano: item.ano,
    criado_em: item.criadoEm ?? new Date().toISOString(),
    atualizado_em: item.atualizadoEm ?? new Date().toISOString(),
  };
}

async function replaceSupabaseLancamentos(lancamentos, backupSuffix) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: currentRows, error: snapshotError } = await supabase
    .from(SUPABASE_LANCAMENTOS_TABLE)
    .select("*")
    .order("data", { ascending: true });

  if (snapshotError) {
    throw new Error(`Falha ao exportar snapshot do Supabase: ${snapshotError.message}`);
  }

  const snapshotPath = path.join(BACKUP_DIR, `supabase-lancamentos.${backupSuffix}.json`);
  await writeJson(snapshotPath, currentRows ?? []);

  const { error: deleteError } = await supabase
    .from(SUPABASE_LANCAMENTOS_TABLE)
    .delete()
    .not("id", "is", null);

  if (deleteError) {
    throw new Error(`Falha ao limpar lancamentos no Supabase: ${deleteError.message}`);
  }

  const payload = lancamentos.map(lancamentoToSupabase);
  for (const chunk of chunkArray(payload, 500)) {
    if (chunk.length === 0) continue;
    const { error } = await supabase.from(SUPABASE_LANCAMENTOS_TABLE).insert(chunk);
    if (error) {
      throw new Error(`Falha ao inserir lancamentos no Supabase: ${error.message}`);
    }
  }

  const { data: insertedRows, error: verifyError } = await supabase
    .from(SUPABASE_LANCAMENTOS_TABLE)
    .select("id");

  if (verifyError) {
    throw new Error(`Falha ao validar insercao no Supabase: ${verifyError.message}`);
  }

  return {
    snapshotPath,
    beforeCount: (currentRows ?? []).length,
    afterCount: (insertedRows ?? []).length,
  };
}

async function main() {
  if (!fs.existsSync(WORKBOOK_PATH)) {
    throw new Error(`Planilha oficial nao encontrada: ${WORKBOOK_PATH}`);
  }
  if (!fs.existsSync(TOPICOS_FILE)) {
    throw new Error(`Arquivo nao encontrado: ${TOPICOS_FILE}`);
  }

  await ensureBackupDir();
  const backupSuffix = new Date().toISOString().replace(/[:.]/g, "-");

  const topicosBackup = await backupFile(TOPICOS_FILE, backupSuffix);
  const lancamentosBackup = await backupFile(LANCAMENTOS_FILE, backupSuffix);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(WORKBOOK_PATH);
  const worksheet = workbook.getWorksheet(WORKBOOK_SHEET) || workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("A planilha nao possui abas legiveis.");
  }

  const periodoFrom = dateCellToIsoDateUtc(worksheet.getCell("G4"));
  const periodoTo = dateCellToIsoDateUtc(worksheet.getCell("G7"));
  const rows = buildSheetRows(worksheet);

  if (rows.length === 0) {
    throw new Error("Nenhum topico valido encontrado na faixa esperada da planilha.");
  }

  const existingTopicos = await readJson(TOPICOS_FILE, []);
  const mergedTopicos = mergeTopicos(existingTopicos, rows);
  await writeJson(TOPICOS_FILE, mergedTopicos);

  const topicosByCanonicalName = new Map(
    mergedTopicos.map((topico) => [normalizeText(topico.nome), topico])
  );

  const { lancamentos, expectedByTopico } = buildLancamentosFromSheetRows(
    rows,
    topicosByCanonicalName,
    periodoFrom,
    periodoTo
  );
  validateTotals(lancamentos, expectedByTopico);

  await writeJson(LANCAMENTOS_FILE, lancamentos);

  let supabaseSummary = null;
  if (SUPABASE_ENABLED) {
    supabaseSummary = await replaceSupabaseLancamentos(lancamentos, backupSuffix);
  }

  console.log("Sincronizacao concluida com sucesso.");
  console.log(`Planilha: ${WORKBOOK_PATH}`);
  console.log(`Aba: ${worksheet.name}`);
  console.log(`Periodo: ${periodoFrom} ate ${periodoTo}`);
  console.log(`Topicos processados: ${rows.length}`);
  console.log(`Lancamentos sinteticos gerados: ${lancamentos.length}`);
  if (topicosBackup) console.log(`Backup topicos: ${topicosBackup}`);
  if (lancamentosBackup) console.log(`Backup lancamentos local: ${lancamentosBackup}`);
  if (supabaseSummary) {
    console.log(`Backup Supabase: ${supabaseSummary.snapshotPath}`);
    console.log(
      `Supabase ${SUPABASE_LANCAMENTOS_TABLE}: ${supabaseSummary.beforeCount} -> ${supabaseSummary.afterCount}`
    );
  } else {
    console.log("Supabase desabilitado: historico atualizado apenas em arquivo local.");
  }
}

main().catch((error) => {
  console.error("Falha na sincronizacao:", error.message || error);
  process.exit(1);
});
