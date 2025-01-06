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
import logger from '../utils/logger'
import { AuthenticatedRequest } from '../middleware/authMiddleware'

const router = express.Router()

// Student Registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required',
        details: {
          email: !!email,
          password: !!password
        }
      })
    }

    // Always set role to STUDENT for this route
    const role = 'STUDENT'
    
    // Check for existing user with detailed logging
    let existingUser;
    try {
      existingUser = await db.execute({
        sql: 'SELECT * FROM users WHERE email = ?',
        args: [email]
      })

      logger.info('Existing user check', { 
        email, 
        existingUserCount: existingUser.rows.length 
      })
    } catch (dbError) {
      logger.error('Database query error during registration', { 
        error: String(dbError),
        email 
      })
      return res.status(500).json({ 
        message: 'Database error during user check',
        error: String(dbError)
      })
    }

    // Prevent duplicate registrations
    if (existingUser.rows.length > 0) {
      logger.warn('Registration attempt with existing email', { email })
      return res.status(409).json({ 
        message: 'An account with this email already exists',
        code: 'EMAIL_EXISTS'
      })
    }

    // Create user
    const userId = uuidv4()
    const hashedPassword = hashPassword(password)

    try {
      await db.execute({
        sql: 'INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)',
        args: [userId, email, hashedPassword, role]
      })

      logger.info('User created successfully', { userId, email })
    } catch (insertError) {
      logger.error('Failed to insert user', { 
        error: String(insertError),
        userId,
        email 
      })
      return res.status(500).json({ 
        message: 'Failed to create user account',
        error: String(insertError)
      })
    }

    // Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(userId, role)
    
    // Store refresh token with error handling
    try {
      await storeRefreshToken(userId, refreshToken)
      logger.info('Refresh token stored', { userId })
    } catch (tokenError) {
      logger.error('Failed to store refresh token', { 
        error: String(tokenError),
        userId 
      })
      // Non-critical error, continue with registration
    }

    res.status(201).json({ 
      accessToken, 
      refreshToken, 
      userId, 
      email, 
      role 
    })
  } catch (error) {
    logger.error('Unexpected registration error', { 
      error: String(error),
      body: req.body
    })
    res.status(500).json({ 
      message: 'Registration process failed', 
      error: String(error) 
    })
  }
})

export default router
