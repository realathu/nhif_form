import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../utils/database'
import { config } from '../config'
import { 
  generateTokenPair, 
  storeRefreshToken, 
  hashPassword, 
  comparePassword 
} from '../utils/auth'
import { UserRegistrationSchema } from '../utils/validation'
import { validateData } from '../utils/validation'
import { validationMiddleware } from '../middleware/validationMiddleware'
import logger from '../utils/logger'
import { AuthenticatedRequest } from '../middleware/authMiddleware'

// Define a type for the user object to ensure type safety
interface User {
  id: string
  email: string
  password: string
  role: string
}

const router = express.Router()

// Student Registration
router.post('/register', 
  validationMiddleware((data) => validateData(UserRegistrationSchema, data)),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body
      
      // Always set role to STUDENT for this route
      const role = 'STUDENT'
      
      // Check for existing user
      const existingUser = await db.execute({
        sql: 'SELECT * FROM users WHERE email = ?',
        args: [email]
      })

      if (existingUser.rows.length > 0) {
        logger.warn('Registration attempt with existing email', { email })
        return res.status(400).json({ message: 'User with this email already exists' })
      }

      // Create user
      const userId = uuidv4()
      const hashedPassword = hashPassword(password)

      await db.execute({
        sql: 'INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)',
        args: [userId, email, hashedPassword, role]
      })

      // Generate token pair
      const { accessToken, refreshToken } = generateTokenPair(userId, role)
      
      // Store refresh token
      await storeRefreshToken(userId, refreshToken)

      logger.info('Student registered successfully', { 
        userId, 
        email 
      })

      res.status(201).json({ 
        accessToken, 
        refreshToken, 
        userId, 
        email, 
        role 
      })
    } catch (error) {
      logger.error('Registration failed', { 
        error: String(error),
        email: req.body.email 
      })
      res.status(500).json({ message: 'Registration failed' })
    }
  }
)

// Login Route
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    })

    if (result.rows.length === 0) {
      logger.warn('Login attempt with non-existent email', { email })
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Explicitly type the user object
    const user = result.rows[0] as User

    // Ensure user.password is a string and exists
    if (!user.password) {
      logger.warn('User password is missing', { email })
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Verify password
    if (!comparePassword(password, user.password)) {
      logger.warn('Failed login attempt', { email })
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Ensure user.id and user.role are strings
    const userId = user.id || uuidv4()
    const userRole = user.role || 'STUDENT'

    // Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(userId, userRole)
    
    // Store refresh token
    await storeRefreshToken(userId, refreshToken)

    logger.info('User logged in successfully', { 
      userId, 
      email, 
      role: userRole 
    })

    res.json({ 
      accessToken, 
      refreshToken, 
      userId, 
      email, 
      role: userRole 
    })
  } catch (error) {
    logger.error('Login failed', { 
      error: String(error),
      email: req.body.email 
    })
    res.status(500).json({ message: 'Login failed' })
  }
})

// Refresh Token Route
router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' })
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.secret) as { 
      userId: string, 
      role: string 
    }

    // Find user
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [decoded.userId]
    })

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid user' })
    }

    // Generate new token pair
    const { 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    } = generateTokenPair(decoded.userId, decoded.role)

    logger.info('Token refreshed successfully')
    res.json({ 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    })
  } catch (error) {
    logger.error('Token refresh failed', { error: String(error) })
    res.status(401).json({ message: 'Invalid refresh token' })
  }
})

// Get User Profile
router.get('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const result = await db.execute({
      sql: 'SELECT id, email, role FROM users WHERE id = ?',
      args: [userId]
    })

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    logger.error('Profile fetch failed', { 
      error: String(error),
      userId: req.user?.userId 
    })
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
})

export default router
