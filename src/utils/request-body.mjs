"use strict";

import { MAX_LOGGED_BODY_LENGTH } from '../config.mjs';

export function safeParseJson(value) {
  if (typeof value !== 'string') {
    return { ok: false, value: null };
  }

  try {
    return { ok: true, value: JSON.parse(value) };
  } catch {
    return { ok: false, value: null };
  }
}

function truncate(value, maxLength = MAX_LOGGED_BODY_LENGTH) {
  if (typeof value !== 'string') return value;
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength)}…[truncated ${value.length - maxLength} chars]`;
}

export function getBodyDetails(req) {
  if (req.body == null) {
    return {
      raw: null,
      parsed: null,
      parsedAsJson: false,
      bodyType: 'empty'
    };
  }

  if (typeof req.body === 'object') {
    const raw = JSON.stringify(req.body);

    return {
      raw: truncate(raw),
      parsed: req.body,
      parsedAsJson: true,
      bodyType: 'object',
      truncated: raw.length > MAX_LOGGED_BODY_LENGTH
    };
  }

  if (typeof req.body === 'string') {
    const parsed = safeParseJson(req.body);

    return {
      raw: truncate(req.body),
      parsed: parsed.value,
      parsedAsJson: parsed.ok,
      bodyType: 'string',
      truncated: req.body.length > MAX_LOGGED_BODY_LENGTH
    };
  }

  const fallback = String(req.body);

  return {
    raw: truncate(fallback),
    parsed: null,
    parsedAsJson: false,
    bodyType: typeof req.body,
    truncated: fallback.length > MAX_LOGGED_BODY_LENGTH
  };
}