// 邮件发送工具函数
import { Resend } from 'resend'
import { prisma } from '@/lib/db'
import { generateDailyEmailContent } from '@/lib/ai'

const resend = new Resend(process.env.RESEND_API_KEY)

// 发送欢迎邮件
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: userEmail,
    subject: '你好呀，我是你魔衣小管家 💌',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Hi ${userName}，欢迎来到魔衣 MagicWear！</h2>
        <p style="color: #666; line-height: 1.6;">从现在起，我就是你的专属小管家了。</p>
        <p style="color: #666; line-height: 1.6;">使用魔衣过程中，有问题随时沟通，微信：smc433。</p>
        <p style="color: #666; line-height: 1.6;">明天早上我会给你发一条早安消息，记得查收哦。</p>
        <br/>
        <p style="color: #999; font-size: 14px;">—— 你的魔衣 MagicWear</p>
      </div>
    `,
  })
}

// 给单个用户发送每日问候邮件
async function sendDailyLoveLetter(
  userEmail: string,
  userName: string,
  unsubscribeToken: string
) {
  // 调用 AI 生成邮件主题和内容
  const { subject, content } = await generateDailyEmailContent(userName)

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: userEmail,
    subject: subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <!-- AI 生成的开场白 -->
        <div style="background: white; padding: 24px; border-radius: 12px; margin-bottom: 16px;">
          <p style="color: #374151; line-height: 1.6; margin: 0;">${content}</p>
        </div>

        <!-- 固定的产品引导部分 -->
        <div style="background: white; padding: 24px; border-radius: 12px; margin-bottom: 16px;">
          <h3 style="color: #111827; margin: 0 0 12px 0; font-size: 18px;">✨ 今晚试试这些</h3>
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 16px 0;">
            上传你的照片，AI 帮你试穿各种风格的衣服，找到最适合你的那一件。
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://moyiai.club'}"
             style="display: inline-block; background: #111827; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            立即体验
          </a>
        </div>

        <!-- 客服联系 -->
        <div style="background: white; padding: 24px; border-radius: 12px; margin-bottom: 16px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            有问题随时找我：<strong style="color: #111827;">微信 smc433</strong>
          </p>
        </div>

        <!-- 取消订阅链接 -->
        <div style="text-align: center; padding-top: 16px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            不想再收到这类邮件？<a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://moyiai.club'}/unsubscribe?token=${unsubscribeToken}" style="color: #6b7280; text-decoration: underline;">点击取消订阅</a>
          </p>
        </div>
      </div>
    `,
  })
}

// 给所有订阅用户发送每日问候邮件
export async function sendDailyLoveLetterToAll() {
  // 查询所有订阅了邮件且有邮箱的用户
  const users = await prisma.user.findMany({
    where: {
      emailSubscribed: true,  // 订阅状态为 true
      email: { not: null },   // 邮箱不为空
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  })

  console.log(`开始发送每日邮件，共 ${users.length} 位用户`)

  // 逐个发送（避免并发过多导致 API 限流）
  let successCount = 0
  let failCount = 0

  for (const user of users) {
    try {
      // 生成取消订阅 token（简单方案：用户 ID + 密钥的哈希）
      const crypto = await import('crypto')
      const unsubscribeToken = crypto
        .createHash('sha256')
        .update(`${user.id}-${process.env.CRON_SECRET}`)
        .digest('hex')

      await sendDailyLoveLetter(user.email!, user.username, unsubscribeToken)
      successCount++
      console.log(`✓ 已发送给 ${user.username} (${user.email})`)
    } catch (error) {
      failCount++
      console.error(`✗ 发送失败 ${user.username}:`, error)
    }

    // 每发送一封邮件后等待 100ms，避免触发 API 限流
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`发送完成：成功 ${successCount} 封，失败 ${failCount} 封`)
}

