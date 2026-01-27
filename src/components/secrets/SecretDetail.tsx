import { useState } from 'react'
import type { Secret } from '../../types/secrets'
import { useSecretsStore } from '../../stores/secretsStore'
import { SecretForm } from './SecretForm'
import { CopyButton } from '../shared/CopyButton'
import { PasswordField } from '../shared/PasswordField'
import {
  Key,
  KeyRound,
  Server,
  FileText,
  Shield,
  Star,
  Edit2,
  Trash2,
  Globe,
  User,
  Terminal,
  Clock,
} from 'lucide-react'

interface SecretDetailProps {
  secret: Secret
}

const TYPE_ICONS = {
  password: <Key className="w-6 h-6 text-blue-400" />,
  ssh_key: <KeyRound className="w-6 h-6 text-green-400" />,
  server: <Server className="w-6 h-6 text-purple-400" />,
  note: <FileText className="w-6 h-6 text-amber-400" />,
  api_key: <Shield className="w-6 h-6 text-red-400" />,
}

const TYPE_LABELS = {
  password: 'Password',
  ssh_key: 'SSH Key',
  server: 'Server',
  note: 'Secure Note',
  api_key: 'API Key',
}

export function SecretDetail({ secret }: SecretDetailProps) {
  const { deleteSecret, toggleFavorite, setSelectedSecretId } = useSecretsStore()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    await deleteSecret(secret.id)
    setSelectedSecretId(null)
  }

  if (isEditing) {
    return (
      <SecretForm
        type={secret.type}
        existingSecret={secret}
        onClose={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
            >
              {TYPE_ICONS[secret.type]}
            </div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{secret.name}</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{TYPE_LABELS[secret.type]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(secret.id)}
              className={`p-2 rounded-lg transition-colors ${
                secret.favorite
                  ? 'text-amber-400 bg-amber-400/10'
                  : 'hover:text-amber-400 hover:bg-[var(--color-bg-tertiary)]'
              }`}
              style={{ color: secret.favorite ? undefined : 'var(--color-text-muted)' }}
            >
              <Star className={`w-5 h-5 ${secret.favorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg transition-colors hover:bg-[var(--color-bg-tertiary)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg transition-colors hover:text-red-400 hover:bg-[var(--color-bg-tertiary)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6 max-w-2xl">
          {secret.type === 'password' && <PasswordDetails secret={secret} />}
          {secret.type === 'ssh_key' && <SSHKeyDetails secret={secret} />}
          {secret.type === 'server' && <ServerDetails secret={secret} />}
          {secret.type === 'note' && <NoteDetails secret={secret} />}
          {secret.type === 'api_key' && <APIKeyDetails secret={secret} />}

          {/* Metadata */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <Clock className="w-4 h-4" />
              <span>
                Last updated: {new Date(secret.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card max-w-sm mx-4 animate-slide-in">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Delete Secret?</h3>
            <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Are you sure you want to delete "{secret.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PasswordDetails({ secret }: { secret: Extract<Secret, { type: 'password' }> }) {
  return (
    <div className="space-y-4">
      {secret.url && (
        <DetailRow icon={<Globe className="w-4 h-4" />} label="Website">
          <a
            href={secret.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:underline"
          >
            {secret.url}
          </a>
          <CopyButton text={secret.url} />
        </DetailRow>
      )}
      {secret.username && (
        <DetailRow icon={<User className="w-4 h-4" />} label="Username">
          <span style={{ color: 'var(--color-text-primary)' }}>{secret.username}</span>
          <CopyButton text={secret.username} />
        </DetailRow>
      )}
      <DetailRow icon={<Key className="w-4 h-4" />} label="Password">
        <PasswordField value={secret.password} />
        <CopyButton text={secret.password} clearAfter={30000} />
      </DetailRow>
      {secret.notes && (
        <DetailRow icon={<FileText className="w-4 h-4" />} label="Notes">
          <p className="whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>{secret.notes}</p>
        </DetailRow>
      )}
    </div>
  )
}

function SSHKeyDetails({ secret }: { secret: Extract<Secret, { type: 'ssh_key' }> }) {
  return (
    <div className="space-y-4">
      <DetailRow icon={<Terminal className="w-4 h-4" />} label="Key Type">
        <span className="uppercase" style={{ color: 'var(--color-text-primary)' }}>{secret.keyType}</span>
      </DetailRow>
      {secret.fingerprint && (
        <DetailRow icon={<KeyRound className="w-4 h-4" />} label="Fingerprint">
          <code
            className="text-sm px-2 py-1 rounded"
            style={{ color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            {secret.fingerprint}
          </code>
          <CopyButton text={secret.fingerprint} />
        </DetailRow>
      )}
      {secret.publicKey && (
        <div>
          <label className="label flex items-center gap-2">
            <span>Public Key</span>
            <CopyButton text={secret.publicKey} />
          </label>
          <pre
            className="rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
          >
            {secret.publicKey}
          </pre>
        </div>
      )}
      <div>
        <label className="label flex items-center gap-2">
          <span>Private Key</span>
          <CopyButton text={secret.privateKey} clearAfter={30000} />
        </label>
        <PasswordField value={secret.privateKey} multiline />
      </div>
      {secret.passphrase && (
        <DetailRow icon={<Key className="w-4 h-4" />} label="Passphrase">
          <PasswordField value={secret.passphrase} />
          <CopyButton text={secret.passphrase} clearAfter={30000} />
        </DetailRow>
      )}
      {secret.notes && (
        <DetailRow icon={<FileText className="w-4 h-4" />} label="Notes">
          <p className="whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>{secret.notes}</p>
        </DetailRow>
      )}
    </div>
  )
}

function ServerDetails({ secret }: { secret: Extract<Secret, { type: 'server' }> }) {
  const sshCommand = secret.protocol === 'ssh' && secret.username
    ? `ssh ${secret.username}@${secret.hostname}${secret.port && secret.port !== 22 ? ` -p ${secret.port}` : ''}`
    : null

  return (
    <div className="space-y-4">
      <DetailRow icon={<Server className="w-4 h-4" />} label="Hostname">
        <span style={{ color: 'var(--color-text-primary)' }}>{secret.hostname}</span>
        <CopyButton text={secret.hostname} />
      </DetailRow>
      {secret.port && (
        <DetailRow icon={<Terminal className="w-4 h-4" />} label="Port">
          <span style={{ color: 'var(--color-text-primary)' }}>{secret.port}</span>
        </DetailRow>
      )}
      <DetailRow icon={<Globe className="w-4 h-4" />} label="Protocol">
        <span className="uppercase" style={{ color: 'var(--color-text-primary)' }}>{secret.protocol}</span>
      </DetailRow>
      {secret.username && (
        <DetailRow icon={<User className="w-4 h-4" />} label="Username">
          <span style={{ color: 'var(--color-text-primary)' }}>{secret.username}</span>
          <CopyButton text={secret.username} />
        </DetailRow>
      )}
      {secret.password && (
        <DetailRow icon={<Key className="w-4 h-4" />} label="Password">
          <PasswordField value={secret.password} />
          <CopyButton text={secret.password} clearAfter={30000} />
        </DetailRow>
      )}
      {sshCommand && (
        <div>
          <label className="label">SSH Command</label>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 rounded-lg p-3 text-sm text-green-400 font-mono"
              style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
            >
              {sshCommand}
            </code>
            <CopyButton text={sshCommand} />
          </div>
        </div>
      )}
      {secret.notes && (
        <DetailRow icon={<FileText className="w-4 h-4" />} label="Notes">
          <p className="whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>{secret.notes}</p>
        </DetailRow>
      )}
    </div>
  )
}

function NoteDetails({ secret }: { secret: Extract<Secret, { type: 'note' }> }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="label">Content</label>
        <CopyButton text={secret.content} />
      </div>
      <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
        <p className="whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>{secret.content}</p>
      </div>
    </div>
  )
}

function APIKeyDetails({ secret }: { secret: Extract<Secret, { type: 'api_key' }> }) {
  return (
    <div className="space-y-4">
      {secret.serviceName && (
        <DetailRow icon={<Shield className="w-4 h-4" />} label="Service">
          <span style={{ color: 'var(--color-text-primary)' }}>{secret.serviceName}</span>
        </DetailRow>
      )}
      <DetailRow icon={<Key className="w-4 h-4" />} label="API Key">
        <PasswordField value={secret.apiKey} />
        <CopyButton text={secret.apiKey} clearAfter={30000} />
      </DetailRow>
      {secret.apiSecret && (
        <DetailRow icon={<KeyRound className="w-4 h-4" />} label="API Secret">
          <PasswordField value={secret.apiSecret} />
          <CopyButton text={secret.apiSecret} clearAfter={30000} />
        </DetailRow>
      )}
      {secret.endpointUrl && (
        <DetailRow icon={<Globe className="w-4 h-4" />} label="Endpoint">
          <a
            href={secret.endpointUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:underline"
          >
            {secret.endpointUrl}
          </a>
          <CopyButton text={secret.endpointUrl} />
        </DetailRow>
      )}
      {secret.notes && (
        <DetailRow icon={<FileText className="w-4 h-4" />} label="Notes">
          <p className="whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>{secret.notes}</p>
        </DetailRow>
      )}
    </div>
  )
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="label flex items-center gap-2">
        {icon}
        {label}
      </label>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}
