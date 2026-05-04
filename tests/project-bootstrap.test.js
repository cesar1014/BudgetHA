import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

let tempDataDir = "";
let bootstrapProjectRuntime;
let getKnownProjectCodes;

test.before(async () => {
  tempDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "site-relatorio-project-bootstrap-"));

  process.env.DATA_DIR = tempDataDir;
  process.env.SUPABASE_URL = "";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "";
  process.env.APP_PROJECT_CODE = "PEOCON";
  process.env.AUTH_TOKEN_SECRET = "project_bootstrap_test_secret_please_change";
  process.env.APP_LOGIN_USERS_JSON = "";

  const serverModuleUrl = `${pathToFileURL(path.resolve("server.js")).href}?test=${Date.now()}`;
  const serverModule = await import(serverModuleUrl);
  await serverModule.createServerApp();
  bootstrapProjectRuntime = serverModule.bootstrapProjectRuntime;
  getKnownProjectCodes = serverModule.getKnownProjectCodes;
});

test.after(async () => {
  if (tempDataDir) {
    await fs.rm(tempDataDir, { recursive: true, force: true });
  }
});

test("bootstrapProjectRuntime seeds a new project from the default template source", async () => {
  const seedTopicos = JSON.parse(
    await fs.readFile(path.join("data", "seeds", "PEOCON", "topicos.json"), "utf8")
  );

  const result = await bootstrapProjectRuntime("ALFA_TEST");
  assert.equal(result?.projectCode, "ALFA_TEST");
  assert.equal(result?.templateSourceProjectCode, "PEOCON");
  assert.ok(result?.topicosCount > 0);

  const topicosFile = path.join(tempDataDir, "ALFA_TEST", "topicos.json");
  const appConfigFile = path.join(tempDataDir, "ALFA_TEST", "app-config.json");
  const topicos = JSON.parse(await fs.readFile(topicosFile, "utf8"));
  const appConfig = JSON.parse(await fs.readFile(appConfigFile, "utf8"));

  assert.equal(topicos.length, seedTopicos.length);
  assert.equal(topicos[0]?.id, seedTopicos[0]?.id);
  assert.deepEqual(appConfig, { teamHiresUnlocked: false });
  assert.ok(getKnownProjectCodes().includes("ALFA_TEST"));
});
