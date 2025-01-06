const { db } = require('../dist/utils/database')
const logger = require('../dist/utils/logger').default

async function runMigrations() {
  try {
    console.log('Running database migrations...')
    
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

    // Student Registrations table
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
        exportedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
      )
    `)

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

    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigrations()
