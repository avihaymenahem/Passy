import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordFieldProps {
  value: string
  multiline?: boolean
}

export function PasswordField({ value, multiline = false }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)

  const maskedValue = multiline
    ? '••••••••••••••••\n••••••••••••••••\n••••••••••••••••'
    : '••••••••••••••••'

  return (
    <div className="flex-1 flex items-center gap-2">
      {multiline ? (
        <pre
          className="flex-1 rounded-lg p-3 text-sm overflow-x-auto whitespace-pre-wrap break-all"
          style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            color: isVisible ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
            fontFamily: isVisible ? 'monospace' : 'inherit'
          }}
        >
          {isVisible ? value : maskedValue}
        </pre>
      ) : (
        <span
          className="flex-1 font-mono"
          style={{ color: isVisible ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
        >
          {isVisible ? value : maskedValue}
        </span>
      )}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="p-1.5 rounded transition-colors hover:bg-[var(--color-bg-tertiary)]"
        style={{ color: 'var(--color-text-muted)' }}
        title={isVisible ? 'Hide' : 'Show'}
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}
