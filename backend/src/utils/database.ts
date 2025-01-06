import { createClient } from '@libsql/client'
import { config } from '../config'
import logger from './logger'

export const db = createClient({
  url: config.database.url
})

export async function initializeDatabase() {
  try {
    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Student registrations table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS student_registrations (
        id TEXT PRIMARY KEY,
        userId TEXT,
        formFourIndexNo TEXT,
        firstName TEXT,
        middleName TEXT,
        lastName TEXT,
        dateOfBirth TEXT,
        maritalStatus TEXT,
        gender TEXT,
        admissionDate TEXT,
        mobileNo TEXT,
        courseName TEXT,
        collegeFaculty TEXT,
        yearOfStudy INTEGER,
        courseDuration INTEGER,
        nationalID TEXT,
        admissionNo TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
      )
    `)

    logger.info('Database initialized successfully')
  } catch (error) {
    logger.error('Database initialization failed', { error: String(error) })
    throw error
  }
}
