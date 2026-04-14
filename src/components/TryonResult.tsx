'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, RefreshCw } from 'lucide-react'

interface TryonResultProps {
  imageUrl: string | null
  isLoading: boolean
  onRetry: () => void
}

export function TryonResult({ imageUrl, isLoading, onRetry }: TryonResultProps) {
  const handleDownload = () => {
    if (!imageUrl) return

    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `tryon-result-${Date.now()}.jpg`
    link.click()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>试穿结果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            <p className="text-sm text-gray-600">正在生成试穿效果...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!imageUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>试穿结果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p>上传图片后点击"开始试穿"查看结果</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>试穿结果</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <img
            src={imageUrl}
            alt="试穿结果"
            className="w-full h-auto rounded-lg"
          />

          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              下载结果
            </Button>
            <Button onClick={onRetry} variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              重新试穿
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
