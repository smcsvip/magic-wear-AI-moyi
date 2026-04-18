// 验证邮箱验证码接口
// POST /api/email/verify-code
// 请求体：{ email: string, code: string }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const { email, code } = await request.json()

  if (!email || !code) {
    return NextResponse.json({ message: '邮箱和验证码不能为空' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  // 查询验证码记录
  const record = await prisma.emailVerification.findFirst({
    where: {
      email: normalizedEmail,
      code: code.trim(),
      expiresAt: { gte: new Date() }, // 未过期
    },
    orderBy: { createdAt: 'desc' }, // 取最新的一条
  })

  if (!record) {
    return NextResponse.json({ message: '验证码错误或已过期' }, { status: 400 })
  }

  // 验证成功后删除该验证码（一次性使用）
  await prisma.emailVerification.delete({ where: { id: record.id } })

  return NextResponse.json({ message: '验证成功' })
}
