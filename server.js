import path from "node:path";
import { fileURLToPath } from "node:url";
import { carregarVariaveisAmbiente } from "./src/servidor/config/ambiente.js";

carregarVariaveisAmbiente();

const aplicacao = await import("./src/servidor/aplicacao.js");

export const createServerApp = aplicacao.createServerApp;
export const startServer = aplicacao.startServer;
export const bootstrapProjectRuntime = aplicacao.bootstrapProjectRuntime;
export const getKnownProjectCodes = aplicacao.getKnownProjectCodes;
export const getSupabaseRuntimeSummary = aplicacao.getSupabaseRuntimeSummary;

const arquivoAtual = path.resolve(fileURLToPath(import.meta.url));
const arquivoEntrada = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (arquivoAtual === arquivoEntrada) {
  await aplicacao.startServer(process.env.PORT || 3000);
}
