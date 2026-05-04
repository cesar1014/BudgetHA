import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import request from "supertest";

let tempDataDir = "";
let app;
let agent;
let regularUserAgent;

const TRUSTED_HOST = "localhost";
const TRUSTED_ORIGIN = `http://${TRUSTED_HOST}`;
const SUPER_ADMIN_USERNAME = "SUPER_ADMIN_TEST";
const SUPER_ADMIN_PASSWORD = "SuperPass123!";

function withTrustedOrigin(requestBuilder) {
  return requestBuilder.set("Host", TRUSTED_HOST).set("Origin", TRUSTED_ORIGIN);
}

async function ensureSuperAdminLogin() {
  const status = await agent.get("/api/auth/status");
  if (status.status === 200 && status.body?.authenticated) return;
  const login = await withTrustedOrigin(agent.post("/api/auth/login")).send({
    username: SUPER_ADMIN_USERNAME,
    password: SUPER_ADMIN_PASSWORD,
  });
  assert.equal(login.status, 200);
  assert.equal(login.body?.isSuperAdmin, true);
}

async function getOverview() {
  await ensureSuperAdminLogin();
  const response = await agent.get("/api/admin/overview");
  assert.equal(response.status, 200);
  return response.body;
}

async function loginRegularUser(username = "REGULAR_USER_TEST", password = "RegularPass123!") {
  const response = await withTrustedOrigin(regularUserAgent.post("/api/auth/login")).send({
    username,
    password,
  });
  assert.equal(response.status, 200);
  return response.body;
}

test.before(async () => {
  tempDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "site-relatorio-admin-rules-"));

  const authUsersSeed = [
    {
      id: "super-admin-test",
      username: SUPER_ADMIN_USERNAME,
      password: SUPER_ADMIN_PASSWORD,
      role: "admin",
      accountType: "user",
      isSuperAdmin: true,
      isActive: true,
      allowedProjects: ["PEOCON", "FELLOW"],
      defaultProjectCode: "PEOCON",
      rolesByProject: {
        PEOCON: "admin",
        FELLOW: "admin",
      },
    },
    {
      id: "regular-user-test",
      username: "REGULAR_USER_TEST",
      password: "RegularPass123!",
      role: "viewer",
      accountType: "user",
      isSuperAdmin: false,
      isActive: true,
      allowedProjects: ["PEOCON"],
      defaultProjectCode: "PEOCON",
      rolesByProject: {
        PEOCON: "viewer",
      },
    },
  ];
  await fs.writeFile(
    path.join(tempDataDir, "auth-users.json"),
    JSON.stringify(authUsersSeed, null, 2),
    "utf8"
  );

  process.env.DATA_DIR = tempDataDir;
  process.env.SUPABASE_URL = "";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "";
  process.env.APP_PROJECT_CODE = "PEOCON";
  process.env.AUTH_TOKEN_SECRET = "admin_rules_test_token_secret_please_change";
  process.env.APP_LOGIN_USERS_JSON = "";

  const serverModuleUrl = `${pathToFileURL(path.resolve("server.js")).href}?test=${Date.now()}`;
  const { createServerApp } = await import(serverModuleUrl);
  app = await createServerApp();
  agent = request.agent(app);
  regularUserAgent = request.agent(app);
});

test.after(async () => {
  if (tempDataDir) {
    await fs.rm(tempDataDir, { recursive: true, force: true });
  }
});

test("POST /api/admin/users/create rejects accountType=project with multiple projects", async () => {
  await ensureSuperAdminLogin();

  const response = await withTrustedOrigin(agent.post("/api/admin/users/create")).send({
    username: "PROJECT_MULTI_CREATE",
    password: "ProjectPass123!",
    role: "viewer",
    accountType: "project",
    isActive: true,
    isSuperAdmin: false,
    rolesByProject: {
      PEOCON: "viewer",
      FELLOW: "viewer",
    },
  });

  assert.equal(response.status, 400);
  assert.match(
    String(response.body?.error ?? ""),
    /Conta de projeto deve ter exatamente 1 projeto permitido/i
  );
});

test("PATCH /api/admin/users/:id rejects accountType=project with multiple projects", async () => {
  await ensureSuperAdminLogin();

  const created = await withTrustedOrigin(agent.post("/api/admin/users/create")).send({
    username: "PROJECT_SINGLE_EDIT",
    password: "ProjectPass123!",
    role: "viewer",
    accountType: "project",
    isActive: true,
    isSuperAdmin: false,
    rolesByProject: {
      PEOCON: "viewer",
    },
  });
  assert.equal(created.status, 201);
  const userId = String(created.body?.user?.id ?? "");
  assert.ok(userId.length > 0);

  const updated = await withTrustedOrigin(
    agent.patch(`/api/admin/users/${encodeURIComponent(userId)}`)
  ).send({
    accountType: "project",
    isSuperAdmin: false,
    rolesByProject: {
      PEOCON: "viewer",
      FELLOW: "viewer",
    },
  });

  assert.equal(updated.status, 400);
  assert.match(
    String(updated.body?.error ?? ""),
    /Conta de projeto deve ter exatamente 1 projeto permitido/i
  );
});

test("POST /api/admin/users/create allows accountType=user with multiple projects", async () => {
  await ensureSuperAdminLogin();

  const created = await withTrustedOrigin(agent.post("/api/admin/users/create")).send({
    username: "USER_MULTI_OK",
    password: "UserPass123!",
    role: "viewer",
    accountType: "user",
    isActive: true,
    isSuperAdmin: false,
    rolesByProject: {
      PEOCON: "viewer",
      FELLOW: "editor",
    },
    defaultProjectCode: "FELLOW",
  });

  assert.equal(created.status, 201);
  assert.equal(created.body?.user?.accountType, "user");
  assert.deepEqual((created.body?.user?.allowedProjects ?? []).sort(), ["FELLOW", "PEOCON"]);
});

test("PATCH /api/admin/users/:id blocks removing privilege from last active super admin", async () => {
  const overview = await getOverview();
  const superAdmin = (overview?.users ?? []).find(
    (user) => user?.username === SUPER_ADMIN_USERNAME
  );
  assert.ok(superAdmin?.id, "super admin test user should exist");

  const response = await withTrustedOrigin(
    agent.patch(`/api/admin/users/${encodeURIComponent(superAdmin.id)}`)
  ).send({
    isSuperAdmin: false,
    accountType: "user",
    rolesByProject: {
      PEOCON: "admin",
      FELLOW: "admin",
    },
  });

  assert.equal(response.status, 400);
  assert.match(String(response.body?.error ?? ""), /ultimo super admin ativo/i);
});

test("PATCH /api/admin/users/:id revokes existing sessions when username changes", async () => {
  await ensureSuperAdminLogin();
  await loginRegularUser();

  const overview = await getOverview();
  const regularUser = (overview?.users ?? []).find((user) => user?.username === "REGULAR_USER_TEST");
  assert.ok(regularUser?.id, "regular user test account should exist");

  const renamedUsername = "REGULAR_USER_RENAMED";
  const updated = await withTrustedOrigin(
    agent.patch(`/api/admin/users/${encodeURIComponent(regularUser.id)}`)
  ).send({
    username: renamedUsername,
    accountType: "user",
    isActive: true,
    isSuperAdmin: false,
    rolesByProject: {
      PEOCON: "viewer",
    },
  });

  assert.equal(updated.status, 200);
  assert.equal(updated.body?.user?.username, renamedUsername);

  const staleSessionStatus = await regularUserAgent.get("/api/auth/status");
  assert.equal(staleSessionStatus.status, 200);
  assert.equal(staleSessionStatus.body?.authenticated, false);

  const relogin = await loginRegularUser(renamedUsername);
  assert.equal(relogin.username, renamedUsername);
});
