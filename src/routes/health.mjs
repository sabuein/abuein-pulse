"use strict";

import { Router } from 'express';
import { createRateLimit } from '../middleware/rate-limit.mjs';
import { FEEDBACK_LOG_FILE, ATTRIBUTION_LOG_FILE, IS_PROD } from '../config.mjs';

const router = Router();
const rateLimit = createRateLimit({ windowMs: 60_000, maxRequests: 20 });

router.get('/health', rateLimit, (req, res) => {
  const payload = {
    ok: true,
    service: 'AbuEin Pulse logger',
    time: new Date().toISOString()
  };

  if (!IS_PROD) {
    payload.logs = {
      feedback: FEEDBACK_LOG_FILE,
      attribution: ATTRIBUTION_LOG_FILE
    };
  }

  res.json(payload);
});

export default router;