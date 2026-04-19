import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || 'file:./db/custom.db'
  const isRemote = dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://')

  if (isRemote) {
    console.log('[DB] Using remote Turso database')
    try {
      // Dynamic import for Turso adapter (only when remote URL is configured)
      const { PrismaLibSQL } = require('@prisma/adapter-libsql')
      const adapter = new PrismaLibSQL({ url: dbUrl })
      return new PrismaClient({ adapter })
    } catch {
      console.log('[DB] Turso adapter not available, falling back to direct connection')
      return new PrismaClient({ log: ['error', 'warn'] })
    }
  } else {
    console.log('[DB] Using local SQLite:', dbUrl)
    return new PrismaClient({
      log: ['error', 'warn'],
    })
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
