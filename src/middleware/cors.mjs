import { ALLOWED_ORIGINS, IS_DEV } from '../config.mjs';

export function corsMiddleware(req, res, next) {
  const origin = req.get('origin');

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  } else if (origin && !IS_DEV) {
    console.warn(`[cors] blocked origin: ${origin} for ${req.method} ${req.originalUrl}`);
    return res.status(403).json({ error: 'Origin not allowed' });
  } else if (IS_DEV) {
    res.header('Access-Control-Allow-Origin', '*');
    console.log('Running in development mode');
    console.debug(`[cors] not blocked origin: ${origin} for ${req.method} ${req.originalUrl}`);
  }

  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
}