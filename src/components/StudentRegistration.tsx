import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const StudentRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    formFourIndexNo: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    maritalStatus: '',
    gender: '',
    admissionDate: '',
    mobileNo: '',
    courseName: '',
    collegeFaculty: '',
    yearOfStudy: 1,
    courseDuration: 3,
    nationalID: '',
    admissionNo: ''
  })

  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const confirmed = window.confirm(
      "IMPORTANT: Please verify all information carefully. Incorrect details may affect your NHIF registration. Are you sure you want to submit?"
    )

    if (confirmed) {
      try {
        const response = await fetch('/api/students/register', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (response.ok) {
          alert("Your information has been submitted successfully. The dean will process your registration and provide a control number via the mobile number you provided.")
          navigate('/login')
        } else {
          alert(data.message)
        }
      } catch (error) {
        console.error('Registration error', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl mb-4 text-center">NHIF Student Registration</h2>
        
        <div className="grid grid-cols-1 gap-4">
          <input 
            type="text" 
            name="formFourIndexNo" 
            placeholder="Form Four Index No" 
            value={formData.formFourIndexNo}
            onChange={handleChange}
            required 
            className="w-full p-2 border rounded"
          />
          <input 
            type="text" 
            name="firstName" 
            placeholder="First Name" 
            value={formData.firstName}
            onChange={handleChange}
            required 
            className="w-full p-2 border rounded"
          />
          <input 
            type="text" 
            name="middleName" 
            placeholder="Middle Name (Optional)" 
            value={formData.middleName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input 
            type="text" 
            name="lastName" 
            placeholder="Last Name" 
            value={formData.lastName}
            onChange={handleChange}
            required 
            className="w-full p-2 border rounded"
          />
          <input 
            type="date" 
            name="dateOfBirth" 
            placeholder="Date of Birth" 
            value={formData.dateOfBirth}
            onChange={handleChange}
            required 
            className="w-full p-2 border rounded"
          />
          <select 
            name="maritalStatus" 
            value={formData.maritalStatus}
            onChange={handleChange}
            required 
            className="w-full p-2 border rounded"
          >
            <option value="">Select Marital Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
          </select>
          <select 
            name="gender" 
            value={formData.gender}
            onChange={handleChange}
            required 
            className="w-full p-2 border rounded"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input 
            type="date" 
            name="admissionDate" 
            placeholder="Admission Date" 
            value={formData.admissionDate}
            onChange={handleChange}
            required 
            className="w-full p-2 border rounded"
          />
          <input 
            type="tel" 
            name="mobileNo" 
            placeholder="Mobile Number" 
            value={formData.mobileNo}
            onChange={handleChange}
            required 
            className="w-full p-2 border rounded"
          />
          <input 
            type="text" 
            name="courseName" 
            placeholder="Course Name" 
            value={formData.courseName}
            onChange={handleChange}
            required 
            className="w-full p-2 border rounded"
          />
          <input 
            type="text" 
            name="collegeFaculty" 
            placeholder="College/Faculty" 
            value={formData.collegeFaculty}
            onChange={handleChange}
            required 
            className="w-full p-2 border rounded"
          />
          <input 
            type="number" 
            name="yearOfStudy" 
            placeholder="Year of Study" 
            value={formData.yearOfStudy}
            onChange={handleChange}
            required 
            className="w-full p-2 border rounded"
          />
          <input 
            type="number" 
            name="courseDuration" 
            placeholder="Course Duration (Years)" 
            value={formData.courseDuration}
            onChange={handleChange}
            required 
            className="w-full p-2 border rounded"
          />
          <input 
            type="text" 
            name="nationalID" 
            placeholder="National ID" 
            value={formData.nationalID}
            onChange={handleChange}
            required 
            className="w-full p-2 border rounded"
          />
          <input 
            type="text" 
            name="admissionNo" 
            placeholder="Admission Number" 
            value={formData.admissionNo}
            onChange={handleChange}
            required 
            className="w-full p-2 border rounded"
          />
        </div>

        <button 
          type="submit" 
          className="w-full mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Submit Registration
        </button>
      </form>
    </div>
  )
}

export default StudentRegistration
