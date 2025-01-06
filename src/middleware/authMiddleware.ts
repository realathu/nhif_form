import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'your_jwt_secret_key_here' // In production, use environment variable

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    role: 'STUDENT' | 'ADMIN'
  }
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string }
    req.user = {
      userId: decoded.userId,
      role: decoded.role as 'STUDENT' | 'ADMIN'
    }
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin rights required.' })
  }
  next()
}

export const requireStudent = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'STUDENT') {
    return res.status(403).json({ message: 'Access denied. Student rights required.' })
  }
  next()
}
