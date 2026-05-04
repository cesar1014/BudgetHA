#!/usr/bin/env node
/**
 * make-super-admin.js
 *
 * Gera hash PBKDF2 para um super admin e imprime os SQLs de INSERT/UPDATE
 * para a tabela app_users do Supabase.
 *
 * Uso:
 *   node scripts/make-super-admin.js --username ADMIN --password SenhaForte123
 *
 * O script imprime no stdout os comandos SQL que você pode copiar
 * e executar no SQL Editor do Supabase.
 */

import { createPbkdf2Credential } from "../src/servidor/modulos/autenticacao/senhas.js";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--username" && argv[i + 1]) {
      args.username = argv[++i];
    } else if (argv[i] === "--password" && argv[i + 1]) {
      args.password = argv[++i];
    }
  }
  return args;
}

const args = parseArgs(process.argv);

if (!args.username || !args.password) {
  console.error("Uso: node scripts/make-super-admin.js --username ADMIN --password SenhaForte123");
  process.exit(1);
}

const username = args.username.trim();
const passwordHash = createPbkdf2Credential(args.password);
const userId = `user-${username.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
const now = new Date().toISOString();

console.log(`\n-- Super Admin: ${username}`);
console.log(`-- Gerado em: ${now}`);
console.log(`-- Password hash: ${passwordHash.slice(0, 30)}...\n`);

console.log(`-- INSERT (criar novo super admin):`);
console.log(
  `INSERT INTO public.app_users (id, username, password_hash, role, is_active, is_super_admin, created_at, updated_at, last_password_reset_at)`
);
console.log(`VALUES (`);
console.log(`  '${userId}',`);
console.log(`  '${username}',`);
console.log(`  '${passwordHash}',`);
console.log(`  'admin',`);
console.log(`  true,`);
console.log(`  true,`);
console.log(`  '${now}',`);
console.log(`  '${now}',`);
console.log(`  '${now}'`);
console.log(`) ON CONFLICT (id) DO UPDATE SET`);
console.log(`  password_hash = EXCLUDED.password_hash,`);
console.log(`  is_super_admin = true,`);
console.log(`  role = 'admin',`);
console.log(`  is_active = true,`);
console.log(`  updated_at = EXCLUDED.updated_at,`);
console.log(`  last_password_reset_at = EXCLUDED.last_password_reset_at;`);

console.log(`\n-- UPDATE (tornar usuario existente super admin):`);
console.log(`UPDATE public.app_users`);
console.log(`SET is_super_admin = true, role = 'admin', updated_at = '${now}'`);
console.log(`WHERE lower(btrim(username)) = lower('${username}');`);

console.log(`\n-- Ou alternativamente, grave este registro em DATA_DIR/auth/auth-users.json (modo local):`);
console.log(
  JSON.stringify(
    {
      id: userId,
      username,
      passwordHash,
      role: "admin",
      isActive: true,
      isSuperAdmin: true,
      allowedProjects: ["PEOCON"],
      rolesByProject: { PEOCON: "admin" },
      defaultProjectCode: "PEOCON",
    },
    null,
    2
  )
);

console.log(`\nPronto! Execute o SQL acima no Supabase SQL Editor.`);
