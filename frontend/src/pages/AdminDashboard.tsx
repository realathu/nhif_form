import React, { useState, useEffect } from 'react'
import { adminApi } from '../utils/api'
import { toast } from 'react-hot-toast'

const AdminDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    todayStudents: 0,
    exportedStudents: 0
  })

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await adminApi.getDashboardStats()
        setDashboardStats(response.data)
      } catch (error) {
        toast.error('Failed to fetch dashboard statistics')
      }
    }

    fetchDashboardStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl">Total Students</h2>
          <p className="text-2xl">{dashboardStats.totalStudents}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl">Students Today</h2>
          <p className="text-2xl">{dashboardStats.todayStudents}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl">Exported Students</h2>
          <p className="text-2xl">{dashboardStats.exportedStudents}</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
