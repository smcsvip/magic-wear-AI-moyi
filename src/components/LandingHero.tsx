// 这是首页的英雄区组件（Hero Section）
// "英雄区"是网站首屏最显眼的部分，包含大标题、副标题和行动按钮
// 'use client' 表示这是客户端组件，因为需要处理按钮点击事件

'use client'

import { Button } from '@/components/ui/button'
import { Sparkles, Wand2 } from 'lucide-react'

export function LandingHero() {
  // handleStartTrial：点击"立即体验"按钮，平滑滚动到试穿功能区
  const handleStartTrial = () => {
    // getElementById 找到 id="try-section" 的元素（在 page.tsx 里定义的）
    // scrollIntoView 让页面滚动到那个元素，behavior: 'smooth' 是平滑滚动效果
    document.getElementById('try-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    // 英雄区：上下留白，overflow-hidden 防止背景渐变溢出
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* 背景渐变：从粉色到白色到紫色 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-violet-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* 顶部标签：粉色圆角标签，显示"全新上线" */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium mb-8">
            <Wand2 className="h-4 w-4" />
            <span>全新上线</span>
          </div>

          {/* 主标题：大字体，渐变色文字 */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6">
            一键试穿
            <br />
            {/* bg-clip-text 让渐变色只应用在文字上 */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-violet-600">
              所见即所得
            </span>
          </h1>

          {/* 副标题：描述产品功能 */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI驱动的虚拟试衣工具，上传你的照片和服装图片，
            <br className="hidden md:block" />
            即刻预览试穿效果，让购物更有信心。
          </p>

          {/* 按钮组：主按钮（立即体验）+ 次按钮（了解更多） */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* 主按钮：渐变色背景，点击滚动到试穿区 */}
            <Button
              size="lg"
              onClick={handleStartTrial}
              className="px-10 py-7 text-lg bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white shadow-lg shadow-pink-500/25 transition-all hover:shadow-xl hover:shadow-pink-500/30"
            >
              <Sparkles className="mr-3 h-6 w-6" />
              立即体验
            </Button>

            {/* 次按钮：白色背景，边框样式 */}
            <Button
              size="lg"
              variant="secondary"
              className="px-10 py-7 text-lg bg-white text-gray-900 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
            >
              了解更多
            </Button>
          </div>

          {/* 底部特性标签：三个绿点 + 文字，展示产品优势 */}
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>免费使用</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>无需登录</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>AI驱动</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
