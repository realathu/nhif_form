import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCheckCircle, FaPrint, FaDownload } from 'react-icons/fa'
import api from '../utils/api'
import { StudentRegistration } from '../types'

const StudentConfirmation: React.FC = () => {
  const navigate = useNavigate()
  const [studentData, setStudentData] = useState<StudentRegistration | null>(null)
  const [controlNumber, setControlNumber] = useState<string | null>(null)

  useEffect(() => {
    // Fetch most recent student registration
    const fetchStudentRegistration = async () => {
      try {
        const response = await api.get('/students/my-registration')
        setStudentData(response.data)
        
        // Generate a mock control number (in real scenario, this would come from backend)
        const mockControlNumber = `NHIF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        setControlNumber(mockControlNumber)
      } catch (error) {
        console.error('Failed to fetch registration', error)
        navigate('/student/register')
      }
    }

    fetchStudentRegistration()
  }, [navigate])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await api.post('/students/generate-pdf', studentData, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `nhif_registration_${studentData?.firstName}_${studentData?.lastName}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('PDF generation failed', error)
    }
  }

  if (!studentData) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-green-500 text-white p-6 text-center">
          <FaCheckCircle className="mx-auto text-6xl mb-4" />
          <h1 className="text-3xl font-bold">Registration Successful!</h1>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                Personal Details
              </h2>
              <div className="space-y-2">
                <p><strong>Name:</strong> {studentData.firstName} {studentData.lastName}</p>
                <p><strong>Date of Birth:</strong> {studentData.dateOfBirth}</p>
                <p><strong>Gender:</strong> {studentData.gender}</p>
                <p><strong>Mobile Number:</strong> {studentData.mobileNo}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                Academic Details
              </h2>
              <div className="space-y-2">
                <p><strong>Course:</strong> {studentData.courseName}</p>
                <p><strong>Admission Date:</strong> {studentData.admissionDate}</p>
                <p><strong>Year of Study:</strong> {studentData.yearOfStudy}</p>
                <p><strong>Admission Number:</strong> {studentData.admissionNo}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              NHIF Registration Control Number
            </h3>
            <div className="text-2xl font-bold text-blue-600 text-center">
              {controlNumber}
            </div>
            <p className="text-sm text-blue-600 text-center mt-2">
              Please keep this control number for future reference
            </p>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={handlePrint}
              className="
                flex items-center space-x-2 
                bg-primary-600 text-white 
                px-4 py-2 rounded-md 
                hover:bg-primary-700
              "
            >
              <FaPrint />
              <span>Print Confirmation</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="
                flex items-center space-x-2 
                bg-green-600 text-white 
                px-4 py-2 rounded-md 
                hover:bg-green-700
              "
            >
              <FaDownload />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentConfirmation
