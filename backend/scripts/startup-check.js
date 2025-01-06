const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function checkEnvironment() {
  console.log('🔍 Backend Startup Verification')

  // Check Node.js version
  const nodeVersion = process.version
  console.log(`Node.js Version: ${nodeVersion}`)

  // Check required configuration files
  const requiredFiles = [
    '.env',
    'package.json',
    'tsconfig.json'
  ]

  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file)
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing file: ${file}`)
      process.exit(1)
    }
  })

  // Check environment variables
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET'
  ]

  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      console.warn(`⚠️ Missing environment variable: ${varName}`)
    }
  })

  // Dependency check
  try {
    console.log('📦 Checking dependencies...')
    execSync('npm list --depth=0', { stdio: 'ignore' })
    console.log('✅ Dependencies verified')
  } catch (error) {
    console.error('❌ Dependency check failed', error)
    process.exit(1)
  }

  // TypeScript compilation check
  try {
    console.log('🔨 Checking TypeScript compilation...')
    execSync('npm run build', { stdio: 'inherit' })
    console.log('✅ TypeScript compilation successful')
  } catch (error) {
    console.error('❌ TypeScript compilation failed', error)
    process.exit(1)
  }

  // Database migration check
  try {
    console.log('💾 Checking database migration...')
    execSync('npm run migrate', { stdio: 'inherit' })
    console.log('✅ Database migration successful')
  } catch (error) {
    console.error('❌ Database migration failed', error)
    process.exit(1)
  }

  console.log('🚀 Backend startup verification complete!')
}

// Run the verification
checkEnvironment()
