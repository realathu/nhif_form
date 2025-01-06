import fs from 'fs'
import path from 'path'
import { config } from '../config'

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

class Logger {
  private logFile: string
  private currentLogFile: string
  private maxLogSize: number
  private logLevel: LogLevel

  constructor() {
    const logDir = path.join(process.cwd(), 'logs')
    
    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir)
    }

    this.logFile = path.join(logDir, 'app.log')
    this.currentLogFile = this.getCurrentLogFile()
    this.maxLogSize = 10 * 1024 * 1024 // 10MB
    this.logLevel = this.getLogLevel()
  }

  private getCurrentLogFile(): string {
    const timestamp = new Date().toISOString().replace(/:/g, '-')
    return path.join(path.dirname(this.logFile), `app-${timestamp}.log`)
  }

  private getLogLevel(): LogLevel {
    switch (config.env) {
      case 'production':
        return LogLevel.WARN
      case 'development':
        return LogLevel.DEBUG
      default:
        return LogLevel.INFO
    }
  }

  private rotateLogIfNeeded() {
    try {
      const stats = fs.statSync(this.logFile)
      if (stats.size > this.maxLogSize) {
        fs.renameSync(this.logFile, this.currentLogFile)
      }
    } catch (error) {
      // File might not exist, which is fine
    }
  }

  private log(level: LogLevel, message: string, meta?: Record<string, any>) {
    // Only log if the current level is less than or equal to the configured level
    if (this.shouldLog(level)) {
      this.rotateLogIfNeeded()

      const timestamp = new Date().toISOString()
      const logEntry = JSON.stringify({
        timestamp,
        level,
        message,
        meta,
        env: config.env
      }) + '\n'

      // Write to file
      fs.appendFileSync(this.logFile, logEntry)

      // Console logging for development
      if (config.env !== 'production') {
        console.log(`[${level}] ${message}`, meta)
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const logLevels = [
      LogLevel.ERROR,
      LogLevel.WARN,
      LogLevel.INFO,
      LogLevel.DEBUG
    ]
    return logLevels.indexOf(level) <= logLevels.indexOf(this.logLevel)
  }

  error(message: string, meta?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, meta)
  }

  warn(message: string, meta?: Record<string, any>) {
    this.log(LogLevel.WARN, message, meta)
  }

  info(message: string, meta?: Record<string, any>) {
    this.log(LogLevel.INFO, message, meta)
  }

  debug(message: string, meta?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, meta)
  }
}

export default new Logger()
