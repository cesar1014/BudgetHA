import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import request from "supertest";

let tempDataDir = "";
let app;
let superAdminAgent;
let regularUserAgent;

const TRUSTED_HOST = "localhost";
const TRUSTED_ORIGIN = `http://${TRUSTED_HOST}`;
const SUPER_ADMIN_USERNAME = "SUPER_ADMIN_TEST";
const SUPER_ADMIN_PASSWORD = "SuperPass123!";
const REGULAR_USERNAME = "REGULAR_USER_TEST";
const REGULAR_PASSWORD = "RegularPass123!";

function withTrustedOrigin(requestBuilder) {
  return requestBuilder.set("Host", TRUSTED_HOST).set("Origin", TRUSTED_ORIGIN);
}

async function loginSuperAdmin() {
  const response = await withTrustedOrigin(superAdminAgent.post("/api/auth/login")).send({
    username: SUPER_ADMIN_USERNAME,
    password: SUPER_ADMIN_PASSWORD,
  });
  assert.equal(response.status, 200);
}

async function loginRegularUser(username = REGULAR_USERNAME, password = REGULAR_PASSWORD) {
  const response = await withTrustedOrigin(regularUserAgent.post("/api/auth/login")).send({
    username,
    password,
  });
  assert.equal(response.status, 200);
  return response.body;
}

test.before(async () => {
  tempDataDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "site-relatorio-admin-username-session-")
  );

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
      username: REGULAR_USERNAME,
      password: REGULAR_PASSWORD,
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
  process.env.AUTH_TOKEN_SECRET = "admin_username_session_test_token_secret";
  process.env.APP_LOGIN_USERS_JSON = "";

  const serverModuleUrl = `${pathToFileURL(path.resolve("server.js")).href}?test=${Date.now()}`;
  const { createServerApp } = await import(serverModuleUrl);
  app = await createServerApp();
  superAdminAgent = request.agent(app);
  regularUserAgent = request.agent(app);
});

test.after(async () => {
  if (tempDataDir) {
    await fs.rm(tempDataDir, { recursive: true, force: true });
  }
});

test("admin rename revokes stale user session and allows login with new username", async () => {
  await loginSuperAdmin();
  await loginRegularUser();

  const overview = await superAdminAgent.get("/api/admin/overview");
  assert.equal(overview.status, 200);

  const regularUser = (overview.body?.users ?? []).find((user) => user?.username === REGULAR_USERNAME);
  assert.ok(regularUser?.id, "regular user test account should exist");

  const renamedUsername = "REGULAR_USER_RENAMED";
  const updated = await withTrustedOrigin(
    superAdminAgent.patch(`/api/admin/users/${encodeURIComponent(regularUser.id)}`)
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

  const staleStatus = await regularUserAgent.get("/api/auth/status");
  assert.equal(staleStatus.status, 200);
  assert.equal(staleStatus.body?.authenticated, false);

  const relogin = await loginRegularUser(renamedUsername);
  assert.equal(relogin.username, renamedUsername);
});
