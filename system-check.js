const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Comprehensive System Check
function systemCheck() {
  console.log('🔍 Performing Comprehensive System Check')

  // Check Project Structure
  const requiredFolders = [
    'backend',
    'frontend',
    'backend/src',
    'backend/scripts',
    'frontend/src'
  ]

  requiredFolders.forEach(folder => {
    if (!fs.existsSync(path.join(process.cwd(), folder))) {
      console.error(`❌ Missing folder: ${folder}`)
      process.exit(1)
    }
  })

  // Check Key Configuration Files
  const requiredFiles = [
    'backend/package.json',
    'backend/tsconfig.json',
    'backend/.env.example',
    'frontend/package.json',
    'frontend/tsconfig.json'
  ]

  requiredFiles.forEach(file => {
    if (!fs.existsSync(path.join(process.cwd(), file))) {
      console.error(`❌ Missing file: ${file}`)
      process.exit(1)
    }
  })

  // Dependency Check
  try {
    execSync('npm run verify', { stdio: 'inherit' })
    console.log('✅ System Verification Successful')
  } catch (error) {
    console.error('❌ System Verification Failed', error)
    process.exit(1)
  }
}

systemCheck()
