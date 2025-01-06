import React from 'react'
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Pages
import Login from './pages/Login'
import StudentRegistration from './pages/StudentRegistration'
import AdminDashboard from './pages/AdminDashboard'
import MainLayout from './components/Layout/MainLayout'

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode, 
  requiredRole?: 'STUDENT' | 'ADMIN' 
}> = ({ children, requiredRole }) => {
  const token = localStorage.getItem('accessToken')
  const role = localStorage.getItem('role')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/login" replace />
  }

  return <MainLayout>{children}</MainLayout>
}

// Create a client
const queryClient = new QueryClient()

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Student Routes */}
          <Route 
            path="/student/register" 
            element={
              <ProtectedRoute requiredRole="STUDENT">
                <StudentRegistration />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Default Redirect */}
          <Route 
            path="*" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  )
}

export default App
