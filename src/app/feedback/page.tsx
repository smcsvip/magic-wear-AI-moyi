'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Navbar } from '@/components/Navbar'
import { ArrowLeft, Send, Loader2, CheckCircle2 } from 'lucide-react'

export default function FeedbackPage() {
  const router = useRouter()
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'other'>('feature')
  const [content, setContent] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError('请输入反馈内容')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          content: content.trim(),
          email: email.trim() || null
        })
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setContent('')
        setEmail('')
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setError(data.message || '提交失败，请重试')
      }
    } catch (err) {
      setError('提交失败，请检查网络连接')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">提交成功</h2>
            <p className="text-gray-600 mb-6">感谢你的反馈，我们会尽快处理</p>
            <Button onClick={() => router.push('/')} variant="outline">
              返回首页
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">反馈建议</h1>
            <p className="text-gray-600">
              你的反馈对我们非常重要，帮助我们不断改进产品
            </p>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>提交反馈</CardTitle>
              <CardDescription>
                请详细描述你遇到的问题或建议，我们会认真对待每一条反馈
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 反馈类型选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    反馈类型
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFeedbackType('bug')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        feedbackType === 'bug'
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Bug 反馈
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackType('feature')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        feedbackType === 'feature'
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      功能建议
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackType('other')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        feedbackType === 'other'
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      其他
                    </button>
                  </div>
                </div>

                {/* 反馈内容 */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    反馈内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    placeholder="请详细描述你的问题或建议..."
                    required
                  />
                </div>

                {/* 联系邮箱（可选） */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    联系邮箱（可选）
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="如需回复，请留下邮箱"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    留下邮箱后，我们会在处理后及时回复你
                  </p>
                </div>

                {/* 错误提示 */}
                {error && (
                  <Alert variant="destructive" className="border-none bg-red-50">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* 提交按钮 */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      提交反馈
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 其他联系方式 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">也可以通过邮件联系我们</p>
            <a
              href="mailto:180333@qq.com"
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              180333@qq.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
