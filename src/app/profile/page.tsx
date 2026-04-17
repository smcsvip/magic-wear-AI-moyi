// 这是用户个人主页（/profile 页面）
// 'use client' 表示这是客户端组件，支持头像上传、昵称编辑、修改密码等交互功能
// 页面加载时通过 API 获取用户信息，未登录会跳转到登录页

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UserCircle, Calendar, LogOut, Shirt, Pencil, Check, X, KeyRound, Eye, EyeOff } from 'lucide-react'

// 用户信息的数据结构
interface UserInfo {
  id: number
  username: string
  nickname: string | null
  avatar: string | null
  createdAt: string
  records: { id: number; resultImage: string; createdAt: string }[]
}

export default function ProfilePage() {
  const router = useRouter()

  // 用户数据
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // 昵称编辑状态
  const [editingNickname, setEditingNickname] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const [nicknameSaving, setNicknameSaving] = useState(false)
  const [nicknameMsg, setNicknameMsg] = useState('')

  // 头像上传状态
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 修改密码状态
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordMsgType, setPasswordMsgType] = useState<'ok' | 'err'>('ok')

  // 页面加载时获取用户信息
  useEffect(() => {
    fetch('/api/profile/me')
      .then(res => {
        if (res.status === 401) { router.push('/login'); return null }
        return res.json()
      })
      .then(data => {
        if (data) { setUser(data.user); setLoading(false) }
      })
      .catch(() => setLoading(false))
  }, [router])

  // ── 头像上传 ──────────────────────────────────────────────

  // 用户点击头像区域，触发文件选择
  function handleAvatarClick() {
    fileInputRef.current?.click()
  }

  // 用户选择图片文件后处理
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 校验格式
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setAvatarMsg('只支持 JPG 或 PNG 格式')
      return
    }
    // 校验大小（2MB）
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMsg('图片大小不能超过 2MB')
      return
    }

    setAvatarUploading(true)
    setAvatarMsg('')

    // 把图片裁剪为 1:1 正方形，然后转成 base64
    const base64 = await cropAndConvertToBase64(file)

    // 上传到服务器
    const res = await fetch('/api/user/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: base64 }),
    })
    const data = await res.json()
    setAvatarUploading(false)

    if (!res.ok) {
      setAvatarMsg(data.message)
    } else {
      // 更新本地显示
      setUser(prev => prev ? { ...prev, avatar: base64 } : prev)
      setAvatarMsg('头像已更新')
      setTimeout(() => setAvatarMsg(''), 2000)
    }

    // 清空 input，允许重复选同一张图
    e.target.value = ''
  }

  // 把图片裁剪为 1:1 正方形并转成 base64
  function cropAndConvertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = ev => {
        const img = new Image()
        img.onload = () => {
          // 取宽高中较小的一边作为正方形边长
          const size = Math.min(img.width, img.height)
          const canvas = document.createElement('canvas')
          // 输出尺寸固定为 400×400（清晰度够用，文件也不会太大）
          canvas.width = 400
          canvas.height = 400
          const ctx = canvas.getContext('2d')!
          // 居中裁剪：从图片中心取正方形区域
          const sx = (img.width - size) / 2
          const sy = (img.height - size) / 2
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 400, 400)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        }
        img.onerror = reject
        img.src = ev.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // ── 昵称编辑 ──────────────────────────────────────────────

  function startEditNickname() {
    setNicknameInput(user?.nickname ?? '')
    setNicknameMsg('')
    setEditingNickname(true)
  }

  function cancelEditNickname() {
    setEditingNickname(false)
    setNicknameMsg('')
  }

  async function saveNickname() {
    const trimmed = nicknameInput.trim()
    if (trimmed.length > 20) {
      setNicknameMsg('昵称最多 20 个字符')
      return
    }
    setNicknameSaving(true)
    setNicknameMsg('')
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: trimmed }),
    })
    const data = await res.json()
    setNicknameSaving(false)
    if (!res.ok) {
      setNicknameMsg(data.message)
    } else {
      setUser(prev => prev ? { ...prev, nickname: trimmed || null } : prev)
      setEditingNickname(false)
    }
  }

  // ── 修改密码 ──────────────────────────────────────────────

  function openPasswordForm() {
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordMsg('')
    setShowPasswordForm(true)
  }

  function closePasswordForm() {
    setShowPasswordForm(false)
    setPasswordMsg('')
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMsg('')

    if (!oldPassword) { setPasswordMsg('请输入当前密码'); setPasswordMsgType('err'); return }
    if (!newPassword) { setPasswordMsg('请输入新密码'); setPasswordMsgType('err'); return }
    if (newPassword.length < 6) { setPasswordMsg('新密码至少 6 位'); setPasswordMsgType('err'); return }
    if (newPassword !== confirmPassword) { setPasswordMsg('两次密码不一致'); setPasswordMsgType('err'); return }

    setPasswordSaving(true)
    const res = await fetch('/api/auth/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
    })
    const data = await res.json()
    setPasswordSaving(false)

    if (!res.ok) {
      setPasswordMsg(data.message)
      setPasswordMsgType('err')
    } else {
      setPasswordMsg('密码修改成功')
      setPasswordMsgType('ok')
      // 2 秒后关闭表单
      setTimeout(() => closePasswordForm(), 2000)
    }
  }

  // ── 退出登录 ──────────────────────────────────────────────

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  // ── 渲染 ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">加载中...</p>
      </div>
    )
  }

  if (!user) return null

  // 显示名称：有昵称用昵称，否则用用户名
  const displayName = user.nickname || user.username

  // 注册时间格式化：精确到时分秒
  const createdAtStr = new Date(user.createdAt).toLocaleString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* 用户信息卡片 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-5">

            {/* 头像区域：点击可更换 */}
            <div
              className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 cursor-pointer group flex-shrink-0"
              onClick={handleAvatarClick}
              title="点击更换头像"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="头像" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-full h-full text-gray-300 p-1" />
              )}
              {/* 悬停时显示"更换"遮罩 */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs">更换</span>
              </div>
              {/* 上传中的遮罩 */}
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs">上传中</span>
                </div>
              )}
            </div>
            {/* 隐藏的文件输入框 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* 用户名 / 昵称区域 */}
            <div className="flex-1 min-w-0">
              {editingNickname ? (
                // 编辑昵称的输入框
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={e => setNicknameInput(e.target.value)}
                    maxLength={20}
                    placeholder="输入昵称（最多 20 字）"
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-gray-400"
                    autoFocus
                  />
                  <button onClick={saveNickname} disabled={nicknameSaving} className="text-gray-600 hover:text-gray-900 disabled:opacity-40">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={cancelEditNickname} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // 显示昵称/用户名，旁边有编辑按钮
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-gray-900 truncate">{displayName}</h1>
                  <button onClick={startEditNickname} className="text-gray-300 hover:text-gray-500 flex-shrink-0" title="编辑昵称">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {/* 昵称操作提示 */}
              {nicknameMsg && <p className="text-xs text-red-500 mt-0.5">{nicknameMsg}</p>}
              {/* 有昵称时在下方显示用户名 */}
              {user.nickname && !editingNickname && (
                <p className="text-xs text-gray-400 mt-0.5">@{user.username}</p>
              )}
              {/* 头像操作提示 */}
              {avatarMsg && <p className="text-xs text-gray-400 mt-0.5">{avatarMsg}</p>}
            </div>
          </div>

          {/* 注册时间 */}
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-2.5">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>注册于 {createdAtStr}</span>
          </div>
        </div>

        {/* 试穿历史记录 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shirt className="w-4 h-4" />
              试穿历史
              <span className="text-xs text-gray-400 font-normal">({user.records.length} 条)</span>
            </h2>
            <a href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">去试穿 →</a>
          </div>

          {user.records.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              还没有试穿记录，去首页试试吧
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {user.records.map(record => (
                <div key={record.id} className="group relative">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={record.resultImage}
                      alt="试穿结果"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    {new Date(record.createdAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 修改密码区域 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <button
            onClick={showPasswordForm ? closePasswordForm : openPasswordForm}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            修改密码
          </button>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
              {/* 当前密码 */}
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="当前密码"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 pr-9"
                />
                <button type="button" onClick={() => setShowOld(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* 新密码 */}
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="新密码（至少 6 位）"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 pr-9"
                />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* 确认新密码 */}
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="确认新密码"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 pr-9"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* 提示信息 */}
              {passwordMsg && (
                <p className={`text-sm ${passwordMsgType === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordMsg}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {passwordSaving ? '保存中...' : '确认修改'}
                </button>
                <button
                  type="button"
                  onClick={closePasswordForm}
                  className="px-4 border border-gray-200 rounded-lg text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 退出登录按钮 */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-xl py-3 shadow-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>

      </div>
    </div>
  )
}
