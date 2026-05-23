import os from 'node:os';
import path from 'node:path';

function parsePort(value, fallback = 3000) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    return fallback;
  }
  return parsed;
}

function parseNodeEnv(value) {
  const normalized = (value || 'development').trim();
  const allowed = new Set(['development', 'test', 'production']);
  return allowed.has(normalized) ? normalized : 'development';
}

function parseAllowedOrigins(value) {
  return new Set(
    (value || '')
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
  );
}

export const PORT = parsePort(process.env.PORT, 3000);
export const NODE_ENV = parseNodeEnv(process.env.NODE_ENV);
export const IS_DEV = NODE_ENV === 'development';
export const IS_PROD = NODE_ENV === 'production';

export const LOG_DIR = path.join(os.homedir(), 'abuein-pulse-logs');
export const FEEDBACK_LOG_FILE = path.join(LOG_DIR, 'feedback.log');
export const ATTRIBUTION_LOG_FILE = path.join(LOG_DIR, 'track-attribution.log');

export const ALLOWED_ORIGINS = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);

export const CORS_ALLOWED_METHODS = 'POST, GET, OPTIONS';
export const CORS_ALLOWED_HEADERS = 'Content-Type';

export const LOG_VERBOSE = process.env.LOG_VERBOSE === 'true';

if (IS_PROD && ALLOWED_ORIGINS.size === 0) {
  throw new Error('ALLOWED_ORIGINS must be set in production');
}