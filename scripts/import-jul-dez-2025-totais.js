import "dotenv/config";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const DATA_DIR = path.join(rootDir, "data");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const TOPICOS_FILE = path.join(DATA_DIR, "topicos.json");
const LANCAMENTOS_FILE = path.join(DATA_DIR, "lancamentos.json");
const PENDING_SYNC_FILE = path.join(DATA_DIR, "lancamentos-pending-sync.json");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_LANCAMENTOS_TABLE = process.env.SUPABASE_LANCAMENTOS_TABLE || "lancamentos";
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

const IMPORT_TAG = "IMPORT_PDF_2025_OFICIAL";
const IMPORT_DESC_PREFIX = "IMPORT_JUL_DEZ_2025_COL5_OFICIAL";
const TARGET_DATE = "2025-12-31";
const INCLUDE_ZERO_LANCAMENTOS = false;

const OFFICIAL_TOTALS = [
  { nome: "Nurse 1", total: 116131.09, saldo: 152849.91 },
  { nome: "Nurse 2", total: 15597.05, saldo: 96478.95 },
  { nome: "Project Coordinator", total: 117861.68, saldo: -42182.68 },
  { nome: "Administrative Assistant 1", total: 19895.04, saldo: 46347.96 },
  { nome: "Administrative Assistant 2", total: 16091.93, saldo: 46839.07 },
  { nome: "Computer", total: 18250.75, saldo: 0.25 },
  { nome: "Didactic Material", total: 5774.18, saldo: 24225.82 },
  { nome: "Publications", total: 0, saldo: 25000.0 },
  { nome: "Technical Equipment & Infrastructure", total: 8444.0, saldo: 41556.0 },
  { nome: "Team Transportation & Meals", total: 1612.43, saldo: 28387.57 },
  { nome: "Events & Conferences", total: 0, saldo: 60000.0 },
  { nome: "Just Mine", total: 100000.0, saldo: 0.0 },
  { nome: "External Consultant", total: 0, saldo: 30000.0 },
  { nome: "Digital Marketing", total: 0, saldo: 20000.0 },
];

function round2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
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
    `${fileName}.import-jul-dez-2025.${suffix}${path.extname(filePath)}`
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

function makeLancamento(topicoId, topicoNome, value) {
  const { ano, semestre } = getAnoSemestre(TARGET_DATE);
  const nowIso = new Date().toISOString();
  return {
    id: uuidv4(),
    topicoId,
    data: TARGET_DATE,
    descricao: `${IMPORT_DESC_PREFIX} - ${topicoNome}`,
    fornecedor: IMPORT_TAG,
    responsavel: IMPORT_TAG,
    valor: round2(value),
    semestre,
    ano,
    criadoEm: nowIso,
    atualizadoEm: nowIso,
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

  const snapshotPath = path.join(
    BACKUP_DIR,
    `supabase-lancamentos.import-jul-dez-2025.${backupSuffix}.json`
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

  const topicoByCanonicalName = new Map(
    topicos.map((topico) => [normalizeText(topico.nome), { ...topico, id: String(topico.id) }])
  );

  if (OFFICIAL_TOTALS.length !== 14) {
    throw new Error(`Quantidade de topicos oficiais invalida: ${OFFICIAL_TOTALS.length}`);
  }

  const missingTopics = [];
  const mapped = [];

  for (const item of OFFICIAL_TOTALS) {
    const target = topicoByCanonicalName.get(normalizeText(item.nome));
    if (!target) {
      missingTopics.push(item.nome);
      continue;
    }

    const orcamento = Number(target.orcamentoProgramaBRL ?? 0);
    const saldoCalculado = round2(orcamento - Number(item.total));
    if (Math.abs(saldoCalculado - Number(item.saldo)) >= 0.01) {
      throw new Error(
        `Saldo divergente para ${item.nome}: esperado=${Number(item.saldo).toFixed(2)} calculado=${saldoCalculado.toFixed(2)}`
      );
    }

    mapped.push({
      ...item,
      topicoId: target.id,
      topicoNomeSistema: target.nome,
      orcamento,
    });
  }

  if (missingTopics.length > 0) {
    throw new Error(`Topicos oficiais nao encontrados no sistema: ${missingTopics.join(", ")}`);
  }

  const lancamentos = mapped
    .filter((item) => INCLUDE_ZERO_LANCAMENTOS || Number(item.total) > 0)
    .map((item) => makeLancamento(item.topicoId, item.topicoNomeSistema, Number(item.total)));

  const totalCarregado = round2(
    lancamentos.reduce((sum, item) => sum + Number(item.valor || 0), 0)
  );
  const expectedTotal = round2(
    OFFICIAL_TOTALS.reduce((sum, item) => sum + Number(item.total || 0), 0)
  );
  if (Math.abs(totalCarregado - expectedTotal) >= 0.01) {
    throw new Error(
      `Total carregado divergente: esperado=${expectedTotal.toFixed(2)} atual=${totalCarregado.toFixed(2)}`
    );
  }

  await writeJson(LANCAMENTOS_FILE, lancamentos);
  await writeJson(PENDING_SYNC_FILE, []);

  let supabaseSummary = null;
  if (SUPABASE_ENABLED) {
    supabaseSummary = await replaceSupabaseLancamentos(lancamentos, backupSuffix);
  }

  console.log("Importacao oficial Jul-Dez 2025 concluida com sucesso.");
  console.log(`Topicos oficiais validados: ${mapped.length}`);
  console.log(
    `Lancamentos gravados (compacto=${INCLUDE_ZERO_LANCAMENTOS ? "nao" : "sim"}): ${lancamentos.length}`
  );
  console.log(`Total oficial carregado: ${totalCarregado.toFixed(2)}`);
  if (backups.topicos) console.log(`Backup topicos: ${backups.topicos}`);
  if (backups.lancamentos) console.log(`Backup lancamentos: ${backups.lancamentos}`);
  if (backups.pendingSync) console.log(`Backup pending-sync: ${backups.pendingSync}`);

  if (supabaseSummary) {
    console.log(`Backup Supabase: ${supabaseSummary.snapshotPath}`);
    console.log(
      `Supabase ${SUPABASE_LANCAMENTOS_TABLE}: ${supabaseSummary.beforeCount} -> ${supabaseSummary.afterCount}`
    );
  } else {
    console.log("Supabase desabilitado: importacao aplicada apenas em arquivos locais.");
  }
}

main().catch((error) => {
  console.error("Falha na importacao Jul-Dez 2025:", error?.message || error);
  process.exit(1);
});
