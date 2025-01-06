
import React, { useState, useEffect } from 'react'
import XLSX from 'xlsx'

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    todayStudents: 0,
    exportedStudents: 0
  })
  const [students, setStudents] = useState([])

  useEffect(() => {
    fetchDashboardData()
    fetchStudents()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Dashboard data fetch error', error)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/students', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error('Students fetch error', error)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.blob()
      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `NHIF_Students_Export_${new Date().toISOString()}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl mb-6 text-center">Admin Dashboard</h1>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl">Total Students</h2>
            <p className="text-2xl">{dashboardData.totalStudents}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl">Students Today</h2>
            <p className="text-2xl">{dashboardData.todayStudents}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl">Exported Students</h2>
            <p className="text-2xl">{dashboardData.exportedStudents}</p>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button 
            onClick={handleExport}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Export to Excel
          </button>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-2xl mb-4">Student Registrations</h2>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Course</th>
                <th className="p-2 text-left">Mobile No</th>
                <th className="p-2 text-left">Submitted At</th>
                <th className="p-2 text-left">Exported</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student: any) => (
                <tr key={student.id} className="border-b">
                  <td className="p-2">{student.firstName} {student.lastName}</td>
                  <td className="p-2">{student.courseName}</td>
                  <td className="p-2">{student.mobileNo}</td>
                  <td className="p-2">{new Date(student.createdAt).toLocaleString()}</td>
                  <td className="p-2">
                    {student.exportedAt ? 
                      <span className="text-green-500">✓</span> : 
                      <span className