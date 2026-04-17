// 这是获取当前登录用户试穿历史记录的接口
// 首页点击"历史记录"按钮时调用，返回和个人中心一致的数据

import { NextResponse } from 'next/server'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  // 读取登录令牌
  const token = await getAuthToken()
  if (!token) {
    // 未登录，返回空数组
    return NextResponse.json({ records: [] })
  }
  try {
    const payload = await verifyToken(token)
    // 查询该用户最近 20 条试穿记录，和个人中心保持一致
    const records = await prisma.tryonRecord.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, resultImage: true, createdAt: true },
    })
    return NextResponse.json({ records })
  } catch {
    return NextResponse.json({ records: [] })
  }
}
