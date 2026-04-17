// 这个文件负责调用豆包（字节跳动）AI 图像生成接口
// 主要功能：把两张图片（人物 + 服装）发送给 AI，获取试穿结果图片的 URL

import { env, validateEnv } from '@/lib/env'
import {
  DoubaoRequest,
  DoubaoResponse,
  DoubaoErrorResponse,
  DoubaoErrorCode,
  DoubaoServiceError
} from './types'

// logger：日志工具，用于在控制台打印带时间戳的日志
// 这样在排查问题时，可以看到每一步的执行情况
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
  // debug 日志只在开发环境下打印，生产环境不打印（避免日志太多）
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${new Date().toISOString()}] [DEBUG] ${message}`, ...args)
    }
  }
}

// fileToBase64：把图片文件转换成 Base64 字符串
// Base64 是一种把二进制数据（图片）编码成文本的方式，方便通过 JSON 传输
// 返回格式：data:image/jpeg;base64,/9j/4AAQSkZJRgAB...
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()  // 读取文件的二进制数据
  const buffer = Buffer.from(arrayBuffer)        // 转成 Node.js 的 Buffer 对象
  const base64 = buffer.toString('base64')       // 编码成 Base64 字符串
  const mimeType = file.type || 'image/jpeg'     // 获取图片类型（如 image/png）
  // 拼接成完整的 Data URL 格式
  return `data:${mimeType};base64,${base64}`
}

// callDoubaoAPI：调用豆包 AI 接口，返回试穿结果图片的 URL
// 参数：人物照片文件、服装图片文件
// 返回：AI 生成的试穿结果图片 URL
export async function callDoubaoAPI(
  personImage: File,
  clothesImage: File
): Promise<string> {
  logger.info('豆包API调用开始')

  // 检查 API Key 是否已配置
  if (!validateEnv()) {
    throw new DoubaoServiceError(
      DoubaoErrorCode.UNKNOWN,
      'API Key未配置，请检查.env.local文件'
    )
  }

  try {
    logger.info('开始转换图片为Base64')
    // Promise.all 同时转换两张图片，比一张一张转更快
    const [personBase64, clothesBase64] = await Promise.all([
      fileToBase64(personImage),
      fileToBase64(clothesImage)
    ])
    logger.info('图片转换完成')

    // 构建请求数据
    const request: DoubaoRequest = {
      model: env.MODEL,
      prompt: '将图1的服装换为图2的服装', // 告诉 AI 要做什么
      image: [personBase64, clothesBase64], // 第一张是人物，第二张是服装
      sequential_image_generation: 'disabled',
      response_format: 'url',  // 让 AI 返回图片链接而不是 Base64
      size: '2K',               // 生成 2K 分辨率的图片
      stream: false,            // 不使用流式返回
      watermark: true           // 添加水印
    }

    logger.info('发送请求到豆包API', {
      model: request.model,
      imageSize: request.size
    })

    // 设置 60 秒超时：如果 AI 60 秒内没有响应，就取消请求
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort() // 取消请求
    }, 60000) // 60000 毫秒 = 60 秒

    // 发送 HTTP 请求到豆包 API
    const response = await fetch(env.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.DOUBAO_API_KEY}` // API Key 放在请求头里
      },
      body: JSON.stringify(request), // 把请求数据转成 JSON 字符串
      signal: controller.signal      // 关联超时控制器
    })

    clearTimeout(timeoutId) // 请求成功，取消超时计时器

    logger.info('收到响应', {
      status: response.status,
      statusText: response.statusText
    })

    // 处理 HTTP 错误响应
    if (!response.ok) {
      // 尝试读取错误详情，如果读取失败就用空对象
      const errorData = await response.json().catch(() => ({})) as DoubaoErrorResponse

      // 根据 HTTP 状态码判断错误类型
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

    // 解析成功响应
    const data = await response.json() as DoubaoResponse
    logger.info('API调用成功', {
      model: data.model,
      generatedImages: data.usage.generated_images,
      outputTokens: data.usage.output_tokens
    })

    // 检查返回的图片数据是否存在
    if (!data.data || data.data.length === 0) {
      throw new DoubaoServiceError(
        DoubaoErrorCode.UNKNOWN,
        'API返回数据格式错误'
      )
    }

    // 取第一张生成的图片 URL
    const imageUrl = data.data[0].url
    logger.info('获取到图片URL', { url: imageUrl })

    return imageUrl
  } catch (error) {
    // 如果已经是我们自定义的错误，直接抛出
    if (error instanceof DoubaoServiceError) {
      throw error
    }

    // 处理超时错误（AbortError 是 AbortController 取消请求时抛出的）
    if (error instanceof Error && error.name === 'AbortError') {
      logger.error('请求超时')
      throw new DoubaoServiceError(
        DoubaoErrorCode.TIMEOUT,
        '请求超时，请重试',
        error
      )
    }

    // 其他网络错误
    logger.error('网络错误', error)
    throw new DoubaoServiceError(
      DoubaoErrorCode.NETWORK_ERROR,
      '网络请求失败，请检查网络连接',
      error
    )
  }
}
