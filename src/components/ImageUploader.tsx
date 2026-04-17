// 这是图片上传组件
// 支持两种上传方式：拖拽图片到区域 或 点击选择文件
// 上传后会自动检测图片质量，给出评分和建议
// 'use client' 表示这是客户端组件，因为需要处理用户交互

'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload } from 'lucide-react'
import { checkImageQuality } from '@/lib/imageUtils'
import { ImageQuality } from '@/types'

// 定义组件接收的参数（Props）类型
interface ImageUploaderProps {
  title: string                                          // 卡片标题，比如"上传人物照片"
  description: string                                    // 卡片描述，比如"请上传一张清晰的正面全身照"
  onImageSelect: (file: File, preview: string) => void  // 图片选择后的回调函数
  currentPreview: string | null                          // 当前已选图片的预览 URL
}

export function ImageUploader({ title, description, onImageSelect, currentPreview }: ImageUploaderProps) {
  // quality：图片质量检测结果（评分、问题、建议）
  const [quality, setQuality] = useState<ImageQuality | null>(null)
  // isDragging：用户是否正在拖拽文件到上传区域（用于改变样式）
  const [isDragging, setIsDragging] = useState(false)
  // fileInputRef：指向隐藏的 <input type="file"> 元素，用于触发文件选择对话框
  const fileInputRef = useRef<HTMLInputElement>(null)

  // handleFile：处理选中的图片文件（拖拽和点击都会调用这个函数）
  const handleFile = useCallback(async (file: File) => {
    // 检查是否是图片文件
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 检测图片质量，更新质量状态
    const qualityResult = await checkImageQuality(file)
    setQuality(qualityResult)

    // 创建图片预览 URL（临时的本地 URL，用于在页面上显示图片）
    const preview = URL.createObjectURL(file)
    // 调用父组件传来的回调，把文件和预览 URL 传出去
    onImageSelect(file, preview)
  }, [onImageSelect])

  // handleFileChange：input 元素的 onChange 事件处理（点击选择文件时触发）
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] // 取第一个选中的文件
    if (!file) return
    await handleFile(file)
  }

  // handleDragOver：鼠标拖着文件悬停在上传区域时触发
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()       // 阻止浏览器默认行为（否则会打开文件）
    setIsDragging(true)      // 标记正在拖拽，改变上传区域样式
  }, [])

  // handleDragLeave：鼠标拖着文件离开上传区域时触发
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)     // 取消拖拽状态
  }, [])

  // handleDrop：松开鼠标，把文件放到上传区域时触发
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    // 从拖拽事件里获取文件
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await handleFile(file)
  }, [handleFile])

  // handleClick：点击上传区域时，触发隐藏的 input 元素，打开文件选择对话框
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
          {/* 根据是否已有图片，显示上传区域或图片预览 */}
          {!currentPreview ? (
            // 还没有图片：显示拖拽上传区域
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-gray-400 bg-gray-50'           // 拖拽中：深色边框
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50' // 默认：浅色边框
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              {/* 隐藏的文件输入框，只接受图片格式 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center space-y-3">
                {/* 上传图标 */}
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
            // 已有图片：显示预览，点击可以更换
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
                    className="w-full h-full object-contain"
                  />
                  {/* 悬停时显示"更换图片"提示 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button variant="secondary" size="sm">
                      更换图片
                    </Button>
                  </div>
                </div>
              </div>
              {/* 隐藏的文件输入框（更换图片用） */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* 图片质量检测结果：只有检测完成后才显示 */}
          {quality && (
            <div className="space-y-2">
              {/* 质量评分：根据分数显示不同颜色（绿/黄/红） */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">图片质量评分</span>
                <span className={`text-sm font-bold ${quality.score >= 70 ? 'text-green-600' : quality.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {quality.score}/100
                </span>
              </div>

              {/* 问题列表：只有发现问题时才显示 */}
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

              {/* 优化建议：只有有建议时才显示 */}
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
