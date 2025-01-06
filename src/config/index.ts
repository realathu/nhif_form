import dotenv from 'dotenv'
import path from 'path'

// Determine environment
const envFile = process.env.NODE_ENV 
  ? `.env.${process.env.NODE_ENV}` 
  : '.env'

// Load environment variables
dotenv.config({ 
  path: path.resolve(process.cwd(), envFile) 
})

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  database: {
    url: process.env.DATABASE_URL || 'file:nhif_registration.db'
  },
  jwt: {
    secret: process.env.JWT_SECRET || this.generateFallbackSecret(),
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d'
  },
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',')
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },
  
  // Fallback secret generation
  generateFallbackSecret(): string {
    return crypto.randomBytes(64).toString('hex')
  }
}
