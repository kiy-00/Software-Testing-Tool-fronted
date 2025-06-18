import axios from 'axios'
import type {
  HomeworkCodeResponse,
  TestResults,
  ScanClassesResponse,
  ScanFunctionsResponse,
  UnitTestResults,
} from '@/types/api'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 创建用于文件上传的axios实例
const uploadApi = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'multipart/form-data',
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

// 为上传API也添加拦截器
uploadApi.interceptors.request.use(
  (config) => {
    console.log('发送文件上传请求:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('上传请求错误:', error)
    return Promise.reject(error)
  },
)

uploadApi.interceptors.response.use(
  (response) => {
    console.log('收到上传响应:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('上传响应错误:', error)
    return Promise.reject(error)
  },
)

export const apiService = {
  // ========== 作业题测试相关接口 ==========

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

  // ========== 单元测试相关接口 ==========

  /**
   * 扫描项目中的类
   * @param directory 项目根路径
   * @returns 类扫描结果
   */
  async scanClasses(directory: string): Promise<ScanClassesResponse> {
    const response = await api.get('/scan_classes', {
      params: { directory },
    })
    return response.data
  },

  /**
   * 扫描项目中的函数
   * @param directory 项目根路径
   * @returns 函数扫描结果
   */
  async scanFunctions(directory: string): Promise<ScanFunctionsResponse> {
    const response = await api.get('/scan_functions', {
      params: { directory },
    })
    return response.data
  },

  /**
   * 运行单元测试
   * @param params 单元测试参数
   * @returns 单元测试结果
   */
  async runUnitTest(params: {
    root: string
    className: string
    methodName: string
    mockConfig: string
    excelFile: File
  }): Promise<UnitTestResults> {
    const formData = new FormData()
    formData.append('root', params.root)
    formData.append('class_name', params.className)
    formData.append('method_name', params.methodName)
    formData.append('mock_config', params.mockConfig)
    formData.append('excel_file', params.excelFile)

    const response = await uploadApi.post('/run_unit_test', formData)
    return response.data
  },
}
