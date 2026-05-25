# AbuEin Pulse Logger

A small Node.js + Express server that accepts AbuEin Pulse widget requests and writes them to disk.

## Project structure

```text
.
├── package.json
├── README.md
├── public/
│   └── widget/
│       └── index.html
└── src/
    ├── app.mjs
    ├── config.mjs
    ├── server.mjs
    ├── middleware/
    │   └── cors.mjs
    ├── routes/
    │   ├── attribution.mjs
    │   ├── feedback.mjs
    │   └── health.mjs
    └── utils/
        ├── file-logger.mjs
        ├── request-body.mjs
        └── snapshot.mjs
```

## Logs

By default, logs are written to:

```text
~/abuein-pulse-logs/feedback.log
~/abuein-pulse-logs/track-attribution.log
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

## Notes

This project is intended primarily for local development and request inspection.

For production use, consider:
- stricter CORS
- redaction of sensitive headers
- log rotation
- rate limiting
- input validation