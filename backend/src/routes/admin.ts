import express from 'express'
import * as XLSX from 'xlsx'
import { db } from '../utils/database'
import { StudentRegistration } from '../types'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware'
import logger from '../utils/logger'

const router = express.Router()

router.post('/export', 
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { 
        startDate, 
        endDate, 
        courseName 
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

      const result = await db.execute({
        sql: query,
        args: params
      })

      // Explicitly type the rows
      const students = result.rows.map(row => ({
        formFourIndexNo: row.formFourIndexNo || '',
        firstName: row.firstName || '',
        middleName: row.middleName || '',
        lastName: row.lastName || '',
        dateOfBirth: row.dateOfBirth || '',
        maritalStatus: row.maritalStatus || '',
        gender: row.gender || '',
        admissionDate: row.admissionDate || '',
        mobileNo: row.mobileNo || '',
        courseName: row.courseName || '',
        collegeFaculty: row.collegeFaculty || '',
        yearOfStudy: row.yearOfStudy || 1,
        courseDuration: row.courseDuration || 3,
        nationalID: row.nationalID || '',
        admissionNo: row.admissionNo || ''
      })) as StudentRegistration[]

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
          args: [student.id || '']
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

export default router
