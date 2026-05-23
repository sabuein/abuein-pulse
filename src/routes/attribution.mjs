import { Router } from 'express';
import { ATTRIBUTION_LOG_FILE } from '../config.mjs';
import { buildRequestSnapshot } from '../utils/snapshot.mjs';
import { appendLog } from '../utils/file-logger.mjs';

const router = Router();

router.post('/api/track-attribution', (req, res) => {
  const entry = buildRequestSnapshot(req, 'track-attribution');
  appendLog(ATTRIBUTION_LOG_FILE, 'track-attribution', entry);
  res.sendStatus(204);
});

export default router;