#!/usr/bin/env node
import path from "node:path";
import { PROJECT_ROOT } from "../src/servidor/config/caminhos-runtime.js";
import { assertArtifactHasNoSensitivePaths } from "./security-artifact-utils.js";

async function main() {
  const targetArg = process.argv[2];
  const targetDir = targetArg ? path.resolve(targetArg) : PROJECT_ROOT;

  await assertArtifactHasNoSensitivePaths(targetDir);
  console.log(`[security] Nenhum arquivo sensivel encontrado em ${targetDir}`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
