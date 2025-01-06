import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import logger from '../utils/logger'

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    role: 'STUDENT' | 'ADMIN'
    tokenType: 'access' | 'refresh'
  }
}

export const verifyToken = (token: string, type: 'access' | 'refresh' = 'access') => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: ['HS256'],
      maxAge: type === 'access' ? config.jwt.accessExpiration : config.jwt.refreshExpiration
    }) as { 
      userId: string, 
      role: string, 
      tokenType: string 
    }

    // Additional token type validation
    if (decoded.tokenType !== type) {
      throw new Error('Invalid token type')
    }

    return decoded
  } catch (error) {
    logger.warn('Token verification failed', { error: String(error) })
    return null
  }
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  const decoded = verifyToken(token)

  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }

  req.user = {
    userId: decoded.userId,
    role: decoded.role as 'STUDENT' | 'ADMIN',
    tokenType: 'access'
  }

  next()
}

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    logger.warn('Unauthorized admin access attempt', { 
      userId: req.user?.userId, 
      requestedRole: req.user?.role 
    })
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

export const requireStudent = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'STUDENT') {
    logger.warn('Unauthorized student access attempt', { 
      userId: req.user?.userId, 
      requestedRole: req.user?.role 
    })
    return res.status(403).json({ message: 'Student access required' })
  }
  next()
}
