import crypto from "node:crypto";

const PBKDF2_PREFIX = "pbkdf2$";
const SUPPORTED_PBKDF2_DIGESTS = new Set(["sha256", "sha384", "sha512"]);
const BCRYPT_PREFIXES = ["$2a$", "$2b$", "$2y$"];

function normalizeBase64(rawValue) {
  const cleaned = String(rawValue ?? "").trim();
  if (!cleaned) {
    throw new Error("Salt/hash PBKDF2 vazio.");
  }
  if (!/^[A-Za-z0-9+/_=-]+$/.test(cleaned)) {
    throw new Error("Salt/hash PBKDF2 contém caracteres inválidos.");
  }

  const base64 = cleaned.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = base64.length % 4;
  if (remainder === 1) {
    throw new Error("Salt/hash PBKDF2 inválido.");
  }
  if (remainder === 0) return base64;
  return base64.padEnd(base64.length + (4 - remainder), "=");
}

function decodeBase64(rawValue) {
  const normalized = normalizeBase64(rawValue);
  return Buffer.from(normalized, "base64");
}

function parsePbkdf2Credential(rawCredential) {
  const credential = String(rawCredential ?? "").trim();
  const parts = credential.split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2") {
    throw new Error(
      "Hash PBKDF2 inválido. Use o formato pbkdf2$sha256$310000$saltBase64$hashBase64."
    );
  }

  const digest = String(parts[1] ?? "")
    .trim()
    .toLowerCase();
  if (!SUPPORTED_PBKDF2_DIGESTS.has(digest)) {
    throw new Error("Digest PBKDF2 não suportado. Use sha256, sha384 ou sha512.");
  }

  const iterations = Number(parts[2]);
  if (!Number.isInteger(iterations) || iterations < 100_000 || iterations > 5_000_000) {
    throw new Error("Iterações PBKDF2 inválidas. Use um valor entre 100000 e 5000000.");
  }

  const salt = decodeBase64(parts[3]);
  const hash = decodeBase64(parts[4]);
  if (salt.length < 16) {
    throw new Error("Salt PBKDF2 muito curto. Use ao menos 16 bytes.");
  }
  if (hash.length < 32) {
    throw new Error("Hash PBKDF2 muito curto. Use ao menos 32 bytes.");
  }

  return { digest, iterations, salt, hash };
}

function isUnsupportedHashPrefix(value) {
  const credential = String(value ?? "").trim();
  if (!credential) return false;
  if (BCRYPT_PREFIXES.some((prefix) => credential.startsWith(prefix))) return true;
  if (credential.startsWith("$argon2")) return true;
  return false;
}

export function safeEqualText(a, b) {
  const left = Buffer.from(String(a ?? ""), "utf8");
  const right = Buffer.from(String(b ?? ""), "utf8");
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function normalizeAuthCredential(passwordValue, passwordHashValue = "") {
  const passwordHash = String(passwordHashValue ?? "").trim();
  if (passwordHash) {
    if (passwordHash.startsWith(PBKDF2_PREFIX)) {
      parsePbkdf2Credential(passwordHash);
      return passwordHash;
    }
    if (isUnsupportedHashPrefix(passwordHash)) {
      throw new Error(
        "Hash de senha não suportado neste build. Use PBKDF2 no formato pbkdf2$sha256$310000$saltBase64$hashBase64."
      );
    }
    throw new Error("Formato de passwordHash inválido.");
  }

  const password = String(passwordValue ?? "");
  if (!password) return "";

  if (password.startsWith(PBKDF2_PREFIX)) {
    parsePbkdf2Credential(password);
    return password;
  }
  if (isUnsupportedHashPrefix(password)) {
    throw new Error(
      "Hash de senha não suportado neste build. Use PBKDF2 no formato pbkdf2$sha256$310000$saltBase64$hashBase64."
    );
  }

  return password;
}

export function verifyPassword(candidatePassword, storedCredential) {
  const candidate = String(candidatePassword ?? "");
  const stored = String(storedCredential ?? "");
  if (!stored) return false;

  if (!stored.startsWith(PBKDF2_PREFIX)) {
    return safeEqualText(candidate, stored);
  }

  try {
    const parsed = parsePbkdf2Credential(stored);
    const derived = crypto.pbkdf2Sync(
      Buffer.from(candidate, "utf8"),
      parsed.salt,
      parsed.iterations,
      parsed.hash.length,
      parsed.digest
    );
    return crypto.timingSafeEqual(derived, parsed.hash);
  } catch {
    return false;
  }
}

export function createPbkdf2Credential(password, options = {}) {
  const normalizedPassword = String(password ?? "");
  if (!normalizedPassword) {
    throw new Error("Informe uma senha para gerar o hash PBKDF2.");
  }

  const digest = String(options.digest ?? "sha256").toLowerCase();
  if (!SUPPORTED_PBKDF2_DIGESTS.has(digest)) {
    throw new Error("Digest PBKDF2 não suportado. Use sha256, sha384 ou sha512.");
  }

  const iterations = Number(options.iterations ?? 310_000);
  if (!Number.isInteger(iterations) || iterations < 100_000 || iterations > 5_000_000) {
    throw new Error("Iterações PBKDF2 inválidas. Use um valor entre 100000 e 5000000.");
  }

  const keyLength = Number(options.keyLength ?? 32);
  if (!Number.isInteger(keyLength) || keyLength < 32 || keyLength > 128) {
    throw new Error("Tamanho de hash PBKDF2 inválido. Use um valor entre 32 e 128 bytes.");
  }

  const salt = options.salt ? decodeBase64(options.salt) : crypto.randomBytes(16);
  if (salt.length < 16) {
    throw new Error("Salt PBKDF2 muito curto. Use ao menos 16 bytes.");
  }

  const hash = crypto.pbkdf2Sync(
    Buffer.from(normalizedPassword, "utf8"),
    salt,
    iterations,
    keyLength,
    digest
  );

  return `${PBKDF2_PREFIX}${digest}$${iterations}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}
