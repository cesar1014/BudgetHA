import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import request from "supertest";
import { createPbkdf2Credential } from "../src/servidor/modulos/autenticacao/senhas.js";

let tempDataDir = "";
let app;
let agent;

const TRUSTED_HOST = "localhost";
const TRUSTED_ORIGIN = `http://${TRUSTED_HOST}`;

function withTrustedOrigin(requestBuilder) {
  return requestBuilder.set("Host", TRUSTED_HOST).set("Origin", TRUSTED_ORIGIN);
}

test.before(async () => {
  tempDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "site-relatorio-project-account-"));

  process.env.DATA_DIR = tempDataDir;
  process.env.SUPABASE_URL = "";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "";
  process.env.APP_PROJECT_CODE = "PEOCON";
  process.env.AUTH_TOKEN_SECRET = "project_account_login_test_secret_please_change";
  process.env.APP_LOGIN_USERS_JSON = JSON.stringify([
    {
      username: "PROJECT_ACCOUNT_TEST",
      passwordHash: createPbkdf2Credential("ProjectAccountPass123!"),
      role: "viewer",
      accountType: "project",
      isActive: true,
      allowedProjects: ["PEOCON"],
      defaultProjectCode: "PEOCON",
      rolesByProject: {
        PEOCON: "viewer",
      },
    },
  ]);

  const serverModuleUrl = `${pathToFileURL(path.resolve("server.js")).href}?test=${Date.now()}`;
  const { createServerApp } = await import(serverModuleUrl);
  app = await createServerApp();
  agent = request.agent(app);
});

test.after(async () => {
  if (tempDataDir) {
    await fs.rm(tempDataDir, { recursive: true, force: true });
  }
});

test("project account login keeps project-scoped session semantics", async () => {
  const login = await withTrustedOrigin(agent.post("/api/auth/login")).send({
    username: "PROJECT_ACCOUNT_TEST",
    password: "ProjectAccountPass123!",
  });

  assert.equal(login.status, 200);
  assert.equal(login.body?.authenticated, true);
  assert.equal(login.body?.accountType, "project");
  assert.equal(login.body?.requiresProjectSelection, false);
  assert.equal(login.body?.activeProjectCode, "PEOCON");
  assert.equal(login.body?.projectCode, "PEOCON");
  assert.equal(login.body?.role, "viewer");
  assert.equal(login.body?.allowedProjects?.length, 1);
  assert.equal(login.body?.allowedProjects?.[0]?.code, "PEOCON");
  assert.equal(login.body?.projectAccess?.length, 1);
  assert.equal(login.body?.projectAccess?.[0]?.projectCode, "PEOCON");
  assert.equal(login.body?.projectAccess?.[0]?.role, "viewer");
});
