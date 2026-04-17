// 这个文件定义了调用豆包 AI 接口所需的所有数据类型
// TypeScript 的接口（interface）就像一个"模板"，规定了数据必须有哪些字段

// DoubaoRequest：发送给豆包 API 的请求数据格式
export interface DoubaoRequest {
  model: string                       // 使用的 AI 模型名称
  prompt: string                      // 给 AI 的指令，比如"将图1的服装换为图2的服装"
  image: string[]                     // 图片数组（Base64 格式），第一张是人物，第二张是服装
  sequential_image_generation: string // 是否顺序生成图片
  response_format: string             // 返回格式，'url' 表示返回图片链接
  size: string                        // 生成图片的尺寸，比如 '2K'
  stream: boolean                     // 是否流式返回（false 表示等全部生成完再返回）
  watermark: boolean                  // 是否添加水印
}

// DoubaoResponse：豆包 API 返回的响应数据格式
export interface DoubaoResponse {
  model: string                       // 使用的模型名称
  created: number                     // 创建时间（Unix 时间戳）
  data: DoubaoImageData[]             // 生成的图片数组
  usage: {
    generated_images: number          // 生成了几张图片
    output_tokens: number             // 消耗的输出 token 数量
    total_tokens: number              // 消耗的总 token 数量
  }
}

// DoubaoImageData：单张生成图片的数据
export interface DoubaoImageData {
  url: string   // 图片的访问链接
  size: string  // 图片尺寸
}

// DoubaoError：API 返回的错误信息格式
export interface DoubaoError {
  code: string    // 错误代码
  message: string // 错误描述
  param: string   // 出错的参数
  type: string    // 错误类型
}

// DoubaoErrorResponse：API 返回错误时的完整响应格式
export interface DoubaoErrorResponse {
  error: DoubaoError
}

// DoubaoErrorCode：错误代码的枚举（enum）
// 枚举就像一个"选项列表"，限定了错误代码只能是这几种值
export enum DoubaoErrorCode {
  UNAUTHORIZED = 'AuthenticationError',  // 认证失败（API Key 错误）
  RATE_LIMIT = 'RateLimitError',         // 请求频率超限
  TIMEOUT = 'TimeoutError',              // 请求超时
  NETWORK_ERROR = 'NetworkError',        // 网络错误
  UNKNOWN = 'UnknownError'               // 未知错误
}

// DoubaoServiceError：自定义错误类
// 继承自 JavaScript 内置的 Error 类，额外添加了错误代码和原始错误信息
// 这样在捕获错误时，可以根据 code 来判断是什么类型的错误
export class DoubaoServiceError extends Error {
  code: DoubaoErrorCode  // 错误代码（来自上面的枚举）
  originalError?: any    // 原始错误对象（可选）

  constructor(code: DoubaoErrorCode, message: string, originalError?: any) {
    super(message)                    // 调用父类 Error 的构造函数
    this.code = code
    this.originalError = originalError
    this.name = 'DoubaoServiceError'  // 设置错误名称，方便调试
  }
}
