// Use loose typing for zod
import * as z from 'zod'

// User Registration Validation
export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters'),
  role: z.enum(['STUDENT', 'ADMIN']).optional().default('STUDENT')
})

// Student Registration Validation
export const StudentRegistrationSchema = z.object({
  formFourIndexNo: z.string().min(1, 'Form Four Index No is required'),
  firstName: z.string().min(1, 'First Name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last Name is required'),
  dateOfBirth: z.string().refine((dateStr: any) => {
    const birthDate = new Date(dateStr)
    const minAge = new Date()
    minAge.setFullYear(minAge.getFullYear() - 16)
    return birthDate <= minAge
  }, { message: 'You must be at least 16 years old' }),
  maritalStatus: z.enum(['Single', 'Married'], { 
    errorMap: () => ({ message: 'Invalid marital status' }) 
  }),
  gender: z.enum(['Male', 'Female'], { 
    errorMap: () => ({ message: 'Invalid gender' }) 
  }),
  admissionDate: z.string().refine((dateStr: any) => {
    const admission = new Date(dateStr)
    const now = new Date()
    return admission <= now
  }, { message: 'Admission date cannot be in the future' }),
  mobileNo: z.string()
    .regex(/^0[67][0-9]{8}$/, 'Invalid mobile number format'),
  courseName: z.string().min(1, 'Course Name is required'),
  collegeFaculty: z.string().min(1, 'College/Faculty is required'),
  yearOfStudy: z.number().min(1).max(6, 'Invalid year of study'),
  courseDuration: z.number().min(1).max(6, 'Invalid course duration'),
  nationalID: z.string()
    .regex(/^[0-9]{20}$/, 'National ID must be 20 digits'),
  admissionNo: z.string().min(1, 'Admission Number is required')
})

// Validation Utility
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err: any) => ({
        path: err.path.join('.'),
        message: err.message
      }))
      throw new ValidationError('Validation failed', formattedErrors)
    }
    throw error
  }
}

// Custom Validation Error
export class ValidationError extends Error {
  errors: Array<{ path: string, message: string }>

  constructor(message: string, errors: Array<{ path: string, message: string }>) {
    super(message)
    this.name = 'ValidationError'
    this.errors = errors
  }
}
