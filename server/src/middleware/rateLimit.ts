import { Request, Response, NextFunction } from 'express'

const requestCounts = new Map<string, { count: number; resetAt: number }>()

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '1000', 10)

const SKIP_PATHS = ['/api/scans', '/api/demo']

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  // Skip rate limiting for scan execution and demo API
  if (SKIP_PATHS.some(p => req.path.startsWith(p))) {
    return next()
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  const record = requestCounts.get(ip)

  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return next()
  }

  if (record.count >= MAX_REQUESTS) {
    res.status(429).json({ error: 'Too many requests. Rate limit exceeded.' })
    return
  }

  record.count++
  next()
}
