import { useState } from 'react'
import type { Secret, SecretType, CreateSecretData } from '../../types/secrets'
import { useSecretsStore } from '../../stores/secretsStore'
import { PasswordGenerator } from '../shared/PasswordGenerator'
import { X, Eye, EyeOff, Wand2 } from 'lucide-react'

interface SecretFormProps {
  type: SecretType
  existingSecret?: Secret
  onClose: () => void
}

export function SecretForm({ type, existingSecret, onClose }: SecretFormProps) {
  const { createSecret, updateSecret, categories } = useSecretsStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswordGen, setShowPasswordGen] = useState(false)

  // Form state
  const [name, setName] = useState(existingSecret?.name || '')
  const [categoryId, setCategoryId] = useState(existingSecret?.categoryId || '')
  const [favorite, setFavorite] = useState(existingSecret?.favorite || false)

  // Password fields
  const [url, setUrl] = useState(
    existingSecret?.type === 'password' ? existingSecret.url || '' : ''
  )
  const [username, setUsername] = useState(
    existingSecret?.type === 'password' || existingSecret?.type === 'server'
      ? existingSecret.username || ''
      : ''
  )
  const [password, setPassword] = useState(
    existingSecret?.type === 'password' || existingSecret?.type === 'server'
      ? existingSecret.password || ''
      : ''
  )
  const [showPassword, setShowPassword] = useState(false)

  // SSH Key fields
  const [privateKey, setPrivateKey] = useState(
    existingSecret?.type === 'ssh_key' ? existingSecret.privateKey || '' : ''
  )
  const [publicKey, setPublicKey] = useState(
    existingSecret?.type === 'ssh_key' ? existingSecret.publicKey || '' : ''
  )
  const [passphrase, setPassphrase] = useState(
    existingSecret?.type === 'ssh_key' ? existingSecret.passphrase || '' : ''
  )
  const [keyType, setKeyType] = useState<'rsa' | 'ed25519' | 'ecdsa' | 'dsa'>(
    existingSecret?.type === 'ssh_key' ? existingSecret.keyType : 'rsa'
  )

  // Server fields
  const [hostname, setHostname] = useState(
    existingSecret?.type === 'server' ? existingSecret.hostname || '' : ''
  )
  const [port, setPort] = useState(
    existingSecret?.type === 'server' ? existingSecret.port?.toString() || '' : ''
  )
  const [protocol, setProtocol] = useState<'ssh' | 'rdp' | 'vnc' | 'ftp' | 'other'>(
    existingSecret?.type === 'server' ? existingSecret.protocol : 'ssh'
  )

  // Note fields
  const [content, setContent] = useState(
    existingSecret?.type === 'note' ? existingSecret.content || '' : ''
  )

  // API Key fields
  const [serviceName, setServiceName] = useState(
    existingSecret?.type === 'api_key' ? existingSecret.serviceName || '' : ''
  )
  const [apiKey, setApiKey] = useState(
    existingSecret?.type === 'api_key' ? existingSecret.apiKey || '' : ''
  )
  const [apiSecret, setApiSecret] = useState(
    existingSecret?.type === 'api_key' ? existingSecret.apiSecret || '' : ''
  )
  const [endpointUrl, setEndpointUrl] = useState(
    existingSecret?.type === 'api_key' ? existingSecret.endpointUrl || '' : ''
  )

  // Notes field (shared)
  const [notes, setNotes] = useState(
    existingSecret && 'notes' in existingSecret ? existingSecret.notes || '' : ''
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)

    let data: CreateSecretData

    switch (type) {
      case 'password':
        data = {
          type: 'password',
          name: name.trim(),
          categoryId: categoryId || undefined,
          favorite,
          url: url || undefined,
          username: username || undefined,
          password,
          notes: notes || undefined,
        }
        break
      case 'ssh_key':
        data = {
          type: 'ssh_key',
          name: name.trim(),
          categoryId: categoryId || undefined,
          favorite,
          privateKey,
          publicKey: publicKey || undefined,
          passphrase: passphrase || undefined,
          keyType,
          notes: notes || undefined,
        }
        break
      case 'server':
        data = {
          type: 'server',
          name: name.trim(),
          categoryId: categoryId || undefined,
          favorite,
          hostname,
          port: port ? parseInt(port, 10) : undefined,
          protocol,
          username: username || undefined,
          password: password || undefined,
          notes: notes || undefined,
        }
        break
      case 'note':
        data = {
          type: 'note',
          name: name.trim(),
          categoryId: categoryId || undefined,
          favorite,
          content,
        }
        break
      case 'api_key':
        data = {
          type: 'api_key',
          name: name.trim(),
          categoryId: categoryId || undefined,
          favorite,
          serviceName: serviceName || undefined,
          apiKey,
          apiSecret: apiSecret || undefined,
          endpointUrl: endpointUrl || undefined,
          notes: notes || undefined,
        }
        break
    }

    if (existingSecret) {
      await updateSecret(existingSecret.id, data)
    } else {
      await createSecret(data)
    }

    setIsSubmitting(false)
    onClose()
  }

  const handleGeneratedPassword = (generatedPassword: string) => {
    setPassword(generatedPassword)
    setShowPasswordGen(false)
  }

  const typeLabels: Record<SecretType, string> = {
    password: 'Password',
    ssh_key: 'SSH Key',
    server: 'Server',
    note: 'Secure Note',
    api_key: 'API Key',
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {existingSecret ? `Edit ${typeLabels[type]}` : `New ${typeLabels[type]}`}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--color-bg-tertiary)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 max-w-2xl">
          {/* Name (all types) */}
          <div>
            <label htmlFor="name" className="label">
              Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Enter a name for this secret"
              required
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="label">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type-specific fields */}
          {type === 'password' && (
            <>
              <div>
                <label htmlFor="url" className="label">
                  Website URL
                </label>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="input"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label htmlFor="username" className="label">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="username or email"
                />
              </div>
              <div>
                <label htmlFor="password" className="label">
                  Password *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pr-10"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 transition-colors"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordGen(!showPasswordGen)}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    Generate
                  </button>
                </div>
                {showPasswordGen && (
                  <div className="mt-2">
                    <PasswordGenerator onGenerate={handleGeneratedPassword} />
                  </div>
                )}
              </div>
            </>
          )}

          {type === 'ssh_key' && (
            <>
              <div>
                <label htmlFor="keyType" className="label">
                  Key Type *
                </label>
                <select
                  id="keyType"
                  value={keyType}
                  onChange={(e) => setKeyType(e.target.value as typeof keyType)}
                  className="input"
                >
                  <option value="rsa">RSA</option>
                  <option value="ed25519">ED25519</option>
                  <option value="ecdsa">ECDSA</option>
                  <option value="dsa">DSA</option>
                </select>
              </div>
              <div>
                <label htmlFor="privateKey" className="label">
                  Private Key *
                </label>
                <textarea
                  id="privateKey"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="input font-mono text-sm"
                  rows={8}
                  placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                  required
                />
              </div>
              <div>
                <label htmlFor="publicKey" className="label">
                  Public Key
                </label>
                <textarea
                  id="publicKey"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  className="input font-mono text-sm"
                  rows={3}
                  placeholder="ssh-rsa AAAA..."
                />
              </div>
              <div>
                <label htmlFor="passphrase" className="label">
                  Passphrase
                </label>
                <input
                  id="passphrase"
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="input"
                  placeholder="Enter passphrase (if any)"
                />
              </div>
            </>
          )}

          {type === 'server' && (
            <>
              <div>
                <label htmlFor="hostname" className="label">
                  Hostname *
                </label>
                <input
                  id="hostname"
                  type="text"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  className="input"
                  placeholder="server.example.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="port" className="label">
                    Port
                  </label>
                  <input
                    id="port"
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="input"
                    placeholder="22"
                  />
                </div>
                <div>
                  <label htmlFor="protocol" className="label">
                    Protocol *
                  </label>
                  <select
                    id="protocol"
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value as typeof protocol)}
                    className="input"
                  >
                    <option value="ssh">SSH</option>
                    <option value="rdp">RDP</option>
                    <option value="vnc">VNC</option>
                    <option value="ftp">FTP</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="username" className="label">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="root"
                />
              </div>
              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-10"
                    placeholder="Server password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {type === 'note' && (
            <div>
              <label htmlFor="content" className="label">
                Content *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input"
                rows={10}
                placeholder="Enter your secure note..."
                required
              />
            </div>
          )}

          {type === 'api_key' && (
            <>
              <div>
                <label htmlFor="serviceName" className="label">
                  Service Name
                </label>
                <input
                  id="serviceName"
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="input"
                  placeholder="AWS, Stripe, GitHub..."
                />
              </div>
              <div>
                <label htmlFor="apiKey" className="label">
                  API Key *
                </label>
                <input
                  id="apiKey"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="input font-mono"
                  placeholder="Enter API key"
                  required
                />
              </div>
              <div>
                <label htmlFor="apiSecret" className="label">
                  API Secret
                </label>
                <input
                  id="apiSecret"
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="input font-mono"
                  placeholder="Enter API secret (if any)"
                />
              </div>
              <div>
                <label htmlFor="endpointUrl" className="label">
                  Endpoint URL
                </label>
                <input
                  id="endpointUrl"
                  type="url"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="input"
                  placeholder="https://api.example.com"
                />
              </div>
            </>
          )}

          {/* Notes (except for note type) */}
          {type !== 'note' && (
            <div>
              <label htmlFor="notes" className="label">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input"
                rows={3}
                placeholder="Additional notes..."
              />
            </div>
          )}

          {/* Favorite checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="favorite"
              type="checkbox"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}
            />
            <label htmlFor="favorite" style={{ color: 'var(--color-text-secondary)' }}>
              Mark as favorite
            </label>
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: 'var(--color-border)' }}>
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !name.trim()}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : existingSecret ? 'Save Changes' : 'Create'}
        </button>
      </div>
    </div>
  )
}
