import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 获取统计数据
export async function GET(req: NextRequest) {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // 用户总数
    const totalUsers = await prisma.user.count()

    // 今日新增用户
    const todayUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    })

    // 试穿总次数
    const totalTryons = await prisma.tryonRecord.count()

    // 今日试穿次数
    const todayTryons = await prisma.tryonRecord.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    })

    // 反馈总数
    const totalFeedback = await prisma.feedback.count()

    // 待处理反馈数
    const pendingFeedback = await prisma.feedback.count({
      where: {
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        todayUsers,
        totalTryons,
        todayTryons,
        totalFeedback,
        pendingFeedback
      }
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    return NextResponse.json(
      { success: false, message: '获取统计数据失败' },
      { status: 500 }
    )
  }
}
