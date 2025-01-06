import express from 'express'
import { db } from '../utils/database'
import { 
  generateTokenPair, 
  storeRefreshToken, 
  refreshAccessToken 
} from '../utils/auth'
import { v4 as uuidv4 } from 'uuid'
import { UserRegistrationSchema } from '../utils/validation'
import { validateData } from '../utils/validation'
import { validationMiddleware } from '../middleware/validationMiddleware'
import logger from '../utils/logger'

const router = express.Router()

// Registration with validation
router.post('/register', 
  validationMiddleware((data) => validateData(UserRegistrationSchema, data)),
  async (req, res) => {
    try {
      const { email, password, role } = req.body
      
      // Check for existing user
      const existingUser = await db.execute({
        sql: 'SELECT * FROM users WHERE email = ?',
        args: [email]
      })

      if (existingUser.rows.length > 0) {
        logger.warn('Registration attempt with existing email', { email })
        return res.status(400).json({ message: 'User already exists' })
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

      logger.info('User registered successfully', { 
        userId, 
        email, 
        role 
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

// Login with enhanced logging
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    })

    if (result.rows.length === 0) {
      logger.warn('Login attempt with non-existent email', { email })
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const user = result.rows[0]
    const isPasswordValid = comparePassword(password, user.password)

    if (!isPasswordValid) {
      logger.warn('Failed login attempt', { email })
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(user.id, user.role)
    
    // Store refresh token
    await storeRefreshToken(user.id, refreshToken)

    logger.info('User logged in successfully', { 
      userId: user.id, 
      email, 
      role: user.role 
    })

    res.json({ 
      accessToken, 
      refreshToken, 
      userId: user.id, 
      email, 
      role: user.role 
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
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      logger.warn('Refresh token request without token')
      return res.status(400).json({ message: 'Refresh token required' })
    }

    const tokens = await refreshAccessToken(refreshToken)

    logger.info('Token refreshed successfully')
    res.json(tokens)
  } catch (error) {
    logger.error('Token refresh failed', { error: String(error) })
    res.status(401).json({ message: 'Invalid refresh token' })
  }
})

export default router
