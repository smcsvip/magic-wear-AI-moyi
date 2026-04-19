import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // 保护 /admin 路由（除了 /admin/login）
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 允许访问登录页
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    try {
      // 获取认证 token
      const token = request.cookies.get('auth_token')?.value

      if (!token) {
        // 未登录，重定向到后台登录页
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // 验证 token（不在中间件中查询数据库）
      // 角色验证移到页面的 API 调用中进行
      await verifyToken(token)

      // token 有效，继续请求
      return NextResponse.next()
    } catch (error) {
      // token 无效或过期
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
