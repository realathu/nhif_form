import rateLimit from 'express-rate-limit'
import { config } from '../config'
import logger from '../utils/logger'

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip
    })
    res.status(429).json({
      message: 'Too many requests, please try again later'
    })
  }
})
