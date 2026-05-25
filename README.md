# AbuEin Pulse Logger

A small Node.js + Express server that accepts AbuEin Pulse widget requests and writes them to disk.

## Project structure

```text
.
├── package.json
├── README.md
├── public/
│   └── widget/
│       ├── abuein-pulse.css
│       ├── abuein-pulse.js
│       ├── demo.local.html
│       └── index.html
└── src/
    ├── app.mjs
    ├── config.mjs
    ├── server.mjs
    ├── middleware/
    │   ├── cors.mjs
    │   └── rate-limit.mjs
    ├── routes/
    │   ├── attribution.mjs
    │   ├── feedback.mjs
    │   └── health.mjs
    └── utils/
        ├── file-logger.mjs
        ├── request-body.mjs
        ├── snapshot.mjs
        └── validate-feedback.mjs
```

## Widget files

The widget frontend is split into reusable parts:

- `public/widget/index.html` — reusable widget example using relative endpoints
- `public/widget/demo.local.html` — local demo page configured for `http://127.0.0.1:3000`
- `public/widget/abuein-pulse.js` — shared widget logic
- `public/widget/abuein-pulse.css` — shared widget styles

## Logs

By default, logs are written to your home directory:

```text
~/abuein-pulse-logs/
```

Files are rotated by date and look like:

```text
feedback-YYYY-MM-DD.log
track-attribution-YYYY-MM-DD.log
```

The log directory is created automatically when the server starts.

## Run

```bash
npm install
npm start
```

## Endpoints

- `POST /api/feedback`
- `POST /api/track-attribution`
- `GET /health`

## Using the widget

### Reusable widget example

Open:

```text
public/widget/index.html
```

This page uses relative endpoints:

- `/api/feedback`
- `/api/track-attribution`

Use it when the widget is served from the same origin as the backend.

### Local demo page

Open:

```text
public/widget/demo.local.html
```

This page is preconfigured for local development and points to:

- `http://127.0.0.1:3000/api/feedback`
- `http://127.0.0.1:3000/api/track-attribution`

Use it when testing the widget from a local static server while the Node logger runs on port `3000`.

## Notes

This project is intended primarily for local development and request inspection.

For production use, consider:
- stricter CORS
- redaction of sensitive headers
- log rotation
- rate limiting
- input validation