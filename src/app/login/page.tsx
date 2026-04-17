// 这是登录页面
// 用户访问 /login 时看到的就是这个页面
// 'use client' 表示这是一个客户端组件，可以使用 React 的 useState 等 Hook

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { normalizeUsername } from '@/lib/usernameUtils'

export default function LoginPage() {
  const router = useRouter() // 用于页面跳转

  // 用 useState 管理表单的各个字段和状态
  const [username, setUsername] = useState('') // 用户名输入框的值
  const [password, setPassword] = useState('') // 密码输入框的值
  const [error, setError] = useState('')        // 错误提示信息
  const [loading, setLoading] = useState(false) // 是否正在提交（防止重复点击）

  // handleSubmit：处理表单提交
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault() // 阻止表单默认的页面刷新行为
    setError('')        // 清空之前的错误信息

    // 前端基本验证（登录页不做严格格式校验，体验更宽松）
    if (!username.trim()) { setError('用户名不能为空'); return }
    if (!password) { setError('密码不能为空'); return }

    setLoading(true) // 开始加载，禁用按钮

    // 发送登录请求到后端 API
    // 注意：发送前先 normalize 用户名（转小写），和数据库存储保持一致
    // 这样用户输入 "ABC123" 也能匹配到数据库里的 "abc123" 账号
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: normalizeUsername(username), password }),
    })
    const data = await res.json() // 读取服务器返回的数据
    setLoading(false)              // 结束加载

    // 如果服务器返回错误（状态码不是 2xx），显示错误信息
    if (!res.ok) { setError(data.message); return }

    // 登录成功：跳转到首页
    router.push('/')
    router.refresh() // 刷新页面状态，让导航栏显示登录后的用户名
  }

  return (
    // 整个页面居中显示，灰色背景
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* 白色卡片容器 */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        {/* 左上角返回首页入口：不想登录的用户可以直接回去 */}
        <Link href="/" className="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors mb-6">
          ← 返回首页
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">登录</h1>
        <p className="text-sm text-gray-500 mb-6">欢迎回来</p>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用户名输入框 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)} // 用户每次输入都更新 state
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
              placeholder="请输入用户名"
            />
          </div>

          {/* 密码输入框 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">密码</label>
            <input
              type="password" // type="password" 会把输入显示成圆点
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
              placeholder="请输入密码"
            />
          </div>

          {/* 错误提示：只有 error 不为空时才显示 */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* 提交按钮：加载中时禁用，防止重复提交 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        {/* 跳转到注册页的链接 */}
        <p className="mt-5 text-center text-sm text-gray-500">
          没有账号？{' '}
          <Link href="/register" className="text-gray-900 font-medium hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  )
}
