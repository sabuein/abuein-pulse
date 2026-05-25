"use strict";

import { Router } from 'express';
import { FEEDBACK_LOG_FILE, ATTRIBUTION_LOG_FILE, IS_PROD } from '../config.mjs';

const router = Router();

router.get('/health', (req, res) => {
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