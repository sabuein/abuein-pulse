"use strict";

import { Router } from 'express';
import { ATTRIBUTION_LOG_FILE } from '../config.mjs';
import { buildRequestSnapshot } from '../utils/snapshot.mjs';
import { appendLog } from '../utils/file-logger.mjs';

const router = Router();

router.post('/api/track-attribution', async (req, res) => {
  try {
    const entry = buildRequestSnapshot(req, 'track-attribution');
    await appendLog(ATTRIBUTION_LOG_FILE, 'track-attribution', entry);
    res.sendStatus(204);
  } catch (error) {
    console.error('[track-attribution] Failed to persist request:', error);
    res.status(500).json({ error: 'Failed to write attribution log' });
  }
});

export default router;