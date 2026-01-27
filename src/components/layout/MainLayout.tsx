import { useEffect } from 'react'
import { useSecretsStore } from '../../stores/secretsStore'
import { Sidebar } from './Sidebar'
import { MainContent } from './MainContent'

export function MainLayout() {
  const { loadSecrets, loadCategories } = useSecretsStore()

  useEffect(() => {
    loadSecrets()
    loadCategories()
  }, [loadSecrets, loadCategories])

  return (
    <div className="flex flex-1 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <Sidebar />
      <MainContent />
    </div>
  )
}
