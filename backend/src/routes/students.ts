import express, { Request, Response } from 'express'
import { db } from '../utils/database'
import { v4 as uuidv4 } from 'uuid'
import { StudentRegistration } from '../types'
import { authenticateToken } from '../middleware/authMiddleware'
import { validateData } from '../utils/validation'
import { StudentRegistrationSchema } from '../utils/validation'
import logger from '../utils/logger'

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
  }
}

const router = express.Router()

// Register Student Information
router.post('/register', 
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Validate input using Zod schema
      const studentData = validateData(StudentRegistrationSchema, req.body) as StudentRegistration

      // Check if user already has a registration
      const existingRegistration = await db.execute({
        sql: 'SELECT * FROM student_registrations WHERE userId = ?',
        args: [req.user?.userId || '']
      })

      if (existingRegistration.rows.length > 0) {
        return res.status(400).json({ 
          message: 'Student registration already exists' 
        })
      }

      // Generate unique registration ID
      const registrationId = uuidv4()

      // Insert student registration
      await db.execute({
        sql: `
          INSERT INTO student_registrations (
            id, 
            userId,
            formFourIndexNo, 
            firstName, 
            middleName, 
            lastName, 
            dateOfBirth, 
            maritalStatus, 
            gender, 
            admissionDate, 
            mobileNo, 
            courseName, 
            collegeFaculty, 
            yearOfStudy, 
            courseDuration, 
            nationalID, 
            admissionNo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          registrationId,
          req.user?.userId || '',
          studentData.formFourIndexNo,
          studentData.firstName,
          studentData.middleName || '',
          studentData.lastName,
          studentData.dateOfBirth,
          studentData.maritalStatus,
          studentData.gender,
          studentData.admissionDate,
          studentData.mobileNo,
          studentData.courseName,
          studentData.collegeFaculty,
          studentData.yearOfStudy,
          studentData.courseDuration,
          studentData.nationalID,
          studentData.admissionNo
        ]
      })

      logger.info('Student registration created', { 
        userId: req.user?.userId, 
        registrationId 
      })

      res.status(201).json({ 
        message: 'Registration successful', 
        id: registrationId 
      })
    } catch (error) {
      logger.error('Student registration failed', { 
        error: String(error),
        userId: req.user?.userId 
      })
      res.status(500).json({ 
        message: 'Registration failed', 
        error: String(error) 
      })
    }
  }
)

// Other routes similarly updated...

export default router
