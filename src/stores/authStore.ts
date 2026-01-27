import { create } from 'zustand'

interface AuthState {
  isUnlocked: boolean
  isLoading: boolean
  vaultExists: boolean | null
  error: string | null
  lastActivity: number

  // Actions
  checkVaultExists: () => Promise<void>
  createVault: (masterPassword: string) => Promise<boolean>
  unlock: (masterPassword: string) => Promise<boolean>
  lock: () => Promise<void>
  updateActivity: () => void
  clearError: () => void
}

const AUTO_LOCK_TIMEOUT = 5 * 60 * 1000 // 5 minutes

export const useAuthStore = create<AuthState>((set, _get) => ({
  isUnlocked: false,
  isLoading: false,
  vaultExists: null,
  error: null,
  lastActivity: Date.now(),

  checkVaultExists: async () => {
    try {
      const exists = await window.electronAPI.vault.exists()
      set({ vaultExists: exists })
    } catch {
      set({ error: 'Failed to check vault status' })
    }
  },

  createVault: async (masterPassword: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.electronAPI.vault.create(masterPassword)
      if (result.success) {
        set({ isUnlocked: true, vaultExists: true, lastActivity: Date.now() })
        return true
      } else {
        set({ error: result.error || 'Failed to create vault' })
        return false
      }
    } catch {
      set({ error: 'Failed to create vault' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  unlock: async (masterPassword: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.electronAPI.vault.unlock(masterPassword)
      if (result.success) {
        set({ isUnlocked: true, lastActivity: Date.now() })
        return true
      } else {
        set({ error: 'Incorrect master password' })
        return false
      }
    } catch {
      set({ error: 'Failed to unlock vault' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  lock: async () => {
    try {
      await window.electronAPI.vault.lock()
      set({ isUnlocked: false })
    } catch {
      set({ error: 'Failed to lock vault' })
    }
  },

  updateActivity: () => {
    set({ lastActivity: Date.now() })
  },

  clearError: () => {
    set({ error: null })
  },
}))

// Auto-lock checker
let autoLockInterval: ReturnType<typeof setInterval> | null = null

export function startAutoLockChecker() {
  if (autoLockInterval) return

  autoLockInterval = setInterval(() => {
    const state = useAuthStore.getState()
    if (state.isUnlocked && Date.now() - state.lastActivity > AUTO_LOCK_TIMEOUT) {
      state.lock()
    }
  }, 10000) // Check every 10 seconds
}

export function stopAutoLockChecker() {
  if (autoLockInterval) {
    clearInterval(autoLockInterval)
    autoLockInterval = null
  }
}
