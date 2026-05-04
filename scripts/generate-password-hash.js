import { createPbkdf2Credential } from "../src/servidor/modulos/autenticacao/senhas.js";

function parseArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return "";
  return String(process.argv[index + 1] ?? "");
}

const password = parseArg("--password");
const digest = parseArg("--digest") || "sha256";
const iterationsRaw = parseArg("--iterations");
const iterations = iterationsRaw ? Number(iterationsRaw) : undefined;

if (!password) {
  console.error(
    "Uso: node scripts/generate-password-hash.js --password SUA_SENHA [--digest sha256] [--iterations 310000]"
  );
  process.exit(1);
}

try {
  const hash = createPbkdf2Credential(password, { digest, iterations });
  console.log(hash);
} catch (error) {
  console.error(error?.message || error);
  process.exit(1);
}
