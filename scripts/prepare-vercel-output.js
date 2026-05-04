import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const sourceDir = path.join(projectRoot, "public");
const outputDir = path.join(projectRoot, "dist");

if (!fs.existsSync(sourceDir)) {
  throw new Error("Diretorio public/ nao encontrado para preparar o deploy.");
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.cpSync(sourceDir, outputDir, { recursive: true });

console.log("Diretorio de saida preparado em dist/");
