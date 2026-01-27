import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useSecretsStore } from '../../stores/secretsStore'
import { useUIStore } from '../../stores/uiStore'
import { ThemePicker } from '../ui/ThemePicker'
import type { SecretType } from '../../types/secrets'
import {
  Shield,
  Key,
  Server,
  FileText,
  KeyRound,
  Star,
  FolderOpen,
  Plus,
  Lock,
  Layers,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const SECRET_TYPES: { type: SecretType | 'all'; label: string; icon: React.ReactNode }[] = [
  { type: 'all', label: 'All Items', icon: <Layers className="w-5 h-5" /> },
  { type: 'password', label: 'Passwords', icon: <Key className="w-5 h-5" /> },
  { type: 'ssh_key', label: 'SSH Keys', icon: <KeyRound className="w-5 h-5" /> },
  { type: 'server', label: 'Servers', icon: <Server className="w-5 h-5" /> },
  { type: 'note', label: 'Notes', icon: <FileText className="w-5 h-5" /> },
  { type: 'api_key', label: 'API Keys', icon: <Shield className="w-5 h-5" /> },
]

export function Sidebar() {
  const { lock } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const {
    secrets,
    categories,
    selectedType,
    selectedCategoryId,
    showFavoritesOnly,
    setSelectedType,
    setSelectedCategoryId,
    setShowFavoritesOnly,
    createCategory,
    deleteCategory,
  } = useSecretsStore()

  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    await createCategory(newCategoryName.trim())
    setNewCategoryName('')
    setIsAddingCategory(false)
  }

  const getCountForType = (type: SecretType | 'all') => {
    if (type === 'all') return secrets.length
    return secrets.filter((s) => s.type === type).length
  }

  const getCountForCategory = (categoryId: string) => {
    return secrets.filter((s) => s.categoryId === categoryId).length
  }

  const favoriteCount = secrets.filter((s) => s.favorite).length

  return (
    <aside
      className="flex flex-col border-r transition-all duration-300"
      style={{
        width: sidebarCollapsed ? '64px' : '256px',
        backgroundColor: 'var(--color-bg-primary)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Passy
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Secret Types */}
        <div>
          {!sidebarCollapsed && (
            <h3
              className="text-xs font-semibold uppercase tracking-wider px-3 mb-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Types
            </h3>
          )}
          <ul className="space-y-1">
            {SECRET_TYPES.map(({ type, label, icon }) => (
              <li key={type}>
                <button
                  onClick={() => {
                    setSelectedType(type)
                    setSelectedCategoryId(null)
                    setShowFavoritesOnly(false)
                  }}
                  className={`sidebar-item w-full ${
                    selectedType === type && !selectedCategoryId && !showFavoritesOnly
                      ? 'active'
                      : ''
                  } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                  title={sidebarCollapsed ? label : undefined}
                >
                  {icon}
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{label}</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {getCountForType(type)}
                      </span>
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Favorites */}
        <div>
          {!sidebarCollapsed && (
            <h3
              className="text-xs font-semibold uppercase tracking-wider px-3 mb-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Quick Access
            </h3>
          )}
          <button
            onClick={() => {
              setShowFavoritesOnly(true)
              setSelectedType('all')
              setSelectedCategoryId(null)
            }}
            className={`sidebar-item w-full ${showFavoritesOnly ? 'active' : ''} ${
              sidebarCollapsed ? 'justify-center px-2' : ''
            }`}
            title={sidebarCollapsed ? 'Favorites' : undefined}
          >
            <Star className="w-5 h-5" />
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left">Favorites</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {favoriteCount}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Categories - Hidden when collapsed */}
        {!sidebarCollapsed && (
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Categories
              </h3>
              <button
                onClick={() => setIsAddingCategory(true)}
                className="p-1 transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {isAddingCategory && (
              <div className="px-3 mb-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCategory()
                    if (e.key === 'Escape') {
                      setIsAddingCategory(false)
                      setNewCategoryName('')
                    }
                  }}
                  onBlur={() => {
                    if (newCategoryName.trim()) {
                      handleAddCategory()
                    } else {
                      setIsAddingCategory(false)
                    }
                  }}
                  placeholder="Category name"
                  className="input text-sm"
                  autoFocus
                />
              </div>
            )}

            <ul className="space-y-1">
              {categories.map((category) => (
                <li key={category.id} className="group relative">
                  <button
                    onClick={() => {
                      setSelectedCategoryId(category.id)
                      setSelectedType('all')
                      setShowFavoritesOnly(false)
                    }}
                    className={`sidebar-item w-full ${
                      selectedCategoryId === category.id ? 'active' : ''
                    }`}
                  >
                    <FolderOpen className="w-5 h-5" />
                    <span className="flex-1 text-left truncate">{category.name}</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {getCountForCategory(category.id)}
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteCategory(category.id)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--color-border)' }}>
        {/* Theme Picker */}
        <div className="flex justify-center">
          <ThemePicker collapsed={sidebarCollapsed} />
        </div>

        {/* Lock & Collapse buttons */}
        <div className={`flex ${sidebarCollapsed ? 'flex-col gap-2' : 'gap-2'}`}>
          <button
            onClick={() => lock()}
            className={`sidebar-item flex-1 hover:text-amber-400 ${
              sidebarCollapsed ? 'justify-center px-2' : ''
            }`}
            title={sidebarCollapsed ? 'Lock Vault' : undefined}
          >
            <Lock className="w-5 h-5" />
            {!sidebarCollapsed && <span>Lock</span>}
          </button>
          <button
            onClick={toggleSidebar}
            className={`sidebar-item ${sidebarCollapsed ? 'justify-center px-2' : 'px-2'}`}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
