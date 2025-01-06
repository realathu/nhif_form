import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config'
import { initializeDatabase } from './utils/database'
import { globalRateLimiter } from './middleware/rateLimitMiddleware'
import authRoutes from './routes/auth'
import studentRoutes from './routes/students'
import adminRoutes from './routes/admin'
import enumRoutes from './routes/enums'
import { authenticateToken } from './middleware/authMiddleware'
import logger from './utils/logger'

const app = express()

// Security Middleware
app.use(helmet()) // Adds various HTTP headers for security
app.use(globalRateLimiter) // Rate limiting

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    // If no origin (like server-to-server requests), allow
    if (!origin) return callback(null, true)
    
    // Check if origin is in allowed list
    if (config.cors.allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json({
  limit: '10kb' // Prevent large payload attacks
}))

// Logging Middleware
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    path: req.path,
    ip: req.ip
  })
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/students', authenticateToken, studentRoutes)
app.use('/api/admin', authenticateToken, adminRoutes)
app.use('/api/enums', authenticateToken, enumRoutes)

// Global Error Handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack
  })

  res.status(500).json({
    message: config.env === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  })
})

async function startServer() {
  try {
    await initializeDatabase()
    
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`)
    })
  } catch (error) {
    logger.error('Server startup failed', { error: String(error) })
    process.exit(1)
  }
}

startServer()
