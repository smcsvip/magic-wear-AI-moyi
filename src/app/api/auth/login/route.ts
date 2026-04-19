// 这是登录接口（API）
// 当用户填写登录表单并点击"登录"按钮时，前端会发送请求到这里
// 这里负责：验证数据 → 查找用户 → 比对密码 → 生成令牌 → 设置 Cookie

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'
import { normalizeUsername } from '@/lib/usernameUtils'

// POST 函数：处理登录请求
export async function POST(request: NextRequest) {
  // 从请求体里读取用户名和密码
  const { username, password } = await request.json()

  // 基本验证：用户名和密码不能为空
  if (!username?.trim()) {
    return NextResponse.json({ message: '用户名不能为空' }, { status: 400 })
  }
  if (!password) {
    return NextResponse.json({ message: '密码不能为空' }, { status: 400 })
  }

  // 标准化用户名：去首尾空格 + 转小写
  // 用户输入 "ABC123" 会被转成 "abc123"，和数据库里存的一致
  const normalizedUsername = normalizeUsername(username)

  // 在数据库里查找这个用户名（用标准化后的小写用户名查）
  const user = await prisma.user.findUnique({ where: { username: normalizedUsername } })

  // 验证用户是否存在，以及密码是否正确
  // bcrypt.compare 会把用户输入的密码和数据库里的加密密码进行比对
  // 注意：这里故意不区分"用户不存在"和"密码错误"，统一返回同一个错误信息
  // 这是安全最佳实践，防止攻击者通过错误信息猜测哪些用户名存在
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ message: '用户名或密码错误' }, { status: 401 })
  }

  // 检查用户是否被禁用
  if (user.status === 'disabled') {
    return NextResponse.json({ message: '账号已被禁用，请联系管理员' }, { status: 403 })
  }

  // 登录成功：生成 JWT 令牌并存到 Cookie
  const token = await signToken({ userId: user.id, username: user.username })
  await setAuthCookie(token)

  return NextResponse.json({ message: '登录成功' })
}
