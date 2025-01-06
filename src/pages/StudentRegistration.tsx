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
  } = useForm<StudentRegistration>({
    mode: 'onChange', // Validate on change
    defaultValues: {
      yearOfStudy: 1,
      courseDuration: 3
    }
  })

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
      toast.success('Registration submitted successfully!', {
        duration: 4000,
        position: 'top-center'
      })
      navigate('/student/confirmation')
    } catch (error) {
      toast.error('Registration failed. Please try again.', {
        duration: 4000,
        position: 'top-center'
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary-600 text-center">
        NHIF Student Registration
      </h1>

      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6"
      >
        {/* Personal Information Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-primary-600">
            Personal Details
          </h2>
          
          <div className="form-grid">
            {/* First Name */}
            <div>
              <label 
                htmlFor="firstName" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                {...register('firstName', { 
                  required: 'First Name is required',
                  minLength: {
                    value: 2,
                    message: 'First Name must be at least 2 characters'
                  }
                })}
                className={`
                  w-full rounded-md border 
                  ${errors.firstName 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-primary-500'
                  } 
                  shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1
                  px-4 py-2
                `}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label 
                htmlFor="lastName" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                {...register('lastName', { 
                  required: 'Last Name is required',
                  minLength: {
                    value: 2,
                    message: 'Last Name must be at least 2 characters'
                  }
                })}
                className={`
                  w-full rounded-md border 
                  ${errors.lastName 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-primary-500'
                  } 
                  shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1
                  px-4 py-2
                `}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label 
                htmlFor="dateOfBirth" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth', { 
                  required: 'Date of Birth is required',
                  validate: (value) => {
                    const birthDate = new Date(value)
                    const minAge = new Date()
                    minAge.setFullYear(minAge.getFullYear() - 16)
                    return birthDate <= minAge || 'You must be at least 16 years old'
                  }
                })}
                className={`
                  w-full rounded-md border 
                  ${errors.dateOfBirth 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-primary-500'
                  } 
                  shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1
                  px-4 py-2
                `}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label 
                htmlFor="mobileNo" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mobile Number
              </label>
              <input
                id="mobileNo"
                type="tel"
                inputMode="tel"
                {...register('mobileNo', { 
                  required: 'Mobile Number is required',
                  pattern: {
                    value: /^0[67][0-9]{8}$/,
                    message: 'Invalid mobile number format'
                  }
                })}
                className={`
                  w-full rounded-md border 
                  ${errors.mobileNo 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-primary-500'
                  } 
                  shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1
                  px-4 py-2
                `}
                placeholder="0712345678"
              />
              {errors.mobileNo && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.mobileNo.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Academic Information Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-primary-600">
            Academic Details
          </h2>
          
          <div className="form-grid">
            {/* Course Selection */}
            <div>
              <label 
                htmlFor="courseName" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
                      w-full rounded-md border 
                      ${errors.courseName 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-primary-500'
                      } 
                      shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1
                      px-4 py-2
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
                <p className="mt-1 text-sm text-red-500">
                  {errors.courseName.message}
                </p>
              )}
            </div>

            {/* Admission Date */}
            <div>
              <label 
                htmlFor="admissionDate" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Admission Date
              </label>
              <input
                id="admissionDate"
                type="date"
                {...register('admissionDate', { 
                  required: 'Admission Date is required',
                  validate: (value) => {
                    const admissionDate = new Date(value)
                    const now = new Date()
                    return admissionDate <= now || 'Admission date cannot be in the future'
                  }
                })}
                className={`
                  w-full rounded-md border 
                  ${errors.admissionDate 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-primary-500'
                  } 
                  shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1
                  px-4 py-2
                `}
              />
              {errors.admissionDate && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.admissionDate.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="
              w-full py-3 px-4 border border-transparent 
              rounded-md shadow-sm text-sm font-medium 
              text-white bg-primary-600 hover:bg-primary-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-primary-500
              disabled:opacity-50 disabled:cursor-not-allowed
              touch-target
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
