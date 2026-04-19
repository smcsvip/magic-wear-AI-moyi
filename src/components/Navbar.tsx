// 这是导航栏组件
// 显示在页面右上角，根据登录状态显示不同内容：
// - 已登录：显示用户名（可点击进入个人主页）+ 退出按钮
// - 未登录：显示登录按钮 + 注册按钮
// 'use client' 表示这是客户端组件，因为需要在浏览器里检查登录状态

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, LogOut, UserCircle } from 'lucide-react'

// Discord 图标组件
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}

// 定义用户信息的类型（TypeScript 接口）
interface AuthUser {
  id: number
  username: string
}

export function Navbar() {
  const router = useRouter()

  // user：当前登录的用户信息，null 表示未登录
  const [user, setUser] = useState<AuthUser | null>(null)
  // loading：是否正在检查登录状态（检查完之前不显示导航栏，避免闪烁）
  const [loading, setLoading] = useState(true)

  // useEffect：组件加载后立即执行，检查登录状态
  // 空数组 [] 表示只在组件第一次加载时执行一次
  useEffect(() => {
    // 调用 /api/auth/me 接口，获取当前登录用户信息
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        setUser(data.user) // data.user 是用户信息，未登录时是 null
        setLoading(false)
      })
      .catch(() => setLoading(false)) // 请求失败也要结束加载状态
  }, [])

  // handleLogout：处理退出登录
  async function handleLogout() {
    // 调用退出登录接口，服务器会清除 Cookie
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)      // 清空本地的用户状态
    router.refresh()   // 刷新页面，让其他组件也更新状态
  }

  // 还在检查登录状态时，不渲染任何内容（避免页面闪烁）
  if (loading) return null

  return (
    // 固定在页面右上角，z-50 确保在其他内容上方
    <div className="fixed top-0 right-0 z-50 p-4 flex items-center gap-2">
      {/* Discord 社区入口 */}
      <a
        href="https://discord.gg/B9nxRtME"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#5865F2] bg-white border border-gray-200 hover:border-[#5865F2] rounded-lg px-3 py-1.5 shadow-sm transition-all"
        title="加入 Discord 社区"
      >
        <DiscordIcon className="h-4 w-4 transition-colors" />
        <span className="hidden sm:inline">社区</span>
      </a>

      {user ? (
        // 已登录：显示用户名和退出按钮
        <>
          {/* 用户名按钮：点击跳转到个人主页 */}
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm transition-colors"
          >
            <UserCircle className="h-4 w-4" />
            {user.username}
          </Link>
          {/* 退出按钮 */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm transition-colors"
          >
            <LogOut className="h-4 w-4" />
            退出
          </button>
        </>
      ) : (
        // 未登录：显示登录和注册按钮
        <>
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg px-4 py-1.5 shadow-sm transition-colors"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="text-sm text-white bg-gray-900 hover:bg-gray-700 rounded-lg px-4 py-1.5 shadow-sm transition-colors"
          >
            注册
          </Link>
        </>
      )}
    </div>
  )
}
