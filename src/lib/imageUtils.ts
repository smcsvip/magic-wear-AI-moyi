// 这个文件提供图片质量检测功能
// 在用户上传图片后，自动检查图片是否符合 AI 试穿的要求，并给出建议

import { ImageQuality } from '@/types'

// checkImageQuality：检测图片质量，返回评分、问题列表和建议
// 参数：用户上传的图片文件
// 返回：包含 score（分数）、issues（问题）、suggestions（建议）的对象
export async function checkImageQuality(file: File): Promise<ImageQuality> {
  // 用 Promise 包装，因为图片加载是异步的（需要等待）
  return new Promise((resolve) => {
    const img = new Image()
    // createObjectURL 把文件转成一个临时的本地 URL，让浏览器能加载它
    const url = URL.createObjectURL(file)

    // 图片加载成功后执行检测
    img.onload = () => {
      const { width, height } = img
      const issues: string[] = []       // 存放发现的问题
      const suggestions: string[] = [] // 存放优化建议
      let score = 100                   // 初始满分 100 分，发现问题就扣分

      // 检查分辨率是否太低（太低会导致 AI 生成效果差）
      if (width < 512 || height < 512) {
        issues.push('图片分辨率过低')
        suggestions.push('建议使用分辨率至少为512x512的图片')
        score -= 30 // 扣 30 分
      }

      // 检查分辨率是否太高（太高会导致上传慢、处理慢）
      if (width > 4096 || height > 4096) {
        issues.push('图片分辨率过高')
        suggestions.push('建议使用分辨率不超过4096x4096的图片')
        score -= 10 // 扣 10 分
      }

      // 检查文件大小是否太小（太小说明图片质量差）
      // 5 * 1024 = 5120 字节 = 5KB
      if (file.size < 5 * 1024) {
        issues.push('图片文件过小')
        suggestions.push('建议使用文件大小至少为5KB的图片')
        score -= 20 // 扣 20 分
      }

      // 检查文件大小是否太大（太大会导致上传慢）
      // 5 * 1024 * 1024 = 5MB
      if (file.size > 5 * 1024 * 1024) {
        issues.push('图片文件过大')
        suggestions.push('建议使用文件大小不超过5MB的图片')
        score -= 20 // 扣 20 分
      }

      // 检查图片比例是否合适（太宽或太窄的图片效果不好）
      const aspectRatio = width / height
      if (aspectRatio < 0.5 || aspectRatio > 2) {
        issues.push('图片比例不合适')
        suggestions.push('建议使用比例在1:2到2:1之间的图片')
        score -= 15 // 扣 15 分
      }

      // 确保分数不会低于 0
      if (score < 0) score = 0

      // 用完临时 URL 后要释放，避免内存泄漏
      URL.revokeObjectURL(url)

      // 返回检测结果
      resolve({
        score,
        issues,
        suggestions
      })
    }

    // 图片加载失败时的处理
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        score: 0,
        issues: ['图片加载失败'],
        suggestions: ['请检查图片格式是否正确']
      })
    }

    // 开始加载图片
    img.src = url
  })
}

// formatFileSize：把字节数转换成人类可读的格式
// 例如：1024 → "1 KB"，1048576 → "1 MB"
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// getImageDimensions：获取图片的宽高尺寸
// 参数：图片文件
// 返回：包含 width（宽）和 height（高）的对象
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
