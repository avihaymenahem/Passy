// Post-build script to fix HTML for Electron compatibility
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const indexPath = join(__dirname, '..', 'dist', 'index.html')
let html = readFileSync(indexPath, 'utf-8')

// Remove crossorigin attribute from script and link tags
// This is needed for Electron's file:// protocol to work correctly
html = html.replace(/ crossorigin/g, '')

writeFileSync(indexPath, html)
console.log('Fixed dist/index.html for Electron compatibility')
