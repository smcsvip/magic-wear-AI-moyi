import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 获取反馈列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 20
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''

    // 构建查询条件
    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status

    // 获取总数
    const total = await prisma.feedback.count({ where })

    // 获取反馈列表
    const feedbacks = await prisma.feedback.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    return NextResponse.json({
      success: true,
      data: {
        feedbacks,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    })
  } catch (error) {
    console.error('获取反馈列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取反馈列表失败' },
      { status: 500 }
    )
  }
}

// 更新反馈状态
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: '参数错误' },
        { status: 400 }
      )
    }

    if (!['pending', 'resolved'].includes(status)) {
      return NextResponse.json(
        { success: false, message: '无效的状态值' },
        { status: 400 }
      )
    }

    await prisma.feedback.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({
      success: true,
      message: '更新成功'
    })
  } catch (error) {
    console.error('更新反馈状态失败:', error)
    return NextResponse.json(
      { success: false, message: '更新失败' },
      { status: 500 }
    )
  }
}
