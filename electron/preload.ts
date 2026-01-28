import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Vault management
  vault: {
    exists: () => ipcRenderer.invoke('vault:exists'),
    create: (masterPassword: string) => ipcRenderer.invoke('vault:create', masterPassword),
    unlock: (masterPassword: string) => ipcRenderer.invoke('vault:unlock', masterPassword),
    lock: () => ipcRenderer.invoke('vault:lock'),
    isUnlocked: () => ipcRenderer.invoke('vault:isUnlocked'),
  },

  // Secrets CRUD
  secrets: {
    getAll: () => ipcRenderer.invoke('secrets:getAll'),
    getById: (id: string) => ipcRenderer.invoke('secrets:getById', id),
    create: (data: unknown) => ipcRenderer.invoke('secrets:create', data),
    update: (id: string, data: unknown) => ipcRenderer.invoke('secrets:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('secrets:delete', id),
  },

  // Categories
  categories: {
    getAll: () => ipcRenderer.invoke('categories:getAll'),
    create: (name: string, icon?: string) => ipcRenderer.invoke('categories:create', name, icon),
    update: (id: string, data: { name?: string; icon?: string }) => ipcRenderer.invoke('categories:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('categories:delete', id),
    reorder: (orderedIds: string[]) => ipcRenderer.invoke('categories:reorder', orderedIds),
  },

  // Clipboard
  clipboard: {
    write: (text: string, clearAfterMs?: number) =>
      ipcRenderer.invoke('clipboard:write', text, clearAfterMs),
  },

  // Password generator
  password: {
    generate: (options: {
      length: number
      uppercase: boolean
      lowercase: boolean
      numbers: boolean
      symbols: boolean
    }) => ipcRenderer.invoke('password:generate', options),
  },

  // Window controls
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },
})

// Type definitions for the exposed API
export interface ElectronAPI {
  vault: {
    exists: () => Promise<boolean>
    create: (masterPassword: string) => Promise<{ success: boolean; error?: string }>
    unlock: (masterPassword: string) => Promise<{ success: boolean; error?: string }>
    lock: () => Promise<{ success: boolean }>
    isUnlocked: () => Promise<boolean>
  }
  secrets: {
    getAll: () => Promise<{ success: boolean; data?: unknown[]; error?: string }>
    getById: (id: string) => Promise<{ success: boolean; data?: unknown; error?: string }>
    create: (data: unknown) => Promise<{ success: boolean; data?: unknown; error?: string }>
    update: (id: string, data: unknown) => Promise<{ success: boolean; data?: unknown; error?: string }>
    delete: (id: string) => Promise<{ success: boolean; error?: string }>
  }
  categories: {
    getAll: () => Promise<{ success: boolean; data?: unknown[]; error?: string }>
    create: (name: string, icon?: string) => Promise<{ success: boolean; data?: unknown; error?: string }>
    update: (id: string, data: { name?: string; icon?: string }) => Promise<{ success: boolean; data?: unknown; error?: string }>
    delete: (id: string) => Promise<{ success: boolean; error?: string }>
    reorder: (orderedIds: string[]) => Promise<{ success: boolean; error?: string }>
  }
  clipboard: {
    write: (text: string, clearAfterMs?: number) => Promise<{ success: boolean }>
  }
  password: {
    generate: (options: {
      length: number
      uppercase: boolean
      lowercase: boolean
      numbers: boolean
      symbols: boolean
    }) => Promise<{ success: boolean; data?: string; error?: string }>
  }
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    isMaximized: () => Promise<boolean>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
