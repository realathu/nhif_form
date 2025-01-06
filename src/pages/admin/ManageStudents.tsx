import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
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
    exportStatus: ''
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch students with advanced filtering
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/admin/students', {
          params: {
            search: searchTerm,
            ...filters
          }
        })
        setStudents(response.data)
      } catch (error) {
        toast.error('Failed to load students')
      }
    }
    fetchStudents()
  }, [searchTerm, filters])

  // Bulk delete students
  const handleBulkDelete = async () => {
    if (!window.confirm('Are you sure you want to delete selected students?')) return

    try {
      await Promise.all(
        selectedStudents.map(id => 
          api.delete(`/admin/students/${id}`)
        )
      )
      
      // Remove deleted students from local state
      setStudents(prev => 
        prev.filter(student => !selectedStudents.includes(student.id!))
      )
      
      // Clear selection
      setSelectedStudents([])
      
      toast.success('Selected students deleted successfully')
    } catch (error) {
      toast.error('Failed to delete students')
    }
  }

  // Bulk export students
  const handleBulkExport = () => {
    // If no students selected, export all
    const studentsToExport = selectedStudents.length > 0
      ? students.filter(student => selectedStudents.includes(student.id!))
      : students

    // Multiple export options
    const exportOptions = [
      { label: 'Excel (with Analytics)', type: 'excel' },
      { label: 'CSV', type: 'csv' }
    ]

    // Prompt for export type
    const exportType = window.prompt(
      'Select export type:\n' + 
      exportOptions.map((opt, index) => `${index + 1}. ${opt.label}`).join('\n')
    )

    if (exportType) {
      const selectedExport = exportOptions[parseInt(exportType) - 1]
      
      if (selectedExport.type === 'excel') {
        ExportUtils.exportStudentsToExcel(studentsToExport)
      } else {
        ExportUtils.exportStudentsToCsv(studentsToExport)
      }
    }
  }

  // Toggle student selection
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  // Select all students
  const toggleSelectAll = () => {
    setSelectedStudents(
      selectedStudents.length === students.length
        ? []
        : students.map(student => student.id!)
    )
  }

  // Render filter dropdown
  const FilterDropdown: React.FC<{
    name: string
    options: string[]
    value: string
    onChange: (value: string) => void
  }> = ({ name, options, value, onChange }) => (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded p-2"
    >
      <option value="">All {name}</option>
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Bulk Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSelectAll}
            className="flex items-center space-x-2 btn btn-secondary"
          >
            <FaCheckSquare />
            <span>
              {selectedStudents.length === students.length 
                ? 'Deselect All' 
                : 'Select All'}
            </span>
          </button>
          
          {selectedStudents.length > 0 && (
            <>
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-2 btn btn-danger"
              >
                <FaTrash />
                <span>Delete Selected</span>
              </button>
              <button
                onClick={handleBulkExport}
                className="flex items-center space-x-2 btn btn-primary"
              >
                <FaFileExport />
                <span>Export Selected</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow border rounded p-2"
        />
        
        <FilterDropdown
          name="courseName"
          options={[
            'Shipping and Logistics', 
            'Maritime and Nautical Science', 
            'Business Administration'
          ]}
          value={filters.courseName}
          onChange={(value) => setFilters(prev => ({ ...prev, courseName: value }))}
        />
        
        <FilterDropdown
          name="yearOfStudy"
          options={['1', '2', '3', '4', '5']}
          value={filters.yearOfStudy}
          onChange={(value) => setFilters(prev => ({ ...prev, yearOfStudy: value }))}
        />
        
        <FilterDropdown
          name="exportStatus"
          options={['Exported', 'Not Exported']}
          value={filters.exportStatus}
          onChange={(value) => setFilters(prev => ({ ...prev, exportStatus: value }))}
        />
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === students.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-4">Name</th>
              <th className="p-4">Course</th>
              <th className="p-4">Year of Study</th>
              <th className="p-4">Mobile No</th>
              <th className="p-4">Export Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr 
                key={student.id} 
                className="border-b hover:bg-gray-50"
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id!)}
                    onChange={() => toggleStudentSelection(student.id!)}
                  />
                </td>
                <td className="p-4">
                  {student.firstName} {student.lastName}
                </td>
                <td className="p-4">{student.courseName}</td>
                <td className="p-4">{student.yearOfStudy}</td>
                <td className="p-4">{student.mobileNo}</td>
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
                <td className="p-4 flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => {/* Delete logic */}}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageStudents
