export type SecretType = 'password' | 'ssh_key' | 'server' | 'note' | 'api_key'

export interface BaseSecret {
  id: string
  type: SecretType
  name: string
  categoryId?: string
  favorite: boolean
  createdAt: string
  updatedAt: string
}

export interface PasswordSecret extends BaseSecret {
  type: 'password'
  url?: string
  username?: string
  password: string
  notes?: string
  totpSecret?: string
}

export interface SSHKeySecret extends BaseSecret {
  type: 'ssh_key'
  privateKey: string
  publicKey?: string
  passphrase?: string
  keyType: 'rsa' | 'ed25519' | 'ecdsa' | 'dsa'
  fingerprint?: string
  notes?: string
}

export interface ServerSecret extends BaseSecret {
  type: 'server'
  hostname: string
  port?: number
  protocol: 'ssh' | 'rdp' | 'vnc' | 'ftp' | 'other'
  username?: string
  password?: string
  sshKeyId?: string
  notes?: string
}

export interface NoteSecret extends BaseSecret {
  type: 'note'
  content: string
}

export interface APIKeySecret extends BaseSecret {
  type: 'api_key'
  serviceName?: string
  apiKey: string
  apiSecret?: string
  endpointUrl?: string
  notes?: string
}

export type Secret = PasswordSecret | SSHKeySecret | ServerSecret | NoteSecret | APIKeySecret

export interface Category {
  id: string
  name: string
  icon?: string
  sortOrder: number
  createdAt: string
}

// Form data types for creating/editing secrets
export type CreatePasswordData = Omit<PasswordSecret, 'id' | 'createdAt' | 'updatedAt'>
export type CreateSSHKeyData = Omit<SSHKeySecret, 'id' | 'createdAt' | 'updatedAt'>
export type CreateServerData = Omit<ServerSecret, 'id' | 'createdAt' | 'updatedAt'>
export type CreateNoteData = Omit<NoteSecret, 'id' | 'createdAt' | 'updatedAt'>
export type CreateAPIKeyData = Omit<APIKeySecret, 'id' | 'createdAt' | 'updatedAt'>

export type CreateSecretData =
  | CreatePasswordData
  | CreateSSHKeyData
  | CreateServerData
  | CreateNoteData
  | CreateAPIKeyData
