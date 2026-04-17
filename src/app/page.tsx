// 这是网站的首页（/ 路由）
// 'use client' 表示这是一个客户端组件，可以使用 React 的 useState、useEffect 等功能
// 首页包含：导航栏、英雄区（大标题）、试穿功能区、功能介绍、页脚、联系按钮

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ImageUploader } from '@/components/ImageUploader'
import { LandingHero } from '@/components/LandingHero'
import { LandingFeatures } from '@/components/LandingFeatures'
import { LandingFooter } from '@/components/LandingFooter'
import { ContactButton } from '@/components/ContactButton'
import { Navbar } from '@/components/Navbar'
import { TryonState } from '@/types'
import { Sparkles, Trash2, History, Maximize2, Loader2, Download } from 'lucide-react'

// 从数据库加载的历史记录类型（和个人中心一致）
interface DbHistoryItem {
  id: number
  resultImage: string
  createdAt: string // 数据库返回的是字符串格式的日期
}

// 当前登录用户的信息类型
interface AuthUser {
  id: number
  username: string
}

// getCookie：从浏览器 Cookie 里读取指定名称的值
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

// setCookie：向浏览器写入一个 Cookie，days 参数控制有效期（天数）
function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/`
}

export default function Home() {
  const router = useRouter()

  // state：管理整个试穿功能的状态
  // 包括：两张图片文件、两张图片的预览URL、结果图片URL、加载状态、错误信息
  const [state, setState] = useState<TryonState>({
    personImage: null,          // 人物照片文件
    clothesImage: null,         // 服装图片文件
    personImagePreview: null,   // 人物照片的预览 URL（用于在页面上显示）
    clothesImagePreview: null,  // 服装图片的预览 URL
    resultImage: null,          // AI 生成的试穿结果图片 URL
    isLoading: false,           // 是否正在生成中
    error: null                 // 错误信息
  })

  // showHistory：是否显示历史记录面板
  const [showHistory, setShowHistory] = useState(false)
  // enlargedImage：当前放大查看的图片 URL（null 表示没有放大）
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)

  // user：当前登录的用户信息（null 表示未登录或还在加载中）
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  // showLoginModal：是否显示"免费次数已用完，请登录"弹窗
  const [showLoginModal, setShowLoginModal] = useState(false)
  // dbHistory：从数据库加载的历史记录（已登录用户专用）
  const [dbHistory, setDbHistory] = useState<DbHistoryItem[]>([])
  // historyLoading：历史记录是否正在从数据库加载中
  const [historyLoading, setHistoryLoading] = useState(false)

  // 组件加载时检查登录状态，用于控制试穿次数限制和历史记录功能
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        setUser(data.user)
        setUserLoading(false)
      })
      .catch(() => setUserLoading(false))
  }, [])

  // handlePersonImageSelect：用户选择人物照片后的回调
  const handlePersonImageSelect = (file: File, preview: string) => {
    setState(prev => ({
      ...prev,              // 保留其他状态不变
      personImage: file,
      personImagePreview: preview,
      resultImage: null     // 换了图片就清空之前的结果
    }))
  }

  // handleClothesImageSelect：用户选择服装图片后的回调
  const handleClothesImageSelect = (file: File, preview: string) => {
    setState(prev => ({
      ...prev,
      clothesImage: file,
      clothesImagePreview: preview,
      resultImage: null
    }))
  }

  // handleTryon：点击"开始试穿"按钮后执行
  const handleTryon = async () => {
    // 检查两张图片是否都已上传
    if (!state.personImage || !state.clothesImage) {
      alert('请上传人物照片和服装图片')
      return
    }

    // 未登录用户：检查是否已用完免费次数（通过 Cookie 判断，有效期 7 天）
    // userLoading 为 true 时跳过检查，避免登录用户被误拦截
    if (!userLoading && !user) {
      if (getCookie('tryon_used')) {
        setShowLoginModal(true)
        return
      }
    }

    // 开始加载，清空之前的错误
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // 用 FormData 打包两张图片，发送给后端 API
      const formData = new FormData()
      formData.append('personImage', state.personImage)
      formData.append('clothesImage', state.clothesImage)

      // 发送请求到试穿 API
      const response = await fetch('/api/tryon', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        // 更新状态：显示结果图片
        setState(prev => ({
          ...prev,
          resultImage: data.imageUrl,
          isLoading: false
        }))

        // 未登录用户试穿成功后，写入 Cookie 记录已使用免费次数（7 天有效）
        if (!user) {
          setCookie('tryon_used', '1', 7)
        }
      } else {
        // 试穿失败：显示错误信息
        setState(prev => ({
          ...prev,
          error: data.message || '试穿失败',
          isLoading: false
        }))
      }
    } catch (error) {
      // 网络错误等异常情况
      console.error('Tryon error:', error)
      setState(prev => ({
        ...prev,
        error: '试穿失败，请重试',
        isLoading: false
      }))
    }
  }

  // handleClear：清空所有内容，重新开始
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

  // handleDownload：下载试穿结果图片
  const handleDownload = async () => {
    if (!state.resultImage) return

    try {
      // 创建一个隐藏的 <a> 标签，模拟点击来触发下载
      const a = document.createElement('a')
      a.href = state.resultImage
      a.download = `魔衣试穿-${Date.now()}.jpg` // 下载的文件名
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
      alert('下载失败，请重试')
    }
  }

  // handleHistoryButtonClick：点击工具栏"历史记录"按钮
  // 未登录 → 跳转登录页；已登录 → 从数据库加载历史并展开面板
  const handleHistoryButtonClick = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    // 再次点击则收起面板
    if (showHistory) {
      setShowHistory(false)
      return
    }
    setHistoryLoading(true)
    setShowHistory(true)
    try {
      const res = await fetch('/api/tryon/history')
      const data = await res.json()
      setDbHistory(data.records)
    } catch {
      setDbHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  // handleDbHistoryItemClick：点击历史面板里的某张图片
  // 把该结果图片显示到试穿结果区（数据库记录没有人物/服装预览，只恢复结果图）
  const handleDbHistoryItemClick = (item: DbHistoryItem) => {
    setState(prev => ({ ...prev, resultImage: item.resultImage, error: null }))
    setShowHistory(false)
  }

  return (
    <div className="min-h-screen">
      {/* 导航栏：显示在右上角，包含登录/注册按钮或用户名 */}
      <Navbar />
      {/* 英雄区：大标题和"立即体验"按钮 */}
      <LandingHero />

      {/* 试穿功能区 */}
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

          {/* 工具栏：历史记录按钮和清空按钮 */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHistoryButtonClick}
              className="text-gray-600 hover:text-gray-900"
            >
              <History className="mr-2 h-4 w-4" />
              历史记录
              {/* 已登录且有历史记录时显示数量徽章 */}
              {dbHistory.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {dbHistory.length}
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

          {/* 历史记录面板：已登录用户点击"历史记录"按钮后展开，数据来自数据库 */}
          {showHistory && (
            <div className="mb-8">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">历史记录</CardTitle>
                  <CardDescription>点击图片可快速查看试穿结果</CardDescription>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    // 加载中状态
                    <div className="flex justify-center py-8 text-gray-400 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />加载中...
                    </div>
                  ) : dbHistory.length === 0 ? (
                    // 空状态
                    <div className="text-center py-8 text-gray-400 text-sm">暂无历史记录</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {dbHistory.map((item) => (
                        <div
                          key={item.id}
                          className="cursor-pointer group"
                          onClick={() => handleDbHistoryItemClick(item)}
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
                            {new Date(item.createdAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* 三列布局：人物照片上传 | 服装图片上传 | 试穿结果 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* 人物照片上传组件 */}
            <ImageUploader
              title="上传人物照片"
              description="请上传一张清晰的正面全身照"
              onImageSelect={handlePersonImageSelect}
              currentPreview={state.personImagePreview}
            />

            {/* 服装图片上传组件 */}
            <ImageUploader
              title="上传服装图片"
              description="请上传服装平铺图或模特图"
              onImageSelect={handleClothesImageSelect}
              currentPreview={state.clothesImagePreview}
            />

            {/* 试穿结果展示区 */}
            <div>
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">试穿结果</CardTitle>
                  <CardDescription>AI生成的试穿效果图</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* 根据状态显示不同内容：加载中 / 有结果 / 空状态 */}
                  {state.isLoading ? (
                    // 加载中：显示骨架屏动画
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
                    // 有结果：显示试穿结果图片和下载按钮
                    <div className="relative space-y-4">
                      <div className="relative w-full flex justify-center">
                        {/* 点击图片可以放大查看 */}
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
                          {/* 悬停时显示"放大查看"提示 */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button variant="secondary" size="sm" className="bg-white/90">
                              <Maximize2 className="mr-2 h-4 w-4" />
                              放大查看
                            </Button>
                          </div>
                        </div>
                      </div>
                      {/* 下载按钮 */}
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
                    // 空状态：还没有结果时显示提示
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

          {/* 开始试穿按钮：两张图片都上传后才能点击 */}
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

          {/* 错误提示：只有出错时才显示 */}
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

      {/* 功能介绍区 */}
      <LandingFeatures />
      {/* 页脚 */}
      <LandingFooter />
      {/* 右下角联系按钮（微信二维码） */}
      <ContactButton />

      {/* 图片放大查看的遮罩层：点击任意位置关闭 */}
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

      {/* 登录提示弹窗：未登录用户用完免费次数后弹出 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl text-center space-y-5">
            {/* 图标 */}
            <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-violet-100 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-7 w-7 text-pink-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">免费次数已用完</h3>
              <p className="text-sm text-gray-500">登录后即可无限次使用虚拟试穿</p>
            </div>
            {/* 去登录按钮 */}
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white"
            >
              去登录
            </Button>
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              暂不登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
