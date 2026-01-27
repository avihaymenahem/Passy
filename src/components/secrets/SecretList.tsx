import type { Secret } from '../../types/secrets'
import { Key, KeyRound, Server, FileText, Shield, Star } from 'lucide-react'

interface SecretListProps {
  secrets: Secret[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const TYPE_ICONS = {
  password: <Key className="w-5 h-5 text-blue-400" />,
  ssh_key: <KeyRound className="w-5 h-5 text-green-400" />,
  server: <Server className="w-5 h-5 text-purple-400" />,
  note: <FileText className="w-5 h-5 text-amber-400" />,
  api_key: <Shield className="w-5 h-5 text-red-400" />,
}

export function SecretList({ secrets, selectedId, onSelect }: SecretListProps) {
  if (secrets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4" style={{ color: 'var(--color-text-muted)' }}>
        <p className="text-center">No secrets found</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {secrets.map((secret) => (
        <SecretCard
          key={secret.id}
          secret={secret}
          isSelected={secret.id === selectedId}
          onClick={() => onSelect(secret.id)}
        />
      ))}
    </div>
  )
}

interface SecretCardProps {
  secret: Secret
  isSelected: boolean
  onClick: () => void
}

function SecretCard({ secret, isSelected, onClick }: SecretCardProps) {
  const getSubtitle = () => {
    switch (secret.type) {
      case 'password':
        return secret.username || secret.url || 'No username'
      case 'ssh_key':
        return secret.keyType.toUpperCase()
      case 'server':
        return `${secret.hostname}${secret.port ? `:${secret.port}` : ''}`
      case 'note':
        return 'Secure note'
      case 'api_key':
        return secret.serviceName || 'API Key'
      default:
        return ''
    }
  }

  return (
    <button
      onClick={onClick}
      className={`secret-card w-full text-left ${isSelected ? 'selected' : ''}`}
    >
      <div className="flex-shrink-0">{TYPE_ICONS[secret.type]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{secret.name}</span>
          {secret.favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
        </div>
        <p className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>{getSubtitle()}</p>
      </div>
    </button>
  )
}
