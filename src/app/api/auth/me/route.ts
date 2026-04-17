// 这是"获取当前登录用户信息"的接口（API）
// 前端（比如导航栏）会调用这个接口来判断用户是否已登录
// 如果已登录，返回用户信息；如果未登录，返回 null

import { NextResponse } from 'next/server'
import { getAuthToken, verifyToken } from '@/lib/auth'

// GET 函数：处理获取用户信息的请求
export async function GET() {
  // 从 Cookie 里读取登录令牌
  const token = await getAuthToken()

  // 如果没有令牌，说明用户未登录，返回 null
  if (!token) {
    return NextResponse.json({ user: null })
  }

  try {
    // 验证令牌是否有效（没过期、没被篡改）
    const payload = await verifyToken(token)
    // 令牌有效，返回用户信息
    return NextResponse.json({ user: { id: payload.userId, username: payload.username } })
  } catch {
    // 令牌无效（比如已过期），返回 null
    return NextResponse.json({ user: null })
  }
}
