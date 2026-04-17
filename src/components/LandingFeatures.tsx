// 这是功能介绍区组件
// 展示产品的四个核心功能，以卡片网格形式排列
// 'use client' 表示这是客户端组件

'use client'

import { Upload, Scan, History, Smartphone, Download } from 'lucide-react'

// 定义单个功能卡片的数据类型
interface Feature {
  icon: any        // 图标组件
  title: string    // 功能标题
  description: string // 功能描述
}

// features：四个功能的数据，用数组存储，方便统一渲染
const features: Feature[] = [
  {
    icon: Upload,
    title: '拖拽上传',
    description: '支持拖拽和点击两种上传方式，轻松上传你的照片和服装图片，操作简单直观。'
  },
  {
    icon: Scan,
    title: '图片质量检测',
    description: '自动检测图片质量，给出专业的优化建议，确保生成效果最佳。'
  },
  {
    icon: History,
    title: '历史记录',
    description: '自动保存试穿历史，随时查看和重新生成，方便对比不同效果。'
  },
  {
    icon: Smartphone,
    title: '移动端适配',
    description: '完美支持手机端使用，随时随地体验虚拟试穿，购物更加便捷。'
  }
]

export function LandingFeatures() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* 标题区域 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            强大功能，简单易用
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            我们专注于用户体验，每个功能都精心设计
          </p>
        </div>

        {/* 功能卡片网格：手机1列，平板2列，桌面4列 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 遍历 features 数组，为每个功能渲染一张卡片 */}
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-3xl bg-gradient-to-br from-pink-50 to-violet-50 border-2 border-transparent hover:border-pink-200 hover:shadow-xl transition-all duration-300"
            >
              {/* 功能图标：渐变色圆角方块，悬停时放大 */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {/* feature.icon 是一个 React 组件，这里动态渲染它 */}
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              {/* 功能标题 */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              {/* 功能描述 */}
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
