"use strict";

import express, { Router } from 'express';
import { createRateLimit } from '../middleware/rate-limit.mjs';
import { ATTRIBUTION_LOG_FILE } from '../config.mjs';
import { buildRequestSnapshot } from '../utils/snapshot.mjs';
import { appendLog } from '../utils/file-logger.mjs';

const router = Router();
const rateLimit = createRateLimit({ windowMs: 60_000, maxRequests: 20 });

router.post(
  '/api/track-attribution',
  rateLimit,
  express.text({ type: ['text/plain', 'application/x-www-form-urlencoded'], limit: '100kb' }),
  async (req, res) => {
    try {
      const entry = buildRequestSnapshot(req, 'track-attribution');
      await appendLog(ATTRIBUTION_LOG_FILE, 'track-attribution', entry);
      return res.sendStatus(204);
    } catch (error) {
      console.error('[track-attribution] Failed to persist request:', error);
      return res.status(500).json({ error: 'Failed to write attribution log' });
    }
  });

export default router;