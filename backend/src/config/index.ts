import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env') 
})

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  database: {
    url: process.env.DATABASE_URL || 'file:nhif_registration.db'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d'
  },
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',')
  }
}
