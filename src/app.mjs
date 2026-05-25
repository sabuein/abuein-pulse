"use strict";

import express from 'express';
import { corsMiddleware } from './middleware/cors.mjs';
import feedbackRoutes from './routes/feedback.mjs';
import attributionRoutes from './routes/attribution.mjs';
import healthRoutes from './routes/health.mjs';

const app = express();

app.use(corsMiddleware);
app.use(express.json({ limit: '100kb' }));
app.use(express.text({ type: '*/*', limit: '100kb' }));

app.use(feedbackRoutes);
app.use(attributionRoutes);
app.use(healthRoutes);

export default app;