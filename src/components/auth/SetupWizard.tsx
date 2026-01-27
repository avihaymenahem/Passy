import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { Shield, Eye, EyeOff, Check, X } from 'lucide-react'

export function SetupWizard() {
  const { createVault, isLoading, error, clearError } = useAuthStore()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const passwordChecks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
  }

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordStrong || !passwordsMatch) return

    clearError()
    await createVault(password)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="w-full max-w-md mx-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600/20 mb-4">
            <Shield className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Welcome to Passy</h1>
          <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Create a master password to secure your vault
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="label">
              Master Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-10"
                placeholder="Enter a strong password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Password requirements:</p>
            <ul className="space-y-1 text-sm">
              <PasswordCheck passed={passwordChecks.length} label="At least 12 characters" />
              <PasswordCheck passed={passwordChecks.uppercase} label="One uppercase letter" />
              <PasswordCheck passed={passwordChecks.lowercase} label="One lowercase letter" />
              <PasswordCheck passed={passwordChecks.number} label="One number" />
              <PasswordCheck passed={passwordChecks.special} label="One special character" />
            </ul>
          </div>

          <div>
            <label htmlFor="confirm" className="label">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input pr-10"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
            )}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <p className="text-amber-400 text-sm">
              <strong>Important:</strong> Your master password cannot be recovered if lost. Make
              sure to remember it or store it safely.
            </p>
          </div>

          <button
            type="submit"
            disabled={!isPasswordStrong || !passwordsMatch || isLoading}
            className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Vault...' : 'Create Vault'}
          </button>
        </form>
      </div>
    </div>
  )
}

function PasswordCheck({ passed, label }: { passed: boolean; label: string }) {
  return (
    <li
      className="flex items-center gap-2"
      style={{ color: passed ? '#4ade80' : 'var(--color-text-muted)' }}
    >
      {passed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {label}
    </li>
  )
}
