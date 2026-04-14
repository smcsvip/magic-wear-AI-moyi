'use client'

import { Upload, Scan, History, Smartphone, Download } from 'lucide-react'

interface Feature {
  icon: any
  title: string
  description: string
}

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
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            强大功能，简单易用
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            我们专注于用户体验，每个功能都精心设计
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-3xl bg-gradient-to-br from-pink-50 to-violet-50 border-2 border-transparent hover:border-pink-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
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
