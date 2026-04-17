// 这是注册接口（API）
// 当用户填写注册表单并点击"注册"按钮时，前端会发送请求到这里
// 这里负责：验证数据 → 检查用户名是否重复 → 加密密码 → 创建用户 → 自动登录

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'
import { validateUsername, normalizeUsername } from '@/lib/usernameUtils'

// POST 函数：处理注册请求（只接受 POST 方法）
export async function POST(request: NextRequest) {
  // 从请求体里读取用户名、密码和 Turnstile 验证 token
  const { username, password, turnstileToken } = await request.json()

  // ── Turnstile 人机验证 ──
  // 去 Cloudflare 服务器验证前端传来的 token 是否真实有效
  if (!turnstileToken) {
    return NextResponse.json({ message: '请完成人机验证' }, { status: 400 })
  }
  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
    }),
  })
  const verifyResult = await verifyRes.json()
  if (!verifyResult.success) {
    return NextResponse.json({ message: '人机验证失败，请重试' }, { status: 403 })
  }

  // ── 用户名校验（后端兜底，即使前端绕过也能拦截）──
  // validateUsername 会检查：非空、4-16位、只含字母数字、不能纯数字
  const usernameError = validateUsername(username)
  if (usernameError) {
    return NextResponse.json({ message: usernameError }, { status: 400 })
  }

  // 标准化用户名：去首尾空格 + 转小写
  // 这样 "ABC123" 和 "abc123" 会被当作同一个用户名
  const normalizedUsername = normalizeUsername(username)

  // 验证密码不能为空
  if (!password) {
    return NextResponse.json({ message: '密码不能为空' }, { status: 400 })
  }
  // 验证密码长度至少 6 位
  if (password.length < 6) {
    return NextResponse.json({ message: '密码至少6位' }, { status: 400 })
  }

  // 查询数据库，检查用户名是否已经被注册过（用标准化后的小写用户名查）
  const existing = await prisma.user.findUnique({ where: { username: normalizedUsername } })
  if (existing) {
    // 409 状态码表示"冲突"，这里表示用户名已存在
    return NextResponse.json({ message: '用户名已被占用' }, { status: 409 })
  }

  // 用 bcrypt 加密密码，数字 10 是"加密强度"（越大越安全但越慢）
  // 加密后的密码是一串乱码，即使数据库被盗也无法还原原始密码
  const hashed = await bcrypt.hash(password, 10)

  // 在数据库里创建新用户，存储标准化后的小写用户名和加密后的密码
  const user = await prisma.user.create({
    data: { username: normalizedUsername, password: hashed },
  })

  // 注册成功后自动登录：生成 JWT 令牌并存到 Cookie
  const token = await signToken({ userId: user.id, username: user.username })
  await setAuthCookie(token)

  // 返回成功响应，201 状态码表示"已创建"
  return NextResponse.json({ message: '注册成功' }, { status: 201 })
}
