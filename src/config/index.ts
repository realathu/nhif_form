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
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    expiration: process.env.JWT_EXPIRATION || '24h'
  },
  admin: {
    initialEmail: process.env.INITIAL_ADMIN_EMAIL || 'dean@dmi.ac.tz',
    initialPassword: process.env.INITIAL_ADMIN_PASSWORD || 'pass123#'
  },
  features: {
    registration: process.env.ENABLE_REGISTRATION === 'true',
    export: process.env.ENABLE_EXPORT === 'true'
  }
}
