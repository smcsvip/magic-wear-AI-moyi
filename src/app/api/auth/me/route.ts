import { NextResponse } from 'next/server'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET 函数：处理获取用户信息的请求
export async function GET() {
  // 从 Cookie 里读取登录令牌
  const token = await getAuthToken()

  // 如果没有令牌，说明用户未登录，返回 null
  if (!token) {
    return NextResponse.json({ user: null })
  }

  try {
    // 验证令牌是否有效（没过期、没被篡改）
    const payload = await verifyToken(token)

    // 从数据库获取完整用户信息（包括 role）
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ user: null })
    }

    // 令牌有效，返回用户信息
    return NextResponse.json({ user })
  } catch {
    // 令牌无效（比如已过期），返回 null
    return NextResponse.json({ user: null })
  }
}
