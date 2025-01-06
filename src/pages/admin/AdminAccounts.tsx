
import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import { FaUserPlus, FaTrash } from 'react-icons/fa'

interface AdminAccount {
  id: string
  email: string
  name?: string
  createdAt: string
}

const AdminAccounts: React.FC = () => {
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([])
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false)

  // Fetch admin accounts
  useEffect(() => {
    const fetchAdminAccounts = async () => {
      try {
        const response = await api.get('/admin/admin-accounts')
        setAdminAccounts(response.data)
      } catch (error) {
        toast.error('Failed to load admin accounts')
      }
    }
    fetchAdminAccounts()
  }, [])

  // Add Admin Modal Component
  const AddAdminModal: React.FC = () => {
    const [formData, setFormData] = useState({
      email: '',
      name: '',
      password: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        const response = await api.post('/admin/add-admin', formData)
        
        // Add new admin to list
        setAdminAccounts(prev => [...prev, response.data])
        
        toast.success('Admin account created successfully')
        setIsAddAdminModalOpen(false)
      } catch (error) {
        toast.error('Failed to create admin account')
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Add New Admin</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Name (Optional)</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
                minLength={6}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsAddAdminModalOpen(false)}
                className="btn btn-secondary