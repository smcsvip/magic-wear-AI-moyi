// 更新用户邮件订阅状态 API
// POST /api/user/email-subscription
// 请求体：{ subscribed: boolean }

import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  // 验证用户登录状态
  const token = await getAuthToken()
  if (!token) {
    return NextResponse.json({ message: '未登录' }, { status: 401 })
  }

  let payload
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ message: '登录已过期' }, { status: 401 })
  }

  const { subscribed } = await request.json()

  if (typeof subscribed !== 'boolean') {
    return NextResponse.json({ message: '参数错误' }, { status: 400 })
  }

  // 更新用户的订阅状态
  await prisma.user.update({
    where: { id: payload.userId },
    data: { emailSubscribed: subscribed },
  })

  return NextResponse.json({ message: '更新成功' })
}
