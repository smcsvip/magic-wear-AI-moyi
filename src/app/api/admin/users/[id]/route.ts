// API: 获取用户详情
// 返回用户基本信息、试穿记录（最近20条）、反馈记录（最近10条）

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Next.js 15: params 是 Promise，需要 await
    const userId = parseInt(id)

    // 获取用户基本信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            records: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取试穿记录
    const tryonRecords = await prisma.tryonRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // 获取反馈记录
    const feedbacks = await prisma.feedback.findMany({
      where: { email: user.email || undefined },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...user,
          tryonCount: user._count.records
        },
        tryonRecords,
        feedbacks
      }
    })
  } catch (error) {
    console.error('获取用户详情失败:', error)
    return NextResponse.json(
      { success: false, message: '获取用户详情失败' },
      { status: 500 }
    )
  }
}
