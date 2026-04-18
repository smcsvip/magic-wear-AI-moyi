// 发送邮箱验证码接口
// POST /api/email/send-code
// 请求体：{ email: string }

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/db'

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  // 校验邮箱格式
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ message: '邮箱格式不正确' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  // 生成 6 位随机验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  // 过期时间：5 分钟后
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  // 删除该邮箱之前的验证码（避免重复）
  await prisma.emailVerification.deleteMany({ where: { email: normalizedEmail } })

  // 保存新验证码
  await prisma.emailVerification.create({
    data: { email: normalizedEmail, code, expiresAt },
  })

  // 发送邮件
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: normalizedEmail,
      subject: '魔衣 - 邮箱验证码',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">邮箱验证码</h2>
          <p style="color: #666; font-size: 14px;">您正在进行邮箱验证，验证码为：</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 8px;">${code}</span>
          </div>
          <p style="color: #999; font-size: 12px;">验证码 5 分钟内有效，请勿泄露给他人。</p>
          <p style="color: #999; font-size: 12px;">如果这不是您的操作，请忽略此邮件。</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('发送邮件失败:', error)
    return NextResponse.json({ message: '发送失败，请稍后重试' }, { status: 500 })
  }

  return NextResponse.json({ message: '验证码已发送，请查收邮件' })
}
