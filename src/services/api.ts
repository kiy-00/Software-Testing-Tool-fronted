import axios from 'axios'
import type { HomeworkCodeResponse, TestResults } from '@/types/api'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('响应错误:', error)
    if (error.code === 'ECONNABORTED') {
      console.error('请求超时')
    } else if (error.response?.status === 500) {
      console.error('服务器内部错误')
    }
    return Promise.reject(error)
  },
)

export const apiService = {
  /**
   * 获取题目的初始代码
   * @param problem 题目名称
   * @returns 代码响应
   */
  async getHomeworkCode(problem: string): Promise<HomeworkCodeResponse> {
    const response = await api.get('/homework/code', {
      params: { problem },
    })
    return response.data
  },

  /**
   * 运行测试用例生成和执行
   * @param code 要测试的代码字符串
   * @param functionName 题目名称
   * @param testMethod 测试方法名称
   * @returns 测试结果
   */
  async runTest(code: string, functionName: string, testMethod: string): Promise<TestResults> {
    const response = await api.post('/homework/test', {
      code,
      function_name: functionName,
      test_method: testMethod,
    })
    return response.data
  },
}
