import rateLimit from 'express-rate-limit'
import { config } from '../config'
import logger from '../utils/logger'

export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path
    })
    res.status(429).json({
      message: 'Too many requests, please try again later'
    })
})
