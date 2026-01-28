import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useSecretsStore } from '../../stores/secretsStore'
import { useUIStore } from '../../stores/uiStore'
import { ThemePicker } from '../ui/ThemePicker'
import type { SecretType, Category } from '../../types/secrets'
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
  Pencil,
  GripVertical,
} from 'lucide-react'

interface ContextMenuState {
  isOpen: boolean
  x: number
  y: number
  categoryId: string | null
}

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
    updateCategory,
    deleteCategory,
    reorderCategories,
  } = useSecretsStore()

  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null)
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    categoryId: null,
  })
  const dragCounter = useRef(0)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    await createCategory(newCategoryName.trim())
    setNewCategoryName('')
    setIsAddingCategory(false)
  }

  const handleStartEdit = (category: Category) => {
    setEditingCategoryId(category.id)
    setEditingCategoryName(category.name)
  }

  const handleSaveEdit = async () => {
    if (!editingCategoryId || !editingCategoryName.trim()) {
      setEditingCategoryId(null)
      setEditingCategoryName('')
      return
    }
    await updateCategory(editingCategoryId, { name: editingCategoryName.trim() })
    setEditingCategoryId(null)
    setEditingCategoryName('')
  }

  const handleCancelEdit = () => {
    setEditingCategoryId(null)
    setEditingCategoryName('')
  }

  const handleContextMenu = (e: React.MouseEvent, categoryId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      categoryId,
    })
  }

  const closeContextMenu = () => {
    setContextMenu({ isOpen: false, x: 0, y: 0, categoryId: null })
  }

  const handleContextMenuEdit = () => {
    const category = categories.find((c) => c.id === contextMenu.categoryId)
    if (category) {
      handleStartEdit(category)
    }
    closeContextMenu()
  }

  const handleContextMenuDelete = () => {
    if (contextMenu.categoryId) {
      deleteCategory(contextMenu.categoryId)
    }
    closeContextMenu()
  }

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        closeContextMenu()
      }
    }

    if (contextMenu.isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextMenu.isOpen])

  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategoryId(categoryId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', categoryId)
  }

  const handleDragEnd = () => {
    setDraggedCategoryId(null)
    setDragOverCategoryId(null)
    dragCounter.current = 0
  }

  const handleDragEnter = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault()
    dragCounter.current++
    if (categoryId !== draggedCategoryId) {
      setDragOverCategoryId(categoryId)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverCategoryId(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault()
    dragCounter.current = 0
    setDragOverCategoryId(null)

    if (!draggedCategoryId || draggedCategoryId === targetCategoryId) {
      setDraggedCategoryId(null)
      return
    }

    const draggedIndex = categories.findIndex((c) => c.id === draggedCategoryId)
    const targetIndex = categories.findIndex((c) => c.id === targetCategoryId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedCategoryId(null)
      return
    }

    const newOrder = [...categories]
    const [removed] = newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, removed)

    reorderCategories(newOrder.map((c) => c.id))
    setDraggedCategoryId(null)
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
                <li
                  key={category.id}
                  className={`group relative ${
                    draggedCategoryId === category.id ? 'opacity-50' : ''
                  } ${
                    dragOverCategoryId === category.id
                      ? 'border-t-2 border-primary-500'
                      : ''
                  }`}
                  draggable={editingCategoryId !== category.id}
                  onDragStart={(e) => handleDragStart(e, category.id)}
                  onDragEnd={handleDragEnd}
                  onDragEnter={(e) => handleDragEnter(e, category.id)}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, category.id)}
                >
                  {editingCategoryId === category.id ? (
                    <div className="flex items-center gap-2 px-3 py-2">
                      <FolderOpen className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                      <input
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit()
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                        onBlur={handleSaveEdit}
                        className="input text-sm flex-1 py-1"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedCategoryId(category.id)
                        setSelectedType('all')
                        setShowFavoritesOnly(false)
                      }}
                      onContextMenu={(e) => handleContextMenu(e, category.id)}
                      className={`sidebar-item w-full ${
                        selectedCategoryId === category.id ? 'active' : ''
                      }`}
                    >
                      <GripVertical
                        className="w-4 h-4 opacity-0 group-hover:opacity-50 cursor-grab flex-shrink-0"
                        style={{ color: 'var(--color-text-muted)' }}
                      />
                      <FolderOpen className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-left truncate">{category.name}</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {getCountForCategory(category.id)}
                      </span>
                    </button>
                  )}
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

      {/* Context Menu */}
      {contextMenu.isOpen && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 min-w-[140px] py-1 rounded-lg shadow-lg border"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: 'var(--color-bg-secondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          <button
            onClick={handleContextMenuEdit}
            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-black/10 transition-colors"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Pencil className="w-4 h-4" />
            Rename
          </button>
          <button
            onClick={handleContextMenuDelete}
            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-black/10 transition-colors text-red-400"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </aside>
  )
}
