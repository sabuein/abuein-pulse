import os from 'node:os';
import path from 'node:path';

export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_DEV = NODE_ENV === 'development';

export const LOG_DIR = path.join(os.homedir(), 'abuein-pulse-logs');
export const FEEDBACK_LOG_FILE = path.join(LOG_DIR, 'feedback.log');
export const ATTRIBUTION_LOG_FILE = path.join(LOG_DIR, 'track-attribution.log');

export const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
);