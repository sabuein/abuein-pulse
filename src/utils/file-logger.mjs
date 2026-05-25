import fs from 'node:fs/promises';
import { LOG_DIR, LOG_VERBOSE } from '../config.mjs';

await fs.mkdir(LOG_DIR, { recursive: true });

export async function appendLog(filePath, label, entry) {
  const line = `${JSON.stringify(entry)}\n`;

  if (LOG_VERBOSE) {
    console.log(`[${label}] ${entry.receivedAt}`);
    console.dir(entry, { depth: null, colors: true });
  }

  await fs.appendFile(filePath, line, 'utf8');
}