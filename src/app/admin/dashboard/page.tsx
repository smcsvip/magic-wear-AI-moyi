'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Image, MessageSquare, TrendingUp, Loader2 } from 'lucide-react'

interface Stats {
  totalUsers: number
  todayUsers: number
  totalTryons: number
  todayTryons: number
  totalFeedback: number
  pendingFeedback: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(data.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const statCards = [
    {
      title: '用户总数',
      value: stats?.totalUsers || 0,
      change: `今日新增 ${stats?.todayUsers || 0}`,
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: '试穿总次数',
      value: stats?.totalTryons || 0,
      change: `今日 ${stats?.todayTryons || 0} 次`,
      icon: Image,
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: '反馈总数',
      value: stats?.totalFeedback || 0,
      change: `待处理 ${stats?.pendingFeedback || 0}`,
      icon: MessageSquare,
      color: 'from-violet-500 to-purple-500'
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">数据概览</h1>
        <p className="text-gray-600 mt-2">实时查看平台运营数据</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index} className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {card.value.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {card.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 快捷操作 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-sm transition-all"
          >
            <h3 className="font-medium text-gray-900">用户管理</h3>
            <p className="text-sm text-gray-500 mt-1">查看和管理用户</p>
          </a>
          <a
            href="/admin/feedback"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-sm transition-all"
          >
            <h3 className="font-medium text-gray-900">反馈管理</h3>
            <p className="text-sm text-gray-500 mt-1">处理用户反馈</p>
          </a>
          <a
            href="/"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-sm transition-all"
          >
            <h3 className="font-medium text-gray-900">返回前台</h3>
            <p className="text-sm text-gray-500 mt-1">查看用户视角</p>
          </a>
        </div>
      </div>
    </div>
  )
}
