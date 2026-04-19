// 管理后台 - 用户管理页面
// 功能：查看用户列表、搜索用户、禁用/启用用户、导出 CSV、查看用户详情

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, ChevronLeft, ChevronRight, Eye, Download, Ban, CheckCircle } from 'lucide-react'

interface User {
  id: number
  username: string
  email: string | null
  role: string
  status: string
  createdAt: string
  tryonCount: number
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // 获取用户列表
  const fetchUsers = (page: number = 1, searchQuery: string = '') => {
    setLoading(true)
    const params = new URLSearchParams({ page: page.toString() })
    if (searchQuery) params.append('search', searchQuery)

    fetch(`/api/admin/users?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setUsers(data.data.users)
          setPagination(data.data.pagination)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearch = () => {
    setSearch(searchInput)
    fetchUsers(1, searchInput)
  }

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, search)
  }

  // 切换用户状态（禁用/启用）
  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active'
    const action = newStatus === 'disabled' ? '禁用' : '启用'

    if (!confirm(`确定要${action}该用户吗？`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await res.json()
      if (data.success) {
        fetchUsers(pagination?.page || 1, search)
      } else {
        alert(data.message || '操作失败')
      }
    } catch (error) {
      alert('操作失败，请重试')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
        <p className="text-gray-600 mt-2">查看和管理平台用户</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>用户列表</CardTitle>
            <div className="flex items-center gap-2">
              <a
                href="/api/admin/export?type=users"
                download
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                导出 CSV
              </a>
              <Input
                placeholder="搜索用户名或邮箱"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-64"
              />
              <Button onClick={handleSearch} size="sm">
                <Search className="h-4 w-4 mr-2" />
                搜索
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无用户数据
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">用户名</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">邮箱</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">角色</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">状态</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">试穿次数</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">注册时间</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{user.id}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{user.username}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.email || '-'}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-pink-100 text-pink-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role === 'admin' ? '管理员' : '用户'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {user.status === 'active' ? '正常' : '已禁用'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.tryonCount}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-3">
                            <a
                              href={`/admin/users/${user.id}`}
                              className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              查看详情
                            </a>
                            <button
                              onClick={() => handleToggleStatus(user.id, user.status)}
                              className={`inline-flex items-center gap-1 transition-colors ${
                                user.status === 'active'
                                  ? 'text-red-600 hover:text-red-700'
                                  : 'text-green-600 hover:text-green-700'
                              }`}
                            >
                              {user.status === 'active' ? (
                                <>
                                  <Ban className="h-4 w-4" />
                                  禁用
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  启用
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    共 {pagination.total} 个用户，第 {pagination.page} / {pagination.totalPages} 页
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
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
