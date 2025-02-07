import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../utils/api'
import { LoginCredentials } from '../types'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>()
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/login', data)
      
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      localStorage.setItem('role', response.data.role)
      localStorage.setItem('userId', response.data.userId)

      toast.success('Login successful!')
      
      // Redirect based on role
      response.data.role === 'ADMIN'
        ? navigate('/admin/dashboard')
        : navigate('/student/register')
    } catch (error) {
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const onRegister = async (data: LoginCredentials) => {
    setIsRegistering(true)
    try {
      const registrationData = {
        ...data,
        role: 'STUDENT'
      }

      const response = await api.post('/auth/register', registrationData)
      
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      localStorage.setItem('role', 'STUDENT')
      localStorage.setItem('userId', response.data.userId)

      toast.success('Registration successful!')
      navigate('/student/register')
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 
        'Registration failed. Please try again.'
      )
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-primary-600">
          NHIF Student Login
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Invalid email address'
                }
              })}
              className={`
                mt-1 block w-full rounded-md border 
                ${errors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-primary-500'
                } 
                shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1
              `}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className={`
                mt-1 block w-full rounded-md border 
                ${errors.password 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-primary-500'
                } 
                shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1
              `}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full py-2 px-4 border border-transparent 
              rounded-md shadow-sm text-sm font-medium 
              text-white bg-primary-600 hover:bg-primary-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-primary-500
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Registration Section */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Don't have an account?
          </p>
          <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Invalid email address'
                  }
                })}
                className="
                  w-full px-3 py-2 border border-gray-300 
                  rounded-md shadow-sm focus:outline-none 
                  focus:ring-primary-500 focus:border-primary-500
                "
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Create a password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="
                  w-full px-3 py-2 border border-gray-300 
                  rounded-md shadow-sm focus:outline-none 
                  focus:ring-primary-500 focus:border-primary-500
                "
              />
            </div>
            <button
              type="submit"
              disabled={isRegistering}
              className="
                w-full py-2 px-4 border border-transparent 
                rounded-md shadow-sm text-sm font-medium 
                text-white bg-green-600 hover:bg-green-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-green-500
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isRegistering ? 'Creating Account...' : 'Create Student Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
