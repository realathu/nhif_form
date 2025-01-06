import express, { Request, Response, NextFunction } from 'express'
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
app.use(helmet())
app.use(globalRateLimiter)

// CORS Configuration
app.use(cors({
  origin: config.cors?.allowedOrigins || ['http://localhost:3000'],
  credentials: true
}))

// Parse JSON with size limit
app.use(express.json({
  limit: '10kb'
}))

// Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info('Request received', {
    method: req.method,
    path: req.path,
    ip: req.ip
  })
  next()
})

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/students', authenticateToken, studentRoutes)
app.use('/api/admin', authenticateToken, adminRoutes)
app.use('/api/enums', authenticateToken, enumRoutes)

// Global Error Handler
app.use((
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
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
