"use strict";

import express from 'express';
import { corsMiddleware } from './middleware/cors.mjs';
import feedbackRoutes from './routes/feedback.mjs';
import attributionRoutes from './routes/attribution.mjs';
import healthRoutes from './routes/health.mjs';

const app = express();

app.use(corsMiddleware);
app.use(express.json({ type: ['application/json', 'application/*+json'], limit: '100kb' }));
app.use(express.text({ type: ['text/plain', 'application/x-www-form-urlencoded'], limit: '100kb' }));

app.use(feedbackRoutes);
app.use(attributionRoutes);
app.use(healthRoutes);

app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.originalUrl
    });
});

app.use((err, req, res, next) => {
    if (err?.type === 'entity.parse.failed') {
        return res.status(400).json({
            error: 'Invalid JSON request body'
        });
    }

    console.error('[app] Unhandled error:', err);

    return res.status(500).json({
        error: 'Internal server error'
    });
});

export default app;