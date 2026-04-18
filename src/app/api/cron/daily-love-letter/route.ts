// 定时任务 API：每日问候邮件
// 路径：POST /api/cron/daily-love-letter
// 由 cron-job.org 每天晚上 20:00 调用

import { sendDailyLoveLetterToAll } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // 第一步：验证请求是否合法
  // 只有携带正确的 CRON_SECRET 的请求才能执行任务
  // 这样可以防止被恶意调用，避免滥发邮件
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: '未授权访问' },
      { status: 401 }
    )
  }

  // 第二步：执行任务——给所有订阅用户发送每日问候邮件
  try {
    await sendDailyLoveLetterToAll()
    return NextResponse.json({
      success: true,
      message: '每日问候邮件发送完成',
      time: new Date().toISOString(),
    })
  } catch (error) {
    console.error('每日问候邮件发送失败：', error)
    return NextResponse.json(
      { error: '发送失败' },
      { status: 500 }
    )
  }
}
