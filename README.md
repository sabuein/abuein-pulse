# AbuEin Pulse Logger

A small Node.js + Express server that accepts AbuEin Pulse widget requests and writes them to disk.

It supports two POST endpoints:

- `/api/feedback`
- `/api/track-attribution`

Each endpoint writes to its own log file:

- `logs/feedback.log`
- `logs/track-attribution.log`

It also prints incoming requests to the console so you can inspect what the browser is actually sending.

---

## Why this exists

When testing the widget in a static local server such as `127.0.0.1:5500`, requests like:

- `POST /api/feedback`
- `POST /api/track-attribution`

can fail with `405 Method Not Allowed` because the static server does not implement those API routes.

This logger server gives you a lightweight backend that:

- accepts the POST requests
- logs them to the terminal
- appends them to files on disk
- helps you inspect request headers, body, and metadata for future use

---

## Features

- Accepts `POST /api/feedback`
- Accepts `POST /api/track-attribution`
- Writes feedback and attribution to separate log files
- Logs request details to the console
- Stores a structured snapshot of each incoming request
- Includes permissive CORS headers for local development
- Includes a `/health` endpoint

---

## Project files

```text
.
├── server.js
├── package.json
├── README.md
└── logs/
    ├── feedback.log
    └── track-attribution.log
```

The `logs` directory is created automatically when the server starts.

---

## Requirements

- Node.js 18+ recommended
- npm

---

## Install

```bash
npm install
```

---

## Run

```bash
npm start
```

The server will start on:

```text
http://127.0.0.1:3000
```

You should see output similar to:

```text
AbuEin Pulse logger running on http://127.0.0.1:3000
Feedback log: /path/to/project/logs/feedback.log
Attribution log: /path/to/project/logs/track-attribution.log
```

---

## Available endpoints

### `POST /api/feedback`

Accepts feedback requests from the widget.

Typical payload example:

```json
{
  "response": "yes",
  "helpful": true,
  "page": "/abuein-pulse.html",
  "url": "http://127.0.0.1:5500/abuein-pulse.html",
  "title": "AbuEin Pulse v1.0",
  "timestamp": "2026-05-23T20:14:59.000Z",
  "widget": "AbuEin Pulse v1.0"
}
```

Response:

```text
204 No Content
```

---

### `POST /api/track-attribution`

Accepts attribution tracking requests, such as browser link ping requests.

These requests may contain less information than feedback requests depending on the browser.

Response:

```text
204 No Content
```

---

### `GET /health`

Returns a simple health response.

Example response:

```json
{
  "ok": true,
  "service": "AbuEin Pulse logger",
  "logs": {
    "feedback": "/path/to/project/logs/feedback.log",
    "attribution": "/path/to/project/logs/track-attribution.log"
  },
  "time": "2026-05-23T20:30:00.000Z"
}
```

---

## What gets logged

Each request is stored as a single JSON line in the corresponding log file.

The logger captures:

- time received
- endpoint type
- request method
- request path
- protocol
- host
- IP address
- content type
- content length
- origin
- referer
- user agent
- accept header
- `sec-fetch-*` headers
- query parameters
- full request headers
- raw body
- parsed body when JSON is available
- normalized fields such as:
  - `response`
  - `helpful`
  - `page`
  - `url`
  - `title`
  - `widget`
  - `timestamp`

---

## Example log entry

Example from `logs/feedback.log`:

```json
{
  "receivedAt": "2026-05-23T20:15:00.000Z",
  "kind": "feedback",
  "request": {
    "method": "POST",
    "path": "/api/feedback",
    "originalUrl": "/api/feedback",
    "protocol": "http",
    "host": "127.0.0.1:3000",
    "ip": "::1",
    "contentLength": "180",
    "contentType": "application/json",
    "origin": "http://127.0.0.1:5500",
    "referer": "http://127.0.0.1:5500/abuein-pulse.html",
    "userAgent": "Mozilla/5.0 ...",
    "accept": "*/*",
    "secFetchSite": "cross-site",
    "secFetchMode": "cors",
    "secFetchDest": "empty",
    "query": {},
    "headers": {
      "content-type": "application/json"
    },
    "body": {
      "raw": "{\"response\":\"yes\",\"helpful\":true}",
      "parsed": {
        "response": "yes",
        "helpful": true
      },
      "parsedAsJson": true,
      "bodyType": "object"
    }
  },
  "normalized": {
    "endpointType": "feedback",
    "hasStructuredBody": true,
    "response": "yes",
    "helpful": true,
    "page": "/abuein-pulse.html",
    "url": "http://127.0.0.1:5500/abuein-pulse.html",
    "title": "AbuEin Pulse v1.0",
    "widget": "AbuEin Pulse v1.0",
    "timestamp": "2026-05-23T20:14:59.000Z"
  }
}
```

In the actual log file, each entry is stored on one line as JSON.

---

## Using it with the widget

If your HTML file is served from `127.0.0.1:5500` and this logger is served from `127.0.0.1:3000`, configure the widget like this:

```html
<script>
  AbuEinPulse.init({
    endpoint: 'http://127.0.0.1:3000/api/feedback',
    attributionEndpoint: 'http://127.0.0.1:3000/api/track-attribution',
    skipTelemetryInLocalPreview: false
  });
</script>
```

This server includes permissive CORS headers for local development, so cross-origin requests from port `5500` to `3000` should work.

---

## Notes about attribution ping requests

Browser `ping` requests can differ from normal `fetch()` requests.

Depending on the browser and privacy mode, attribution requests may:

- have an empty body
- omit some headers
- use a different content type
- include less metadata than the feedback endpoint

That is expected. Logging the raw request helps you understand what is actually available.

---

## Notes about logs

- Log files are append-only
- One request = one JSON line
- This makes them easy to inspect manually or process later with scripts

Examples:

```bash
cat logs/feedback.log
cat logs/track-attribution.log
```

If you want to pretty-print each JSON line later, tools like `jq` can help.

---

## Development notes

This project is intended for local development and inspection.

For production use, consider:

- restricting CORS
- filtering or redacting sensitive headers
- rotating log files
- validating input
- using a real structured logger
- storing logs in a database or observability platform

---

## Troubleshooting

### I still get `405 Method Not Allowed`
Make sure your widget is posting to the Node server port, not your static file server.

Wrong:

```text
http://127.0.0.1:5500/api/feedback
```

Correct:

```text
http://127.0.0.1:3000/api/feedback
```

---

### I get a CORS error
Make sure the logger server is running and that the request is pointed at port `3000`.

This server already sends permissive CORS headers for local development.

---

### No log files are created
Make sure:

- the server started successfully
- you clicked the widget buttons or opened the attribution link
- the process has permission to write to disk

---

## License

MIT