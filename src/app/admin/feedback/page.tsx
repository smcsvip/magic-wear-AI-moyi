'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface Feedback {
  id: number
  type: string
  content: string
  email: string | null
  status: string
  createdAt: string
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchFeedbacks = (page: number = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: page.toString() })
    if (typeFilter) params.append('type', typeFilter)
    if (statusFilter) params.append('status', statusFilter)

    fetch(`/api/admin/feedback?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setFeedbacks(data.data.feedbacks)
          setPagination(data.data.pagination)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [typeFilter, statusFilter])

  const handleMarkResolved = async (id: number) => {
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'resolved' })
      })

      const data = await res.json()
      if (data.success) {
        fetchFeedbacks(pagination?.page || 1)
      }
    } catch (error) {
      console.error('标记失败:', error)
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bug: 'Bug反馈',
      feature: '功能建议',
      other: '其他'
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      bug: 'bg-red-100 text-red-700',
      feature: 'bg-blue-100 text-blue-700',
      other: 'bg-gray-100 text-gray-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">反馈管理</h1>
        <p className="text-gray-600 mt-2">查看和处理用户反馈</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>反馈列表</CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">全部类型</option>
                <option value="bug">Bug反馈</option>
                <option value="feature">功能建议</option>
                <option value="other">其他</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">全部状态</option>
                <option value="pending">待处理</option>
                <option value="resolved">已处理</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无反馈数据
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(feedback.type)}`}>
                            {getTypeLabel(feedback.type)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            feedback.status === 'resolved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {feedback.status === 'resolved' ? '已处理' : '待处理'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(feedback.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mb-2 whitespace-pre-wrap">
                          {feedback.content}
                        </p>
                        {feedback.email && (
                          <p className="text-xs text-gray-500">
                            联系邮箱：{feedback.email}
                          </p>
                        )}
                      </div>
                      {feedback.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkResolved(feedback.id)}
                          className="ml-4 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          标记已处理
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页 */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    共 {pagination.total} 条反馈，第 {pagination.page} / {pagination.totalPages} 页
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchFeedbacks(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchFeedbacks(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      下一页
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
