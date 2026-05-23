import { getBodyDetails } from './request-body.mjs';

export function buildNormalizedData(kind, parsedBody) {
  if (!parsedBody || typeof parsedBody !== 'object') {
    return {
      endpointType: kind,
      hasStructuredBody: false
    };
  }

  return {
    endpointType: kind,
    hasStructuredBody: true,
    response: parsedBody.response ?? null,
    helpful: parsedBody.helpful ?? null,
    page: parsedBody.page ?? null,
    url: parsedBody.url ?? null,
    title: parsedBody.title ?? null,
    widget: parsedBody.widget ?? null,
    timestamp: parsedBody.timestamp ?? null
  };
}

export function buildRequestSnapshot(req, kind) {
  const body = getBodyDetails(req);

  return {
    receivedAt: new Date().toISOString(),
    kind,
    request: {
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      protocol: req.protocol,
      host: req.get('host') || '',
      ip: req.ip,
      contentLength: req.get('content-length') || '',
      contentType: req.get('content-type') || '',
      origin: req.get('origin') || '',
      referer: req.get('referer') || '',
      userAgent: req.get('user-agent') || '',
      accept: req.get('accept') || '',
      secFetchSite: req.get('sec-fetch-site') || '',
      secFetchMode: req.get('sec-fetch-mode') || '',
      secFetchDest: req.get('sec-fetch-dest') || '',
      query: req.query || {},
      headers: req.headers,
      body
    },
    normalized: buildNormalizedData(kind, body.parsed)
  };
}