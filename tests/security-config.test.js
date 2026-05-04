import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { createPbkdf2Credential } from "../src/servidor/modulos/autenticacao/senhas.js";

const serverModuleBaseUrl = pathToFileURL(path.resolve("server.js")).href;

async function importFreshServerModule() {
  return import(`${serverModuleBaseUrl}?security-test=${Date.now()}-${Math.random()}`);
}

async function withIsolatedEnv(overrides, fn) {
  const previousEnv = { ...process.env };
  try {
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    Object.assign(process.env, previousEnv, overrides);
    await fn();
  } finally {
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    Object.assign(process.env, previousEnv);
  }
}

test("production startup rejects APP_LOGIN_USERS_JSON with plaintext password", async () => {
  const tempDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "site-relatorio-security-env-"));

  try {
    await withIsolatedEnv(
      {
        NODE_ENV: "production",
        DATA_DIR: tempDataDir,
        SUPABASE_URL: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
        APP_PROJECT_CODE: "PEOCON",
        AUTH_TOKEN_SECRET: "production_security_test_token_secret_please_rotate",
        APP_LOGIN_USERS_JSON: JSON.stringify([
          {
            username: "ADMIN",
            password: "PlaintextPass123!",
            role: "admin",
            allowedProjects: ["PEOCON"],
            defaultProjectCode: "PEOCON",
          },
        ]),
      },
      async () => {
        await assert.rejects(
          importFreshServerModule(),
          /APP_LOGIN_USERS_JSON aceita apenas passwordHash PBKDF2/i
        );
      }
    );
  } finally {
    await fs.rm(tempDataDir, { recursive: true, force: true });
  }
});

test("production startup accepts Vercel admin bootstrap variables", async () => {
  const tempDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "site-relatorio-vercel-admin-"));

  try {
    const result = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", 'const mod = await import("./server.js"); console.log(typeof mod.createServerApp);'],
      {
        cwd: path.resolve("."),
        env: {
          ...process.env,
          NODE_ENV: "production",
          VERCEL: "1",
          DATA_DIR: tempDataDir,
          SUPABASE_URL: "",
          SUPABASE_SERVICE_ROLE_KEY: "",
          APP_PROJECT_CODE: "PEOCON",
          AUTH_TOKEN_SECRET: "vercel_admin_bootstrap_secret_please_rotate",
          APP_LOGIN_USERS_JSON: "",
          ADMIN_USERNAME: "ADMIN",
          ADMIN_PASSWORD: "StrongPass123!",
          ADMIN_PROJECTS: "PEOCON,FELLOW",
          ADMIN_DEFAULT_PROJECT: "PEOCON",
        },
        encoding: "utf8",
      }
    );
    assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
    assert.match(result.stdout, /function/);
  } finally {
    await fs.rm(tempDataDir, { recursive: true, force: true });
  }
});

test("production startup rejects DATA_DIR inside repository", async () => {
  const repoDataDir = path.join(path.resolve("."), "runtime-inside-repo");
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", 'import "./server.js";'],
    {
      cwd: path.resolve("."),
      env: {
        ...process.env,
        NODE_ENV: "production",
        DATA_DIR: repoDataDir,
        SUPABASE_URL: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
        APP_PROJECT_CODE: "PEOCON",
        AUTH_TOKEN_SECRET: "another_production_security_test_token_secret_please_rotate",
        APP_LOGIN_USERS_JSON: JSON.stringify([
          {
            username: "ADMIN",
            passwordHash: createPbkdf2Credential("StrongPass123!"),
            role: "admin",
            allowedProjects: ["PEOCON"],
            defaultProjectCode: "PEOCON",
          },
        ]),
      },
      encoding: "utf8",
    }
  );

  assert.notEqual(result.status, 0);
  assert.match(
    `${result.stderr}\n${result.stdout}`,
    /DATA_DIR inseguro para producao/i
  );
});
