import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

interface RateLimitEntry {
  count: number
  lastRequestTime: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private MAX_REQUESTS = 100 // requests per window
  private WINDOW_MS = 15 * 60 * 1000 // 15 minutes

  limit(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || 'unknown'
    const now = Date.now()

    const existing = this.limits.get(ip)

    if (existing) {
      // Check if we're in a new window
      if (now - existing.lastRequestTime > this.WINDOW_MS) {
        // Reset the counter
        this.limits.set(ip, { count: 1, lastRequestTime: now })
        return next()
      }

      // Increment request count
      if (existing.count >= this.MAX_REQUESTS) {
        logger.warn('Rate limit exceeded', { ip })
        return res.status(429).json({
          message: 'Too many requests, please try again later'
        })
      }

      this.limits.set(ip, {
        count: existing.count + 1,
        lastRequestTime: now
      })
    } else {
      // First request for this IP
      this.limits.set(ip, { count: 1, lastRequestTime: now })
    }

    next()
  }
}

export default new RateLimiter()
