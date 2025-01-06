import express from 'express'
import { db } from '../utils/database'
import { v4 as uuidv4 } from 'uuid'
import { StudentRegistration } from '../types'
import { authenticateToken, requireStudent } from '../middleware/authMiddleware'

const router = express.Router()

// Apply authentication and student-only middleware to all routes
router.use(authenticateToken)
router.use(requireStudent)

router.post('/register', async (req, res) => {
  try {
    const studentData: StudentRegistration = {
      ...req.body,
      userId: req.user?.userId // Add the authenticated user's ID
    }
    const registrationId = uuidv4()

    await db.execute({
      sql: `INSERT INTO student_registrations (
        id, formFourIndexNo, firstName, middleName, lastName, 
        dateOfBirth, maritalStatus, gender, admissionDate, 
        mobileNo, courseName, collegeFaculty, yearOfStudy, 
        courseDuration, nationalID, admissionNo, userId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        registrationId,
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
        studentData.admissionNo,
        studentData.userId
      ]
    })

    res.status(201).json({ message: 'Registration successful', id: registrationId })
  } catch (error) {
    console.error('Student registration error:', error)
    res.status(500).json({ message: 'Registration failed', error: String(error) })
  }
})

// Optional: Add a route to get student's own registration
router.get('/my-registration', async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM student_registrations WHERE userId = ? LIMIT 1',
      args: [req.user?.userId]
    })

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No registration found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Fetch student registration error:', error)
    res.status(500).json({ message: 'Failed to fetch registration', error: String(error) })
  }
})

export default router
