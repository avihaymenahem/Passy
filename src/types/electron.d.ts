import type { Secret, Category, CreateSecretData } from './secrets'

export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface ElectronAPI {
  vault: {
    exists: () => Promise<boolean>
    create: (masterPassword: string) => Promise<APIResponse>
    unlock: (masterPassword: string) => Promise<APIResponse>
    lock: () => Promise<APIResponse>
    isUnlocked: () => Promise<boolean>
  }
  secrets: {
    getAll: () => Promise<APIResponse<Secret[]>>
    getById: (id: string) => Promise<APIResponse<Secret>>
    create: (data: CreateSecretData) => Promise<APIResponse<Secret>>
    update: (id: string, data: CreateSecretData) => Promise<APIResponse<Secret>>
    delete: (id: string) => Promise<APIResponse>
  }
  categories: {
    getAll: () => Promise<APIResponse<Category[]>>
    create: (name: string, icon?: string) => Promise<APIResponse<Category>>
    update: (id: string, data: { name?: string; icon?: string }) => Promise<APIResponse<Category>>
    delete: (id: string) => Promise<APIResponse>
    reorder: (orderedIds: string[]) => Promise<APIResponse>
  }
  clipboard: {
    write: (text: string, clearAfterMs?: number) => Promise<APIResponse>
  }
  password: {
    generate: (options: {
      length: number
      uppercase: boolean
      lowercase: boolean
      numbers: boolean
      symbols: boolean
    }) => Promise<APIResponse<string>>
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
