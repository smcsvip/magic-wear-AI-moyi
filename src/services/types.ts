export interface DoubaoRequest {
  model: string
  prompt: string
  image: string[]
  sequential_image_generation: string
  response_format: string
  size: string
  stream: boolean
  watermark: boolean
}

export interface DoubaoResponse {
  model: string
  created: number
  data: DoubaoImageData[]
  usage: {
    generated_images: number
    output_tokens: number
    total_tokens: number
  }
}

export interface DoubaoImageData {
  url: string
  size: string
}

export interface DoubaoError {
  code: string
  message: string
  param: string
  type: string
}

export interface DoubaoErrorResponse {
  error: DoubaoError
}

export enum DoubaoErrorCode {
  UNAUTHORIZED = 'AuthenticationError',
  RATE_LIMIT = 'RateLimitError',
  TIMEOUT = 'TimeoutError',
  NETWORK_ERROR = 'NetworkError',
  UNKNOWN = 'UnknownError'
}

export class DoubaoServiceError extends Error {
  code: DoubaoErrorCode
  originalError?: any

  constructor(code: DoubaoErrorCode, message: string, originalError?: any) {
    super(message)
    this.code = code
    this.originalError = originalError
    this.name = 'DoubaoServiceError'
  }
}
