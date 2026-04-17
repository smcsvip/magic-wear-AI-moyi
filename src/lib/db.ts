// 这个文件负责创建数据库连接
// Prisma 是一个帮助我们操作数据库的工具，就像一个翻译官，把我们写的代码翻译成数据库能懂的语言

import { PrismaClient } from 'prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// globalForPrisma 是一个全局变量容器
// 为什么要用全局变量？因为在开发模式下，代码会频繁热更新（自动重载），
// 如果每次都新建数据库连接，会导致连接数量爆炸，所以我们把连接存在全局变量里复用
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// createClient 函数：创建一个新的数据库客户端
function createClient() {
  // PrismaPg 是专门用来连接 PostgreSQL（Neon数据库）的适配器
  // connectionString 就是数据库的地址，存在 .env.local 文件里的 DATABASE_URL
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  // 用这个适配器创建 Prisma 客户端
  return new PrismaClient({ adapter })
}

// 导出 prisma 对象供其他文件使用
// 逻辑：如果全局变量里已经有了，就直接用；没有就新建一个
// ?? 是"空值合并运算符"，意思是：左边有值就用左边，左边是 null/undefined 就用右边
export const prisma = globalForPrisma.prisma ?? createClient()

// 只在开发环境下把 prisma 存到全局变量
// 生产环境不需要，因为生产环境不会热更新
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
