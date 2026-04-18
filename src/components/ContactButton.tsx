// 这是右下角的联系按钮组件
// 点击后弹出一个对话框，显示作者的微信二维码
// 'use client' 表示这是客户端组件，因为需要管理弹窗的开关状态

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, MessageCircle } from 'lucide-react'

export function ContactButton() {
  // isOpen：控制联系弹窗是否显示
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* 悬浮按钮：固定在页面左下角，圆形，渐变色 */}
      {/* fixed bottom-8 left-8 表示固定定位，距底部和左侧各 8 个单位 */}
      {/* z-50 确保按钮显示在其他内容上方 */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 w-14 h-14 rounded-full bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 shadow-lg shadow-pink-500/25 transition-all hover:shadow-xl hover:shadow-pink-500/30 z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* 弹窗：只有 isOpen 为 true 时才显示 */}
      {isOpen && (
        // 遮罩层：半透明黑色背景，覆盖整个屏幕
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          {/* 弹窗内容：白色卡片 */}
          <div className="relative bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl">
            {/* 关闭按钮：右上角的 X */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center space-y-6">
              <h3 className="text-xl font-bold text-gray-900">联系作者</h3>

              {/* 微信二维码图片 */}
              {/* 图片文件放在 public/wechat-qrcode.png */}
              <div className="flex justify-center">
                <div className="bg-gray-100 p-4 rounded-xl">
                  <img
                    src="/wechat-qrcode.png"
                    alt="微信二维码"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>

              <p className="text-gray-600 font-medium">
                AI领域交流加微信
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
