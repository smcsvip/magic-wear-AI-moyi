// 获取当前登录用户完整信息的接口（供个人中心页面使用）
// GET /api/profile/me
// 返回：用户基本信息（含头像、昵称）+ 最近 20 条试穿记录

import { NextResponse } from 'next/server'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const token = await getAuthToken()
  if (!token) {
    return NextResponse.json({ message: '请先登录' }, { status: 401 })
  }

  let payload
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ message: '登录已过期' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      nickname: true,
      avatar: true,
      email: true,
      emailUpdatedAt: true,
      createdAt: true,
      records: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, resultImage: true, createdAt: true },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ message: '用户不存在' }, { status: 404 })
  }

  return NextResponse.json({ user })
}
