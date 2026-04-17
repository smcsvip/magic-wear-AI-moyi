// 这个文件处理用户登录状态的核心逻辑：
// 1. 生成 JWT 令牌（就像一张"通行证"）
// 2. 验证令牌是否有效
// 3. 把令牌存到 Cookie（浏览器的小本本）里
// 4. 从 Cookie 里读取令牌

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// SECRET 是签名密钥，用来给令牌"盖章"，防止别人伪造
// 从环境变量读取，如果没配置就用默认值（仅开发时用）
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'magic-wear-dev-secret'
)

// Cookie 的名字，我们把令牌存在这个名字下
const COOKIE = 'auth_token'

// signToken：生成一个 JWT 令牌（通行证）
// 参数：用户ID 和 用户名
// 返回：一串加密的字符串，就是令牌
export async function signToken(payload: { userId: number; username: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' }) // 使用 HS256 加密算法
    .setIssuedAt()                          // 记录令牌的签发时间
    .setExpirationTime('7d')               // 令牌有效期 7 天，过期需要重新登录
    .sign(SECRET)                           // 用密钥签名
}

// verifyToken：验证令牌是否有效
// 参数：令牌字符串
// 返回：令牌里存的用户信息（userId 和 username）
// 如果令牌无效或过期，会抛出错误
export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET)
  return payload as { userId: number; username: string }
}

// setAuthCookie：把令牌存到浏览器的 Cookie 里
// 参数：令牌字符串
export async function setAuthCookie(token: string) {
  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,                                        // 只有服务器能读，JavaScript 不能读（防止 XSS 攻击）
    secure: process.env.NODE_ENV === 'production',        // 生产环境只在 HTTPS 下传输
    sameSite: 'lax',                                      // 防止跨站请求伪造（CSRF）攻击
    maxAge: 60 * 60 * 24 * 7,                            // Cookie 有效期：7天（单位：秒）
    path: '/',                                            // 整个网站都能用这个 Cookie
  })
}

// clearAuthCookie：删除 Cookie，用于退出登录
export async function clearAuthCookie() {
  const store = await cookies()
  store.delete(COOKIE)
}

// getAuthToken：从 Cookie 里读取令牌
// 返回：令牌字符串，如果没有登录则返回 undefined
export async function getAuthToken() {
  const store = await cookies()
  return store.get(COOKIE)?.value
}
