import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { config } from '../config'
import { db } from './database'
import logger from './logger'

// Enhanced Token Generation
export function generateTokenPair(userId: string, role: string) {
  const accessToken = jwt.sign(
    { 
      userId, 
      role, 
      tokenType: 'access' 
    }, 
    config.jwt.secret, 
    { 
      algorithm: 'HS256',
      expiresIn: config.jwt.accessExpiration 
    }
  )

  const refreshToken = jwt.sign(
    { 
      userId, 
      role, 
      tokenType: 'refresh',
      jti: uuidv4() // Unique identifier for refresh token
    }, 
    config.jwt.secret, 
    { 
      algorithm: 'HS256',
      expiresIn: config.jwt.refreshExpiration 
    }
  )

  return { accessToken, refreshToken }
}

// Secure Password Hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(
    password, 
    salt, 
    10000,  // iterations
    64,     // key length
    'sha512'
  ).toString('hex')
  
  return `${salt}:${hash}`
}

export function comparePassword(inputPassword: string, storedPassword: string): boolean {
  const [salt, originalHash] = storedPassword.split(':')
  const hash = crypto.pbkdf2Sync(
    inputPassword, 
    salt, 
    10000, 
    64, 
    'sha512'
  ).toString('hex')
  
  return hash === originalHash
}

// Refresh Token Management
export async function storeRefreshToken(userId: string, refreshToken: string) {
  try {
    const tokenId = uuidv4()
    await db.execute({
      sql: `
        INSERT INTO refresh_tokens 
        (id, user_id, token, expires_at) 
        VALUES (?, ?, ?, ?)
      `,
      args: [
        tokenId, 
        userId, 
        refreshToken, 
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      ]
    })

    logger.info('Refresh token stored', { userId })
  } catch (error) {
    logger.error('Failed to store refresh token', { 
      userId, 
      error: String(error) 
    })
    throw error
  }
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.secret) as { 
      userId: string, 
      role: string, 
      tokenType: string,
      jti: string
    }

    // Check if it's a refresh token
    if (decoded.tokenType !== 'refresh') {
      throw new Error('Invalid token type')
    }

    // Check if token exists in database
    const result = await db.execute({
      sql: 'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ?',
      args: [refreshToken, decoded.userId]
    })

    if (result.rows.length === 0) {
      throw new Error('Invalid refresh token')
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(
      decoded.userId, 
      decoded.role
    )

    // Update refresh token in database
    await db.execute({
      sql: `
        UPDATE refresh_tokens 
        SET token = ?, expires_at = ? 
        WHERE user_id = ?
      `,
      args: [
        newRefreshToken, 
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        decoded.userId
      ]
    })

    logger.info('Access token refreshed', { userId: decoded.userId })

    return { 
      accessToken, 
      refreshToken: newRefreshToken 
    }
  } catch (error) {
    logger.error('Token refresh failed', { error: String(error) })
    throw error
  }
}
