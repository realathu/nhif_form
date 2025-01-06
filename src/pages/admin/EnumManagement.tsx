import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import { Course } from '../../types'
import { FaCog, FaPlus, FaEdit, FaTrash } from 'react-icons/fa'

const EnumManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/enums/courses')
        setCourses(response.data)
      } catch (error) {
        toast.error('Failed to load courses')
      }
    }
    fetchCourses()
  }, [])

  // Add/Edit Course Modal
  const CourseModal: React.FC = () => {
    const [formData, setFormData] = useState<Partial<Course>>(
      selectedCourse || { 
        name: '', 
        faculty: '', 
        duration: 3,
        active: true 
      }
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        if (selectedCourse) {
          // Edit existing course
          await api.put(`/enums/courses/${selectedCourse.id}`, formData)
          setCourses(prev => 
            prev.map(course => 
              course.id === selectedCourse.id 
                ? { ...course, ...formData } 
                : course
            )
          )
        } else {
          // Add new course
          const response = await api.post('/enums/courses', formData)
          setCourses(prev => [...prev, { ...formData, id: response.data.id }])
        }

        toast.success(
          selectedCourse 
            ? 'Course updated successfully' 
            : 'Course added successfully'
        )
        
        setIsAddCourseModalOpen(false)
        setSelectedCourse(null)
      } catch (error) {
        toast.error('Failed to save course')
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">
            {selectedCourse ? 'Edit Course' : 'Add New Course'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Course Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Faculty</label>
              <input
                type="text"
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Course Duration (Years)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full border rounded p-2"
                min="1"
                max="6"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Status</label>
              <select
                name="active"
                value={formData.active ? 'true' : 'false'}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  active: e.target.value === 'true' 
                }))}
                className="w-full border rounded p-2"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddCourseModalOpen(false)
                  setSelectedCourse(null)
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Save Course
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Delete Course
  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return

    try {
      await api.delete(`/enums/courses/${courseId}`)
      setCourses(prev => prev.filter(course => course.id !== courseId))
      toast.success('Course deleted successfully')
    } catch (error) {
      toast.error('Failed to delete course')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-600 flex items-center">
          <FaCog className="mr-3" />
          Enum Management
        </h1>
        <button
          onClick={() => {
            setSelectedCourse(null)
            setIsAddCourseModalOpen(true)
          }}
          className="
            flex items-center space-x-2 
            bg-primary-600 text-white 
            px-4 py-2 rounded-md 
            hover:bg-primary-700
          "
        >
          <FaPlus />
          <span>Add Course</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-4">Course Name</th>
              <th className="p-4">Faculty</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr 
                key={course.id} 
                className="border-b hover:bg-gray-50"
              >
                <td className="p-4">{course.name}</td>
                <td className="p-4">{course.faculty}</td>
                <td className="p-4">{course.duration} years</td>
                <td className="p-4">
                  <span 
                    className={`
                      px-3 py-1 rounded-full text-xs 
                      ${course.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }
                    `}
                  >
                    {course.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCourse(course)
                      setIsAddCourseModalOpen(true)
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
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

      {/* Add/Edit Course Modal */}
      {isAddCourseModalOpen && <CourseModal />}
    </div>
  )
}

export default EnumManagement
