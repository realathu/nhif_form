import express from 'express'
import multer from 'multer'
import xlsx from 'xlsx'
import { db } from '../utils/database'
import { v4 as uuidv4 } from 'uuid'
import { StudentRegistration } from '../types'
import { authenticateToken, requireStudent } from '../middleware/authMiddleware'

const router = express.Router()
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

// NHIF File Upload Route
router.post('/upload-nhif', 
  authenticateToken,
  requireStudent,
  upload.single('nhifFile'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' })
      }

      // Read the uploaded file
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert to JSON
      const data: any[] = xlsx.utils.sheet_to_json(worksheet)

      // Validate and process each row
      const processedStudents: StudentRegistration[] = []
      const errors: string[] = []

      for (const row of data) {
        try {
          // Validate and transform row data
          const studentData: StudentRegistration = {
            formFourIndexNo: row['FormFourIndexNo'],
            firstName: row['FirstName'],
            middleName: row['MiddleName'] || '',
            lastName: row['LastName'],
            dateOfBirth: row['DateOfBirth'],
            maritalStatus: row['MaritalStatus'],
            gender: row['Gender'],
            admissionDate: row['AdmissionDate'],
            mobileNo: row['MobileNo'],
            courseName: row['CourseName'],
            collegeFaculty: row['CollegeFaculty'],
            yearOfStudy: parseInt(row['YearOfStudy'], 10),
            courseDuration: parseInt(row['CourseDuration'], 10),
            nationalID: row['NationalID'],
            admissionNo: row['AdmissionNo'],
            userId: req.user?.userId
          }

          // Insert into database
          const registrationId = uuidv4()
          await db.execute({
            sql: `
              INSERT INTO student_registrations (
                id, formFourIndexNo, firstName, middleName, lastName, 
                dateOfBirth, maritalStatus, gender, admissionDate, 
                mobileNo, courseName, collegeFaculty, yearOfStudy, 
                courseDuration, nationalID, admissionNo, userId
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            args: [
              registrationId,
              studentData.formFourIndexNo,
              studentData.firstName,
              studentData.middleName,
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

          processedStudents.push(studentData)
        } catch (rowError) {
          errors.push(`Error processing row: ${JSON.stringify(row)}`)
        }
      }

      res.json({
        message: 'File uploaded successfully',
        totalRows: data.length,
        processedRows: processedStudents.length,
        errors
      })
    } catch (error) {
      console.error('NHIF file upload error:', error)
      res.status(500).json({ 
        message: 'Failed to process NHIF file', 
        error: String(error) 
      })
    }
  }
)

export default router
