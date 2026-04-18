// 取消订阅页面
// 用户点击邮件里的"取消订阅"链接后会跳转到这里
// 路径：/unsubscribe?token=xxx

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleUnsubscribe() {
    if (!token) {
      setError('无效的取消订阅链接')
      return
    }

    setLoading(true)
    const res = await fetch('/api/email/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setSuccess(true)
    } else {
      setError(data.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
        {!success ? (
          <>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">取消订阅</h1>
            <p className="text-sm text-gray-600 mb-6">
              确定要取消订阅魔衣 MagicWear 的每日问候邮件吗？
            </p>
            <p className="text-sm text-gray-500 mb-8">
              取消后，你将不再收到我们的每日推送。你可以随时在个人设置中重新订阅。
            </p>

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

            <div className="flex gap-3">
              <Link
                href="/"
                className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                返回首页
              </Link>
              <button
                onClick={handleUnsubscribe}
                disabled={loading || !token}
                className="flex-1 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '处理中...' : '确认取消'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">取消成功</h1>
            <p className="text-sm text-gray-600 mb-8">
              你已成功取消订阅。如需重新订阅，可以在个人设置中开启。
            </p>
            <Link
              href="/"
              className="inline-block bg-gray-900 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              返回首页
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
