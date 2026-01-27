import { Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore, applyTheme } from '../../stores/themeStore'

type Theme = 'light' | 'dark' | 'system'

const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
]

interface ThemePickerProps {
  collapsed?: boolean
}

export function ThemePicker({ collapsed = false }: ThemePickerProps) {
  const { theme, setTheme } = useThemeStore()

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  if (collapsed) {
    // Show only current theme icon when collapsed, cycle through on click
    const currentTheme = themes.find((t) => t.value === theme) || themes[1]
    const Icon = currentTheme.icon
    return (
      <button
        onClick={() => {
          const currentIndex = themes.findIndex((t) => t.value === theme)
          const nextIndex = (currentIndex + 1) % themes.length
          handleThemeChange(themes[nextIndex].value)
        }}
        className="p-2 rounded-lg transition-colors hover:bg-[var(--color-bg-secondary)]"
        title={`Theme: ${currentTheme.label}`}
      >
        <Icon className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
      </button>
    )
  }

  // Icons only - show all three icons in a row
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => handleThemeChange(value)}
          className={`p-2 rounded-md transition-colors ${
            theme === value
              ? 'bg-primary-600 text-white'
              : 'hover:bg-[var(--color-bg-secondary)]'
          }`}
          style={{ color: theme === value ? undefined : 'var(--color-text-muted)' }}
          title={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}
