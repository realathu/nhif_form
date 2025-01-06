import { Request, Response, NextFunction } from 'express'
import { ValidationError } from '../utils/validation'
import logger from '../utils/logger'

export function validationMiddleware(validator: (data: any) => void) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      validator(req.body)
      next()
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('Validation failed', { 
          errors: error.errors,
          body: req.body
        })

        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors
        })
      }

      // Log unexpected errors
      logger.error('Unexpected validation error', { error: String(error) })
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}
