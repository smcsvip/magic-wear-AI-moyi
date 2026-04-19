// 这是页脚组件
// 显示在网站最底部，包含：品牌介绍、产品链接、联系方式、版权信息
// 'use client' 表示这是客户端组件

'use client'

import { useState } from 'react'

export function LandingFooter() {
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('180333@qq.com')
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      // 如果剪贴板 API 失败，使用备用方案
      const textArea = document.createElement('textarea')
      textArea.value = '180333@qq.com'
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err2) {
        console.error('复制失败:', err2)
        alert('复制失败，请手动复制：180333@qq.com')
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    // 深色背景的页脚
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        {/* 四列网格布局：品牌介绍占2列，产品链接1列，联系方式1列 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* 品牌介绍区（占2列） */}
          <div className="md:col-span-2">
            {/* 品牌名：渐变色文字 */}
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              魔衣 MagicWear
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              AI驱动的虚拟试衣工具，让购物更有信心。
              上传你的照片和服装图片，即刻预览试穿效果。
            </p>
            {/* 版权信息 */}
            <p className="text-gray-500 text-sm">
              © 2025 魔衣 MagicWear. All rights reserved.
            </p>
          </div>

          {/* 产品链接列 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">产品</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  功能介绍
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  使用教程
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  更新日志
                </a>
              </li>
            </ul>
          </div>

          {/* 联系方式列 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">联系我们</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  邮箱联系
                </button>
              </li>
              <li>
                <a href="/feedback" className="text-gray-400 hover:text-white transition-colors">
                  反馈建议
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  商务合作
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  社交媒体
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 底部分割线和版权文字 */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>AI虚拟试衣工具 - 让购物更简单</p>
        </div>
      </div>

      {/* 邮箱联系弹窗 */}
      {showEmailModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setShowEmailModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">联系邮箱</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 邮箱地址 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-center text-gray-900 font-mono text-lg">
                180333@qq.com
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyEmail}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors font-medium"
              >
                {copySuccess ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    已复制
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    复制邮箱
                  </>
                )}
              </button>
              <a
                href="mailto:180333@qq.com"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white rounded-lg transition-colors font-medium"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                发送邮件
              </a>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
