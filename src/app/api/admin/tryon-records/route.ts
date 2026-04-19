import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 获取试穿记录列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 20
    const userId = searchParams.get('userId') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''

    // 构建查询条件
    const where: any = {}

    if (userId) {
      where.userId = parseInt(userId)
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    // 获取总数
    const total = await prisma.tryonRecord.count({ where })

    // 获取记录列表
    const records = await prisma.tryonRecord.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    return NextResponse.json({
      success: true,
      data: {
        records,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    })
  } catch (error) {
    console.error('获取试穿记录失败:', error)
    return NextResponse.json(
      { success: false, message: '获取试穿记录失败' },
      { status: 500 }
    )
  }
}
