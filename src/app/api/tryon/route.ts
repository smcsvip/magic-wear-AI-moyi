// 这是虚拟试穿的核心接口（API）
// 当用户点击"开始试穿"按钮时，前端会把两张图片发送到这里
// 这里负责：接收图片 → 调用豆包 AI → 返回结果图片 → 如果已登录则保存记录

// 告诉 Vercel 这个接口最多等 60 秒（AI 生图比较慢，默认 10 秒不够）
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { callDoubaoAPI } from '@/services/doubaoService'
import { DoubaoServiceError, DoubaoErrorCode } from '@/services/types'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST 函数：处理试穿请求
export async function POST(request: NextRequest) {
  try {
    // 从请求里读取表单数据（包含两张图片文件）
    const formData = await request.formData()
    const personImage = formData.get('personImage') as File   // 人物照片
    const clothesImage = formData.get('clothesImage') as File // 服装图片

    // 检查两张图片是否都上传了
    if (!personImage || !clothesImage) {
      return NextResponse.json(
        { success: false, message: '请上传人物照片和服装图片' },
        { status: 400 }
      )
    }

    // 调用豆包 AI 接口，传入两张图片，返回试穿结果图片的 URL
    const imageUrl = await callDoubaoAPI(personImage, clothesImage)

    // 如果用户已登录，把这次试穿记录保存到数据库
    const token = await getAuthToken()
    if (token) {
      try {
        // 验证令牌，获取用户 ID
        const payload = await verifyToken(token)
        // 在数据库里创建一条试穿记录
        await prisma.tryonRecord.create({
          data: { userId: payload.userId, resultImage: imageUrl },
        })
      } catch {
        // 保存记录失败不影响主流程，用户仍然能看到试穿结果
      }
    }

    // 返回成功响应，包含结果图片的 URL
    return NextResponse.json({ success: true, imageUrl, message: '试穿成功' })
  } catch (error) {
    // 处理豆包 API 的各种错误情况
    if (error instanceof DoubaoServiceError) {
      let statusCode = 500
      let message = error.message
      switch (error.code) {
        case DoubaoErrorCode.UNAUTHORIZED:   statusCode = 401; message = 'API认证失败，请检查配置'; break
        case DoubaoErrorCode.RATE_LIMIT:     statusCode = 429; message = '请求过于频繁，请稍后再试'; break
        case DoubaoErrorCode.TIMEOUT:        statusCode = 504; message = '请求超时，请重试'; break
        case DoubaoErrorCode.NETWORK_ERROR:  statusCode = 503; message = '网络错误，请检查网络连接'; break
      }
      return NextResponse.json({ success: false, message }, { status: statusCode })
    }
    // 其他未知错误
    return NextResponse.json({ success: false, message: '试穿失败，请重试' }, { status: 500 })
  }
}
