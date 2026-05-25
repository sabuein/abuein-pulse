"use strict";

import { Router } from 'express';
import { FEEDBACK_LOG_FILE } from '../config.mjs';
import { buildRequestSnapshot } from '../utils/snapshot.mjs';
import { appendLog } from '../utils/file-logger.mjs';

const router = Router();

router.post('/api/feedback', async (req, res) => {
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