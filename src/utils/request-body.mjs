export function safeParseJson(value) {
  if (typeof value !== 'string') {
    return { ok: false, value: null };
  }

  try {
    return { ok: true, value: JSON.parse(value) };
  } catch {
    return { ok: false, value: null };
  }
}

export function getBodyDetails(req) {
  if (req.body == null) {
    return {
      raw: null,
      parsed: null,
      parsedAsJson: false,
      bodyType: 'empty'
    };
  }

  if (typeof req.body === 'object') {
    return {
      raw: JSON.stringify(req.body),
      parsed: req.body,
      parsedAsJson: true,
      bodyType: 'object'
    };
  }

  if (typeof req.body === 'string') {
    const parsed = safeParseJson(req.body);

    return {
      raw: req.body,
      parsed: parsed.value,
      parsedAsJson: parsed.ok,
      bodyType: 'string'
    };
  }

  return {
    raw: String(req.body),
    parsed: null,
    parsedAsJson: false,
    bodyType: typeof req.body
  };
}