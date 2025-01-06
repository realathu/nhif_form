import React from 'react'
import { Toaster } from 'react-hot-toast'
import Sidebar from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        {children}
      </main>

      <Toaster 
        position="top-right"
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 5000 }
        }}
      />
    </div>
  )
}

export default MainLayout
