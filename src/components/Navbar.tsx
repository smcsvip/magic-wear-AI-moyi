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
