"use strict";

const buckets = new Map();

// TODO: add periodic pruning.
// Consider pruning stale entries in the in-memory rate limiter if uptime/traffic grows.

export function createRateLimit({ windowMs = 60_000, maxRequests = 30 } = {}) {
    return function rateLimit(req, res, next) {
        const key = req.ip || "unknown";
        const now = Date.now();
        const current = buckets.get(key);

        if (!current || now > current.resetAt) {
            buckets.set(key, {
                count: 1,
                resetAt: now + windowMs,
            });
            return next();
        }

        if (current.count >= maxRequests) {
            return res.status(429).json({
                error: "Too many requests. Please try again later.",
            });
        }

        current.count += 1;
        next();
    };
}
