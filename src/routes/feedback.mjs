import { Router } from 'express';
import { FEEDBACK_LOG_FILE } from '../config.mjs';
import { buildRequestSnapshot } from '../utils/snapshot.mjs';
import { appendLog } from '../utils/file-logger.mjs';

const router = Router();

router.post('/api/feedback', (req, res) => {
  const entry = buildRequestSnapshot(req, 'feedback');
  appendLog(FEEDBACK_LOG_FILE, 'feedback', entry);
  res.sendStatus(204);
});

export default router;