import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RAIZ_PROJETO = path.resolve(__dirname, "..", "..", "..");

function limparValor(valor) {
  let texto = String(valor ?? "").trim();
  if (
    (texto.startsWith('"') && texto.endsWith('"')) ||
    (texto.startsWith("'") && texto.endsWith("'"))
  ) {
    texto = texto.slice(1, -1);
  }
  return texto.replace(/\\n/g, "\n");
}

export function carregarVariaveisAmbiente(caminhoArquivo = path.join(RAIZ_PROJETO, ".env")) {
  if (!fs.existsSync(caminhoArquivo)) {
    return { carregado: false, caminho: caminhoArquivo };
  }

  const conteudo = fs.readFileSync(caminhoArquivo, "utf-8");
  for (const linhaOriginal of conteudo.split(/\r?\n/)) {
    const linha = linhaOriginal.trim();
    if (!linha || linha.startsWith("#")) continue;

    const indiceIgual = linha.indexOf("=");
    if (indiceIgual <= 0) continue;

    const chave = linha.slice(0, indiceIgual).trim();
    const valor = limparValor(linha.slice(indiceIgual + 1));

    if (!chave || Object.prototype.hasOwnProperty.call(process.env, chave)) continue;
    process.env[chave] = valor;
  }

  return { carregado: true, caminho: caminhoArquivo };
}
