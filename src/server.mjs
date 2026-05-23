import express from 'express';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV === 'development';
const IS_PROD = NODE_ENV === 'production';
const LOG_DIR = path.join(os.homedir(), 'abuein-pulse-logs');
const FEEDBACK_LOG_FILE = path.join(LOG_DIR, 'feedback.log');
const ATTRIBUTION_LOG_FILE = path.join(LOG_DIR, 'track-attribution.log');
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
);

fs.mkdirSync(LOG_DIR, { recursive: true });

app.use((req, res, next) => {
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
});

app.use(express.json({ limit: '100kb' }));
app.use(express.text({ type: '*/*', limit: '100kb' }));

function safeParseJson(value) {
  if (typeof value !== 'string') {
    return { ok: false, value: null };
  }

  try {
    return { ok: true, value: JSON.parse(value) };
  } catch {
    return { ok: false, value: null };
  }
}

function getBodyDetails(req) {
  if (req.body == null) {
    return {
      raw: null,
      parsed: null,
      parsedAsJson: false,
      bodyType: 'empty'
    };
  }

  if (typeof req.body === 'object') {
    return {
      raw: JSON.stringify(req.body),
      parsed: req.body,
      parsedAsJson: true,
      bodyType: 'object'
    };
  }

  if (typeof req.body === 'string') {
    const parsed = safeParseJson(req.body);

    return {
      raw: req.body,
      parsed: parsed.value,
      parsedAsJson: parsed.ok,
      bodyType: 'string'
    };
  }

  return {
    raw: String(req.body),
    parsed: null,
    parsedAsJson: false,
    bodyType: typeof req.body
  };
}

function buildRequestSnapshot(req, kind) {
  const body = getBodyDetails(req);

  return {
    receivedAt: new Date().toISOString(),
    kind,
    request: {
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      protocol: req.protocol,
      host: req.get('host') || '',
      ip: req.ip,
      contentLength: req.get('content-length') || '',
      contentType: req.get('content-type') || '',
      origin: req.get('origin') || '',
      referer: req.get('referer') || '',
      userAgent: req.get('user-agent') || '',
      accept: req.get('accept') || '',
      secFetchSite: req.get('sec-fetch-site') || '',
      secFetchMode: req.get('sec-fetch-mode') || '',
      secFetchDest: req.get('sec-fetch-dest') || '',
      query: req.query || {},
      headers: req.headers,
      body
    },
    normalized: buildNormalizedData(kind, body.parsed)
  };
}

function buildNormalizedData(kind, parsedBody) {
  if (!parsedBody || typeof parsedBody !== 'object') {
    return {
      endpointType: kind,
      hasStructuredBody: false
    };
  }

  return {
    endpointType: kind,
    hasStructuredBody: true,
    response: parsedBody.response ?? null,
    helpful: parsedBody.helpful ?? null,
    page: parsedBody.page ?? null,
    url: parsedBody.url ?? null,
    title: parsedBody.title ?? null,
    widget: parsedBody.widget ?? null,
    timestamp: parsedBody.timestamp ?? null
  };
}

function appendLog(filePath, label, entry) {
  const line = `${JSON.stringify(entry)}\n`;

  console.log(`[${label}] ${entry.receivedAt}`);
  console.dir(entry, { depth: null, colors: true });

  // Fire-and-forget logging
  fs.appendFile(filePath, line, 'utf8', (err) => {
    if (err) {
      console.error(`[${label}] Failed to write log file:`, err);
    }
  });
}

app.post('/api/feedback', (req, res) => {
  const entry = buildRequestSnapshot(req, 'feedback');
  appendLog(FEEDBACK_LOG_FILE, 'feedback', entry);
  res.sendStatus(204);
});

app.post('/api/track-attribution', (req, res) => {
  const entry = buildRequestSnapshot(req, 'track-attribution');
  appendLog(ATTRIBUTION_LOG_FILE, 'track-attribution', entry);
  res.sendStatus(204);
});

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'AbuEin Pulse logger',
    logs: {
      feedback: FEEDBACK_LOG_FILE,
      attribution: ATTRIBUTION_LOG_FILE
    },
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`AbuEin Pulse logger running on http://127.0.0.1:${PORT}`);
  console.log(`Feedback log: ${FEEDBACK_LOG_FILE}`);
  console.log(`Attribution log: ${ATTRIBUTION_LOG_FILE}`);
});