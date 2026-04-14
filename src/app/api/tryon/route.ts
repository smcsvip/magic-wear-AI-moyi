import { NextRequest, NextResponse } from 'next/server'
import { callDoubaoAPI } from '@/services/doubaoService'
import { DoubaoServiceError, DoubaoErrorCode } from '@/services/types'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const personImage = formData.get('personImage') as File
    const clothesImage = formData.get('clothesImage') as File

    if (!personImage || !clothesImage) {
      return NextResponse.json(
        { success: false, message: '请上传人物照片和服装图片' },
        { status: 400 }
      )
    }

    console.log('[INFO] 开始调用豆包API', {
      personImageSize: personImage.size,
      clothesImageSize: clothesImage.size
    })

    const imageUrl = await callDoubaoAPI(personImage, clothesImage)

    console.log('[INFO] 豆包API调用成功', { imageUrl })

    return NextResponse.json({
      success: true,
      imageUrl,
      message: '试穿成功'
    })
  } catch (error) {
    console.error('[ERROR] Tryon API error:', error)

    if (error instanceof DoubaoServiceError) {
      let statusCode = 500
      let message = error.message

      switch (error.code) {
        case DoubaoErrorCode.UNAUTHORIZED:
          statusCode = 401
          message = 'API认证失败，请检查配置'
          break
        case DoubaoErrorCode.RATE_LIMIT:
          statusCode = 429
          message = '请求过于频繁，请稍后再试'
          break
        case DoubaoErrorCode.TIMEOUT:
          statusCode = 504
          message = '请求超时，请重试'
          break
        case DoubaoErrorCode.NETWORK_ERROR:
          statusCode = 503
          message = '网络错误，请检查网络连接'
          break
      }

      return NextResponse.json(
        { success: false, message },
        { status: statusCode }
      )
    }

    return NextResponse.json(
      { success: false, message: '试穿失败，请重试' },
      { status: 500 }
    )
  }
}
