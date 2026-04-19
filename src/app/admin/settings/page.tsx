// 管理后台 - 系统设置页面
// 功能：维护模式开关、维护提示信息设置

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save, AlertCircle } from 'lucide-react'

interface SystemConfig {
  id: number
  maintenanceMode: boolean
  maintenanceMessage: string | null
  updatedAt: string
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = () => {
    setLoading(true)
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setConfig(data.data)
          setMaintenanceMode(data.data.maintenanceMode)
          setMaintenanceMessage(data.data.maintenanceMessage || '')
        }
      })
      .finally(() => setLoading(false))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceMode,
          maintenanceMessage
        })
      })

      const data = await res.json()
      if (data.success) {
        setConfig(data.data)
        alert('保存成功')
      } else {
        alert(data.message || '保存失败')
      }
    } catch (error) {
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">系统设置</h1>
        <p className="text-gray-600 mt-2">管理系统配置和维护模式</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>维护模式</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 维护模式开关 */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-900 block mb-2">
                启用维护模式
              </label>
              <p className="text-sm text-gray-600 mb-4">
                开启后，普通用户将无法访问系统，只显示维护提示信息。管理员不受影响。
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMaintenanceMode(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !maintenanceMode
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  关闭
                </button>
                <button
                  onClick={() => setMaintenanceMode(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    maintenanceMode
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  开启
                </button>
              </div>
            </div>
          </div>

          {/* 维护提示信息 */}
          <div>
            <label className="text-sm font-medium text-gray-900 block mb-2">
              维护提示信息
            </label>
            <p className="text-sm text-gray-600 mb-3">
              用户在维护模式下看到的提示文字
            </p>
            <Textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="系统维护中，请稍后再试"
              rows={4}
              className="resize-none"
            />
          </div>

          {/* 当前状态提示 */}
          {maintenanceMode && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">维护模式已开启</p>
                <p className="text-sm text-red-700 mt-1">
                  普通用户当前无法访问系统，请在维护完成后及时关闭维护模式。
                </p>
              </div>
            </div>
          )}

          {/* 保存按钮 */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存设置
                </>
              )}
            </Button>
            {config && (
              <span className="text-sm text-gray-500">
                最后更新：{new Date(config.updatedAt).toLocaleString('zh-CN')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

