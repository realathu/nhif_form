export interface User {
  id?: string
  email: string
  password?: string
  role: 'STUDENT' | 'ADMIN'
  createdAt?: Date
}

export interface StudentRegistration {
  id?: string
  userId?: string
  formFourIndexNo: string
  firstName: string
  middleName?: string
  lastName: string
  dateOfBirth: string
  maritalStatus: 'Single' | 'Married'
  gender: 'Male' | 'Female'
  admissionDate: string
  mobileNo: string
  courseName: string
  collegeFaculty: string
  yearOfStudy: number
  courseDuration: number
  nationalID: string
  admissionNo: string
  exportedAt?: Date
  createdAt?: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface Course {
  id: string
  name: string
  faculty: string
  duration: number
  active: boolean
}
