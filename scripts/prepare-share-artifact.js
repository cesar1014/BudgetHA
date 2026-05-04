#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { PROJECT_ROOT } from "../src/servidor/config/caminhos-runtime.js";
import {
  assertArtifactHasNoSensitivePaths,
  normalizeRelativePath,
  shouldIncludeInShareArtifact,
} from "./security-artifact-utils.js";

const OUTPUT_DIR = path.join(PROJECT_ROOT, "exports", "share");

async function copyTree(sourceDir, targetDir) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const relativePath = normalizeRelativePath(PROJECT_ROOT, sourcePath);
    if (!shouldIncludeInShareArtifact(relativePath)) continue;

    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      await fs.mkdir(targetPath, { recursive: true });
      await copyTree(sourcePath, targetPath);
      continue;
    }

    if (entry.isFile()) {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

async function main() {
  await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  await copyTree(PROJECT_ROOT, OUTPUT_DIR);
  await assertArtifactHasNoSensitivePaths(OUTPUT_DIR);

  console.log(`[package] Artefato seguro preparado em ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
