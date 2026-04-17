// 这是退出登录接口（API）
// 当用户点击"退出登录"时，前端会发送请求到这里
// 这里负责：清除 Cookie（删除登录状态）→ 跳转到登录页

import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

// POST 函数：处理退出登录请求
export async function POST(request: NextRequest) {
  // 清除存在 Cookie 里的登录令牌，用户就退出登录了
  await clearAuthCookie()

  // 判断请求来源：
  // - 如果是表单提交（profile 页面的退出按钮），就跳转到登录页
  // - 如果是 JavaScript 发起的 fetch 请求（Navbar 的退出按钮），就返回 JSON
  const isFormSubmit = request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')
  if (isFormSubmit) {
    // 重定向到登录页
    return NextResponse.redirect(new URL('/login', request.url))
  }
  // 返回 JSON 响应，前端 JS 收到后自己处理跳转
  return NextResponse.json({ message: '已退出' })
}
