import { createClient } from '@libsql/client'
import { config } from '../config'
import logger from './logger'

export const db = createClient({
  url: config.database.url
})

// Initialize database tables with additional fields
export async function initializeDatabase() {
  try {
    // Existing tables...

    // Refresh Tokens table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `)

    logger.info('Database initialized successfully')
  } catch (error) {
    logger.error('Database initialization failed', { error: String(error) })
    throw error
  }
}
