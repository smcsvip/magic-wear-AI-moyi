import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, content, email } = body

    // 验证必填字段
    if (!type || !content) {
      return NextResponse.json(
        { success: false, message: '反馈类型和内容不能为空' },
        { status: 400 }
      )
    }

    // 验证反馈类型
    if (!['bug', 'feature', 'other'].includes(type)) {
      return NextResponse.json(
        { success: false, message: '无效的反馈类型' },
        { status: 400 }
      )
    }

    // 保存反馈到数据库
    await prisma.feedback.create({
      data: {
        type,
        content,
        email: email || null
      }
    })

    return NextResponse.json({
      success: true,
      message: '反馈提交成功'
    })
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { success: false, message: '提交失败，请稍后重试' },
      { status: 500 }
    )
  }
}
