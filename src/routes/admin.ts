import express from 'express'
import { db } from '../utils/database'
import XLSX from 'xlsx'
import { v4 as uuidv4 } from 'uuid'
import { StudentRegistration } from '../types'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware'
import { hashPassword } from '../utils/auth'

const router = express.Router()

router.use(authenticateToken)
router.use(requireAdmin)

// Enhanced Student Management
router.get('/students', async (req, res) => {
  try {
    const { 
      search, 
      exported, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20 
    } = req.query

    let query = `
      SELECT * FROM student_registrations 
      WHERE 1=1
    `
    const conditions: string[] = []
    const params: any[] = []

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

    if (exported === 'true') {
      conditions.push('exportedAt IS NOT NULL')
    } else if (exported === 'false') {
      conditions.push('exportedAt IS NULL')
    }

    if (startDate && endDate) {
      conditions.push('createdAt BETWEEN ? AND ?')
      params.push(startDate, endDate)
    }

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

    // Get total count for pagination
    const countResult = await db.execute({
      sql: `
        SELECT COUNT(*) as total 
        FROM student_registrations 
        WHERE 1=1 ${conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''}
      `,
      args: params.slice(0, -2) // Exclude limit and offset
    })

    res.json({
      students: result.rows,
      total: countResult.rows[0].total,
      page: Number(page),
      limit: Number(limit)
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error: String(error) })
  }
})

// Soft Delete Route
router.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params

    await db.execute({
      sql: `
        UPDATE student_registrations 
        SET deleted_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND deleted_at IS NULL
      `,
      args: [id]
    })

    res.json({ message: 'Student registration soft deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to soft delete student', error: String(error) })
  }
})

// Edit Student Registration
router.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updateData: Partial<StudentRegistration> = req.body

    const updateFields = Object.keys(updateData)
      .map(key => `${key} = ?`)
      .join(', ')

    const updateValues = [
      ...Object.values(updateData),
      id
    ]

    await db.execute({
      sql: `
        UPDATE student_registrations 
        SET ${updateFields}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,
      args: updateValues
    })

    res.json({ message: 'Student registration updated successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student', error: String(error) })
  }
})

// Advanced Export with More Options
router.post('/export', async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      courseName, 
      exportType = 'all' 
    } = req.body

    let query = `
      SELECT * FROM student_registrations 
      WHERE 1=1
    `
    const params: any[] = []

    if (startDate && endDate) {
      query += ' AND createdAt BETWEEN ? AND ?'
      params.push(startDate, endDate)
    }

    if (courseName) {
      query += ' AND courseName = ?'
      params.push(courseName)
    }

    if (exportType === 'unexported') {
      query += ' AND exportedAt IS NULL'
    }

    const result = await db.execute({
      sql: query,
      args: params
    })

    const students = result.rows as StudentRegistration[]

    // Create multiple export formats
    const worksheet = XLSX.utils.json_to_sheet(students)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')

    // Additional sheets for analytics
    const courseAnalysis = students.reduce((acc, student) => {
      acc[student.courseName] = (acc[student.courseName] || 0) + 1
      return acc
    }, {})

    const courseSheet = XLSX.utils.json_to_sheet(
      Object.entries(courseAnalysis).map(([course, count]) => ({ course, count }))
    )
    XLSX.utils.book_append_sheet(workbook, courseSheet, 'Course Analysis')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })

    // Mark as exported
    await Promise.all(students.map(student => 
      db.execute({
        sql: 'UPDATE student_registrations SET exportedAt = CURRENT_TIMESTAMP WHERE id = ?',
        args: [student.id]
      })
    ))

    res.contentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.send(excelBuffer)
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: String(error) })
  }
})

// Dashboard Analytics
router.get('/dashboard-analytics', async (req, res) => {
  try {
    // Total registrations by course
    const courseRegistrations = await db.execute(`
      SELECT courseName, COUNT(*) as count 
      FROM student_registrations 
      GROUP BY courseName
    `)

    // Registrations by month
    const monthlyRegistrations = await db.execute(`
      SELECT 
        strftime('%Y-%m', createdAt) as month, 
        COUNT(*) as count 
      FROM student_registrations 
      GROUP BY month 
      ORDER BY month
    `)

    // Export statistics
    const exportStats = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN exportedAt IS NOT NULL THEN 1 ELSE 0 END) as exported
      FROM student_registrations
    `)

    res.json({
      courseRegistrations: courseRegistrations.rows,
      monthlyRegistrations: monthlyRegistrations.rows,
      exportStats: exportStats.rows[0]
    })
  } catch (error) {
    res.status(500).json({ message: 'Analytics fetch failed', error: String(error) })
  }
})

// Add Admin Account
router.post('/add-admin', async (req, res) => {
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

    res.status(201).json({ message: 'Admin account created successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create admin account', error: String(error) })
  }
})

export default router
