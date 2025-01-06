import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import { ExportUtils } from '../../utils/exportUtils'
import CourseRegistrationChart from '../../components/DataVisualization/CourseRegistrationChart'
import MonthlyRegistrationChart from '../../components/DataVisualization/MonthlyRegistrationChart'
import { FaChartBar, FaFileExport } from 'react-icons/fa'

const StudentReports: React.FC = () => {
  const [reportData, setReportData] = useState({
    courseRegistrations: [],
    monthlyRegistrations: [],
    exportStats: {
      total: 0,
      exported: 0
    }
  })

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await api.get('/admin/dashboard-analytics')
        setReportData(response.data)
      } catch (error) {
        toast.error('Failed to load report data')
      }
    }
    fetchReportData()
  }, [])

  // Export detailed report
  const handleExportDetailedReport = async () => {
    try {
      const response = await api.get('/admin/students')
      const students = response.data

      // Prompt for export type
      const exportOptions = [
        { label: 'Excel (with Analytics)', type: 'excel' },
        { label: 'CSV', type: 'csv' }
      ]

      const exportType = window.prompt(
        'Select export type:\n' + 
        exportOptions.map((opt, index) => `${index + 1}. ${opt.label}`).join('\n')
      )

      if (exportType) {
        const selectedExport = exportOptions[parseInt(exportType) - 1]
        
        if (selectedExport.type === 'excel') {
          ExportUtils.exportStudentsToExcel(students)
        } else {
          ExportUtils.exportStudentsToCsv(students)
        }
      }
    } catch (error) {
      toast.error('Failed to export detailed report')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-600 flex items-center">
          <FaChartBar className="mr-3" />
          Student Reports
        </h1>
        <button
          onClick={handleExportDetailedReport}
          className="
            flex items-center space-x-2 
            bg-green-600 text-white 
            px-4 py-2 rounded-md 
            hover:bg-green-700
          "
        >
          <FaFileExport />
          <span>Export Detailed Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Registrations Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Course Registrations</h2>
          <CourseRegistrationChart 
            courseData={reportData.courseRegistrations} 
          />
        </div>

        {/* Monthly Registrations Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Registrations</h2>
          <MonthlyRegistrationChart 
            monthlyData={reportData.monthlyRegistrations} 
          />
        </div>

        {/* Export Statistics */}
        <div className="bg-white rounded-lg shadow p-6 col-span-full grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Registrations</p>
            <p className="text-2xl font-bold text-blue-600">
              {reportData.exportStats.total}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-600">Exported Registrations</p>
            <p className="text-2xl font-bold text-green-600">
              {reportData.exportStats.exported}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded">
            <p className="text-sm text-gray-600">Export Percentage</p>
            <p className="text-2xl font-bold text-yellow-600">
              {reportData.exportStats.total > 0
                ? Math.round(
                    (reportData.exportStats.exported / reportData.exportStats.total) * 100
                  )
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentReports
