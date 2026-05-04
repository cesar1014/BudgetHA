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
let createdTopicoId = "";

const TRUSTED_HOST = "localhost";
const TRUSTED_ORIGIN = `http://${TRUSTED_HOST}`;

function withTrustedOrigin(requestBuilder) {
  return requestBuilder.set("Host", TRUSTED_HOST).set("Origin", TRUSTED_ORIGIN);
}

async function loginMultiRoleUser() {
  const response = await withTrustedOrigin(agent.post("/api/auth/login")).send({
    username: "MULTI_ROLE_USER",
    password: "MultiRolePass123!",
  });
  assert.equal(response.status, 200);
  return response.body;
}

async function selectProject(projectCode) {
  const response = await withTrustedOrigin(agent.post("/api/auth/active-project")).send({
    projectCode,
  });
  assert.equal(response.status, 200);
  return response.body;
}

test.before(async () => {
  tempDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "site-relatorio-project-role-"));

  process.env.DATA_DIR = tempDataDir;
  process.env.SUPABASE_URL = "";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "";
  process.env.APP_PROJECT_CODE = "PEOCON";
  process.env.AUTH_TOKEN_SECRET = "project_role_resolution_test_secret_please_change";
  process.env.APP_LOGIN_USERS_JSON = JSON.stringify([
    {
      username: "MULTI_ROLE_USER",
      passwordHash: createPbkdf2Credential("MultiRolePass123!"),
      role: "viewer",
      accountType: "user",
      allowedProjects: ["PEOCON", "FELLOW"],
      defaultProjectCode: "PEOCON",
      isActive: true,
      rolesByProject: {
        PEOCON: "viewer",
        FELLOW: "admin",
      },
    },
  ]);

  const serverModuleUrl = `${pathToFileURL(path.resolve("server.js")).href}?test=${Date.now()}`;
  const { createServerApp } = await import(serverModuleUrl);
  app = await createServerApp();
  agent = request.agent(app);
});

test.after(async () => {
  if (createdTopicoId) {
    await withTrustedOrigin(agent.delete(`/api/topicos/${encodeURIComponent(createdTopicoId)}`));
  }
  if (tempDataDir) {
    await fs.rm(tempDataDir, { recursive: true, force: true });
  }
});

test("active project switches the effective role and protected permissions", async () => {
  const login = await loginMultiRoleUser();
  assert.equal(login.requiresProjectSelection, true);

  const peocon = await selectProject("PEOCON");
  assert.equal(peocon.role, "viewer");
  assert.equal(peocon.permissions?.canManageConfig, false);
  assert.equal(peocon.permissions?.canWriteLancamentos, false);

  const forbidden = await withTrustedOrigin(agent.post("/api/topicos")).send({
    nome: "Topico Viewer Block",
    grupo: "DIRECT COSTS",
    orcamentoProgramaBRL: 100,
    incluirNoResumo: true,
    permitirLancamento: true,
  });
  assert.equal(forbidden.status, 403);

  const fellow = await selectProject("FELLOW");
  assert.equal(fellow.role, "admin");
  assert.equal(fellow.permissions?.canManageConfig, true);
  assert.equal(fellow.permissions?.canWriteLancamentos, true);

  const allowed = await withTrustedOrigin(agent.post("/api/topicos")).send({
    nome: "Topico Fellow Admin",
    grupo: "DIRECT COSTS",
    orcamentoProgramaBRL: 150,
    incluirNoResumo: true,
    permitirLancamento: true,
  });
  assert.equal(allowed.status, 201);
  createdTopicoId = String(allowed.body?.id ?? "");
  assert.ok(createdTopicoId.length > 0);
});
