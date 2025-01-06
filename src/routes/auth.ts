import express from 'express'
import { db } from '../utils/database'
import { 
  generateTokenPair, 
  storeRefreshToken, 
  hashPassword, 
  comparePassword 
} from '../utils/auth'
import { v4 as uuidv4 } from 'uuid'
import { UserRegistrationSchema } from '../utils/validation'
import { validateData } from '../utils/validation'
import { validationMiddleware } from '../middleware/validationMiddleware'
import logger from '../utils/logger'

const router = express.Router()

// Student Registration
router.post('/register', 
  validationMiddleware((data) => validateData(UserRegistrationSchema, data)),
  async (req, res) => {
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

export default router
