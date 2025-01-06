import express from 'express'
import { db } from '../utils/database'
import XLSX from 'xlsx'
import { v4 as uuidv4 } from 'uuid'
import { StudentRegistration } from '../types'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware'
import { hashPassword } from '../utils/auth'
import logger from '../utils/logger'

const router = express.Router()

// Get All Students with Advanced Filtering
router.get('/students', 
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { 
        search, 
        courseName, 
        yearOfStudy, 
        exportStatus,
        page = 1, 
        limit = 20 
      } = req.query

      let query = `
        SELECT * FROM student_registrations 
        WHERE 1=1
      `
      const conditions: string[] = []
      const params: any[] = []

      // Search across multiple fields
      if (search) {
        conditions.push(`(
          firstName LIKE ? OR 
          lastName LIKE ? OR 
          courseName LIKE ? OR 
          mobileNo LIKE ?
        )`)
        params.push(
          `%${search}%`, 
          `%${search}%`, 
          `%${search}%`, 
          `%${search}%`
        )
      }

      // Course Name Filter
      if (courseName) {
        conditions.push('courseName = ?')
        params.push(courseName)
      }

      // Year of Study Filter
      if (yearOfStudy) {
        conditions.push('yearOfStudy = ?')
        params.push(yearOfStudy)
      }

      // Export Status Filter
      if (exportStatus === 'exported') {
        conditions.push('exportedAt IS NOT NULL')
      } else if (exportStatus === 'pending') {
        conditions.push('exportedAt IS NULL')
      }

      // Add conditions to query
      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ')
      }

      // Pagination
      const offset = (Number(page) - 1) * Number(limit)
      query += ` LIMIT ? OFFSET ?`
      params.push(Number(limit), offset)

      const result = await db.execute({
        sql: query,
        args: params
      })

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM student_registrations 
        WHERE 1=1 ${conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''}
      `
      const countResult = await db.execute({
        sql: countQuery,
        args: params.slice(0, -2) // Exclude limit and offset
      })

      res.json({
        students: result.rows,
        total: countResult.rows[0].total,
        page: Number(page),
        limit: Number(limit)
      })
    } catch (error) {
      logger.error('Failed to fetch students', { error: String(error) })
      res.status(500).json({ message: 'Failed to fetch students', error: String(error) })
    }
  }
)

// Export Students to Excel
router.post('/export', 
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { 
        courseName, 
        startDate, 
        endDate 
      } = req.body

      let query = `
        SELECT * FROM student_registrations 
        WHERE exportedAt IS NULL
      `
      const params: any[] = []

      // Course Name Filter
      if (courseName) {
        query += ' AND courseName = ?'
        params.push(courseName)
      }

      // Date Range Filter
      if (startDate && endDate) {
        query += ' AND createdAt BETWEEN ? AND ?'
        params.push(startDate, endDate)
      }

      const result = await db.execute({
        sql: query,
        args: params
      })

      const students = result.rows as StudentRegistration[]

      // Create workbook
      const worksheet = XLSX.utils.json_to_sheet(students)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'buffer' 
      })

      // Mark as exported
      await Promise.all(students.map(student => 
        db.execute({
          sql: 'UPDATE student_registrations SET exportedAt = CURRENT_TIMESTAMP WHERE id = ?',
          args: [student.id]
        })
      ))

      // Send Excel file
      res.contentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.send(excelBuffer)
    } catch (error) {
      logger.error('Export failed', { error: String(error) })
      res.status(500).json({ message: 'Export failed', error: String(error) })
    }
  }
)

// Dashboard Analytics
router.get('/dashboard', 
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      // Total registrations
      const totalStudents = await db.execute(`
        SELECT COUNT(*) as count 
        FROM student_registrations
      `)

      // Today's registrations
      const todayStudents = await db.execute(`
        SELECT COUNT(*) as count 
        FROM student_registrations 
        WHERE date(createdAt) = date('now')
      `)

      // Exported students
      const exportedStudents = await db.execute(`
        SELECT COUNT(*) as count 
        FROM student_registrations 
        WHERE exportedAt IS NOT NULL
      `)

      // Course-wise registrations
      const courseRegistrations = await db.execute(`
        SELECT courseName, COUNT(*) as count 
        FROM student_registrations 
        GROUP BY courseName
      `)

      res.json({
        totalStudents: totalStudents.rows[0].count,
        todayStudents: todayStudents.rows[0].count,
        exportedStudents: exportedStudents.rows[0].count,
        courseRegistrations: courseRegistrations.rows
      })
    } catch (error) {
      logger.error('Dashboard data fetch failed', { error: String(error) })
      res.status(500).json({ message: 'Dashboard data fetch failed', error: String(error) })
    }
  }
)

// Add Admin Account
router.post('/add-admin', 
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { email, password, name } = req.body

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' })
      }

      // Check if admin already exists
      const existingAdmin = await db.execute({
        sql: 'SELECT * FROM users WHERE email = ? AND role = "ADMIN"',
        args: [email]
      })

      if (existingAdmin.rows.length > 0) {
        return res.status(400).json({ message: 'Admin with this email already exists' })
      }

      // Create new admin
      const hashedPassword = hashPassword(password)
      const adminId = uuidv4()

      await db.execute({
        sql: 'INSERT INTO users (id, email, password, role, name) VALUES (?, ?, ?, ?, ?)',
        args: [adminId, email, hashedPassword, 'ADMIN', name || '']
      })

      logger.info('Admin account created', { email, adminId })
      res.status(201).json({ message: 'Admin account created successfully' })
    } catch (error) {
      logger.error('Failed to create admin account', { 
        error: String(error),
        email: req.body.email 
      })
      res.status(500).json({ message: 'Failed to create admin account', error: String(error) })
    }
  }
)

export default router
