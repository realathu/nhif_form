import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import api from '../utils/api'
import { StudentRegistration } from '../types'
import { FaFileExport, FaSearch } from 'react-icons/fa'

const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentRegistration[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    todayStudents: 0,
    exportedStudents: 0
  })

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard-analytics')
        setDashboardStats(response.data)
      } catch (error) {
        toast.error('Failed to load dashboard statistics')
      }
    }
    fetchStats()
  }, [])

  // Fetch students with search
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/admin/students', {
          params: { search: searchTerm }
        })
        setStudents(response.data)
      } catch (error) {
        toast.error('Failed to load students')
      }
    }
    fetchStudents()
  }, [searchTerm])

  // Export students to Excel
  const handleExport = async () => {
    try {
      const response = await api.post('/admin/export', {}, {
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `students_export_${new Date().toISOString()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Export successful!')
    } catch (error) {
      toast.error('Export failed')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Total Students</h3>
          <p className="text-3xl font-bold text-primary-600">
            {dashboardStats.totalStudents}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Students Today</h3>
          <p className="text-3xl font-bold text-primary-600">
            {dashboardStats.todayStudents}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Exported Students</h3>
          <p className="text-3xl font-bold text-primary-600">
            {dashboardStats.exportedStudents}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center space-x-4 w-full">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2 rounded-md 
                  border border-gray-300 focus:ring-primary-500
                "
              />
              <FaSearch 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
            </div>
            <button
              onClick={handleExport}
              className="
                flex items-center space-x-2 
                bg-primary-600 text-white 
                px-4 py-2 rounded-md 
                hover:bg-primary-700
              "
            >
              <FaFileExport />
              <span>Export</span>
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-4">Name</th>
              <th className="p-4">Course</th>
              <th className="p-4">Mobile No</th>
              <th className="p-4">Admission Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr 
                key={student.id} 
                className="border-b hover:bg-gray-50"
              >
                <td className="p-4">
                  {student.firstName} {student.lastName}
                </td>
                <td className="p-4">{student.courseName}</td>
                <td className="p-4">{student.mobileNo}</td>
                <td className="p-4">{student.admissionDate}</td>
                <td className="p-4">
                  <span 
                    className={`
                      px-3 py-1 rounded-full text-xs 
                      ${student.exportedAt 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                      }
                    `}
                  >
                    {student.exportedAt ? 'Exported' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDashboard
