import axios from 'axios'
import { toast } from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for adding token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor for handling errors
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Token expired, attempt to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post('/api/auth/refresh-token', { refreshToken })
        
        const { accessToken, refreshToken: newRefreshToken } = response.data
        
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)
        
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        toast.error('Session expired. Please login again.')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast.error(errorMessage)
    
    return Promise.reject(error)
  }
)

// Auth-related API methods
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string) => 
    api.post('/auth/register', { email, password }),
  
  refreshToken: (refreshToken: string) => 
    api.post('/auth/refresh-token', { refreshToken })
}

// Student-related API methods
export const studentApi = {
  register: (data: any) => 
    api.post('/students/register', data),
  
  getMyRegistration: () => 
    api.get('/students/my-registration')
}

// Admin-related API methods
export const adminApi = {
  getStudents: (params?: any) => 
    api.get('/admin/students', { params }),
  
  getDashboardStats: () => 
    api.get('/admin/dashboard'),
  
  exportStudents: (data?: any) => 
    api.post('/admin/export', data)
}

export default api
