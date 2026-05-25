"use strict";

import fs from 'node:fs/promises';
import path from 'node:path';
import { LOG_DIR, LOG_VERBOSE } from '../config.mjs';

await fs.mkdir(LOG_DIR, { recursive: true });

function getDatedLogPath(filePath, date = new Date()) {
  const day = date.toISOString().slice(0, 10);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const dir = path.dirname(filePath);

  return path.join(dir, `${base}-${day}${ext}`);
}

export async function appendLog(filePath, label, entry) {
  const rotatedPath = getDatedLogPath(filePath);
  const line = `${JSON.stringify(entry)}\n`;

  if (LOG_VERBOSE) {
    console.log(`[${label}] ${entry.receivedAt}`);
    console.dir(entry, { depth: null, colors: true });
  }

  await fs.appendFile(rotatedPath, line, 'utf8');
}