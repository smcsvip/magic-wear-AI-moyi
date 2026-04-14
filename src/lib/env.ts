export const env = {
  DOUBAO_API_KEY: process.env.VOLC_ENGINE_API_KEY || process.env.DOUBAO_API_KEY || '',
  API_URL: process.env.VOLC_ENGINE_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
  MODEL: process.env.VOLC_ENGINE_MODEL || 'doubao-seedream-4-5-251128'
}

export function validateEnv() {
  if (!env.DOUBAO_API_KEY) {
    console.warn('[WARN] DOUBAO_API_KEY not configured, using mock mode')
    return false
  }
  return true
}
