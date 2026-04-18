// 取消订阅 API
// POST /api/email/unsubscribe
// 用户点击邮件里的"取消订阅"链接后，会跳转到取消订阅页面，页面调用这个接口

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const { token } = await request.json()

  if (!token) {
    return NextResponse.json({ message: 'token 不能为空' }, { status: 400 })
  }

  // 遍历所有用户，找到 token 匹配的用户
  // （简单方案：token = sha256(userId + CRON_SECRET)）
  const users = await prisma.user.findMany({
    where: { emailSubscribed: true },
    select: { id: true },
  })

  let targetUserId: number | null = null

  for (const user of users) {
    const expectedToken = crypto
      .createHash('sha256')
      .update(`${user.id}-${process.env.CRON_SECRET}`)
      .digest('hex')

    if (expectedToken === token) {
      targetUserId = user.id
      break
    }
  }

  if (!targetUserId) {
    return NextResponse.json({ message: '无效的取消订阅链接' }, { status: 400 })
  }

  // 更新用户的订阅状态
  await prisma.user.update({
    where: { id: targetUserId },
    data: { emailSubscribed: false },
  })

  return NextResponse.json({ message: '已成功取消订阅' })
}
