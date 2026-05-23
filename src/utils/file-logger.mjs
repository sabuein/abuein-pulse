import fs from 'node:fs';
import { LOG_DIR } from '../config.mjs';

fs.mkdirSync(LOG_DIR, { recursive: true });

export function appendLog(filePath, label, entry) {
  const line = `${JSON.stringify(entry)}\n`;

  console.log(`[${label}] ${entry.receivedAt}`);
  console.dir(entry, { depth: null, colors: true });

  fs.appendFile(filePath, line, 'utf8', err => {
    if (err) {
      console.error(`[${label}] Failed to write log file:`, err);
    }
  });
}