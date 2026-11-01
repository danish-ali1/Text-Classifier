export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, _req, res, _next) {
  // Malformed JSON body (thrown by express.json)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }

  // Body larger than the 10kb limit
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large' });
  }

  // Errors we raised ourselves
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Log the real error server-side, return a generic message to the client
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}