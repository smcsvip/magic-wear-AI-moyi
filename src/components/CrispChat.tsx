// Crisp 在线客服组件
// 这个组件会在页面加载时自动加载 Crisp 聊天窗口
// 用户可以点击右下角的聊天图标与客服沟通

'use client'

import { useEffect } from 'react'

export default function CrispChat() {
  useEffect(() => {
    // 从环境变量获取 Crisp Website ID
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID
    if (!websiteId) return

    // 设置 Crisp 的 Website ID
    ;(window as any).$crisp = []
    ;(window as any).CRISP_WEBSITE_ID = websiteId

    // 加载 Crisp 的脚本
    const script = document.createElement('script')
    script.src = 'https://client.crisp.chat/l.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // 清理：组件卸载时移除脚本
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return null  // 这个组件不渲染任何东西，只负责加载 Crisp 脚本
}
