// Rename preload.js to preload.cjs for CommonJS compatibility
// This is needed because package.json has "type": "module"
import { renameSync, existsSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const srcPath = join(__dirname, '..', 'dist-electron', 'preload.js')
const destPath = join(__dirname, '..', 'dist-electron', 'preload.cjs')

if (existsSync(srcPath)) {
  // Remove existing .cjs file if it exists
  if (existsSync(destPath)) {
    unlinkSync(destPath)
  }
  renameSync(srcPath, destPath)
  console.log('Renamed preload.js to preload.cjs')
} else {
  console.error('preload.js not found!')
  process.exit(1)
}
