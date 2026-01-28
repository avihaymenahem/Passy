import { create } from 'zustand'
import type { Secret, Category, SecretType, CreateSecretData } from '../types/secrets'

interface SecretsState {
  secrets: Secret[]
  categories: Category[]
  isLoading: boolean
  error: string | null

  // Filters
  searchQuery: string
  selectedType: SecretType | 'all'
  selectedCategoryId: string | null
  showFavoritesOnly: boolean

  // Selection
  selectedSecretId: string | null

  // Actions
  loadSecrets: () => Promise<void>
  loadCategories: () => Promise<void>
  createSecret: (data: CreateSecretData) => Promise<Secret | null>
  updateSecret: (id: string, data: CreateSecretData) => Promise<Secret | null>
  deleteSecret: (id: string) => Promise<boolean>
  toggleFavorite: (id: string) => Promise<void>

  // Category actions
  createCategory: (name: string, icon?: string) => Promise<Category | null>
  updateCategory: (id: string, data: { name?: string; icon?: string }) => Promise<Category | null>
  deleteCategory: (id: string) => Promise<boolean>
  reorderCategories: (orderedIds: string[]) => Promise<boolean>

  // Filter actions
  setSearchQuery: (query: string) => void
  setSelectedType: (type: SecretType | 'all') => void
  setSelectedCategoryId: (id: string | null) => void
  setShowFavoritesOnly: (show: boolean) => void
  setSelectedSecretId: (id: string | null) => void

  clearError: () => void
}

export const useSecretsStore = create<SecretsState>((set, get) => ({
  secrets: [],
  categories: [],
  isLoading: false,
  error: null,

  searchQuery: '',
  selectedType: 'all',
  selectedCategoryId: null,
  showFavoritesOnly: false,
  selectedSecretId: null,

  loadSecrets: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.electronAPI.secrets.getAll()
      if (result.success && result.data) {
        set({ secrets: result.data })
      } else {
        set({ error: result.error || 'Failed to load secrets' })
      }
    } catch {
      set({ error: 'Failed to load secrets' })
    } finally {
      set({ isLoading: false })
    }
  },

  loadCategories: async () => {
    try {
      const result = await window.electronAPI.categories.getAll()
      if (result.success && result.data) {
        set({ categories: result.data })
      }
    } catch {
      // Silently fail for categories
    }
  },

  createSecret: async (data: CreateSecretData) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.electronAPI.secrets.create(data)
      if (result.success && result.data) {
        set((state) => ({
          secrets: [result.data!, ...state.secrets],
          selectedSecretId: result.data!.id,
        }))
        return result.data
      } else {
        set({ error: result.error || 'Failed to create secret' })
        return null
      }
    } catch {
      set({ error: 'Failed to create secret' })
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  updateSecret: async (id: string, data: CreateSecretData) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.electronAPI.secrets.update(id, data)
      if (result.success && result.data) {
        set((state) => ({
          secrets: state.secrets.map((s) => (s.id === id ? result.data! : s)),
        }))
        return result.data
      } else {
        set({ error: result.error || 'Failed to update secret' })
        return null
      }
    } catch {
      set({ error: 'Failed to update secret' })
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  deleteSecret: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.electronAPI.secrets.delete(id)
      if (result.success) {
        set((state) => ({
          secrets: state.secrets.filter((s) => s.id !== id),
          selectedSecretId: state.selectedSecretId === id ? null : state.selectedSecretId,
        }))
        return true
      } else {
        set({ error: result.error || 'Failed to delete secret' })
        return false
      }
    } catch {
      set({ error: 'Failed to delete secret' })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  toggleFavorite: async (id: string) => {
    const secret = get().secrets.find((s) => s.id === id)
    if (!secret) return

    const updatedData = { ...secret, favorite: !secret.favorite } as CreateSecretData
    await get().updateSecret(id, updatedData)
  },

  createCategory: async (name: string, icon?: string) => {
    try {
      const result = await window.electronAPI.categories.create(name, icon)
      if (result.success && result.data) {
        set((state) => ({
          categories: [...state.categories, result.data!],
        }))
        return result.data
      }
      return null
    } catch {
      return null
    }
  },

  updateCategory: async (id: string, data: { name?: string; icon?: string }) => {
    try {
      const result = await window.electronAPI.categories.update(id, data)
      if (result.success && result.data) {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? (result.data as Category) : c
          ),
        }))
        return result.data as Category
      }
      return null
    } catch {
      return null
    }
  },

  deleteCategory: async (id: string) => {
    try {
      const result = await window.electronAPI.categories.delete(id)
      if (result.success) {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          selectedCategoryId: state.selectedCategoryId === id ? null : state.selectedCategoryId,
        }))
        return true
      }
      return false
    } catch {
      return false
    }
  },

  reorderCategories: async (orderedIds: string[]) => {
    try {
      // Optimistically update the UI
      set((state) => {
        const categoryMap = new Map(state.categories.map((c) => [c.id, c]))
        const reordered = orderedIds
          .map((id, index) => {
            const cat = categoryMap.get(id)
            return cat ? { ...cat, sortOrder: index } : null
          })
          .filter((c): c is Category => c !== null)
        return { categories: reordered }
      })

      const result = await window.electronAPI.categories.reorder(orderedIds)
      if (!result.success) {
        // Reload categories if the reorder failed
        get().loadCategories()
        return false
      }
      return true
    } catch {
      get().loadCategories()
      return false
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedType: (type: SecretType | 'all') => set({ selectedType: type }),
  setSelectedCategoryId: (id: string | null) => set({ selectedCategoryId: id }),
  setShowFavoritesOnly: (show: boolean) => set({ showFavoritesOnly: show }),
  setSelectedSecretId: (id: string | null) => set({ selectedSecretId: id }),

  clearError: () => set({ error: null }),
}))

// Selector for filtered secrets
export function useFilteredSecrets() {
  const { secrets, searchQuery, selectedType, selectedCategoryId, showFavoritesOnly } =
    useSecretsStore()

  return secrets.filter((secret) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const nameMatch = secret.name.toLowerCase().includes(query)
      let extraMatch = false

      if (secret.type === 'password') {
        extraMatch =
          secret.url?.toLowerCase().includes(query) ||
          secret.username?.toLowerCase().includes(query) ||
          false
      } else if (secret.type === 'server') {
        extraMatch = secret.hostname.toLowerCase().includes(query)
      } else if (secret.type === 'api_key') {
        extraMatch = secret.serviceName?.toLowerCase().includes(query) || false
      }

      if (!nameMatch && !extraMatch) return false
    }

    // Type filter
    if (selectedType !== 'all' && secret.type !== selectedType) return false

    // Category filter
    if (selectedCategoryId && secret.categoryId !== selectedCategoryId) return false

    // Favorites filter
    if (showFavoritesOnly && !secret.favorite) return false

    return true
  })
}
