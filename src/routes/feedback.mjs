"use strict";

import { Router } from 'express';
import { createRateLimit } from '../middleware/rate-limit.mjs';
import { FEEDBACK_LOG_FILE } from '../config.mjs';
import { buildRequestSnapshot } from '../utils/snapshot.mjs';
import { appendLog } from '../utils/file-logger.mjs';
import { validateFeedbackPayload } from '../utils/validate-feedback.mjs';

const router = Router();
const rateLimit = createRateLimit({ windowMs: 60_000, maxRequests: 20 });

router.post('/api/feedback', rateLimit, async (req, res) => {
  const validation = validateFeedbackPayload(req.body);
  if (!validation.ok) {
    return res.status(400).json({
      error: 'Invalid feedback payload',
      details: validation.errors
    });
  }

  try {
    const entry = buildRequestSnapshot(req, 'feedback');
    await appendLog(FEEDBACK_LOG_FILE, 'feedback', entry);
    res.sendStatus(204);
  } catch (error) {
    console.error('[feedback] Failed to persist request:', error);
    res.status(500).json({ error: 'Failed to write feedback log' });
  }
});

export default router;