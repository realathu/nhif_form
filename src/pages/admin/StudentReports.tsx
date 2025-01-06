import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
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
      const response = await api.post('/admin/export', {}, {
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `detailed_report_${new Date().toISOString()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Detailed report exported successfully!')
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
        {/* Course Registrations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Course Registrations</h2>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Course</th>
                <th className="p-2 text-right">Registrations</th>
              </tr>
            </thead>
            <tbody>
              {reportData.courseRegistrations.map((course: any) => (
                <tr key={course.courseName} className="border-b">
                  <td className="p-2">{course.courseName}</td>
                  <td className="p-2 text-right">{course.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Monthly Registrations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Registrations</h2>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Month</th>
                <th className="p-2 text-right">Registrations</th>
              </tr>
            </thead>
            <tbody>
              {reportData.monthlyRegistrations.map((month: any) => (
                <tr key={month.month} className="border-b">
                  <td className="p-2">{month.month}</td>
                  <td className="p-2 text-right">{month.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Export Statistics */}
        <div className="bg-white rounded-lg shadow p-6 col-span-full">
          <h2 className="text-xl font-semibold mb-4">Export Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentReports
