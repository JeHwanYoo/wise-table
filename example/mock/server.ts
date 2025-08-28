// Mock server for local development with localStorage backend
const STORAGE_KEY = 'wise-mock-server'

// Pagination parameters
export interface PaginationParams<T = Record<string, unknown>> {
  page?: number
  pageSize?: number
  sortBy?: keyof T
  sortDir?: 'asc' | 'desc'
  // Arbitrary filters and search terms forwarded by API layer
  filters?: Record<string, unknown>
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Database structure stored in localStorage
interface MockDatabase<T = Record<string, unknown>> {
  records: T[]
  meta: {
    nextId: number
    createdAt: string
    updatedAt: string
    lastOperation?: {
      type: 'create' | 'update' | 'delete' | 'seed'
      reason?: string
      recordCount: number
      timestamp: string
    }
  }
}

/**
 * Mock server implementation using localStorage as backend
 * Simulates a real database with CRUD operations and pagination
 */
export class MockServer<T, TIdColumn extends keyof T> {
  private tableName: string
  private idColumn: TIdColumn

  constructor(tableName: string = 'default', idColumn: TIdColumn) {
    this.tableName = tableName
    this.idColumn = idColumn
    this.initializeDatabase()
  }

  /**
   * Initialize database if it doesn't exist
   */
  private initializeDatabase(): void {
    const existing = this.getDatabase()
    if (!existing) {
      const initialDb: MockDatabase<T> = {
        records: [],
        meta: {
          nextId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }
      this.saveDatabase(initialDb)
    }
  }

  /**
   * Get database from localStorage
   */
  private getDatabase(): MockDatabase<T> | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return null

      const parsed = JSON.parse(data)
      return parsed[this.tableName] || null
    } catch (error) {
      console.error('Failed to parse database:', error)
      return null
    }
  }

  /**
   * Save database to localStorage
   */
  private saveDatabase(db: MockDatabase<T>): void {
    try {
      const existing = localStorage.getItem(STORAGE_KEY)
      const allData = existing ? JSON.parse(existing) : {}

      allData[this.tableName] = {
        ...db,
        meta: {
          ...db.meta,
          updatedAt: new Date().toISOString(),
        },
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allData))
    } catch (error) {
      console.error('Failed to save database:', error)
      throw new Error('Database save failed')
    }
  }

  /**
   * Generate next ID
   */
  private getNextId(): number {
    const db = this.getDatabase()
    if (!db) throw new Error('Database not initialized')

    return db.meta.nextId
  }

  /**
   * Simulate network delay
   */
  private async simulateDelay(ms: number = 500): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Fetch records with pagination support
   */
  async fetch(params: PaginationParams<T> = {}): Promise<PaginatedResponse<T>> {
    await this.simulateDelay(400) // Quick delay for search/filter

    const db = this.getDatabase()
    if (!db) throw new Error('Database not found')

    const {
      page = 1,
      pageSize = 50,
      sortBy,
      sortDir = 'asc',
      filters = {},
    } = params

    // Apply filtering generically
    const records = db.records.slice().filter((record) => {
      // Text search across string fields
      const search = (filters['search'] as string | undefined)?.toLowerCase?.()
      if (search) {
        const matchesAnyStringField = Object.values(
          record as Record<string, unknown>,
        ).some((v) => typeof v === 'string' && v.toLowerCase().includes(search))
        if (!matchesAnyStringField) return false
      }

      // Handle start_<field>/end_<field> date range filters
      for (const [k, v] of Object.entries(filters)) {
        if (k.startsWith('start_') || k.startsWith('end_')) {
          const isStart = k.startsWith('start_')
          const field = k.replace(/^start_|^end_/, '')
          const recVal = (record as Record<string, unknown>)[field]
          if (!recVal) continue
          const recDate = new Date(String(recVal))
          const filterDate = new Date(String(v))
          if (
            Number.isNaN(recDate.getTime()) ||
            Number.isNaN(filterDate.getTime())
          )
            continue
          if (isStart && recDate < filterDate) return false
          if (!isStart && recDate > filterDate) return false
        }
      }

      // Handle min_<field>/max_<field> and camelCase minField/maxField for numbers
      for (const [k, v] of Object.entries(filters)) {
        const m1 = k.match(/^min_(.+)$/)
        const m2 = k.match(/^max_(.+)$/)
        const m3 = k.match(/^min([A-Z].*)$/)
        const m4 = k.match(/^max([A-Z].*)$/)
        let field: string | null = null
        let kind: 'min' | 'max' | null = null
        if (m1) {
          field = m1[1]
          kind = 'min'
        } else if (m2) {
          field = m2[1]
          kind = 'max'
        } else if (m3) {
          field = m3[1] ? m3[1].charAt(0).toLowerCase() + m3[1].slice(1) : ''
          kind = 'min'
        } else if (m4) {
          field = m4[1] ? m4[1].charAt(0).toLowerCase() + m4[1].slice(1) : ''
          kind = 'max'
        }
        if (field && kind) {
          const recVal = (record as Record<string, unknown>)[field]
          const numRec = Number(recVal)
          const numFilter = Number(v)
          if (!Number.isNaN(numRec) && !Number.isNaN(numFilter)) {
            if (kind === 'min' && numRec < numFilter) return false
            if (kind === 'max' && numRec > numFilter) return false
          }
        }
      }

      // Exact/contains match for remaining scalar filters
      for (const [k, v] of Object.entries(filters)) {
        if (
          k === 'search' ||
          k.startsWith('start_') ||
          k.startsWith('end_') ||
          /^min_/.test(k) ||
          /^max_/.test(k) ||
          /^min[A-Z]/.test(k) ||
          /^max[A-Z]/.test(k)
        ) {
          continue
        }
        const recVal = (record as Record<string, unknown>)[k]
        if (recVal == null || v == null || v === '') continue
        if (typeof recVal === 'string') {
          const lhs = recVal.toLowerCase()
          const rhs = String(v).toLowerCase()
          if (!lhs.includes(rhs)) return false
        } else if (typeof recVal === 'number') {
          const rhsNum = Number(v)
          if (Number.isNaN(rhsNum) || recVal !== rhsNum) return false
        } else if (typeof recVal === 'boolean') {
          const rhsBool = typeof v === 'boolean' ? v : String(v) === 'true'
          if (recVal !== rhsBool) return false
        } else {
          // Fallback strict equality
          if (recVal !== v) return false
        }
      }

      return true
    })

    // Sorting after filtering
    if (sortBy) {
      records.sort((a, b) => {
        const av = a[sortBy] as unknown as number | string | boolean | Date
        const bv = b[sortBy] as unknown as number | string | boolean | Date
        if (av === bv) return 0
        if (av == null) return 1
        if (bv == null) return -1
        if (av < bv) return sortDir === 'asc' ? -1 : 1
        return sortDir === 'asc' ? 1 : -1
      })
    }

    const total = records.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const data = records.slice(startIndex, endIndex)

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    }
  }

  /**
   * Create new records (bulk operation)
   */
  async create(data: Omit<T, TIdColumn>[], reason?: string): Promise<T[]> {
    await this.simulateDelay(700) // Moderate delay for create operations

    const db = this.getDatabase()
    if (!db) throw new Error('Database not found')

    const nextId = this.getNextId()

    const newRecords: T[] = data.map(
      (item, index) =>
        ({
          ...item,
          [this.idColumn]: nextId + index,
        }) as T,
    )

    db.records.push(...newRecords)
    db.meta.nextId += data.length

    // Store operation metadata
    db.meta.lastOperation = {
      type: 'create',
      reason,
      recordCount: newRecords.length,
      timestamp: new Date().toISOString(),
    }

    this.saveDatabase(db)

    return newRecords
  }

  /**
   * Update existing records (bulk operation)
   */

  async update(
    updates: Array<{ id: T[TIdColumn]; data: Partial<T> }>,
    reason?: string,
  ): Promise<T[]> {
    await this.simulateDelay(600) // Moderate delay for update operations

    const db = this.getDatabase()
    if (!db) throw new Error('Database not found')

    const updatedRecords: T[] = []

    for (const update of updates) {
      const index = db.records.findIndex(
        (record) => record[this.idColumn] === update.id,
      )
      if (index !== -1) {
        db.records[index] = { ...db.records[index], ...update.data }
        updatedRecords.push(db.records[index])
      }
    }

    // Store operation metadata
    db.meta.lastOperation = {
      type: 'update',
      reason,
      recordCount: updatedRecords.length,
      timestamp: new Date().toISOString(),
    }

    this.saveDatabase(db)

    return updatedRecords
  }

  /**
   * Delete records (bulk operation)
   */
  async delete(ids: Array<T[TIdColumn]>, reason?: string): Promise<void> {
    await this.simulateDelay(800) // Longer delay for delete operations

    const db = this.getDatabase()
    if (!db) throw new Error('Database not found')

    const initialCount = db.records.length
    db.records = db.records.filter(
      (record) => !ids.includes(record[this.idColumn]),
    )
    const deletedCount = initialCount - db.records.length

    // Store operation metadata
    db.meta.lastOperation = {
      type: 'delete',
      reason,
      recordCount: deletedCount,
      timestamp: new Date().toISOString(),
    }

    this.saveDatabase(db)
  }

  /**
   * Seed database with initial data
   */
  async seed(data: Omit<T, TIdColumn>[], reason?: string): Promise<T[]> {
    let db = this.getDatabase()
    if (!db) throw new Error('Database not found')

    // Clear existing data
    db.records = []
    db.meta.nextId = 1

    const result = await this.create(data, reason || 'Database seeding')

    db = this.getDatabase()

    // Update operation type for seeding
    if (db?.meta.lastOperation) {
      db.meta.lastOperation.type = 'seed'
      this.saveDatabase(db)
    }

    return result
  }

  /**
   * Clear all data from database
   */
  async clear(): Promise<void> {
    const db = this.getDatabase()
    if (!db) throw new Error('Database not found')

    db.records = []
    db.meta.nextId = 1

    this.saveDatabase(db)
  }

  /**
   * Get database statistics
   */
  getStats(): { recordCount: number; lastUpdated: string } {
    const db = this.getDatabase()
    if (!db) return { recordCount: 0, lastUpdated: 'Never' }

    return {
      recordCount: db.records.length,
      lastUpdated: db.meta.updatedAt,
    }
  }
}
