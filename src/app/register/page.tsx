// 这是注册页面
// 用户访问 /register 时看到的就是这个页面
// 'use client' 表示这是一个客户端组件，可以使用 React 的 useState 等 Hook

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { validateUsername, normalizeUsername } from '@/lib/usernameUtils'

export default function RegisterPage() {
  const router = useRouter() // 用于页面跳转

  // 用 useState 管理表单的各个字段和状态
  const [username, setUsername] = useState('')       // 用户名输入框的值
  const [password, setPassword] = useState('')       // 密码输入框的值
  const [confirm, setConfirm] = useState('')         // 确认密码输入框的值
  const [usernameError, setUsernameError] = useState('') // 用户名实时校验错误提示
  const [error, setError] = useState('')             // 表单整体错误提示信息
  const [loading, setLoading] = useState(false)      // 是否正在提交（防止重复点击）

  // handleUsernameChange：用户名输入框的 onChange 事件
  // 每次用户输入都实时校验，给出即时反馈
  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setUsername(value)

    // 只有用户输入了内容才实时校验（避免一打开页面就报错）
    if (value) {
      const err = validateUsername(value)
      setUsernameError(err ?? '') // null 转成空字符串
      if (!err) setError('') // 用户名合法了，同时清掉表单级别的错误提示
    } else {
      setUsernameError('')
    }
  }

  // handleSubmit：处理表单提交
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault() // 阻止表单默认的页面刷新行为
    setError('')        // 清空之前的错误信息

    // 提交前再次校验用户名（防止用户绕过实时校验直接提交）
    const usernameErr = validateUsername(username)
    if (usernameErr) { setError(usernameErr); return }

    // 密码校验
    if (!password) { setError('密码不能为空'); return }
    if (password.length < 6) { setError('密码至少6位'); return }
    if (password !== confirm) { setError('两次密码不一致'); return }

    setLoading(true) // 开始加载，禁用按钮

    // 发送注册请求到后端 API
    // 注意：发送前先 normalize 用户名（转小写），和数据库存储保持一致
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: normalizeUsername(username), password }),
    })
    const data = await res.json()
    setLoading(false)

    // 如果服务器返回错误（状态码不是 2xx），显示错误信息
    if (!res.ok) { setError(data.message); return }

    // 注册成功：跳转到首页（注册后自动登录）
    router.push('/')
    router.refresh() // 刷新页面状态，让导航栏显示登录后的用户名
  }

  return (
    // 整个页面居中显示，灰色背景
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* 白色卡片容器 */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        {/* 左上角返回首页入口：不想注册的用户可以直接回去 */}
        <Link href="/" className="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors mb-6">
          ← 返回首页
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">创建账号</h1>
        <p className="text-sm text-gray-500 mb-6">注册后即可开始虚拟试穿</p>

        {/* 注册表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用户名输入框 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange} // 实时校验
              maxLength={16}                  // 限制最多输入 16 个字符
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
              placeholder="请输入用户名"
            />
            {/* 实时校验错误提示：有错误时显示红色，无错误时显示灰色提示文案 */}
            {usernameError ? (
              <p className="text-xs text-red-500 mt-1">{usernameError}</p>
            ) : (
              // 提示文案：始终显示在输入框下方，帮助用户了解规则
              <p className="text-xs text-gray-400 mt-1">
                支持字母、字母+数字，4-16 位，不能纯数字，不可包含空格、特殊符号
              </p>
            )}
          </div>

          {/* 密码输入框 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">密码</label>
            <input
              type="password" // type="password" 会把输入显示成圆点
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
              placeholder="至少6位"
            />
          </div>

          {/* 确认密码输入框：防止用户输错密码 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">确认密码</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
              placeholder="再次输入密码"
            />
          </div>

          {/* 表单整体错误提示：只有 error 不为空时才显示 */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* 提交按钮：加载中时禁用，防止重复提交 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        {/* 跳转到登录页的链接 */}
        <p className="mt-5 text-center text-sm text-gray-500">
          已有账号？{' '}
          <Link href="/login" className="text-gray-900 font-medium hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
}
