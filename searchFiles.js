const fs = require('fs')
const path = require('path')

function findFiles(dir) {
  const results = []

  function searchDir(currentPath) {
    const files = fs.readdirSync(currentPath)

    files.forEach(file => {
      const fullPath = path.join(currentPath, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        searchDir(fullPath)
      } else if (
        file.includes('Registration') || 
        file.includes('Form') || 
        file.includes('register')
      ) {
        results.push(fullPath)
      }
    })
  }

  searchDir(dir)
  return results
}

const searchPath = path.join(process.cwd(), 'src')
const foundFiles = findFiles(searchPath)

console.log('Found Files:')
foundFiles.forEach(file => console.log(file))
