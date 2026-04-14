import { ImageQuality } from '@/types'

export async function checkImageQuality(file: File): Promise<ImageQuality> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const { width, height } = img
      const issues: string[] = []
      const suggestions: string[] = []
      let score = 100

      if (width < 512 || height < 512) {
        issues.push('图片分辨率过低')
        suggestions.push('建议使用分辨率至少为512x512的图片')
        score -= 30
      }

      if (width > 4096 || height > 4096) {
        issues.push('图片分辨率过高')
        suggestions.push('建议使用分辨率不超过4096x4096的图片')
        score -= 10
      }

      if (file.size < 5 * 1024) {
        issues.push('图片文件过小')
        suggestions.push('建议使用文件大小至少为5KB的图片')
        score -= 20
      }

      if (file.size > 5 * 1024 * 1024) {
        issues.push('图片文件过大')
        suggestions.push('建议使用文件大小不超过5MB的图片')
        score -= 20
      }

      const aspectRatio = width / height
      if (aspectRatio < 0.5 || aspectRatio > 2) {
        issues.push('图片比例不合适')
        suggestions.push('建议使用比例在1:2到2:1之间的图片')
        score -= 15
      }

      if (score < 0) score = 0

      URL.revokeObjectURL(url)

      resolve({
        score,
        issues,
        suggestions
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        score: 0,
        issues: ['图片加载失败'],
        suggestions: ['请检查图片格式是否正确']
      })
    }

    img.src = url
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

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
