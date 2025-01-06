import express from 'express'
import cors from 'cors'
import { initializeDatabase } from './utils/database'
import { config } from './config'
import authRoutes from './routes/auth'
import studentRoutes from './routes/students'
import adminRoutes from './routes/admin'
import enumRoutes from './routes/enums'
import { authenticateToken } from './middleware/authMiddleware'
import rateLimiter from './middleware/rateLimitMiddleware'
import logger from './utils/logger'

const app = express()
const PORT = config.port

// Middleware
app.use(cors())
app.use(express.json())

// Global rate limiting
app.use(rateLimiter.limit)

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info('Request processed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration
    })
  })
  
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/students', authenticateToken, studentRoutes)
app.use('/api/admin', authenticateToken, adminRoutes)
app.use('/api/enums', authenticateToken, enumRoutes)

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { 
    error: err.message,
    stack: err.stack 
  })
  
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: config.env === 'development' ? err.message : 'Internal server error'
  })
})

async function startServer() {
  try {
    await initializeDatabase()
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${config.env} mode`)
    })
  } catch (error) {
    logger.error('Server startup failed', { error: String(error) })
    process.exit(1)
  }
}

startServer()
