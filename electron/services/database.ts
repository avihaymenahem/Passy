import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { CryptoService, EncryptedData } from './crypto.js'

const VAULT_FILENAME = 'passy.db'
const METADATA_FILENAME = 'passy.meta.json'

interface VaultMetadata {
  version: number
  salt: string // hex
  passwordHash: string // hex
  createdAt: string
}

interface SecretRow {
  id: string
  type: string
  name: string
  data: string // JSON encrypted data
  category_id: string | null
  favorite: number
  created_at: string
  updated_at: string
}

interface CategoryRow {
  id: string
  name: string
  icon: string | null
  sort_order: number
  created_at: string
}

export class DatabaseService {
  private db: Database.Database | null = null
  private userDataPath: string
  private cryptoService: CryptoService
  private isVaultUnlocked = false

  constructor(userDataPath: string, cryptoService: CryptoService) {
    this.userDataPath = userDataPath
    this.cryptoService = cryptoService
  }

  private getVaultPath(): string {
    return path.join(this.userDataPath, VAULT_FILENAME)
  }

  private getMetadataPath(): string {
    return path.join(this.userDataPath, METADATA_FILENAME)
  }

  /**
   * Check if a vault database exists
   */
  vaultExists(): boolean {
    return fs.existsSync(this.getMetadataPath()) && fs.existsSync(this.getVaultPath())
  }

  /**
   * Create a new vault with the given master password
   */
  async createVault(masterPassword: string): Promise<void> {
    if (this.vaultExists()) {
      throw new Error('Vault already exists')
    }

    // Generate salt for key derivation
    const salt = this.cryptoService.generateSalt()

    // Derive encryption key
    const key = this.cryptoService.deriveKey(masterPassword, salt)
    this.cryptoService.setKey(key)

    // Create password hash for verification
    const passwordHash = this.cryptoService.hashPassword(masterPassword, salt)

    // Save metadata (not encrypted, just salt and hash for verification)
    const metadata: VaultMetadata = {
      version: 1,
      salt: salt.toString('hex'),
      passwordHash,
      createdAt: new Date().toISOString(),
    }
    fs.writeFileSync(this.getMetadataPath(), JSON.stringify(metadata, null, 2))

    // Create and initialize database
    this.db = new Database(this.getVaultPath())
    this.initializeSchema()
    this.isVaultUnlocked = true
  }

  /**
   * Unlock an existing vault with the master password
   */
  async unlockVault(masterPassword: string): Promise<boolean> {
    if (!this.vaultExists()) {
      throw new Error('Vault does not exist')
    }

    // Load metadata
    const metadataContent = fs.readFileSync(this.getMetadataPath(), 'utf-8')
    const metadata: VaultMetadata = JSON.parse(metadataContent)
    const salt = Buffer.from(metadata.salt, 'hex')

    // Verify password
    if (!this.cryptoService.verifyPassword(masterPassword, salt, metadata.passwordHash)) {
      return false
    }

    // Derive and set key
    const key = this.cryptoService.deriveKey(masterPassword, salt)
    this.cryptoService.setKey(key)

    // Open database
    this.db = new Database(this.getVaultPath())
    this.isVaultUnlocked = true

    // Run migrations for existing databases
    this.runMigrations()

    return true
  }

  /**
   * Lock the vault
   */
  lockVault(): void {
    this.cryptoService.clearKey()
    if (this.db) {
      this.db.close()
      this.db = null
    }
    this.isVaultUnlocked = false
  }

  /**
   * Check if vault is currently unlocked
   */
  isUnlocked(): boolean {
    return this.isVaultUnlocked && this.cryptoService.hasKey()
  }

  /**
   * Initialize database schema
   */
  private initializeSchema(): void {
    if (!this.db) throw new Error('Database not initialized')

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS secrets (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        category_id TEXT,
        favorite INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_secrets_type ON secrets(type);
      CREATE INDEX IF NOT EXISTS idx_secrets_category ON secrets(category_id);
      CREATE INDEX IF NOT EXISTS idx_secrets_favorite ON secrets(favorite);
    `)

    // Run migrations for existing databases
    this.runMigrations()
  }

  /**
   * Run database migrations for schema updates
   */
  private runMigrations(): void {
    if (!this.db) return

    // Check if sort_order column exists in categories table
    const tableInfo = this.db.prepare("PRAGMA table_info(categories)").all() as Array<{ name: string }>
    const hasSortOrder = tableInfo.some((col) => col.name === 'sort_order')

    if (!hasSortOrder) {
      // Add sort_order column to existing categories table
      this.db.exec('ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0')

      // Initialize sort_order based on current alphabetical order
      const categories = this.db.prepare('SELECT id FROM categories ORDER BY name').all() as Array<{ id: string }>
      const stmt = this.db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?')
      categories.forEach((cat, index) => {
        stmt.run(index, cat.id)
      })
    }
  }

  /**
   * Encrypt sensitive data for storage
   */
  private encryptData(data: Record<string, unknown>): string {
    const json = JSON.stringify(data)
    const encrypted = this.cryptoService.encrypt(json)
    return JSON.stringify(encrypted)
  }

  /**
   * Decrypt stored data
   */
  private decryptData(encryptedJson: string): Record<string, unknown> {
    const encrypted: EncryptedData = JSON.parse(encryptedJson)
    const decrypted = this.cryptoService.decrypt(encrypted)
    return JSON.parse(decrypted)
  }

  // ==================== Secrets CRUD ====================

  /**
   * Get all secrets (decrypted)
   */
  getAllSecrets(): Record<string, unknown>[] {
    if (!this.db || !this.isUnlocked()) throw new Error('Vault is locked')

    const rows = this.db.prepare('SELECT * FROM secrets ORDER BY updated_at DESC').all() as SecretRow[]

    return rows.map((row) => {
      const sensitiveData = this.decryptData(row.data)
      return {
        id: row.id,
        type: row.type,
        name: row.name,
        categoryId: row.category_id,
        favorite: row.favorite === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        ...sensitiveData,
      }
    })
  }

  /**
   * Get a secret by ID (decrypted)
   */
  getSecretById(id: string): Record<string, unknown> | null {
    if (!this.db || !this.isUnlocked()) throw new Error('Vault is locked')

    const row = this.db.prepare('SELECT * FROM secrets WHERE id = ?').get(id) as SecretRow | undefined
    if (!row) return null

    const sensitiveData = this.decryptData(row.data)
    return {
      id: row.id,
      type: row.type,
      name: row.name,
      categoryId: row.category_id,
      favorite: row.favorite === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ...sensitiveData,
    }
  }

  /**
   * Create a new secret
   */
  createSecret(data: Record<string, unknown>): Record<string, unknown> {
    if (!this.db || !this.isUnlocked()) throw new Error('Vault is locked')

    const id = this.cryptoService.generateId()
    const now = new Date().toISOString()

    // Extract non-sensitive fields
    const { type, name, categoryId, favorite, ...sensitiveData } = data

    // Encrypt sensitive data
    const encryptedData = this.encryptData(sensitiveData)

    this.db.prepare(`
      INSERT INTO secrets (id, type, name, data, category_id, favorite, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      type as string,
      name as string,
      encryptedData,
      (categoryId as string) || null,
      favorite ? 1 : 0,
      now,
      now
    )

    return {
      id,
      type,
      name,
      categoryId,
      favorite: favorite ?? false,
      createdAt: now,
      updatedAt: now,
      ...sensitiveData,
    }
  }

  /**
   * Update an existing secret
   */
  updateSecret(id: string, data: Record<string, unknown>): Record<string, unknown> {
    if (!this.db || !this.isUnlocked()) throw new Error('Vault is locked')

    const existing = this.getSecretById(id)
    if (!existing) throw new Error('Secret not found')

    const now = new Date().toISOString()

    // Extract non-sensitive fields
    const { type, name, categoryId, favorite, ...sensitiveData } = data

    // Encrypt sensitive data
    const encryptedData = this.encryptData(sensitiveData)

    this.db.prepare(`
      UPDATE secrets
      SET type = ?, name = ?, data = ?, category_id = ?, favorite = ?, updated_at = ?
      WHERE id = ?
    `).run(
      type as string,
      name as string,
      encryptedData,
      (categoryId as string) || null,
      favorite ? 1 : 0,
      now,
      id
    )

    return {
      id,
      type,
      name,
      categoryId,
      favorite: favorite ?? false,
      createdAt: existing.createdAt,
      updatedAt: now,
      ...sensitiveData,
    }
  }

  /**
   * Delete a secret
   */
  deleteSecret(id: string): void {
    if (!this.db || !this.isUnlocked()) throw new Error('Vault is locked')

    this.db.prepare('DELETE FROM secrets WHERE id = ?').run(id)
  }

  // ==================== Categories CRUD ====================

  /**
   * Get all categories
   */
  getAllCategories(): Record<string, unknown>[] {
    if (!this.db || !this.isUnlocked()) throw new Error('Vault is locked')

    const rows = this.db.prepare('SELECT * FROM categories ORDER BY sort_order, name').all() as CategoryRow[]

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    }))
  }

  /**
   * Create a new category
   */
  createCategory(name: string, icon?: string): Record<string, unknown> {
    if (!this.db || !this.isUnlocked()) throw new Error('Vault is locked')

    const id = this.cryptoService.generateId()
    const now = new Date().toISOString()

    // Get max sort order and add 1
    const maxOrderResult = this.db.prepare('SELECT MAX(sort_order) as max_order FROM categories').get() as { max_order: number | null }
    const sortOrder = (maxOrderResult?.max_order ?? -1) + 1

    this.db.prepare(`
      INSERT INTO categories (id, name, icon, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, icon || null, sortOrder, now)

    return { id, name, icon, sortOrder, createdAt: now }
  }

  /**
   * Update a category
   */
  updateCategory(id: string, data: { name?: string; icon?: string }): Record<string, unknown> {
    if (!this.db || !this.isUnlocked()) throw new Error('Vault is locked')

    const existing = this.db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as CategoryRow | undefined
    if (!existing) throw new Error('Category not found')

    const name = data.name ?? existing.name
    const icon = data.icon !== undefined ? data.icon : existing.icon

    this.db.prepare(`
      UPDATE categories SET name = ?, icon = ? WHERE id = ?
    `).run(name, icon, id)

    return {
      id,
      name,
      icon,
      sortOrder: existing.sort_order,
      createdAt: existing.created_at,
    }
  }

  /**
   * Reorder categories
   */
  reorderCategories(orderedIds: string[]): void {
    if (!this.db || !this.isUnlocked()) throw new Error('Vault is locked')

    const stmt = this.db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?')
    const transaction = this.db.transaction((ids: string[]) => {
      ids.forEach((id, index) => {
        stmt.run(index, id)
      })
    })
    transaction(orderedIds)
  }

  /**
   * Delete a category (sets secrets' category_id to null)
   */
  deleteCategory(id: string): void {
    if (!this.db || !this.isUnlocked()) throw new Error('Vault is locked')

    // Remove category reference from secrets
    this.db.prepare('UPDATE secrets SET category_id = NULL WHERE category_id = ?').run(id)

    // Delete category
    this.db.prepare('DELETE FROM categories WHERE id = ?').run(id)
  }
}
