import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { StudentRegistration, Course } from '../types'

const StudentRegistrationPage: React.FC = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors },
    watch 
  } = useForm<StudentRegistration>()

  // Fetch available courses
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

  const onSubmit = async (data: StudentRegistration) => {
    try {
      await api.post('/students/register', data)
      toast.success('Registration submitted successfully!')
      navigate('/student/confirmation')
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary-600">
        NHIF Student Registration
      </h1>

      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Personal Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Personal Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              {...register('firstName', { required: 'First Name is required' })}
              className={`
                mt-1 block w-full rounded-md border 
                ${errors.firstName ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              {...register('lastName', { required: 'Last Name is required' })}
              className={`
                mt-1 block w-full rounded-md border 
                ${errors.lastName ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              {...register('dateOfBirth', { required: 'Date of Birth is required' })}
              className={`
                mt-1 block w-full rounded-md border 
                ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-sm mt-1">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>
        </div>

        {/* Academic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Academic Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course
            </label>
            <Controller
              name="courseName"
              control={control}
              rules={{ required: 'Course is required' }}
              render={({ field }) => (
                <select
                  {...field}
                  className={`
                    mt-1 block w-full rounded-md border 
                    ${errors.courseName ? 'border-red-500' : 'border-gray-300'}
                  `}
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.name}>
                      {course.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.courseName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.courseName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Admission Date
            </label>
            <input
              type="date"
              {...register('admissionDate', { required: 'Admission Date is required' })}
              className={`
                mt-1 block w-full rounded-md border 
                ${errors.admissionDate ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {errors.admissionDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.admissionDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              type="tel"
              {...register('mobileNo', { 
                required: 'Mobile Number is required',
                pattern: {
                  value: /^0[67][0-9]{8}$/,
                  message: 'Invalid mobile number'
                }
              })}
              className={`
                mt-1 block w-full rounded-md border 
                ${errors.mobileNo ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="0712345678"
            />
            {errors.mobileNo && (
              <p className="text-red-500 text-sm mt-1">
                {errors.mobileNo.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="col-span-full mt-6">
          <button
            type="submit"
            className="
              w-full py-3 px-4 border border-transparent 
              rounded-md shadow-sm text-sm font-medium 
              text-white bg-primary-600 hover:bg-primary-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-primary-500
            "
          >
            Submit Registration
          </button>
        </div>
      </form>
    </div>
  )
}

export default StudentRegistrationPage
