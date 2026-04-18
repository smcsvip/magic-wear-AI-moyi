// AI 文案生成工具函数
// 使用豆包（字节跳动）API 生成幽默风格的每日邮件内容

// 生成每日邮件的主题和内容
export async function generateDailyEmailContent(userName: string): Promise<{
  subject: string  // 邮件主题
  content: string  // 邮件开场白（AI 生成的幽默内容）
}> {
  const apiKey = process.env.DOUBAO_API_KEY
  if (!apiKey) {
    throw new Error('DOUBAO_API_KEY 未配置')
  }

  // 调用豆包 API
  // 文档：https://www.volcengine.com/docs/82379/1099475
  const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'ep-20260418151525-b8lnl', // 你的豆包模型 endpoint ID
      messages: [
        {
          role: 'system',
          content: '你是魔衣 MagicWear 虚拟试衣平台的 AI 小助手，负责给用户发送每日问候邮件。你的风格是幽默、轻松、有趣，但不油腻。每次生成的内容要有新意，不要重复。',
        },
        {
          role: 'user',
          content: `请为用户"${userName}"生成一封晚上 8 点发送的问候邮件。要求：
1. 邮件主题：简短有趣，10 字以内，吸引用户打开
2. 邮件开场白：2-3 句话，幽默风趣，自然引出虚拟试衣的场景

请以 JSON 格式返回：
{
  "subject": "邮件主题",
  "content": "开场白内容"
}`,
        },
      ],
      temperature: 0.9, // 提高创造力，让每次生成的内容更多样化
      max_tokens: 200,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('豆包 API 调用失败:', error)
    // 如果 AI 调用失败，返回默认内容（保证邮件能发出去）
    return {
      subject: `${userName}，今晚试试新衣服？`,
      content: `Hi ${userName}，晚上好呀！忙了一天，是不是该放松一下了？不如来魔衣试试新衣服，看看哪件最适合今天的你～`,
    }
  }

  const data = await response.json()
  const aiResponse = data.choices[0].message.content

  try {
    // 解析 AI 返回的 JSON
    const parsed = JSON.parse(aiResponse)
    return {
      subject: parsed.subject || `${userName}，今晚来试衣服吗？`,
      content: parsed.content || `Hi ${userName}，晚上好！`,
    }
  } catch (e) {
    // 如果 AI 返回的不是标准 JSON，尝试直接使用
    console.error('AI 返回格式解析失败:', aiResponse)
    return {
      subject: `${userName}，今晚试试新衣服？`,
      content: aiResponse || `Hi ${userName}，晚上好呀！`,
    }
  }
}
