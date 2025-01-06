import express from 'express'
import { db } from '../utils/database'
import { v4 as uuidv4 } from 'uuid'
import { StudentRegistration } from '../types'
import { authenticateToken, requireStudent } from '../middleware/authMiddleware'
import logger from '../utils/logger'
import { validateData } from '../utils/validation'
import { StudentRegistrationSchema } from '../utils/validation'

const router = express.Router()

// Register Student Information
router.post('/register', 
  authenticateToken,
  requireStudent,
  async (req, res) => {
    try {
      // Validate input using Zod schema
      const studentData = validateData(StudentRegistrationSchema, req.body)

      // Check if user already has a registration
      const existingRegistration = await db.execute({
        sql: 'SELECT * FROM student_registrations WHERE userId = ?',
        args: [req.user?.userId]
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
          req.user?.userId,
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

// Get Student's Own Registration
router.get('/my-registration', 
  authenticateToken,
  requireStudent,
  async (req, res) => {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM student_registrations WHERE userId = ? LIMIT 1',
        args: [req.user?.userId]
      })

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          message: 'No registration found' 
        })
      }

      res.json(result.rows[0])
    } catch (error) {
      logger.error('Fetch student registration failed', { 
        error: String(error),
        userId: req.user?.userId 
      })
      res.status(500).json({ 
        message: 'Failed to fetch registration', 
        error: String(error) 
      })
    }
  }
)

// Update Student Registration
router.put('/update', 
  authenticateToken,
  requireStudent,
  async (req, res) => {
    try {
      // Validate input
      const updateData = validateData(StudentRegistrationSchema, req.body)

      // Update student registration
      await db.execute({
        sql: `
          UPDATE student_registrations 
          SET 
            formFourIndexNo = ?, 
            firstName = ?, 
            middleName = ?, 
            lastName = ?, 
            dateOfBirth = ?, 
            maritalStatus = ?, 
            gender = ?, 
            admissionDate = ?, 
            mobileNo = ?, 
            courseName = ?, 
            collegeFaculty = ?, 
            yearOfStudy = ?, 
            courseDuration = ?, 
            nationalID = ?, 
            admissionNo = ?
          WHERE userId = ?
        `,
        args: [
          updateData.formFourIndexNo,
          updateData.firstName,
          updateData.middleName || '',
          updateData.lastName,
          updateData.dateOfBirth,
          updateData.maritalStatus,
          updateData.gender,
          updateData.admissionDate,
          updateData.mobileNo,
          updateData.courseName,
          updateData.collegeFaculty,
          updateData.yearOfStudy,
          updateData.courseDuration,
          updateData.nationalID,
          updateData.admissionNo,
          req.user?.userId
        ]
      })

      logger.info('Student registration updated', { 
        userId: req.user?.userId 
      })

      res.json({ 
        message: 'Registration updated successfully' 
      })
    } catch (error) {
      logger.error('Student registration update failed', { 
        error: String(error),
        userId: req.user?.userId 
      })
      res.status(500).json({ 
        message: 'Update failed', 
        error: String(error) 
      })
    }
  }
)

export default router
