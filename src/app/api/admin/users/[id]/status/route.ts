// API: 更新用户状态（禁用/启用）
// 管理员可以禁用或启用用户账号

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Next.js 15: params 是 Promise，需要 await
    const userId = parseInt(id)
    const { status } = await req.json()

    if (!['active', 'disabled'].includes(status)) {
      return NextResponse.json(
        { success: false, message: '无效的状态值' },
        { status: 400 }
      )
    }

    // 不能禁用自己
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    // 更新用户状态
    await prisma.user.update({
      where: { id: userId },
      data: { status }
    })

    return NextResponse.json({
      success: true,
      message: status === 'disabled' ? '用户已禁用' : '用户已启用'
    })
  } catch (error) {
    console.error('更新用户状态失败:', error)
    return NextResponse.json(
      { success: false, message: '操作失败' },
      { status: 500 }
    )
  }
}
