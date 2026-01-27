import { useState, useEffect } from 'react'
import { Minus, Square, X, Copy } from 'lucide-react'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await window.electronAPI.window.isMaximized()
      setIsMaximized(maximized)
    }
    checkMaximized()

    // Check periodically for maximize state changes
    const interval = setInterval(checkMaximized, 500)
    return () => clearInterval(interval)
  }, [])

  const handleMinimize = () => {
    window.electronAPI.window.minimize()
  }

  const handleMaximize = async () => {
    await window.electronAPI.window.maximize()
    const maximized = await window.electronAPI.window.isMaximized()
    setIsMaximized(maximized)
  }

  const handleClose = () => {
    window.electronAPI.window.close()
  }

  return (
    <div
      className="title-bar h-8 flex items-center justify-between select-none border-b"
      style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}
    >
      {/* Drag region - left side with app title */}
      <div className="flex-1 h-full flex items-center px-3 drag-region">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Passy</span>
      </div>

      {/* Window controls - right side */}
      <div className="flex items-center h-full">
        <button
          onClick={handleMinimize}
          className="h-full px-4 flex items-center justify-center transition-colors hover:bg-[var(--color-bg-secondary)]"
          style={{ color: 'var(--color-text-muted)' }}
          title="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-full px-4 flex items-center justify-center transition-colors hover:bg-[var(--color-bg-secondary)]"
          style={{ color: 'var(--color-text-muted)' }}
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
        </button>
        <button
          onClick={handleClose}
          className="h-full px-4 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
