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

const FILE_2024_DEFAULT =
  "C:\\Users\\User\\Downloads\\2nd Fundacao Pio XIIl Health Equity Expenditure Reporting 2024 (1).xlsx";
const FILE_2025_DEFAULT =
  "C:\\Users\\User\\Downloads\\Fundacao_Expenditure_Atualizado_2026-02-16 (2).xlsx";
const SHEET_NAME = "Expenditure";

const FILE_2024 = process.argv[2] || FILE_2024_DEFAULT;
const FILE_2025 = process.argv[3] || FILE_2025_DEFAULT;

const DATA_DIR = path.join(rootDir, "data");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const TOPICOS_FILE = path.join(DATA_DIR, "topicos.json");
const LANCAMENTOS_FILE = path.join(DATA_DIR, "lancamentos.json");
const PENDING_SYNC_FILE = path.join(DATA_DIR, "lancamentos-pending-sync.json");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_LANCAMENTOS_TABLE = process.env.SUPABASE_LANCAMENTOS_TABLE || "lancamentos";
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

const IMPORT_TAG = "IMPORT_RECON_2024_2025";
const DATE_2024 = "2024-12-31";
const DATE_2025 = "2025-12-31";

const IGNORE_TOPICS = new Set([
  "equipment",
  "team hires",
  "communications publications",
  "communications and publications",
  "third party services",
  "third party",
  "total budget and expenditure",
  "certification",
]);

const LEGACY_RATEIO_MAP = new Map([
  ["nurse", ["nurse-1", "nurse-2", "administrative-assistant-1", "administrative-assistant-2"]],
  [
    "audio visual producer",
    [
      "nurse-1",
      "nurse-2",
      "project-coordinator",
      "administrative-assistant-1",
      "administrative-assistant-2",
    ],
  ],
  ["prev life", ["just-mine", "external-consultant", "digital-marketing"]],
]);

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
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getAnoSemestre(dateIso) {
  const [anoText, mesText] = String(dateIso).split("-");
  const ano = Number(anoText);
  const mes = Number(mesText);
  return { ano, semestre: mes <= 6 ? "S1" : "S2" };
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
  const backupPath = path.join(
    BACKUP_DIR,
    `${fileName}.reconcile-2024-2025.${suffix}${path.extname(filePath)}`
  );
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

async function loadSheetTopicValues(filePath, columnKey) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo nao encontrado: ${filePath}`);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(SHEET_NAME) || workbook.worksheets[0];
  if (!worksheet) {
    throw new Error(`Aba nao encontrada em ${filePath}`);
  }

  const rows = [];
  for (let row = 1; row <= worksheet.rowCount; row += 1) {
    const topicName = String(worksheet.getCell(`A${row}`).text ?? "").trim();
    if (!topicName) continue;

    const normalized = normalizeText(topicName);
    if (!normalized) continue;
    if (IGNORE_TOPICS.has(normalized)) continue;
    if (normalized.startsWith("certification")) continue;

    const raw =
      worksheet.getCell(`${columnKey}${row}`).value ?? worksheet.getCell(`${columnKey}${row}`).text;
    const value = round2(toNumber(raw));
    if (!Number.isFinite(value) || value <= 0) continue;

    rows.push({
      row,
      topicName,
      normalized,
      value,
    });
  }

  return rows;
}

function distributeByBudget(totalValue, destinationIds, topicosById) {
  const destinations = destinationIds
    .map((id) => ({
      topicoId: id,
      budget: Number(topicosById.get(id)?.orcamentoProgramaBRL ?? 0),
    }))
    .filter((row) => row.budget > 0);

  if (destinations.length === 0) {
    throw new Error(`Nao ha orcamento valido para rateio em: ${destinationIds.join(", ")}`);
  }

  const totalBudget = destinations.reduce((sum, row) => sum + row.budget, 0);
  if (totalBudget <= 0) {
    throw new Error(`Soma de orcamentos invalida para rateio em: ${destinationIds.join(", ")}`);
  }

  const provisional = destinations.map((row) => ({
    ...row,
    value: round2((totalValue * row.budget) / totalBudget),
  }));

  const currentSum = round2(provisional.reduce((sum, row) => sum + row.value, 0));
  const residual = round2(totalValue - currentSum);
  if (Math.abs(residual) >= 0.01) {
    let maxBudgetIndex = 0;
    for (let i = 1; i < provisional.length; i += 1) {
      if (provisional[i].budget > provisional[maxBudgetIndex].budget) {
        maxBudgetIndex = i;
      }
    }
    provisional[maxBudgetIndex].value = round2(provisional[maxBudgetIndex].value + residual);
  }

  return provisional.map((row) => ({ topicoId: row.topicoId, value: row.value }));
}

function mapSourceValueToDestinations(row, topicoByCanonicalName, topicosById) {
  const directId = topicoByCanonicalName.get(row.normalized);
  if (directId) {
    return [{ topicoId: directId, value: row.value }];
  }

  const rateioDestinations = LEGACY_RATEIO_MAP.get(row.normalized);
  if (rateioDestinations) {
    return distributeByBudget(row.value, rateioDestinations, topicosById);
  }

  return null;
}

function makeLancamento({ topicoId, dateIso, descricao, value }) {
  const { ano, semestre } = getAnoSemestre(dateIso);
  const nowIso = new Date().toISOString();

  return {
    id: uuidv4(),
    topicoId,
    data: dateIso,
    descricao,
    fornecedor: IMPORT_TAG,
    responsavel: IMPORT_TAG,
    valor: round2(value),
    semestre,
    ano,
    criadoEm: nowIso,
    atualizadoEm: nowIso,
  };
}

function buildLancamentosFromRows(rows, sourceCode, dateIso, topicoByCanonicalName, topicosById) {
  const lancamentos = [];
  const unresolved = [];

  for (const row of rows) {
    const mapped = mapSourceValueToDestinations(row, topicoByCanonicalName, topicosById);
    if (!mapped) {
      unresolved.push(row);
      continue;
    }

    for (const item of mapped) {
      if (!item.topicoId || !Number.isFinite(item.value) || item.value <= 0) continue;
      lancamentos.push(
        makeLancamento({
          topicoId: item.topicoId,
          dateIso,
          value: item.value,
          descricao: `${sourceCode} - ${row.topicName}`,
        })
      );
    }
  }

  if (unresolved.length > 0) {
    const list = unresolved.map((row) => `${row.topicName} (linha ${row.row})`).join("; ");
    throw new Error(`Topicos sem mapeamento: ${list}`);
  }

  return lancamentos;
}

function sumValues(rows) {
  return round2(rows.reduce((sum, row) => sum + Number(row?.value ?? row?.valor ?? 0), 0));
}

function validateNoOrphans(lancamentos, topicosById) {
  const orphans = [
    ...new Set(lancamentos.map((item) => item.topicoId).filter((id) => !topicosById.has(id))),
  ];
  if (orphans.length > 0) {
    throw new Error(`Lancamentos orfaos encontrados: ${orphans.join(", ")}`);
  }
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

  const snapshotPath = path.join(
    BACKUP_DIR,
    `supabase-lancamentos.reconcile-2024-2025.${backupSuffix}.json`
  );
  await writeJson(snapshotPath, currentRows ?? []);

  const { error: deleteError } = await supabase
    .from(SUPABASE_LANCAMENTOS_TABLE)
    .delete()
    .not("id", "is", null);

  if (deleteError) {
    throw new Error(`Falha ao limpar lancamentos no Supabase: ${deleteError.message}`);
  }

  const payload = lancamentos.map((item) => ({
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
  }));

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

  const afterCount = (insertedRows ?? []).length;
  if (afterCount !== lancamentos.length) {
    throw new Error(
      `Contagem divergente no Supabase: esperado ${lancamentos.length}, obtido ${afterCount}`
    );
  }

  return {
    snapshotPath,
    beforeCount: (currentRows ?? []).length,
    afterCount,
  };
}

async function main() {
  if (!fs.existsSync(TOPICOS_FILE)) {
    throw new Error(`Arquivo nao encontrado: ${TOPICOS_FILE}`);
  }

  await ensureBackupDir();
  const backupSuffix = new Date().toISOString().replace(/[:.]/g, "-");

  const backups = {
    topicos: await backupFile(TOPICOS_FILE, backupSuffix),
    lancamentos: await backupFile(LANCAMENTOS_FILE, backupSuffix),
    pendingSync: await backupFile(PENDING_SYNC_FILE, backupSuffix),
  };

  const topicos = await readJson(TOPICOS_FILE, []);
  if (!Array.isArray(topicos) || topicos.length === 0) {
    throw new Error("Arquivo data/topicos.json vazio ou invalido.");
  }

  const topicosById = new Map(topicos.map((topico) => [String(topico.id), topico]));
  const topicoByCanonicalName = new Map(
    topicos.map((topico) => [normalizeText(topico.nome), String(topico.id)])
  );

  const rows2024D = await loadSheetTopicValues(FILE_2024, "D");
  const rows2025D = await loadSheetTopicValues(FILE_2025, "D");

  const total2024Source = sumValues(rows2024D);
  const total2025Source = sumValues(rows2025D);

  const lancamentos2024 = buildLancamentosFromRows(
    rows2024D,
    "RECON_2024_D",
    DATE_2024,
    topicoByCanonicalName,
    topicosById
  );
  const lancamentos2025 = buildLancamentosFromRows(
    rows2025D,
    "RECON_2025_D",
    DATE_2025,
    topicoByCanonicalName,
    topicosById
  );

  const total2024Generated = sumValues(lancamentos2024);
  const total2025Generated = sumValues(lancamentos2025);

  if (Math.abs(total2024Source - total2024Generated) >= 0.01) {
    throw new Error(
      `Divergencia no total 2024 D: fonte=${total2024Source.toFixed(2)} gerado=${total2024Generated.toFixed(2)}`
    );
  }
  if (Math.abs(total2025Source - total2025Generated) >= 0.01) {
    throw new Error(
      `Divergencia no total 2025 D: fonte=${total2025Source.toFixed(2)} gerado=${total2025Generated.toFixed(2)}`
    );
  }

  const lancamentosFinal = [...lancamentos2024, ...lancamentos2025].sort((a, b) => {
    if (a.data === b.data) return String(a.topicoId).localeCompare(String(b.topicoId));
    return String(a.data).localeCompare(String(b.data));
  });

  validateNoOrphans(lancamentosFinal, topicosById);

  await writeJson(LANCAMENTOS_FILE, lancamentosFinal);
  await writeJson(PENDING_SYNC_FILE, []);

  let supabaseSummary = null;
  if (SUPABASE_ENABLED) {
    supabaseSummary = await replaceSupabaseLancamentos(lancamentosFinal, backupSuffix);
  }

  const totalCombined = round2(total2024Generated + total2025Generated);

  console.log("Reconciliacao concluida com sucesso.");
  console.log(`Planilha 2024 (coluna D): ${FILE_2024}`);
  console.log(`Planilha 2025 (coluna D): ${FILE_2025}`);
  console.log(`Total 2024 S2 oficial: ${total2024Generated.toFixed(2)}`);
  console.log(`Total 2025 S2 oficial: ${total2025Generated.toFixed(2)}`);
  console.log(`Total combinado: ${totalCombined.toFixed(2)}`);
  console.log(`Lancamentos gerados: ${lancamentosFinal.length}`);
  if (backups.topicos) console.log(`Backup topicos: ${backups.topicos}`);
  if (backups.lancamentos) console.log(`Backup lancamentos: ${backups.lancamentos}`);
  if (backups.pendingSync) console.log(`Backup pending-sync: ${backups.pendingSync}`);

  if (supabaseSummary) {
    console.log(`Backup Supabase: ${supabaseSummary.snapshotPath}`);
    console.log(
      `Supabase ${SUPABASE_LANCAMENTOS_TABLE}: ${supabaseSummary.beforeCount} -> ${supabaseSummary.afterCount}`
    );
  } else {
    console.log("Supabase desabilitado: reconciliacao aplicada apenas em arquivos locais.");
  }
}

main().catch((error) => {
  console.error("Falha na reconciliacao:", error?.message || error);
  process.exit(1);
});
