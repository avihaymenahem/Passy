import { app, BrowserWindow, ipcMain, clipboard } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { CryptoService } from './services/crypto.js'
import { DatabaseService } from './services/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null
let cryptoService: CryptoService | null = null
let databaseService: DatabaseService | null = null

const isDev = !app.isPackaged

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    show: false,
    frame: false,
    backgroundColor: '#0f172a',
  })

  // Remove the menu bar
  mainWindow.setMenu(null)

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load from the asar
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html')
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('Failed to load file:', err)
    })
  }

  // Register keyboard shortcut to toggle DevTools (F12 or Ctrl+Shift+I)
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow?.webContents.toggleDevTools()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Log loading errors in dev mode
  if (isDev) {
    mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
      console.error('Failed to load:', errorCode, errorDescription, validatedURL)
    })
  }
}

// Initialize services
function initializeServices() {
  const userDataPath = app.getPath('userData')
  cryptoService = new CryptoService()
  databaseService = new DatabaseService(userDataPath, cryptoService)
}

// App lifecycle
app.whenReady().then(() => {
  initializeServices()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers - Vault Management
ipcMain.handle('vault:exists', async () => {
  return databaseService?.vaultExists() ?? false
})

ipcMain.handle('vault:create', async (_, masterPassword: string) => {
  if (!databaseService || !cryptoService) return { success: false, error: 'Services not initialized' }
  try {
    await databaseService.createVault(masterPassword)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('vault:unlock', async (_, masterPassword: string) => {
  if (!databaseService || !cryptoService) return { success: false, error: 'Services not initialized' }
  try {
    const result = await databaseService.unlockVault(masterPassword)
    return { success: result }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('vault:lock', async () => {
  if (!databaseService) return { success: false }
  databaseService.lockVault()
  return { success: true }
})

ipcMain.handle('vault:isUnlocked', async () => {
  return databaseService?.isUnlocked() ?? false
})

// IPC Handlers - Secrets CRUD
ipcMain.handle('secrets:getAll', async () => {
  if (!databaseService?.isUnlocked()) return { success: false, error: 'Vault is locked' }
  try {
    const secrets = databaseService.getAllSecrets()
    return { success: true, data: secrets }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('secrets:getById', async (_, id: string) => {
  if (!databaseService?.isUnlocked()) return { success: false, error: 'Vault is locked' }
  try {
    const secret = databaseService.getSecretById(id)
    return { success: true, data: secret }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('secrets:create', async (_, secretData: unknown) => {
  if (!databaseService?.isUnlocked()) return { success: false, error: 'Vault is locked' }
  try {
    const secret = databaseService.createSecret(secretData as Record<string, unknown>)
    return { success: true, data: secret }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('secrets:update', async (_, id: string, secretData: unknown) => {
  if (!databaseService?.isUnlocked()) return { success: false, error: 'Vault is locked' }
  try {
    const secret = databaseService.updateSecret(id, secretData as Record<string, unknown>)
    return { success: true, data: secret }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('secrets:delete', async (_, id: string) => {
  if (!databaseService?.isUnlocked()) return { success: false, error: 'Vault is locked' }
  try {
    databaseService.deleteSecret(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// IPC Handlers - Categories
ipcMain.handle('categories:getAll', async () => {
  if (!databaseService?.isUnlocked()) return { success: false, error: 'Vault is locked' }
  try {
    const categories = databaseService.getAllCategories()
    return { success: true, data: categories }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('categories:create', async (_, name: string, icon?: string) => {
  if (!databaseService?.isUnlocked()) return { success: false, error: 'Vault is locked' }
  try {
    const category = databaseService.createCategory(name, icon)
    return { success: true, data: category }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('categories:delete', async (_, id: string) => {
  if (!databaseService?.isUnlocked()) return { success: false, error: 'Vault is locked' }
  try {
    databaseService.deleteCategory(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

// IPC Handlers - Clipboard
ipcMain.handle('clipboard:write', async (_, text: string, clearAfterMs?: number) => {
  clipboard.writeText(text)
  if (clearAfterMs && clearAfterMs > 0) {
    setTimeout(() => {
      if (clipboard.readText() === text) {
        clipboard.clear()
      }
    }, clearAfterMs)
  }
  return { success: true }
})

// IPC Handlers - Password Generator
ipcMain.handle('password:generate', async (_, options: {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}) => {
  let charset = ''
  if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (options.numbers) charset += '0123456789'
  if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  if (charset.length === 0) {
    return { success: false, error: 'At least one character type must be selected' }
  }

  const crypto = await import('crypto')
  let password = ''
  const randomBytes = crypto.randomBytes(options.length)
  for (let i = 0; i < options.length; i++) {
    password += charset[randomBytes[i] % charset.length]
  }

  return { success: true, data: password }
})

// IPC Handlers - Window Controls
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

ipcMain.handle('window:isMaximized', () => {
  return mainWindow?.isMaximized() ?? false
})
