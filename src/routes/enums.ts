import express from 'express'
import { db } from '../utils/database'
import { v4 as uuidv4 } from 'uuid'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware'
import { CourseEnum, AdmissionDateEnum } from '../models/Enum'

const router = express.Router()

router.use(authenticateToken)
router.use(requireAdmin)

// Course Management Routes
router.get('/courses', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM course_enums')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses', error: String(error) })
  }
})

router.post('/courses', async (req, res) => {
  try {
    const { name, faculty, duration }: CourseEnum = req.body
    const courseId = uuidv4()

    await db.execute({
      sql: `
        INSERT INTO course_enums 
        (id, name, faculty, duration, active) 
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [courseId, name, faculty, duration, true]
    })

    res.status(201).json({ message: 'Course added successfully', id: courseId })
  } catch (error) {
    res.status(500).json({ message: 'Failed to add course', error: String(error) })
  }
})

router.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, faculty, duration, active }: CourseEnum = req.body

    await db.execute({
      sql: `
        UPDATE course_enums 
        SET name = ?, faculty = ?, duration = ?, active = ? 
        WHERE id = ?
      `,
      args: [name, faculty, duration, active, id]
    })

    res.json({ message: 'Course updated successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update course', error: String(error) })
  }
})

// Admission Date Management Routes
router.get('/admission-dates', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM admission_date_enums')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admission dates', error: String(error) })
  }
})

router.post('/admission-dates', async (req, res) => {
  try {
    const { date, academicYear }: AdmissionDateEnum = req.body
    const admissionId = uuidv4()

    await db.execute({
      sql: `
        INSERT INTO admission_date_enums 
        (id, date, academic_year, active) 
        VALUES (?, ?, ?, ?)
      `,
      args: [admissionId, date, academicYear, true]
    })

    res.status(201).json({ message: 'Admission date added successfully', id: admissionId })
  } catch (error) {
    res.status(500).json({ message: 'Failed to add admission date', error: String(error) })
  }
})

router.put('/admission-dates/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { date, academicYear, active }: AdmissionDateEnum = req.body

    await db.execute({
      sql: `
        UPDATE admission_date_enums 
        SET date = ?, academic_year = ?, active = ? 
        WHERE id = ?
      `,
      args: [date, academicYear, active, id]
    })

    res.json({ message: 'Admission date updated successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update admission date', error: String(error) })
  }
})

export default router
