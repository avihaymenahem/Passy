import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 12 // 96 bits for GCM
const TAG_LENGTH = 16 // 128 bits
const SALT_LENGTH = 32 // 256 bits
const PBKDF2_ITERATIONS = 600000 // OWASP recommended minimum

export interface EncryptedData {
  iv: string // hex
  data: string // hex
  tag: string // hex
}

export class CryptoService {
  private derivedKey: Buffer | null = null

  /**
   * Generate a cryptographically secure random salt
   */
  generateSalt(): Buffer {
    return crypto.randomBytes(SALT_LENGTH)
  }

  /**
   * Derive an encryption key from the master password using PBKDF2
   */
  deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha256'
    )
  }

  /**
   * Set the derived key for encryption/decryption operations
   */
  setKey(key: Buffer): void {
    this.derivedKey = key
  }

  /**
   * Clear the derived key from memory
   */
  clearKey(): void {
    if (this.derivedKey) {
      this.derivedKey.fill(0)
      this.derivedKey = null
    }
  }

  /**
   * Check if a key is currently set
   */
  hasKey(): boolean {
    return this.derivedKey !== null
  }

  /**
   * Encrypt plaintext using AES-256-GCM
   */
  encrypt(plaintext: string): EncryptedData {
    if (!this.derivedKey) {
      throw new Error('Encryption key not set')
    }

    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, this.derivedKey, iv, {
      authTagLength: TAG_LENGTH,
    })

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ])

    return {
      iv: iv.toString('hex'),
      data: encrypted.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
    }
  }

  /**
   * Decrypt ciphertext using AES-256-GCM
   */
  decrypt(encryptedData: EncryptedData): string {
    if (!this.derivedKey) {
      throw new Error('Encryption key not set')
    }

    const iv = Buffer.from(encryptedData.iv, 'hex')
    const data = Buffer.from(encryptedData.data, 'hex')
    const tag = Buffer.from(encryptedData.tag, 'hex')

    const decipher = crypto.createDecipheriv(ALGORITHM, this.derivedKey, iv, {
      authTagLength: TAG_LENGTH,
    })
    decipher.setAuthTag(tag)

    const decrypted = Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ])

    return decrypted.toString('utf8')
  }

  /**
   * Hash a password for verification (stored separately from the key derivation)
   * Uses a separate salt to avoid rainbow table attacks
   */
  hashPassword(password: string, salt: Buffer): string {
    const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, 'sha256')
    return hash.toString('hex')
  }

  /**
   * Verify a password against a stored hash
   */
  verifyPassword(password: string, salt: Buffer, storedHash: string): boolean {
    const hash = this.hashPassword(password, salt)
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'))
  }

  /**
   * Generate a secure random string (for IDs, etc.)
   */
  generateId(): string {
    return crypto.randomUUID()
  }
}
