// API: 系统配置管理
// 功能：获取和更新系统配置（维护模式开关、维护提示信息）

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 获取系统配置
export async function GET() {
  try {
    let config = await prisma.systemConfig.findFirst()

    // 如果没有配置记录，创建默认配置
    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          maintenanceMode: false,
          maintenanceMessage: '系统维护中，请稍后再试'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error) {
    console.error('获取系统配置失败:', error)
    return NextResponse.json(
      { success: false, message: '获取系统配置失败' },
      { status: 500 }
    )
  }
}

// 更新系统配置
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { maintenanceMode, maintenanceMessage } = body

    // 验证参数
    if (typeof maintenanceMode !== 'boolean') {
      return NextResponse.json(
        { success: false, message: '维护模式参数无效' },
        { status: 400 }
      )
    }

    // 获取或创建配置
    let config = await prisma.systemConfig.findFirst()

    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          maintenanceMode,
          maintenanceMessage: maintenanceMessage || '系统维护中，请稍后再试'
        }
      })
    } else {
      config = await prisma.systemConfig.update({
        where: { id: config.id },
        data: {
          maintenanceMode,
          maintenanceMessage: maintenanceMessage || config.maintenanceMessage
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: config,
      message: '系统配置已更新'
    })
  } catch (error) {
    console.error('更新系统配置失败:', error)
    return NextResponse.json(
      { success: false, message: '更新系统配置失败' },
      { status: 500 }
    )
  }
}
