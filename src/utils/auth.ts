import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import { config } from '../config'
import { db } from './database'
import logger from './logger'

interface TokenPair {
  accessToken: string
  refreshToken: string
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword)
}

export function generateTokenPair(userId: string, role: string): TokenPair {
  const accessToken = jwt.sign(
    { userId, role, type: 'access' }, 
    config.jwt.secret, 
    { expiresIn: config.jwt.expiration }
  )

  const refreshToken = jwt.sign(
    { userId, role, type: 'refresh' }, 
    config.jwt.secret, 
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

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
      type: string 
    }

    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
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

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, config.jwt.secret)
  } catch (error) {
    logger.warn('Token verification failed', { error: String(error) })
    return null
  }
}
