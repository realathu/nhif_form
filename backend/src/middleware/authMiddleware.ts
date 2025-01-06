import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import logger from '../utils/logger'

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    role: 'STUDENT' | 'ADMIN'
  }
}

export const authenticateToken = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { 
      userId: string, 
      role: string 
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role as 'STUDENT' | 'ADMIN'
    }

    next()
  } catch (error) {
    logger.warn('Token verification failed', { error: String(error) })
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

export const requireAdmin = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}
