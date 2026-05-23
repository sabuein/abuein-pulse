import app from './app.mjs';
import { PORT, FEEDBACK_LOG_FILE, ATTRIBUTION_LOG_FILE } from './config.mjs';

app.listen(PORT, () => {
  console.log(`AbuEin Pulse logger running on http://127.0.0.1:${PORT}`);
  console.log(`Feedback log: ${FEEDBACK_LOG_FILE}`);
  console.log(`Attribution log: ${ATTRIBUTION_LOG_FILE}`);
});