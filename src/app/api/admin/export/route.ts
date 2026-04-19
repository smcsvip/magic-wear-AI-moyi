import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // users, feedbacks, tryons

    let csvContent = ''
    let filename = ''

    if (type === 'users') {
      // 导出用户列表
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: { records: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      csvContent = 'ID,用户名,邮箱,角色,试穿次数,注册时间\n'
      users.forEach(user => {
        csvContent += `${user.id},"${user.username}","${user.email || ''}","${user.role}",${user._count.records},"${new Date(user.createdAt).toLocaleString('zh-CN')}"\n`
      })
      filename = `users_${Date.now()}.csv`

    } else if (type === 'feedbacks') {
      // 导出反馈列表
      const feedbacks = await prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' }
      })

      csvContent = 'ID,类型,内容,联系邮箱,状态,提交时间\n'
      feedbacks.forEach(fb => {
        const typeLabel = fb.type === 'bug' ? 'Bug反馈' : fb.type === 'feature' ? '功能建议' : '其他'
        const statusLabel = fb.status === 'resolved' ? '已处理' : '待处理'
        csvContent += `${fb.id},"${typeLabel}","${fb.content.replace(/"/g, '""')}","${fb.email || ''}","${statusLabel}","${new Date(fb.createdAt).toLocaleString('zh-CN')}"\n`
      })
      filename = `feedbacks_${Date.now()}.csv`

    } else if (type === 'tryons') {
      // 导出试穿记录
      const records = await prisma.tryonRecord.findMany({
        include: {
          user: {
            select: {
              username: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      csvContent = 'ID,用户名,用户邮箱,生成时间\n'
      records.forEach(record => {
        csvContent += `${record.id},"${record.user.username}","${record.user.email || ''}","${new Date(record.createdAt).toLocaleString('zh-CN')}"\n`
      })
      filename = `tryon_records_${Date.now()}.csv`

    } else {
      return NextResponse.json(
        { success: false, message: '无效的导出类型' },
        { status: 400 }
      )
    }

    // 添加 BOM 以支持 Excel 正确显示中文
    const bom = '\uFEFF'
    const csvWithBom = bom + csvContent

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('导出数据失败:', error)
    return NextResponse.json(
      { success: false, message: '导出失败' },
      { status: 500 }
    )
  }
}
