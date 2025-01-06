import { Request, Response, NextFunction } from 'express'
import { IPUtils } from '../utils/security'
import logger from '../utils/logger'

export class SecurityMiddleware {
  // Prevent common security headers
  static secureHeaders(req: Request, res: Response, next: NextFunction) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY')
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff')
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block')
    
    // Strict transport security (for HTTPS)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade')
    
    next()
  }

  // IP-based access control
  static ipWhitelist(allowedIPs: string[] = []) {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientIP = req.ip || req.connection.remoteAddress

      if (!clientIP) {
        logger.warn('Unable to determine client IP')
        return res.status(403).json({ message: 'Access denied' })
      }

      // Anonymize IP for logging
      const anonymizedIP = IPUtils.anonymize(clientIP)

      // Check if IP is valid
      if (!IPUtils.isValidIP(clientIP)) {
        logger.warn('Invalid IP detected', { ip: anonymizedIP })
        return res.status(403).json({ message: 'Invalid IP address' })
      }

      // If whitelist is empty, allow all
      if (allowedIPs.length === 0) {
        return next()
      }

      // Check against whitelist
      if (!allowedIPs.includes(clientIP)) {
        logger.warn('IP not in whitelist', { 
          ip: anonymizedIP,
          allowedIPs 
        })
        return res.status(403).json({ message: 'IP not authorized' })
      }

      next()
    }
  }

  // Prevent brute force login attempts
  static bruteForceProtection(
    maxAttempts: number = 5, 
    lockoutDuration: number = 15 * 60 * 1000 // 15 minutes
  ) {
    const attempts: Map<string, { count: number, lastAttempt: number }> = new Map()

    return (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip || 'unknown'
      const now = Date.now()

      const record = attempts.get(ip)

      // Clean up old attempts
      if (record && now - record.lastAttempt > lockoutDuration) {
        attempts.delete(ip)
      }

      // Check if IP is locked out
      if (record && record.count >= maxAttempts) {
        const remainingLockout = lockoutDuration - (now - record.lastAttempt)
        
        logger.warn('Brute force protection triggered', { 
          ip: IPUtils.anonymize(ip),
          remainingLockout 
        })

        return res.status(429).json({
          message: `Too many attempts. Try again in ${Math.ceil(remainingLockout / 1000)} seconds`
        })
      }

      // Track login attempts
      const updatedRecord = record 
        ? { count: record.count + 1, lastAttempt: now }
        : { count: 1, lastAttempt: now }
      
      attempts.set(ip, updatedRecord)

      next()
    }
  }

  // Content Security Policy
  static contentSecurityPolicy(req: Request, res: Response, next: NextFunction) {
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "font-src 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "frame-src 'none'"
    ].join('; '))

    next()
  }
}
