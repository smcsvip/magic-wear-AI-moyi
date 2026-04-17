// 修改密码的接口
// PUT /api/auth/password
// 请求体：{ oldPassword: string, newPassword: string }

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
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

  const { oldPassword, newPassword } = await request.json()

  // 基本校验
  if (!oldPassword) {
    return NextResponse.json({ message: '请输入当前密码' }, { status: 400 })
  }
  if (!newPassword) {
    return NextResponse.json({ message: '请输入新密码' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ message: '新密码至少 6 位' }, { status: 400 })
  }

  // 查询用户当前密码
  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) {
    return NextResponse.json({ message: '用户不存在' }, { status: 404 })
  }

  // 验证旧密码是否正确
  const isMatch = await bcrypt.compare(oldPassword, user.password)
  if (!isMatch) {
    return NextResponse.json({ message: '当前密码不正确' }, { status: 400 })
  }

  // 新密码不能和旧密码相同
  const isSame = await bcrypt.compare(newPassword, user.password)
  if (isSame) {
    return NextResponse.json({ message: '新密码不能与当前密码相同' }, { status: 400 })
  }

  // 加密新密码并保存
  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: payload.userId },
    data: { password: hashed },
  })

  return NextResponse.json({ message: '密码修改成功' })
}
