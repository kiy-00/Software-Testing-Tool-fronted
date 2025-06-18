// 使用相对路径，通过代理转发
const API_BASE_URL = '/api'

// 或者直接使用完整URL（需要处理CORS）
// const API_BASE_URL = 'http://localhost:5000'

export const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  return response
}
