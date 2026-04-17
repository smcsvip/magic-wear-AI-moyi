// 这个文件管理环境变量（就是存在 .env.local 文件里的配置）
// 环境变量是一种安全存储敏感信息（比如 API 密钥）的方式，不会被提交到代码仓库

export const env = {
  // 豆包 API 的密钥，优先读 VOLC_ENGINE_API_KEY，其次读 DOUBAO_API_KEY，都没有就是空字符串
  DOUBAO_API_KEY: process.env.VOLC_ENGINE_API_KEY || process.env.DOUBAO_API_KEY || '',
  // 豆包 API 的请求地址（URL）
  API_URL: process.env.VOLC_ENGINE_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
  // 使用的 AI 模型名称
  MODEL: process.env.VOLC_ENGINE_MODEL || 'doubao-seedream-4-5-251128'
}

// validateEnv：检查环境变量是否配置好了
// 返回 true 表示配置正常，返回 false 表示缺少 API Key
export function validateEnv() {
  if (!env.DOUBAO_API_KEY) {
    // 如果没有配置 API Key，打印警告信息
    console.warn('[WARN] DOUBAO_API_KEY not configured, using mock mode')
    return false
  }
  return true
}
