"use strict";

import { Router } from 'express';
import { createRateLimit } from '../middleware/rate-limit.mjs';
import { FEEDBACK_LOG_FILE, ATTRIBUTION_LOG_FILE } from '../config.mjs';

const router = Router();
const rateLimit = createRateLimit({ windowMs: 60_000, maxRequests: 20 });

router.get('/health', rateLimit, (req, res) => {
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

export default router;