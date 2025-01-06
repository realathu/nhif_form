import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { FaInfoCircle, FaCheckCircle } from 'react-icons/fa'
import api from '../utils/api'
import { StudentRegistration, Course } from '../types'

const StudentRegistrationPage: React.FC = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors, isValid },
    watch 
  } = useForm<StudentRegistration>({
    mode: 'onChange',
    defaultValues: {
      yearOfStudy: 1,
      courseDuration: 3,
      maritalStatus: 'Single',
      gender: 'Male'
    }
  })

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/enums/courses')
        setCourses(response.data.filter((course: Course) => course.active))
      } catch (error) {
        toast.error('Failed to load courses')
      }
    }
    fetchCourses()
  }, [])

  const onSubmit = async (data: StudentRegistration) => {
    setIsSubmitting(true)
    try {
      // Confirmation modal
      const confirmed = window.confirm(`
        IMPORTANT NHIF REGISTRATION NOTICE:

        By submitting this form, you confirm that:
        1. All information provided is accurate
        2. You understand incorrect information may affect your NHIF registration
        3. You are voluntarily providing these details

        Do you want to proceed?
      `)

      if (!confirmed) {
        setIsSubmitting(false)
        return
      }

      await api.post('/students/register', data)
      
      toast.success('Registration submitted successfully!', {
        icon: <FaCheckCircle className="text-green-500 text-2xl" />,
        duration: 5000,
        position: 'top-center'
      })

      navigate('/student/confirmation')
    } catch (error) {
      toast.error('Registration failed. Please check your information.', {
        icon: <FaInfoCircle className="text-red-500 text-2xl" />,
        duration: 5000,
        position: 'top-center'
      })
      setIsSubmitting(false)
    }
  }

  // Watch form values for dynamic validation
  const watchCourse = watch('courseName')
  const watchAdmissionDate = watch('admissionDate')

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="bg-primary-600 text-white text-center py-4">
          <h1 className="text-2xl font-bold">NHIF Student Registration</h1>
          <p className="text-sm text-primary-100">
            Provide accurate information for NHIF registration
          </p>
        </div>

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="p-6 space-y-6"
        >
          {/* Personal Information Section */}
          <div>
            <h2 className="text-xl font-semibold text-primary-600 mb-4 border-b pb-2">
              Personal Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Gender */}
              <div>
                <label 
                  htmlFor="gender" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Gender
                </label>
                <Controller
                  name="gender"
                  control={control}
                  rules={{ required: 'Gender is required' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`
                        w-full rounded-md border 
                        ${errors.gender 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                        } 
                        shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1
                        px-4 py-2
                      `}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  )}
                />
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              {/* Marital Status */}
              <div>
                <label 
                  htmlFor="maritalStatus" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Marital Status
                </label>
                <Controller
                  name="maritalStatus"
                  control={control}
                  rules={{ required: 'Marital Status is required' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`
                        w-full rounded-md border 
                        ${errors.maritalStatus 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                        } 
                        shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1
                        px-4 py-2
                      `}
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                    </select>
                  )}
                />
                {errors.maritalStatus && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.maritalStatus.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div>
            <h2 className="text-xl font-semibold text-primary-600 mb-4 border-b pb-2">
              Academic Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {watchCourse && (
                  <p className="mt-1 text-xs text-gray-500">
                    Selected Course: {watchCourse}
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
                {watchAdmissionDate && (
                  <p className="mt-1 text-xs text-gray-500">
                    Selected Date: {new Date(watchAdmissionDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Year of Study */}
              <div>
                <label 
                  htmlFor="yearOfStudy" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Year of Study
                </label>
                <input
                  id="yearOfStudy"
                  type="number"
                  {...register('yearOfStudy', { 
                    required: 'Year of Study is required',
                    min: {
                      value: 1,
                      message: 'Year of Study must be at least 1'
                    },
                    max: {
                      value: 6,
                      message: 'Year of Study cannot exceed 6'
                    }
                  })}
                  className={`
                    w-full rounded-md border 
                    ${errors.yearOfStudy 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-primary-500'
                    } 
                    shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1
                    px-4 py-2
                  `}
                  placeholder="Enter year of study"
                />
                {errors.yearOfStudy && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.yearOfStudy.message}
                  </p>
                )}
              </div>

              {/* Course Duration */}
              <div>
                <label 
                  htmlFor="courseDuration" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Course Duration (Years)
                </label>
                <input
                  id="courseDuration"
                  type="number"
                  {...register('courseDuration', { 
                    required: 'Course Duration is required',
                    min: {
                      value: 1,
                      message: 'Course Duration must be at least 1 year'
                    },
                    max: {
                      value: 6,
                      message: 'Course Duration cannot exceed 6 years'
                    }
                  })}
                  className={`
                    w-full rounded-md border 
                    ${errors.courseDuration 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-primary-500'
                    } 
                    shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1
                    px-4 py-2
                  `}
                  placeholder="Enter course duration"
                />
                {errors.courseDuration && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.courseDuration.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div>
            <h2 className="text-xl font-semibold text-primary-600 mb-4 border-b pb-2">
              Additional Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* National ID */}
              <div>
                <label 
                  htmlFor="nationalID" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  National ID
                </label>
                <input
                  id="nationalID"
                  type="text"
                  {...register('nationalID', { 
                    required: 'National ID is required',
                    pattern: {
                      value: /^[0-9]{20}$/,
                      message: 'National ID must be 20 digits'
                    }
                  })}
                  className={`
                    w-full rounded-md border 
                    ${errors.nationalID 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-primary-500'
                    } 
                    shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1
                    px-4 py-2
                  `}
                  placeholder="Enter 20-digit National ID"
                />
                {errors.nationalID && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.nationalID.message}
                  </p>
                )}
              </div>

              {/* Admission Number */}
              <div>
                <label 
                  htmlFor="admissionNo" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Admission Number
                </label>
                <input
                  id="admissionNo"
                  type="text"
                  {...register('admissionNo', { 
                    required: 'Admission Number is required',
                    minLength: {
                      value: 5,
                      message: 'Admission Number must be at least 5 characters'
                    }
                  })}
                  className={`
                    w-full rounded-md border 
                    ${errors.admissionNo 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-primary-500'
                    } 
                    shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1
                    px-4 py-2
                  `}
                  placeholder="Enter admission number"
                />
                {errors.admissionNo && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.admissionNo.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="
                w-full py-3 px-4 border border-transparent 
                rounded-md shadow-sm text-sm font-medium 
                text-white bg-primary-600 hover:bg-primary-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-primary-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300
                flex items-center justify-center
                space-x-2
              "
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <span>Submit Registration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentRegistrationPage
