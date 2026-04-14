import { env, validateEnv } from '@/lib/env'
import {
  DoubaoRequest,
  DoubaoResponse,
  DoubaoErrorResponse,
  DoubaoErrorCode,
  DoubaoServiceError
} from './types'

const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[${new Date().toISOString()}] [INFO] ${message}`, ...args)
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, ...args)
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, ...args)
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${new Date().toISOString()}] [DEBUG] ${message}`, ...args)
    }
  }
}

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString('base64')
  const mimeType = file.type || 'image/jpeg'
  return `data:${mimeType};base64,${base64}`
}

export async function callDoubaoAPI(
  personImage: File,
  clothesImage: File
): Promise<string> {
  logger.info('豆包API调用开始')

  if (!validateEnv()) {
    throw new DoubaoServiceError(
      DoubaoErrorCode.UNKNOWN,
      'API Key未配置，请检查.env.local文件'
    )
  }

  try {
    logger.info('开始转换图片为Base64')
    const [personBase64, clothesBase64] = await Promise.all([
      fileToBase64(personImage),
      fileToBase64(clothesImage)
    ])
    logger.info('图片转换完成')

    const request: DoubaoRequest = {
      model: env.MODEL,
      prompt: '将图1的服装换为图2的服装',
      image: [personBase64, clothesBase64],
      sequential_image_generation: 'disabled',
      response_format: 'url',
      size: '2K',
      stream: false,
      watermark: true
    }

    logger.info('发送请求到豆包API', {
      model: request.model,
      imageSize: request.size
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 60000)

    const response = await fetch(env.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.DOUBAO_API_KEY}`
      },
      body: JSON.stringify(request),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    logger.info('收到响应', {
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as DoubaoErrorResponse

      if (response.status === 401) {
        logger.error('认证失败', errorData)
        throw new DoubaoServiceError(
          DoubaoErrorCode.UNAUTHORIZED,
          'API认证失败，请检查API Key是否正确',
          errorData
        )
      }

      if (response.status === 429) {
        logger.error('请求频率超限', errorData)
        throw new DoubaoServiceError(
          DoubaoErrorCode.RATE_LIMIT,
          '请求过于频繁，请稍后再试',
          errorData
        )
      }

      if (response.status === 404) {
        logger.error('资源不存在', errorData)
        throw new DoubaoServiceError(
          DoubaoErrorCode.UNKNOWN,
          'API资源不存在',
          errorData
        )
      }

      logger.error('未知错误', errorData)
      throw new DoubaoServiceError(
        DoubaoErrorCode.UNKNOWN,
        `API调用失败: ${response.status} ${response.statusText}`,
        errorData
      )
    }

    const data = await response.json() as DoubaoResponse
    logger.info('API调用成功', {
      model: data.model,
      generatedImages: data.usage.generated_images,
      outputTokens: data.usage.output_tokens
    })

    if (!data.data || data.data.length === 0) {
      throw new DoubaoServiceError(
        DoubaoErrorCode.UNKNOWN,
        'API返回数据格式错误'
      )
    }

    const imageUrl = data.data[0].url
    logger.info('获取到图片URL', { url: imageUrl })

    return imageUrl
  } catch (error) {
    if (error instanceof DoubaoServiceError) {
      throw error
    }

    if (error instanceof Error && error.name === 'AbortError') {
      logger.error('请求超时')
      throw new DoubaoServiceError(
        DoubaoErrorCode.TIMEOUT,
        '请求超时，请重试',
        error
      )
    }

    logger.error('网络错误', error)
    throw new DoubaoServiceError(
      DoubaoErrorCode.NETWORK_ERROR,
      '网络请求失败，请检查网络连接',
      error
    )
  }
}
