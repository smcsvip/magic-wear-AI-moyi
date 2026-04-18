// 修改邮箱的接口
// PUT /api/user/email
// 请求体：{ email: string }
// 限制：7 天内只能修改一次（首次设置不受限）

import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 邮箱格式正则
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function PUT(request: NextRequest) {
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

  const { email } = await request.json()

  // 校验邮箱格式
  if (!email || !email.trim()) {
    return NextResponse.json({ message: '邮箱不能为空' }, { status: 400 })
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ message: '邮箱格式不正确' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  // 查询当前用户
  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) {
    return NextResponse.json({ message: '用户不存在' }, { status: 404 })
  }

  // 7 天限制：如果已经设置过邮箱（emailUpdatedAt 不为空），检查是否超过 7 天
  if (user.emailUpdatedAt) {
    const daysSinceUpdate = (Date.now() - user.emailUpdatedAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate < 7) {
      const daysLeft = Math.ceil(7 - daysSinceUpdate)
      return NextResponse.json(
        { message: `邮箱 ${daysLeft} 天后才能再次修改` },
        { status: 400 }
      )
    }
  }

  // 检查邮箱是否已被其他用户使用
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing && existing.id !== payload.userId) {
    return NextResponse.json({ message: '该邮箱已被其他账号使用' }, { status: 409 })
  }

  // 保存邮箱，同时记录修改时间
  await prisma.user.update({
    where: { id: payload.userId },
    data: { email: normalizedEmail, emailUpdatedAt: new Date() },
  })

  return NextResponse.json({ message: '邮箱已更新' })
}
