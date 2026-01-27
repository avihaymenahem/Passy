import { useState, useEffect } from 'react'
import { RefreshCw, Copy, Check } from 'lucide-react'

interface PasswordGeneratorProps {
  onGenerate: (password: string) => void
}

export function PasswordGenerator({ onGenerate }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(16)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [copied, setCopied] = useState(false)

  const generatePassword = async () => {
    try {
      const result = await window.electronAPI.password.generate({
        length,
        uppercase,
        lowercase,
        numbers,
        symbols,
      })
      if (result.success && result.data) {
        setPassword(result.data)
      }
    } catch (error) {
      console.error('Failed to generate password:', error)
    }
  }

  useEffect(() => {
    generatePassword()
  }, [length, uppercase, lowercase, numbers, symbols])

  const handleCopy = async () => {
    try {
      await window.electronAPI.clipboard.write(password, 30000)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleUse = () => {
    onGenerate(password)
  }

  const getStrength = (): { label: string; color: string; width: string } => {
    let score = 0
    if (length >= 12) score++
    if (length >= 16) score++
    if (length >= 20) score++
    if (uppercase) score++
    if (lowercase) score++
    if (numbers) score++
    if (symbols) score++

    if (score <= 3) return { label: 'Weak', color: 'bg-red-500', width: '25%' }
    if (score <= 5) return { label: 'Fair', color: 'bg-amber-500', width: '50%' }
    if (score <= 6) return { label: 'Good', color: 'bg-blue-500', width: '75%' }
    return { label: 'Strong', color: 'bg-green-500', width: '100%' }
  }

  const strength = getStrength()

  const atLeastOneSelected = uppercase || lowercase || numbers || symbols

  return (
    <div
      className="rounded-lg p-4 space-y-4 border"
      style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' }}
    >
      {/* Generated password */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <code
            className="flex-1 rounded px-3 py-2 text-sm font-mono text-primary-400 break-all"
            style={{ backgroundColor: 'var(--color-bg-primary)' }}
          >
            {password || 'Select at least one option'}
          </code>
          <button
            onClick={generatePassword}
            disabled={!atLeastOneSelected}
            className="p-2 rounded transition-colors disabled:opacity-50 hover:bg-[var(--color-bg-secondary)]"
            style={{ color: 'var(--color-text-muted)' }}
            title="Regenerate"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            disabled={!password}
            className={`p-2 rounded transition-colors disabled:opacity-50 ${
              copied
                ? 'text-green-400 bg-green-400/10'
                : 'hover:bg-[var(--color-bg-secondary)]'
            }`}
            style={{ color: copied ? undefined : 'var(--color-text-muted)' }}
            title="Copy"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Strength meter */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <div
              className={`h-full ${strength.color} transition-all duration-300`}
              style={{ width: strength.width }}
            />
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{strength.label}</span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {/* Length slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Length</label>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{length}</span>
          </div>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-500"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
          />
        </div>

        {/* Character options */}
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-primary)' }}
            />
            Uppercase (A-Z)
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-primary)' }}
            />
            Lowercase (a-z)
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
            <input
              type="checkbox"
              checked={numbers}
              onChange={(e) => setNumbers(e.target.checked)}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-primary)' }}
            />
            Numbers (0-9)
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
            <input
              type="checkbox"
              checked={symbols}
              onChange={(e) => setSymbols(e.target.checked)}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-primary)' }}
            />
            Symbols (!@#$)
          </label>
        </div>
      </div>

      {/* Use button */}
      <button
        onClick={handleUse}
        disabled={!password}
        className="btn btn-primary w-full disabled:opacity-50"
      >
        Use Password
      </button>
    </div>
  )
}
