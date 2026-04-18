// 这是用户个人主页（/profile 页面）
// 'use client' 表示这是客户端组件，支持头像上传、昵称编辑、修改密码等交互功能
// 页面加载时通过 API 获取用户信息，未登录会跳转到登录页

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserCircle, Calendar, LogOut, Shirt, Pencil, Check, X, KeyRound, Eye, EyeOff, Download, Mail } from 'lucide-react'

// 用户信息的数据结构
interface UserInfo {
  id: number
  username: string
  nickname: string | null
  avatar: string | null
  email: string | null
  emailUpdatedAt: string | null
  emailSubscribed: boolean  // 是否订阅每日邮件
  createdAt: string
  records: { id: number; resultImage: string; createdAt: string }[]
}

export default function ProfilePage() {
  const router = useRouter()

  // 用户数据
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // 放大预览状态
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)

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

  // 邮箱编辑状态
  const [editingEmail, setEditingEmail] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [emailVerifyCode, setEmailVerifyCode] = useState('')
  const [emailCodeSent, setEmailCodeSent] = useState(false)
  const [emailSendingCode, setEmailSendingCode] = useState(false)
  const [emailCountdown, setEmailCountdown] = useState(0)
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailMsg, setEmailMsg] = useState('')
  const [emailMsgType, setEmailMsgType] = useState<'ok' | 'err'>('ok')
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // 邮件订阅状态
  const [emailSubscribedToggling, setEmailSubscribedToggling] = useState(false)

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

  // ESC 键关闭放大预览
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setEnlargedImage(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // 邮箱验证码倒计时
  useEffect(() => {
    if (emailCountdown > 0) {
      const timer = setTimeout(() => setEmailCountdown(emailCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [emailCountdown])

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

  // ── 邮箱编辑 ──────────────────────────────────────────────

  function startEditEmail(autoOpen = false) {
    setEmailInput(user?.email ?? '')
    setEmailVerifyCode('')
    setEmailCodeSent(false)
    setEmailCountdown(0)
    setEmailMsg('')
    setEditingEmail(true)
    if (autoOpen) setTimeout(() => document.getElementById('email-input')?.focus(), 100)
  }

  function cancelEditEmail() {
    setEditingEmail(false)
    setEmailMsg('')
  }

  async function handleSendEmailCode() {
    const trimmed = emailInput.trim().toLowerCase()
    if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
      setEmailMsg('请输入正确的邮箱')
      setEmailMsgType('err')
      return
    }
    setEmailSendingCode(true)
    const res = await fetch('/api/email/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmed }),
    })
    const data = await res.json()
    setEmailSendingCode(false)
    if (res.ok) {
      setEmailCodeSent(true)
      setEmailCountdown(60)
      setEmailMsg('')
    } else {
      setEmailMsg(data.message)
      setEmailMsgType('err')
    }
  }

  async function saveEmail() {
    const trimmed = emailInput.trim().toLowerCase()
    if (!trimmed) { setEmailMsg('邮箱不能为空'); setEmailMsgType('err'); return }
    if (!EMAIL_REGEX.test(trimmed)) { setEmailMsg('邮箱格式不正确'); setEmailMsgType('err'); return }
    if (!emailVerifyCode.trim()) { setEmailMsg('请输入验证码'); setEmailMsgType('err'); return }
    if (emailVerifyCode.trim().length !== 6) { setEmailMsg('验证码为 6 位数字'); setEmailMsgType('err'); return }

    // 先验证验证码
    const verifyRes = await fetch('/api/email/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmed, code: emailVerifyCode.trim() }),
    })
    if (!verifyRes.ok) {
      const verifyData = await verifyRes.json()
      setEmailMsg(verifyData.message)
      setEmailMsgType('err')
      return
    }

    setEmailSaving(true)
    setEmailMsg('')
    const res = await fetch('/api/user/email', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmed }),
    })
    const data = await res.json()
    setEmailSaving(false)
    if (!res.ok) {
      setEmailMsg(data.message)
      setEmailMsgType('err')
    } else {
      setUser(prev => prev ? { ...prev, email: trimmed, emailUpdatedAt: new Date().toISOString() } : prev)
      setEditingEmail(false)
      setEmailMsg('')
    }
  }

  // ── 切换邮件订阅状态 ──────────────────────────────────────────────
  async function toggleEmailSubscribed() {
    if (!user) return
    setEmailSubscribedToggling(true)

    const res = await fetch('/api/user/email-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscribed: !user.emailSubscribed }),
    })

    setEmailSubscribedToggling(false)

    if (res.ok) {
      setUser(prev => prev ? { ...prev, emailSubscribed: !prev.emailSubscribed } : prev)
    }
  }

  // ── 下载图片 ──────────────────────────────────────────────  // 下载单张图片
  function downloadImage(url: string, filename: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  // 全部下载：逐张触发下载，间隔 200ms 避免浏览器拦截
  function downloadAll() {
    if (!user) return
    user.records.forEach((record, index) => {
      setTimeout(() => {
        downloadImage(record.resultImage, `tryon-${index + 1}.jpg`)
      }, index * 200)
    })
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
    <>
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* 返回首页 */}
        <Link href="/" className="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← 返回首页
        </Link>

        {/* 老用户未设置邮箱提示条 */}
        {!user.email && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>您还未设置邮箱，建议完善账号信息</span>
            </div>
            <button
              onClick={() => startEditEmail(true)}
              className="text-xs text-amber-700 font-medium hover:underline flex-shrink-0 ml-3"
            >
              立即设置
            </button>
          </div>
        )}

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

          {/* 邮箱区域 */}
          <div className="mt-3">
            {editingEmail ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    id="email-input"
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="请输入邮箱"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={emailVerifyCode}
                    onChange={e => setEmailVerifyCode(e.target.value)}
                    maxLength={6}
                    placeholder="请输入 6 位验证码"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    disabled={emailSendingCode || emailCountdown > 0 || !emailInput.trim()}
                    className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {emailSendingCode ? '发送中' : emailCountdown > 0 ? `${emailCountdown}秒` : emailCodeSent ? '重发' : '发送'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={saveEmail} disabled={emailSaving} className="text-gray-600 hover:text-gray-900 disabled:opacity-40">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={cancelEditEmail} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {emailMsg && (
                  <p className={`text-xs ${emailMsgType === 'ok' ? 'text-green-600' : 'text-red-500'}`}>{emailMsg}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-2.5">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{user.email ?? '未设置邮箱'}</span>
                <button onClick={() => startEditEmail()} className="text-gray-300 hover:text-gray-500" title="修改邮箱">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 邮件订阅开关：只有设置了邮箱才显示 */}
          {user.email && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">每日问候邮件</p>
                  <p className="text-xs text-gray-500 mt-0.5">每晚 8 点收到 AI 生成的个性化问候</p>
                </div>
                <button
                  onClick={toggleEmailSubscribed}
                  disabled={emailSubscribedToggling}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                    user.emailSubscribed ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      user.emailSubscribed ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 试穿历史记录 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shirt className="w-4 h-4" />
              试穿历史
              <span className="text-xs text-gray-400 font-normal">({user.records.length} 条)</span>
            </h2>
            <div className="flex items-center gap-3">
              {/* 全部下载按钮：有记录时才显示 */}
              {user.records.length > 0 && (
                <button
                  onClick={downloadAll}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  全部下载
                </button>
              )}
              <a href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">去试穿 →</a>
            </div>
          </div>

          {user.records.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              还没有试穿记录，去首页试试吧
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {user.records.map((record, index) => (
                <div key={record.id} className="group relative">
                  <div
                    className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                    onClick={() => setEnlargedImage(record.resultImage)}
                  >
                    <img
                      src={record.resultImage}
                      alt="试穿结果"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {/* 悬停时显示下载按钮 */}
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadImage(record.resultImage, `tryon-${index + 1}.jpg`) }}
                      className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="下载"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
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

    {/* 图片放大弹窗 */}
    {enlargedImage && (
      <div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={() => setEnlargedImage(null)}
      >
        <img
          src={enlargedImage}
          alt="放大预览"
          className="max-w-full max-h-full rounded-xl object-contain"
          onClick={e => e.stopPropagation()}
        />
        <button
          onClick={() => setEnlargedImage(null)}
          className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none"
        >
          ✕
        </button>
      </div>
    )}
    </>
  )
}
