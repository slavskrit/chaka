import fs from "fs";
import os from "os";
import path from "path";
import { logger } from "../core_api/src/logger";

export function createTempDirectory(suffix: string) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), suffix));
  logger.info(`Temp dir is created: ${suffix}`);
  return tempDir;
}
