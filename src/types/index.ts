export interface User {
  id: string
  email: string
  role: 'STUDENT' | 'ADMIN'
}

export interface StudentRegistration {
  id?: string
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
}

export interface Course {
  id: string
  name: string
  faculty: string
  duration: number
  active: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
