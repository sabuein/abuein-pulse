"use strict";

import os from "node:os";
import path from "node:path";

function parsePort(value, fallback = 3000) {
    const parsed = Number.parseInt(value ?? "", 10);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        return fallback;
    }
    return parsed;
}

function parseNodeEnv(value) {
    const normalized = (value || "development").trim();
    const allowed = new Set(["development", "test", "production"]);
    return allowed.has(normalized) ? normalized : "development";
}

function parseAllowedOrigins(value) {
    return new Set(
        (value || "")
            .split(",")
            .map((origin) => origin.trim())
            .filter(Boolean)
    );
}

function parseBoolean(value, fallback = false) {
    if (value == null) return fallback;
    return String(value).trim().toLowerCase() === "true";
}

function parseNumber(value, fallback) {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const PORT = parsePort(process.env.PORT, 3000);
export const NODE_ENV = parseNodeEnv(process.env.NODE_ENV);
export const IS_DEV = NODE_ENV === "development";
export const IS_PROD = NODE_ENV === "production";

export const LOG_DIR = path.join(os.homedir(), "abuein-pulse-logs");
export const FEEDBACK_LOG_FILE = path.join(LOG_DIR, "feedback.log");
export const ATTRIBUTION_LOG_FILE = path.join(LOG_DIR, "track-attribution.log");

export const ALLOWED_ORIGINS = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);

export const CORS_ALLOWED_METHODS = "POST, GET, OPTIONS";
export const CORS_ALLOWED_HEADERS = "Content-Type";

export const LOG_VERBOSE = parseBoolean(process.env.LOG_VERBOSE, false);
export const LOG_INCLUDE_HEADERS = parseBoolean(process.env.LOG_INCLUDE_HEADERS, false);
export const MAX_LOGGED_BODY_LENGTH = parseNumber(process.env.MAX_LOGGED_BODY_LENGTH, 2000);

if (IS_PROD && ALLOWED_ORIGINS.size === 0) {
    throw new Error("ALLOWED_ORIGINS must be set in production");
}
