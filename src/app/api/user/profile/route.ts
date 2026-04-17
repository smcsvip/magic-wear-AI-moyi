// 保存用户昵称的接口
// PUT /api/user/profile
// 请求体：{ nickname: string }

import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest) {
  // 验证登录状态
  const token = await getAuthToken()
  if (!token) {
    return NextResponse.json({ message: '请先登录' }, { status: 401 })
  }

  let payload
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ message: '登录已过期，请重新登录' }, { status: 401 })
  }

  const { nickname } = await request.json()

  // 昵称校验：可以为空（空字符串表示清除昵称），非空时最多 20 位
  if (nickname !== undefined && nickname !== null) {
    const trimmed = nickname.trim()
    if (trimmed.length > 20) {
      return NextResponse.json({ message: '昵称最多 20 个字符' }, { status: 400 })
    }
    // 更新数据库：空字符串存为 null（表示未设置昵称）
    await prisma.user.update({
      where: { id: payload.userId },
      data: { nickname: trimmed || null },
    })
    return NextResponse.json({ message: '昵称已保存' })
  }

  return NextResponse.json({ message: '参数错误' }, { status: 400 })
}
