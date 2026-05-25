import { Request, Response, NextFunction } from 'express'

const TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10)

export function requestTimeout(_req: Request, res: Response, next: NextFunction) {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout' })
    }
  }, TIMEOUT_MS)

  res.on('finish', () => clearTimeout(timer))
  next()
}
