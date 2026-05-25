"use strict";

import {
  ALLOWED_ORIGINS,
  IS_DEV,
  CORS_ALLOWED_METHODS,
  CORS_ALLOWED_HEADERS,
  LOG_VERBOSE
} from '../config.mjs';

export function corsMiddleware(req, res, next) {
  const origin = req.get('origin');

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  } else if (origin && !IS_DEV) {
    if (LOG_VERBOSE) {
      console.warn(`[cors] blocked origin: ${origin} for ${req.method} ${req.originalUrl}`);
    }
    return res.status(403).json({ error: 'Origin not allowed' });
  } else if (IS_DEV) {
    res.header('Access-Control-Allow-Origin', '*');
    if (LOG_VERBOSE) {
      console.debug(`[cors] dev allow origin: ${origin || '(none)'} for ${req.method} ${req.originalUrl}`);
    }
  }

  res.header('Access-Control-Allow-Methods', CORS_ALLOWED_METHODS);
  res.header('Access-Control-Allow-Headers', CORS_ALLOWED_HEADERS);

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
}