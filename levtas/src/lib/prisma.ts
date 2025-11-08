import { PrismaClient } from '@prisma/client'

// PrismaClientのインスタンスをグローバルに宣言
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// グローバルにインスタンスが存在しない場合のみ、新しく作成する
export const prisma = 
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // クエリのログを出力する設定（開発中に便利）
  })

// 開発環境でのみ、グローバルにインスタンスを保存する
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
