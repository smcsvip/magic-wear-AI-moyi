'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ImageUploader } from '@/components/ImageUploader'
import { LandingHero } from '@/components/LandingHero'
import { LandingFeatures } from '@/components/LandingFeatures'
import { LandingFooter } from '@/components/LandingFooter'
import { ContactButton } from '@/components/ContactButton'
import { TryonState, TryonHistoryItem } from '@/types'
import { Sparkles, Trash2, History, Maximize2, Loader2, Download } from 'lucide-react'

export default function Home() {
  const [state, setState] = useState<TryonState>({
    personImage: null,
    clothesImage: null,
    personImagePreview: null,
    clothesImagePreview: null,
    resultImage: null,
    isLoading: false,
    error: null
  })

  const [history, setHistory] = useState<TryonHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)

  const handlePersonImageSelect = (file: File, preview: string) => {
    setState(prev => ({
      ...prev,
      personImage: file,
      personImagePreview: preview,
      resultImage: null
    }))
  }

  const handleClothesImageSelect = (file: File, preview: string) => {
    setState(prev => ({
      ...prev,
      clothesImage: file,
      clothesImagePreview: preview,
      resultImage: null
    }))
  }

  const handleTryon = async () => {
    if (!state.personImage || !state.clothesImage) {
      alert('请上传人物照片和服装图片')
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const formData = new FormData()
      formData.append('personImage', state.personImage)
      formData.append('clothesImage', state.clothesImage)

      const response = await fetch('/api/tryon', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        const newResult: TryonHistoryItem = {
          id: Date.now().toString(),
          personImagePreview: state.personImagePreview!,
          clothesImagePreview: state.clothesImagePreview!,
          resultImage: data.imageUrl,
          timestamp: new Date()
        }

        setState(prev => ({
          ...prev,
          resultImage: data.imageUrl,
          isLoading: false
        }))

        setHistory(prev => [newResult, ...prev.slice(0, 9)])
      } else {
        setState(prev => ({
          ...prev,
          error: data.message || '试穿失败',
          isLoading: false
        }))
      }
    } catch (error) {
      console.error('Tryon error:', error)
      setState(prev => ({
        ...prev,
        error: '试穿失败，请重试',
        isLoading: false
      }))
    }
  }

  const handleRetry = () => {
    setState(prev => ({
      ...prev,
      resultImage: null,
      error: null
    }))
  }

  const handleClear = () => {
    setState({
      personImage: null,
      clothesImage: null,
      personImagePreview: null,
      clothesImagePreview: null,
      resultImage: null,
      isLoading: false,
      error: null
    })
  }

  const handleHistoryClick = (item: TryonHistoryItem) => {
    setState(prev => ({
      ...prev,
      personImagePreview: item.personImagePreview,
      clothesImagePreview: item.clothesImagePreview,
      resultImage: item.resultImage,
      error: null
    }))
    setShowHistory(false)
  }

  const handleDownload = async () => {
    if (!state.resultImage) return
    
    try {
      const a = document.createElement('a')
      a.href = state.resultImage
      a.download = `魔衣试穿-${Date.now()}.jpg`
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
      alert('下载失败，请重试')
    }
  }

  return (
    <div className="min-h-screen">
      <LandingHero />
      
      <section id="try-section" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              开始体验
            </h2>
            <p className="text-xl text-gray-600">
              上传你的照片和服装图片，即刻预览试穿效果
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-gray-600 hover:text-gray-900"
            >
              <History className="mr-2 h-4 w-4" />
              历史记录
              {history.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {history.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-gray-600 hover:text-gray-900"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              清空
            </Button>
          </div>

          {showHistory && history.length > 0 && (
            <div className="mb-8">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">历史记录</CardTitle>
                  <CardDescription>点击可以快速重新试穿</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="cursor-pointer group"
                        onClick={() => handleHistoryClick(item)}
                      >
                        <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-gray-100">
                          <img
                            src={item.resultImage}
                            alt="历史记录"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {item.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <ImageUploader
              title="上传人物照片"
              description="请上传一张清晰的正面全身照"
              onImageSelect={handlePersonImageSelect}
              currentPreview={state.personImagePreview}
            />

            <ImageUploader
              title="上传服装图片"
              description="请上传服装平铺图或模特图"
              onImageSelect={handleClothesImageSelect}
              currentPreview={state.clothesImagePreview}
            />

            <div>
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">试穿结果</CardTitle>
                  <CardDescription>AI生成的试穿效果图</CardDescription>
                </CardHeader>
                <CardContent>
                  {state.isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[300px] sm:h-[400px] bg-gray-50 rounded-xl">
                      <div className="space-y-4 w-full max-w-xs">
                        <div className="space-y-3">
                          <div className="h-24 sm:h-32 bg-gray-200 rounded-xl animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-gray-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">AI处理中...</span>
                        </div>
                      </div>
                    </div>
                  ) : state.resultImage ? (
                    <div className="relative space-y-4">
                      <div className="relative w-full flex justify-center">
                        <div 
                          className="relative bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
                          style={{ width: '169px', height: '300px' }}
                          onClick={() => setEnlargedImage(state.resultImage)}
                        >
                          <img
                            src={state.resultImage}
                            alt="试穿结果"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button variant="secondary" size="sm" className="bg-white/90">
                              <Maximize2 className="mr-2 h-4 w-4" />
                              放大查看
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleDownload}
                          className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          下载图片
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] sm:h-[400px] text-gray-400 bg-gray-50 rounded-xl">
                      <div className="text-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                        </div>
                        <p className="text-sm">上传图片后点击开始试穿</p>
                        <p className="text-xs text-gray-500 mt-1">查看试穿结果</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center mb-8">
            <Button
              onClick={handleTryon}
              disabled={!state.personImage || !state.clothesImage || state.isLoading}
              size="lg"
              className="px-12 py-6 text-lg bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white shadow-lg shadow-pink-500/25 transition-all hover:shadow-xl hover:shadow-pink-500/30"
            >
              {state.isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  生成中...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  开始试穿
                </div>
              )}
            </Button>
          </div>

          {state.error && (
            <div className="mb-8 max-w-2xl mx-auto">
              <Alert variant="destructive" className="border-none bg-red-50">
                <AlertDescription>
                  <p>{state.error}</p>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </section>
      
      <LandingFeatures />
      <LandingFooter />
      <ContactButton />

      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={enlargedImage}
              alt="放大预览"
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
              onClick={() => setEnlargedImage(null)}
            >
              关闭
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
