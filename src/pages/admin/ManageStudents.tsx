import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import socketService from '../../utils/socketService'
import { StudentRegistration } from '../../types'
import { ExportUtils } from '../../utils/exportUtils'
import { 
  FaEdit, 
  FaTrash, 
  FaFileExport, 
  FaFilter, 
  FaCheckSquare 
} from 'react-icons/fa'

const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<StudentRegistration[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [filters, setFilters] = useState({
    courseName: '',
    yearOfStudy: '',
    exportStatus: '',
    dateRange: {
      start: '',
      end: ''
    },
    searchTerm: ''
  })

  // Advanced Filtering Hook
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/admin/students', {
          params: {
            ...filters,
            page: 1,
            limit: 50
          }
        })
        setStudents(response.data)
      } catch (error) {
        toast.error('Failed to load students')
      }
    }

    fetchStudents()
  }, [filters])

  // Real-time Updates
  useEffect(() => {
    // Connect socket and listen for student updates
    socketService
      .connect()
      .on('student:registered', (newStudent: StudentRegistration) => {
        setStudents(prev => [newStudent, ...prev])
      })
      .on('student:updated', (updatedStudent: StudentRegistration) => {
        setStudents(prev => 
          prev.map(student => 
            student.id === updatedStudent.id ? updatedStudent : student
          )
        )
      })
      .on('student:deleted', (deletedStudentId: string) => {
        setStudents(prev => 
          prev.filter(student => student.id !== deletedStudentId)
        )
      })

    return () => {
      socketService.disconnect()
    }
  }, [])

  // Advanced Filter Component
  const AdvancedFilterPanel = () => (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Course Filter */}
        <select
          value={filters.courseName}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            courseName: e.target.value
          }))}
          className="border rounded p-2"
        >
          <option value="">All Courses</option>
          <option value="Shipping and Logistics">Shipping and Logistics</option>
          <option value="Maritime Science">Maritime Science</option>
        </select>

        {/* Year of Study Filter */}
        <select
          value={filters.yearOfStudy}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            yearOfStudy: e.target.value
          }))}
          className="border rounded p-2"
        >
          <option value="">All Years</option>
          {[1, 2, 3, 4, 5].map(year => (
            <option key={year} value={year.toString()}>
              Year {year}
            </option>
          ))}
        </select>

        {/* Export Status Filter */}
        <select
          value={filters.exportStatus}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            exportStatus: e.target.value
          }))}
          className="border rounded p-2"
        >
          <option value="">All Statuses</option>
          <option value="exported">Exported</option>
          <option value="pending">Pending</option>
        </select>

        {/* Date Range Filters */}
        <div className="flex space-x-2">
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              dateRange: { ...prev.dateRange, start: e.target.value }
            }))}
            className="border rounded p-2 flex-1"
          />
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              dateRange: { ...prev.dateRange, end: e.target.value }
            }))}
            className="border rounded p-2 flex-1"
          />
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search students..."
          value={filters.searchTerm}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            searchTerm: e.target.value
          }))}
          className="border rounded p-2 col-span-full"
        />
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Students</h1>
      
      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel />

      {/* Rest of the existing component remains the same */}
      {/* Student table rendering */}
    </div>
  )
}

export default ManageStudents
