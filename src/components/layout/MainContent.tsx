import { useState } from 'react'
import { useSecretsStore, useFilteredSecrets } from '../../stores/secretsStore'
import { SecretList } from '../secrets/SecretList'
import { SecretDetail } from '../secrets/SecretDetail'
import { SecretForm } from '../secrets/SecretForm'
import { SearchBar } from '../shared/SearchBar'
import { Plus } from 'lucide-react'
import type { SecretType } from '../../types/secrets'

export function MainContent() {
  const {
    selectedSecretId,
    setSelectedSecretId,
    selectedType,
    showFavoritesOnly,
    selectedCategoryId,
  } = useSecretsStore()
  const filteredSecrets = useFilteredSecrets()

  const [isCreating, setIsCreating] = useState(false)
  const [createType, setCreateType] = useState<SecretType>('password')

  const selectedSecret = filteredSecrets.find((s) => s.id === selectedSecretId)

  const getTitle = () => {
    if (showFavoritesOnly) return 'Favorites'
    if (selectedCategoryId) {
      const category = useSecretsStore
        .getState()
        .categories.find((c) => c.id === selectedCategoryId)
      return category?.name || 'Category'
    }
    const typeLabels: Record<SecretType | 'all', string> = {
      all: 'All Items',
      password: 'Passwords',
      ssh_key: 'SSH Keys',
      server: 'Servers',
      note: 'Notes',
      api_key: 'API Keys',
    }
    return typeLabels[selectedType]
  }

  const handleCreateNew = (type: SecretType) => {
    setCreateType(type)
    setIsCreating(true)
    setSelectedSecretId(null)
  }

  const handleCloseForm = () => {
    setIsCreating(false)
  }

  return (
    <div className="flex-1 flex">
      {/* List Section */}
      <div
        className="w-80 border-r flex flex-col"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{getTitle()}</h2>
            <div className="relative group">
              <button className="btn btn-primary flex items-center gap-1 text-sm py-1.5 px-3">
                <Plus className="w-4 h-4" />
                New
              </button>
              <div
                className="absolute right-0 top-full mt-1 w-40 rounded-lg border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' }}
              >
                <button
                  onClick={() => handleCreateNew('password')}
                  className="w-full text-left px-3 py-2 text-sm rounded-t-lg hover:bg-[var(--color-bg-secondary)]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Password
                </button>
                <button
                  onClick={() => handleCreateNew('ssh_key')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-bg-secondary)]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  SSH Key
                </button>
                <button
                  onClick={() => handleCreateNew('server')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-bg-secondary)]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Server
                </button>
                <button
                  onClick={() => handleCreateNew('note')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-bg-secondary)]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Note
                </button>
                <button
                  onClick={() => handleCreateNew('api_key')}
                  className="w-full text-left px-3 py-2 text-sm rounded-b-lg hover:bg-[var(--color-bg-secondary)]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  API Key
                </button>
              </div>
            </div>
          </div>
          <SearchBar />
        </div>

        {/* Secret List */}
        <SecretList
          secrets={filteredSecrets}
          selectedId={selectedSecretId}
          onSelect={(id) => {
            setSelectedSecretId(id)
            setIsCreating(false)
          }}
        />
      </div>

      {/* Detail Section */}
      <div className="flex-1" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {isCreating ? (
          <SecretForm type={createType} onClose={handleCloseForm} />
        ) : selectedSecret ? (
          <SecretDetail secret={selectedSecret} />
        ) : (
          <div className="h-full flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
            <div className="text-center">
              <p className="text-lg">Select an item to view details</p>
              <p className="text-sm mt-1">or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
