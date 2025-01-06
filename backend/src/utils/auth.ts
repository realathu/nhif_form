import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { config } from '../config'
import { db } from './database'
import logger from './logger'

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword)
}

export function generateTokenPair(userId: string, role: string) {
  const accessToken = jwt.sign(
    { userId, role, type: 'access' }, 
    config.jwt.secret, 
    { expiresIn: config.jwt.accessExpiration }
  )

  const refreshToken = jwt.sign(
    { userId, role, type: 'refresh' }, 
    config.jwt.secret, 
    { expiresIn: config.jwt.refreshExpiration }
  )

  return { accessToken, refreshToken }
}

export async function storeRefreshToken(userId: string, refreshToken: string) {
  try {
    await db.execute({
      sql: `
        INSERT INTO refresh_tokens 
        (user_id, token, expires_at) 
        VALUES (?, ?, ?)
      `,
      args: [
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
