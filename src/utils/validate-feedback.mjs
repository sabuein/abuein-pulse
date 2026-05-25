"use strict";

function isNonEmptyString(value, maxLength) {
    return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

export function validateFeedbackPayload(body) {
    const errors = [];

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return {
            ok: false,
            errors: ["Request body must be a JSON object."],
        };
    }

    if (!["yes", "no"].includes(body.response)) {
        errors.push('response must be "yes" or "no".');
    }

    if ("helpful" in body && typeof body.helpful !== "boolean") {
        errors.push("helpful must be a boolean.");
    }

    if ("page" in body && body.page != null && !isNonEmptyString(body.page, 512)) {
        errors.push("page must be a non-empty string up to 512 characters.");
    }

    if ("url" in body && body.url != null && !isNonEmptyString(body.url, 2048)) {
        errors.push("url must be a non-empty string up to 2048 characters.");
    }

    if ("title" in body && body.title != null && !isNonEmptyString(body.title, 256)) {
        errors.push("title must be a non-empty string up to 256 characters.");
    }

    if ("widget" in body && body.widget != null && !isNonEmptyString(body.widget, 128)) {
        errors.push("widget must be a non-empty string up to 128 characters.");
    }

    return {
        ok: errors.length === 0,
        errors,
    };
}
