// 上传头像的接口
// POST /api/user/avatar
// 请求体：{ avatar: string }  — base64 格式，含 data:image/... 前缀
// 校验：只允许 JPG/PNG，大小不超过 2MB

import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 2MB 对应的 base64 字节数上限
// base64 编码后体积约为原始文件的 4/3，所以 2MB 原始 ≈ 2.7MB base64
// 这里用 base64 字符串长度来估算，1 个 base64 字符 ≈ 0.75 字节
const MAX_BASE64_LENGTH = Math.ceil((2 * 1024 * 1024 * 4) / 3) // ≈ 2.8MB base64 字符数

export async function POST(request: NextRequest) {
  // 验证登录状态
  const token = await getAuthToken()
  if (!token) {
    return NextResponse.json({ message: '请先登录' }, { status: 401 })
  }

  let payload
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ message: '登录已过期，请重新登录' }, { status: 401 })
  }

  const { avatar } = await request.json()

  if (!avatar || typeof avatar !== 'string') {
    return NextResponse.json({ message: '头像数据不能为空' }, { status: 400 })
  }

  // 校验格式：必须是 JPG 或 PNG 的 base64 data URL
  if (!avatar.startsWith('data:image/jpeg;base64,') && !avatar.startsWith('data:image/png;base64,')) {
    return NextResponse.json({ message: '只支持 JPG 或 PNG 格式' }, { status: 400 })
  }

  // 校验大小：base64 字符串长度不能超过上限
  if (avatar.length > MAX_BASE64_LENGTH) {
    return NextResponse.json({ message: '图片大小不能超过 2MB' }, { status: 400 })
  }

  // 保存到数据库
  await prisma.user.update({
    where: { id: payload.userId },
    data: { avatar },
  })

  return NextResponse.json({ message: '头像已更新', avatar })
}
