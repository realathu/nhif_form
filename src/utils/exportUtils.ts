import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { StudentRegistration } from '../types'

export class ExportUtils {
  // Custom Excel export with multiple sheets and styling
  static exportStudentsToExcel(
    students: StudentRegistration[], 
    options?: {
      sheetName?: string
      includeAnalytics?: boolean
    }
  ) {
    const { 
      sheetName = 'Students', 
      includeAnalytics = true 
    } = options || {}

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Main students sheet
    const worksheet = XLSX.utils.json_to_sheet(students)
    
    // Add custom styling
    worksheet['!cols'] = [
      { wch: 15 }, // Form Four Index No
      { wch: 15 }, // First Name
      { wch: 15 }, // Middle Name
      { wch: 15 }, // Last Name
      // ... other columns
    ]

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Optional analytics sheets
    if (includeAnalytics) {
      // Course Analytics
      const courseAnalytics = students.reduce((acc, student) => {
        acc[student.courseName] = (acc[student.courseName] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const courseSheet = XLSX.utils.json_to_sheet(
        Object.entries(courseAnalytics).map(([course, count]) => ({ 
          Course: course, 
          Registrations: count 
        }))
      )
      XLSX.utils.book_append_sheet(workbook, courseSheet, 'Course Analytics')

      // Gender Analytics
      const genderAnalytics = students.reduce((acc, student) => {
        acc[student.gender] = (acc[student.gender] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const genderSheet = XLSX.utils.json_to_sheet(
        Object.entries(genderAnalytics).map(([gender, count]) => ({ 
          Gender: gender, 
          Count: count 
        }))
      )
      XLSX.utils.book_append_sheet(workbook, genderSheet, 'Gender Analytics')
    }

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array' 
    })

    // Save file
    const fileName = `NHIF_Students_Export_${new Date().toISOString()}.xlsx`
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, fileName)
  }

  // CSV export with custom formatting
  static exportStudentsToCsv(
    students: StudentRegistration[], 
    options?: {
      columns?: string[]
    }
  ) {
    const { columns = Object.keys(students[0]) } = options || {}

    // Convert to CSV
    const csvContent = [
      columns.join(','),
      ...students.map(student => 
        columns.map(col => 
          `"${student[col as keyof StudentRegistration] || ''}"`.replace(/"/g, '""')
        ).join(',')
      )
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const fileName = `NHIF_Students_Export_${new Date().toISOString()}.csv`
    saveAs(blob, fileName)
  }
}
