import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  text: string
  clearAfter?: number // milliseconds to clear clipboard after (default: no auto-clear)
}

export function CopyButton({ text, clearAfter }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await window.electronAPI.clipboard.write(text, clearAfter)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded transition-colors ${
        copied
          ? 'text-green-400 bg-green-400/10'
          : 'hover:bg-[var(--color-bg-tertiary)]'
      }`}
      style={{ color: copied ? undefined : 'var(--color-text-muted)' }}
      title={copied ? 'Copied!' : clearAfter ? `Copy (clears after ${clearAfter / 1000}s)` : 'Copy'}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}
