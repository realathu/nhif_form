
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
        