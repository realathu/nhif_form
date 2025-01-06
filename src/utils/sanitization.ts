import sanitizeHtml from 'sanitize-html'
import validator from 'validator'

export class InputSanitizer {
  // Sanitize HTML input
  static sanitizeHtml(input: string, options?: sanitizeHtml.IOptions): string {
    const defaultOptions: sanitizeHtml.IOptions = {
      allowedTags: [ 'b', 'i', 'em', 'strong', 'a' ],
      allowedAttributes: {
        'a': [ 'href' ]
      }
    }

    return sanitizeHtml(input, { ...defaultOptions, ...options })
  }

  // Escape special characters
  static escapeSpecialChars(input: string): string {
    return validator.escape(input)
  }

  // Normalize and validate email
  static normalizeEmail(email: string): string | false {
    return validator.normalizeEmail(email, {
      gmail_remove_dots: true,
      gmail_remove_subaddress: true,
      outlookdotcom_remove_subaddress: true,
      yahoo_remove_subaddress: true,
      icloud_remove_subaddress: true
    })
  }

  // Validate and sanitize phone number
  static sanitizePhoneNumber(phone: string): string | false {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Validate based on common formats
    if (/^(0[67][0-9]{8})$/.test(cleaned)) {
      return cleaned
    }

    return false
  }

  // Trim and clean string input
  static cleanString(input: string, maxLength: number = 500): string {
    return validator.trim(
      validator.stripLow(input)
    ).substring(0, maxLength)
  }
}
