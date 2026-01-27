import { Search, X } from 'lucide-react'
import { useSecretsStore } from '../../stores/secretsStore'

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useSecretsStore()

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg border"
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search secrets..."
        className="flex-1 bg-transparent text-sm outline-none"
        style={{ color: 'var(--color-text-primary)' }}
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="p-0.5 transition-colors flex-shrink-0"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
