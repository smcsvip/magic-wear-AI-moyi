// 这是注册接口（API）
// 当用户填写注册表单并点击"注册"按钮时，前端会发送请求到这里
// 这里负责：验证数据 → 检查用户名是否重复 → 加密密码 → 创建用户 → 自动登录

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'
import { validateUsername, normalizeUsername } from '@/lib/usernameUtils'
import { sendWelcomeEmail } from '@/lib/email'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST 函数：处理注册请求（只接受 POST 方法）
export async function POST(request: NextRequest) {
  // 从请求体里读取用户名、邮箱、密码和 Turnstile 验证 token
  const { username, email, password, turnstileToken } = await request.json()

  // ── Turnstile 人机验证 ──
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

  // ── 用户名校验 ──
  const usernameError = validateUsername(username)
  if (usernameError) {
    return NextResponse.json({ message: usernameError }, { status: 400 })
  }
  const normalizedUsername = normalizeUsername(username)

  // ── 邮箱校验 ──
  if (!email || !email.trim()) {
    return NextResponse.json({ message: '邮箱不能为空' }, { status: 400 })
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ message: '邮箱格式不正确' }, { status: 400 })
  }
  const normalizedEmail = email.trim().toLowerCase()

  // ── 密码校验 ──
  if (!password) {
    return NextResponse.json({ message: '密码不能为空' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ message: '密码至少6位' }, { status: 400 })
  }

  // 检查用户名是否已被占用
  const existingUsername = await prisma.user.findUnique({ where: { username: normalizedUsername } })
  if (existingUsername) {
    return NextResponse.json({ message: '用户名已被占用' }, { status: 409 })
  }

  // 检查邮箱是否已被注册
  const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existingEmail) {
    return NextResponse.json({ message: '该邮箱已被注册' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)

  // 检查是否是首个用户（自动成为管理员）
  const userCount = await prisma.user.count()
  const isFirstUser = userCount === 0

  // 创建用户，同时记录邮箱修改时间（注册时设置的邮箱也算一次）
  const user = await prisma.user.create({
    data: {
      username: normalizedUsername,
      email: normalizedEmail,
      emailUpdatedAt: new Date(),
      password: hashed,
      role: isFirstUser ? 'admin' : 'user', // 首个用户自动成为管理员
    },
  })

  const token = await signToken({ userId: user.id, username: user.username })
  await setAuthCookie(token)

  // 发送欢迎邮件（异步，不阻塞响应）
  sendWelcomeEmail(normalizedEmail, user.username).catch(err => {
    console.error('发送欢迎邮件失败:', err)
  })

  return NextResponse.json({ message: '注册成功' }, { status: 201 })
}
