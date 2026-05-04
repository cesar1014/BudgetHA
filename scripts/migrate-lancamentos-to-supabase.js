import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE = process.env.SUPABASE_LANCAMENTOS_TABLE || "lancamentos";
const sourceFile = path.join(rootDir, "data", "lancamentos.json");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de executar o script.");
  process.exit(1);
}

if (!fs.existsSync(sourceFile)) {
  console.error(`Arquivo nao encontrado: ${sourceFile}`);
  process.exit(1);
}

const raw = fs.readFileSync(sourceFile, "utf8");
const lancamentos = JSON.parse(raw);

if (!Array.isArray(lancamentos) || lancamentos.length === 0) {
  console.log("Nenhum lancamento para migrar.");
  process.exit(0);
}

const payload = lancamentos.map((item) => ({
  id: item.id,
  topico_id: item.topicoId,
  data: item.data,
  descricao: item.descricao,
  fornecedor: item.fornecedor ?? "",
  responsavel: item.responsavel ?? "",
  valor: item.valor,
  semestre: item.semestre,
  ano: item.ano,
  criado_em: item.criadoEm ?? new Date().toISOString(),
  atualizado_em: item.atualizadoEm ?? new Date().toISOString(),
}));

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: "id" });

if (error) {
  console.error("Falha na migracao:", error.message);
  process.exit(1);
}

console.log(`Migracao concluida com sucesso. Itens enviados: ${payload.length}`);
