'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'

interface TryonRecord {
  id: number
  resultImage: string
  createdAt: string
  user: {
    id: number
    username: string
    email: string | null
  }
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export default function AdminTryonRecordsPage() {
  const [records, setRecords] = useState<TryonRecord[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)

  const fetchRecords = (page: number = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: page.toString() })
    if (userId) params.append('userId', userId)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    fetch(`/api/admin/tryon-records?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setRecords(data.data.records)
          setPagination(data.data.pagination)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleFilter = () => {
    fetchRecords(1)
  }

  const handleReset = () => {
    setUserId('')
    setStartDate('')
    setEndDate('')
    fetchRecords(1)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">试穿记录管理</h1>
        <p className="text-gray-600 mt-2">查看所有用户的试穿记录</p>
      </div>

      <Card className="border-none shadow-sm mb-6">
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">用户 ID</label>
              <Input
                type="number"
                placeholder="输入用户 ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">开始日期</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">结束日期</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleFilter} className="flex-1">
                筛选
              </Button>
              <Button onClick={handleReset} variant="outline">
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>试穿记录列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无试穿记录
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="group relative cursor-pointer"
                    onClick={() => setEnlargedImage(record.resultImage)}
                  >
                    <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={record.resultImage}
                        alt="试穿结果"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Maximize2 className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <p className="font-medium truncate">
                        {record.user.username}
                      </p>
                      <p className="text-gray-500">
                        {new Date(record.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页 */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchRecords(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchRecords(pagination.page + 1)}
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

      {/* 图片放大查看 */}
      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={enlargedImage}
              alt="放大预览"
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
              onClick={() => setEnlargedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
