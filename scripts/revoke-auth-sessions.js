import { carregarVariaveisAmbiente } from "../src/servidor/config/ambiente.js";
carregarVariaveisAmbiente();
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { DATA_DIR, getAuthStoragePaths } from "../src/servidor/config/caminhos-runtime.js";

const runtimeDataDir = DATA_DIR;
const authPaths = getAuthStoragePaths(runtimeDataDir);
const localSessionsFile = authPaths.sessionsFile;
const legacyLocalSessionsFile = authPaths.legacySessionsFile;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseTable = process.env.SUPABASE_AUTH_SESSIONS_TABLE || "auth_sessions";

async function revokeLocalSessions() {
  await fs.mkdir(authPaths.authDataDir, { recursive: true });
  await fs.writeFile(localSessionsFile, "[]\n", "utf8");
  if (path.resolve(legacyLocalSessionsFile) !== path.resolve(localSessionsFile)) {
    await fs.writeFile(legacyLocalSessionsFile, "[]\n", "utf8");
  }
}

async function revokeSupabaseSessions() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return { skipped: true, reason: "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes." };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const { error } = await supabase
    .from(supabaseTable)
    .delete()
    .gte("created_at", "1970-01-01T00:00:00.000Z");

  if (error) {
    throw new Error(`Falha ao revogar sessoes no Supabase: ${error.message}`);
  }
  return { skipped: false };
}

async function main() {
  await revokeLocalSessions();
  const remote = await revokeSupabaseSessions();

  console.log(`[auth] Sessoes locais revogadas em ${localSessionsFile}`);
  if (remote.skipped) {
    console.log(`[auth] Revogacao remota ignorada: ${remote.reason}`);
  } else {
    console.log(`[auth] Sessoes remotas revogadas na tabela ${supabaseTable}.`);
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
