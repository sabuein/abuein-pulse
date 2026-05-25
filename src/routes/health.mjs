"use strict";

import { Router } from 'express';
import { FEEDBACK_LOG_FILE, ATTRIBUTION_LOG_FILE } from '../config.mjs';

const router = Router();

router.get('/health', (req, res) => {
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