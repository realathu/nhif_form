import crypto from 'crypto'
import { config } from '../config'
import logger from './logger'

// Simplified Password Strength Checker
export class PasswordStrengthChecker {
  // Simplified password assessment
  static assess(password: string): {
    score: number
    feedback: string[]
  } {
    const checks = [
      { 
        test: (p: string) => p.length >= 6, 
        message: 'Password should be at least 6 characters long' 
      },
      { 
        test: (p: string) => /[a-zA-Z]/.test(p), 
        message: 'Password should contain letters' 
      },
      { 
        test: (p: string) => /[0-9]/.test(p), 
        message: 'Password should contain numbers' 
      }
    ]

    const results = checks.map(check => check.test(password))
    const score = results.filter(Boolean).length
    const feedback = results.map((passed, index) => 
      passed ? null : checks[index].message
    ).filter(Boolean)

    return { 
      score, 
      feedback 
    }
  }

  // Generate a more user-friendly password
  static generate(length: number = 10): string {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numberChars = '0123456789'
    
    const allChars = lowercaseChars + uppercaseChars + numberChars
    
    const getRandomChar = (chars: string) => 
      chars[crypto.randomInt(chars.length)]

    let password = ''
    
    // Ensure at least one of each type
    password += getRandomChar(lowercaseChars)
    password += getRandomChar(uppercaseChars)
    password += getRandomChar(numberChars)

    // Fill the rest of the password
    while (password.length < length) {
      password += getRandomChar(allChars)
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => 0.5 - crypto.randomInt(2))
      .join('')
  }
}
