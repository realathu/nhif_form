import express from 'express'
import { db } from '../utils/database'
import { v4 as uuidv4 } from 'uuid'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware'
import logger from '../utils/logger'

const router = express.Router()

// Get Active Courses
router.get('/courses', 
  authenticateToken,
  async (req, res) => {
    try {
      const result = await db.execute('SELECT * FROM course_enums WHERE active = 1')
      res.json(result.rows)
    } catch (error) {
      logger.error('Failed to fetch courses', { error: String(error) })
      res.status(500).json({ message: 'Failed to fetch courses', error: String(error) })
    }
  }
)

// Admin: Add New Course
router.post('/courses', 
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { name, faculty, duration } = req.body

      // Validate input
      if (!name || !faculty || !duration) {
        return res.status(400).json({ message: 'Name, faculty, and duration are required' })
      }

      const courseId = uuidv4()

      await db.execute({
        sql: `
          INSERT INTO course_enums 
          (id, name, faculty, duration, active) 
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [courseId, name, faculty, duration, true]
      })

      logger.info('Course added', { name, faculty, duration })
      res.status(201).json({ 
        message: 'Course added successfully', 
        id: courseId 
      })
    } catch (error) {
      logger.error('Failed to add course', { 
        error: String(error),
        name: req.body.name 
      })
      res.status(500).json({ message: 'Failed to add course', error: String(error) })
    }
  }
)

// Admin: Update Course
router.put('/courses/:id', 
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params
      const { name, faculty, duration, active } = req.body

      // Validate input
      if (!name || !faculty || duration === undefined) {
        return res.status(400).json({ message: 'Name, faculty, and duration are required' })
      }

      await db.execute({
        sql: `
          UPDATE course_enums 
          SET name = ?, faculty = ?, duration = ?, active = ? 
          WHERE id = ?
        `,
        args: [name, faculty, duration, active, id]
      })

      logger.info('Course updated', { id, name, faculty })
      res.json({ message: 'Course updated successfully' })
    } catch (error) {
      logger.error('Failed to update course', { 
        error: String(error),
        id: req.params.id 
      })
      res.status(500).json({ message: 'Failed to update course', error: String(error) })
    }
  }
)

export default router
