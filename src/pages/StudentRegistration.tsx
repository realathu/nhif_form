import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { 
  FaInfoCircle, 
  FaCheckCircle, 
  FaExclamationTriangle 
} from 'react-icons/fa'
import api from '../utils/api'
import { StudentRegistration, Course } from '../types'

const StudentRegistrationPage: React.FC = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [registrationProgress, setRegistrationProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { 
    register, 
    handleSubmit, 
    control,
    watch,
    formState: { errors, isValid }
  } = useForm<StudentRegistration>({
    mode: 'onChange',
    defaultValues: {
      yearOfStudy: 1,
      courseDuration: 3,
      maritalStatus: 'Single',
      gender: 'Male'
    }
  })

  // Calculate registration progress
  const watchedFields = watch()
  useEffect(() => {
    const totalFields = Object.keys(watchedFields).length
    const filledFields = Object.values(watchedFields).filter(
      value => value !== undefined && value !== ''
    ).length

    const progress = Math.round((filledFields / totalFields) * 100)
    setRegistrationProgress(progress)
  }, [watchedFields])

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/enums/courses')
        setCourses(response.data.filter((course: Course) => course.active))
      } catch (error) {
        toast.error('Failed to load courses', {
          icon: <FaExclamationTriangle className="text-yellow-500" />
        })
      }
    }
    fetchCourses()
  }, [])

  const onSubmit = async (data: StudentRegistration) => {
    setIsSubmitting(true)
    try {
      // Comprehensive validation
      const validationErrors: string[] = []
      
      // Custom validation examples
      if (data.yearOfStudy > data.courseDuration) {
        validationErrors.push('Year of study cannot exceed course duration')
      }

      if (validationErrors.length > 0) {
        validationErrors.forEach(error => 
          toast.error(error, { 
            icon: <FaExclamationTriangle className="text-red-500" /> 
          })
        )
        setIsSubmitting(false)
        return
      }

      // Confirmation modal with detailed warning
      const confirmed = window.confirm(`
        NHIF REGISTRATION CONFIRMATION

        Please carefully review your information:

        Personal Details:
        - Name: ${data.firstName} ${data.lastName}
        - Date of Birth: ${data.dateOfBirth}
        - Gender: ${data.gender}

        Academic Details:
        - Course: ${data.courseName}
        - Admission Date: ${data.admissionDate}

        IMPORTANT: 
        1. Ensure all information is accurate
        2. Incorrect details may affect your NHIF registration
        3. You cannot modify these details after submission

        Do you want to proceed?
      `)

      if (!confirmed) {
        setIsSubmitting(false)
        return
      }

      // Submit registration
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Progress Indicator */}
        <div className="bg-gray-100 p-4">
          <div className="flex items-center">
            <div 
              className="w-full bg-gray-200 rounded-full h-2.5 mr-4"
              title={`Registration Progress: ${registrationProgress}%`}
            >
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${registrationProgress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-500">
              {registrationProgress}%
            </span>
          </div>
        </div>

        <div className="bg-primary-600 text-white text-center py-4">
          <h1 className="text-2xl font-bold">NHIF Student Registration</h1>
          <p className="text-sm text-primary-100">
            Complete all fields to proceed with NHIF registration
          </p>
        </div>

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="p-6 space-y-6"
        >
          {/* Existing form fields remain the same */}
          {/* ... (previous implementation) ... */}

          {/* Submit Button with Progress Indication */}
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
                flex items-center justify-center
                transition-all duration-300
              "
            >
              {isSubmitting ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentRegistrationPage
