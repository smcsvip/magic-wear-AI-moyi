// 管理后台 - 用户详情页面
// 功能：查看用户基本信息、试穿记录、反馈记录、禁用/启用用户

'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Mail, Calendar, Image as ImageIcon, MessageSquare, Ban, CheckCircle } from 'lucide-react'

interface UserDetail {
  id: number
  username: string
  email: string | null
  role: string
  status: string
  createdAt: string
  tryonCount: number
}

interface TryonRecord {
  id: number
  resultImage: string
  createdAt: string
}

interface Feedback {
  id: number
  type: string
  content: string
  status: string
  createdAt: string
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params) // Next.js 15: params 是 Promise，需要用 use() 解包
  const router = useRouter()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [tryonRecords, setTryonRecords] = useState<TryonRecord[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  // 切换用户状态（禁用/启用）
  const handleToggleStatus = async () => {
    if (!user) return

    const newStatus = user.status === 'active' ? 'disabled' : 'active'
    const action = newStatus === 'disabled' ? '禁用' : '启用'

    if (!confirm(`确定要${action}该用户吗？`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await res.json()
      if (data.success) {
        setUser({ ...user, status: newStatus })
      } else {
        alert(data.message || '操作失败')
      }
    } catch (error) {
      alert('操作失败，请重试')
    }
  }

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setUser(data.data.user)
          setTryonRecords(data.data.tryonRecords)
          setFeedbacks(data.data.feedbacks)
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">用户不存在</p>
        <Button onClick={() => router.back()} className="mt-4">
          返回
        </Button>
      </div>
    )
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bug: 'Bug反馈',
      feature: '功能建议',
      other: '其他'
    }
    return labels[type] || type
  }

  return (
    <div>
      {/* 返回按钮 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回用户列表
      </button>

      {/* 用户基本信息 */}
      <Card className="border-none shadow-sm mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>用户信息</CardTitle>
            <Button
              onClick={handleToggleStatus}
              variant="outline"
              className={user.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
            >
              {user.status === 'active' ? (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  禁用用户
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  启用用户
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">用户名</label>
                <p className="text-lg font-medium text-gray-900">{user.username}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">邮箱</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {user.email || '未设置'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">角色</label>
                <p>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    user.role === 'admin'
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role === 'admin' ? '管理员' : '用户'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">状态</label>
                <p>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status === 'active' ? '正常' : '已禁用'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">注册时间</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {new Date(user.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm">试穿次数</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.tryonCount}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">反馈次数</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 试穿记录 */}
      <Card className="border-none shadow-sm mb-6">
        <CardHeader>
          <CardTitle>试穿记录（最近 20 条）</CardTitle>
        </CardHeader>
        <CardContent>
          {tryonRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无试穿记录</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tryonRecords.map((record) => (
                <div key={record.id} className="group">
                  <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={record.resultImage}
                      alt="试穿结果"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 反馈记录 */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>反馈记录（最近 10 条）</CardTitle>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无反馈记录</div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {getTypeLabel(feedback.type)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      feedback.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {feedback.status === 'resolved' ? '已处理' : '待处理'}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {new Date(feedback.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {feedback.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
