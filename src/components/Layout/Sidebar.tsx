import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  FaHome, 
  FaUserEdit, 
  FaChartBar, 
  FaCog, 
  FaUsers, 
  FaSignOutAlt 
} from 'react-icons/fa'

const Sidebar: React.FC = () => {
  const location = useLocation()
  const role = localStorage.getItem('role')

  const adminMenuItems = [
    { 
      icon: <FaHome />, 
      label: 'Dashboard', 
      path: '/admin/dashboard' 
    },
    { 
      icon: <FaUsers />, 
      label: 'Students', 
      subItems: [
        { 
          label: 'Manage Students', 
          path: '/admin/students/manage' 
        },
        { 
          label: 'Reports', 
          path: '/admin/students/reports' 
        }
      ]
    },
    { 
      icon: <FaCog />, 
      label: 'Settings', 
      subItems: [
        { 
          label: 'Enum Management', 
          path: '/admin/settings/enums' 
        },
        { 
          label: 'Admin Accounts', 
          path: '/admin/settings/admin-accounts' 
        }
      ]
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('role')
    window.location.href = '/login'
  }

  const MenuItem: React.FC<{
    icon?: React.ReactNode, 
    label: string, 
    path?: string, 
    subItems?: Array<{label: string, path: string}>
  }> = ({ icon, label, path, subItems }) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const isActive = path 
      ? location.pathname === path 
      : subItems?.some(item => location.pathname === item.path)

    const toggleSubMenu = () => {
      if (subItems) {
        setIsOpen(!isOpen)
      }
    }

    return (
      <div>
        <div 
          onClick={toggleSubMenu}
          className={`
            flex items-center p-3 mb-2 rounded transition 
            cursor-pointer
            ${isActive 
              ? 'bg-primary-100 text-primary-600' 
              : 'hover:bg-gray-100'
            }
          `}
        >
          {icon && <span className="mr-3">{icon}</span>}
          <div className="flex-grow">{label}</div>
          {subItems && (
            <span 
              className={`
                transform transition-transform 
                ${isOpen ? 'rotate-90' : ''}
              `}
            >
              ▶
            </span>
          )}
        </div>
        
        {subItems && isOpen && (
          <div className="pl-6 bg-gray-50">
            {subItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  block p-2 rounded transition 
                  ${location.pathname === item.path 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'hover:bg-gray-100'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary-600">
          NHIF Registration
        </h1>
      </div>

      <nav className="p-4">
        {adminMenuItems.map((item, index) => (
          <MenuItem 
            key={index} 
            icon={item.icon} 
            label={item.label} 
            path={item.path}
            subItems={item.subItems}
          />
        ))}

        <button 
          onClick={handleLogout}
          className="
            w-full flex items-center p-3 mt-4 
            text-red-500 hover:bg-red-50 rounded
          "
        >
          <FaSignOutAlt className="mr-3" />
          Logout
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar
