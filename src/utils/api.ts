import axios from 'axios'
import { toast } from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
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

export default api
