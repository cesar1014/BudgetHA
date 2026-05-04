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
let createdLancamentoId = "";
let createdTopicoId = "";
const TRUSTED_HOST = "localhost";
const TRUSTED_ORIGIN = `http://${TRUSTED_HOST}`;

function withTrustedOrigin(requestBuilder) {
  return requestBuilder.set("Host", TRUSTED_HOST).set("Origin", TRUSTED_ORIGIN);
}

async function ensureLoggedIn() {
  const status = await agent.get("/api/auth/status");
  if (status.status === 200 && status.body?.authenticated) return;
  const login = await agent.post("/api/auth/login").send({
    username: "SMOKE_ADMIN",
    password: "SmokePass123!",
  });
  assert.equal(login.status, 200);
}

test.before(async () => {
  tempDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "site-relatorio-smoke-"));

  process.env.DATA_DIR = tempDataDir;
  process.env.SUPABASE_URL = "";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "";
  process.env.APP_PROJECT_CODE = "PEOCON";
  process.env.AUTH_TOKEN_SECRET = "smoke_test_token_secret_please_change";
  process.env.APP_LOGIN_USERS_JSON = JSON.stringify([
    {
      username: "SMOKE_ADMIN",
      passwordHash: createPbkdf2Credential("SmokePass123!"),
      role: "admin",
      allowedProjects: ["PEOCON"],
      defaultProjectCode: "PEOCON",
      isActive: true,
    },
  ]);

  const serverModuleUrl = `${pathToFileURL(path.resolve("server.js")).href}?test=${Date.now()}`;
  const { createServerApp } = await import(serverModuleUrl);
  app = await createServerApp();
  agent = request.agent(app);
});

test.after(async () => {
  try {
    await ensureLoggedIn();
  } catch {
    // Ignore cleanup auth failures.
  }
  if (createdLancamentoId) {
    await withTrustedOrigin(
      agent.delete(`/api/lancamentos/${encodeURIComponent(createdLancamentoId)}`)
    );
  }
  if (createdTopicoId) {
    await withTrustedOrigin(agent.delete(`/api/topicos/${encodeURIComponent(createdTopicoId)}`));
  }
  if (tempDataDir) {
    await fs.rm(tempDataDir, { recursive: true, force: true });
  }
});

test("GET /api/auth/status returns anonymous payload before login", async () => {
  const response = await agent.get("/api/auth/status");
  assert.equal(response.status, 200);
  assert.equal(response.body?.authenticated, false);
});

test("POST /api/auth/login authenticates with configured smoke user", async () => {
  const response = await agent.post("/api/auth/login").send({
    username: "SMOKE_ADMIN",
    password: "SmokePass123!",
  });

  assert.equal(response.status, 200);
  assert.equal(response.body?.authenticated, true);
  assert.equal(response.body?.username, "SMOKE_ADMIN");
});

test("GET /login sends CSP without unsafe-inline for styles", async () => {
  const response = await agent.get("/login");
  assert.equal(response.status, 200);
  const csp = String(response.headers["content-security-policy"] ?? "");
  assert.match(csp, /style-src 'self' https:\/\/fonts\.googleapis\.com/i);
  assert.match(csp, /style-src-attr 'none'/i);
  assert.doesNotMatch(csp, /unsafe-inline/i);
});

test("main UI places report charts inside the relatorios view", async () => {
  await ensureLoggedIn();

  const response = await agent.get("/");
  assert.equal(response.status, 200);
  const html = String(response.text ?? "");
  assert.match(html, /id="filter-data-inicio"/);
  assert.match(html, /id="filter-data-fim"/);

  const relatoriosSectionMatch = html.match(
    /<section class="view view-section" id="view-relatorios">([\s\S]*?)<\/section>/
  );
  assert.ok(relatoriosSectionMatch, "relatorios section should exist");
  const relatoriosSection = String(relatoriosSectionMatch?.[1] ?? "");
  assert.match(relatoriosSection, /id="group-distribution-chart"/);
  assert.match(relatoriosSection, /id="chart-bar"/);
  assert.doesNotMatch(relatoriosSection, /id="chart-pie"/);

  const resumoSectionMatch = html.match(
    /<section class="view view-section active" id="view-resumo">([\s\S]*?)<\/section>/
  );
  assert.ok(resumoSectionMatch, "resumo section should exist");
  const resumoSection = String(resumoSectionMatch?.[1] ?? "");
  assert.doesNotMatch(resumoSection, /id="group-distribution-chart"/);
  assert.doesNotMatch(resumoSection, /id="chart-bar"/);
});

test("core protected routes and export CSV work after login", async () => {
  await ensureLoggedIn();

  const health = await agent.get("/api/health");
  assert.equal(health.status, 200);
  assert.equal(health.body?.ok, true);
  assert.equal(health.body?.runtime?.persistenceMode, "arquivo_local");
  assert.equal(health.body?.supabase?.status, "disabled");
  assert.equal(health.body?.access?.role, "admin");
  assert.deepEqual(health.body?.access?.allowedProjects, ["PEOCON"]);

  const topicos = await agent.get("/api/topicos");
  assert.equal(topicos.status, 200);
  assert.ok(Array.isArray(topicos.body));
  assert.ok(topicos.body.length > 0);

  const lancavel = topicos.body.find(
    (item) => item?.permitirLancamentoEfetivo !== false && item?.permitirLancamento !== false
  );
  const topicoId = String(lancavel?.id ?? topicos.body[0]?.id ?? "");
  assert.ok(topicoId.length > 0);

  const created = await withTrustedOrigin(agent.post("/api/lancamentos")).send({
    topicoId,
    data: "2026-01-15",
    descricao: "Lancamento de smoke test",
    fornecedor: "Fornecedor QA",
    responsavel: "Equipe QA",
    valor: 123.45,
  });
  assert.equal(created.status, 201);
  assert.ok(typeof created.body?.id === "string" && created.body.id.length > 0);
  createdLancamentoId = created.body.id;

  const resumo = await agent.get("/api/resumo?ano=2026");
  assert.equal(resumo.status, 200);
  assert.ok(Array.isArray(resumo.body?.rows));
  assert.ok(typeof resumo.body?.indicadores === "object" && resumo.body.indicadores !== null);

  const csv = await agent.get("/api/export/csv?ano=2026");
  assert.equal(csv.status, 200);
  assert.match(String(csv.headers["content-type"] || ""), /text\/csv/i);
  assert.match(String(csv.text || ""), /Resumo por T/i);
});

test("topicos CRUD smoke: create and update", async () => {
  await ensureLoggedIn();

  const created = await withTrustedOrigin(agent.post("/api/topicos")).send({
    nome: "Smoke Topic",
    grupo: "DIRECT COSTS",
    orcamentoProgramaBRL: 1000,
    incluirNoResumo: true,
    permitirLancamento: true,
  });
  assert.equal(created.status, 201);
  createdTopicoId = String(created.body?.id ?? "");
  assert.ok(createdTopicoId.length > 0);

  const updated = await withTrustedOrigin(
    agent.put(`/api/topicos/${encodeURIComponent(createdTopicoId)}`)
  ).send({
    nome: "Smoke Topic Updated",
    grupo: "DIRECT COSTS",
    orcamentoProgramaBRL: 2000,
    incluirNoResumo: true,
    permitirLancamento: true,
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body?.nome, "Smoke Topic Updated");
});
