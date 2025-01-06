import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import { StudentRegistration } from '../../types'
import { FaEdit, FaTrash, FaFileExport } from 'react-icons/fa'

const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<StudentRegistration[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentRegistration | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Fetch students
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

  // Edit student handler
  const handleEditStudent = async (updatedStudent: StudentRegistration) => {
    try {
      await api.put(`/admin/students/${updatedStudent.id}`, updatedStudent)
      toast.success('Student updated successfully')
      
      // Update local state
      setStudents(prev => 
        prev.map(student => 
          student.id === updatedStudent.id ? updatedStudent : student
        )
      )
      
      setIsEditModalOpen(false)
    } catch (error) {
      toast.error('Failed to update student')
    }
  }

  // Delete student handler
  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return

    try {
      await api.delete(`/admin/students/${studentId}`)
      toast.success('Student deleted successfully')
      
      // Update local state
      setStudents(prev => prev.filter(student => student.id !== studentId))
    } catch (error) {
      toast.error('Failed to delete student')
    }
  }

  // Export students
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

  // Edit Modal Component
  const EditStudentModal: React.FC = () => {
    const [formData, setFormData] = useState<StudentRegistration>(
      selectedStudent || {} as StudentRegistration
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      handleEditStudent(formData)
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Edit Student</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Mobile Number</label>
              <input
                type="tel"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Course Name</label>
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-600">
          Manage Students
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={handleExport}
            className="
              flex items-center space-x-2 
              bg-green-600 text-white 
              px-4 py-2 rounded-md 
              hover:bg-green-700
            "
          >
            <FaFileExport />
            <span>Export Students</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full px-4 py-2 rounded-md 
              border border-gray-300 
              focus:ring-primary-500
            "
          />
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-4">Name</th>
              <th className="p-4">Course</th>
              <th className="p-4">Mobile No</th>
              <th className="p-4">Admission Date</th>
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
                  {student.firstName} {student.lastName}
                </td>
                <td className="p-4">{student.courseName}</td>
                <td className="p-4">{student.mobileNo}</td>
                <td className="p-4">{student.admissionDate}</td>
                <td className="p-4 flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedStudent(student)
                      setIsEditModalOpen(true)
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student.id!)}
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

      {/* Edit Modal */}
      {isEditModalOpen && <EditStudentModal />}
    </div>
  )
}

export default ManageStudents
