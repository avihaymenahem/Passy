import { useEffect } from 'react'
import { useAuthStore, startAutoLockChecker } from './stores/authStore'
import { initThemeListener } from './stores/themeStore'
import { TitleBar } from './components/layout/TitleBar'
import { SetupWizard } from './components/auth/SetupWizard'
import { UnlockScreen } from './components/auth/UnlockScreen'
import { MainLayout } from './components/layout/MainLayout'

export default function App() {
  const { isUnlocked, vaultExists, checkVaultExists, updateActivity } = useAuthStore()

  useEffect(() => {
    checkVaultExists()
    startAutoLockChecker()
    const cleanupTheme = initThemeListener()
    return cleanupTheme
  }, [checkVaultExists])

  // Track user activity for auto-lock
  useEffect(() => {
    const handleActivity = () => {
      if (isUnlocked) {
        updateActivity()
      }
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
    }
  }, [isUnlocked, updateActivity])

  // Loading state while checking vault existence
  if (vaultExists === null) {
    return (
      <>
        <TitleBar />
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="animate-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading...</div>
        </div>
      </>
    )
  }

  // No vault exists - show setup wizard
  if (!vaultExists) {
    return (
      <>
        <TitleBar />
        <SetupWizard />
      </>
    )
  }

  // Vault exists but locked - show unlock screen
  if (!isUnlocked) {
    return (
      <>
        <TitleBar />
        <UnlockScreen />
      </>
    )
  }

  // Vault unlocked - show main app
  return (
    <>
      <TitleBar />
      <MainLayout />
    </>
  )
}
