'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload } from 'lucide-react'
import { checkImageQuality } from '@/lib/imageUtils'
import { ImageQuality } from '@/types'

interface ImageUploaderProps {
  title: string
  description: string
  onImageSelect: (file: File, preview: string) => void
  currentPreview: string | null
}

export function ImageUploader({ title, description, onImageSelect, currentPreview }: ImageUploaderProps) {
  const [quality, setQuality] = useState<ImageQuality | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    const qualityResult = await checkImageQuality(file)
    setQuality(qualityResult)

    const preview = URL.createObjectURL(file)
    onImageSelect(file, preview)
  }, [onImageSelect])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await handleFile(file)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await handleFile(file)
  }, [handleFile])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!currentPreview ? (
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-3 rounded-full ${isDragging ? 'bg-gray-100' : 'bg-gray-100'}`}>
                  <Upload className={`h-8 w-8 ${isDragging ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {isDragging ? '松开鼠标上传图片' : '拖拽图片到此处'}
                  </p>
                  <p className="text-sm text-gray-500">
                    或者 <span className="text-gray-600 font-medium">点击选择文件</span>
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  支持 JPG、JPEG、PNG 格式
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="relative w-full flex justify-center">
                <div 
                  className="relative bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer group"
                  style={{ width: '169px', height: '300px' }}
                  onClick={handleClick}
                >
                  <img
                    src={currentPreview}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button variant="secondary" size="sm">
                      更换图片
                    </Button>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {quality && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">图片质量评分</span>
                <span className={`text-sm font-bold ${quality.score >= 70 ? 'text-green-600' : quality.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {quality.score}/100
                </span>
              </div>

              {quality.issues.length > 0 && (
                <Alert variant="destructive" className="border-none bg-red-50">
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium text-red-900">发现问题：</p>
                      <ul className="list-disc list-inside text-sm text-red-800">
                        {quality.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {quality.suggestions.length > 0 && (
                <Alert className="border-none bg-gray-50">
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">优化建议：</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {quality.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
