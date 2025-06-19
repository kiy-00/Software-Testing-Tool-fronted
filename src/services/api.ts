import axios from 'axios'
import type {
  HomeworkCodeResponse,
  TestResults,
  ScanClassesResponse,
  ScanFunctionsResponse,
  UnitTestResults,
  IntegrationTestCasesResponse,
  IntegrationTestResults,
  FunctionSourceResponse,
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

    // 打印调试信息
    console.log('=== API请求调试信息 ===')
    console.log('请求URL:', '/api/run_unit_test')
    console.log('FormData内容:')
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, `File(${value.name}, ${value.size} bytes)`)
      } else {
        console.log(`${key}:`, value)
      }
    }

    try {
      const response = await uploadApi.post('/run_unit_test', formData)

      console.log('=== API响应成功 ===')
      console.log('响应状态:', response.status)
      console.log('响应数据:', response.data)

      return response.data
    } catch (error) {
      console.error('=== API请求失败 ===')
      console.error('错误详情:', error)
      if (error.response) {
        console.error('错误状态:', error.response.status)
        console.error('错误数据:', error.response.data)
      }
      throw error
    }
  },

  // ========== 集成测试相关接口 ==========

  /**
   * 获取预定义测试用例
   * @param testType 测试类型
   * @returns 预定义测试用例
   */
  async getIntegrationTestCases(testType: string): Promise<IntegrationTestCasesResponse> {
    const endpointMap: Record<string, string> = {
      add_package: '/admin/test/package_predefined_cases',
      add_plant: '/admin/test/plant_predefined_cases',
      city_input: '/admin/test/city_predefined_cases',
      add_disease: '/admin/test/disease_predefined_cases',
      add_plot: '/plot/test/predefined_cases',
      get_plot_detail: '/plot/test/plot_detail_predefined_cases',
      validate_plot_access: '/detect/test/validate_plot_access_predefined_cases',
      call_get_logs: '/plot/test/call_get_logs_predefined_cases',
      get_plot_by_id: '/plot/test/get_plot_by_id_predefined_cases',
      set_log: '/log/test/set_log_predefined_cases',
    }

    const endpoint = endpointMap[testType]
    if (!endpoint) {
      throw new Error(`未知的测试类型: ${testType}`)
    }

    const response = await api.get(endpoint)
    return response.data
  },

  /**
   * 执行集成测试
   * @param testType 测试类型
   * @param testCases 测试用例
   * @returns 测试结果
   */
  async runIntegrationTest(testType: string, testCases: any[]): Promise<IntegrationTestResults> {
    const endpointMap: Record<string, string> = {
      add_package: '/admin/test/add_package',
      add_plant: '/admin/test/add_plant',
      city_input: '/admin/test/city_input',
      add_disease: '/admin/test/disease_input',
      add_plot: '/plot/test/add_plot',
      get_plot_detail: '/plot/test/get_plot_detail',
      validate_plot_access: '/detect/test/validate_plot_access',
      call_get_logs: '/plot/test/call_get_logs',
      get_plot_by_id: '/plot/test/get_plot_by_id',
      set_log: '/log/test/set_log',
    }

    const endpoint = endpointMap[testType]
    if (!endpoint) {
      throw new Error(`未知的测试类型: ${testType}`)
    }

    const response = await api.post(endpoint, {
      test_cases: testCases,
    })
    return response.data
  },

  /**
   * 自动执行所有预定义测试用例
   * @param testType 测试类型
   * @returns 测试结果
   */
  async runAllIntegrationTests(testType: string): Promise<IntegrationTestResults> {
    const endpointMap: Record<string, string> = {
      add_package: '/admin/test/run_all_package_tests',
      add_plant: '/admin/test/run_all_plant_tests',
      city_input: '/admin/test/run_all_city_tests',
      add_disease: '/admin/test/run_all_disease_tests',
      add_plot: '/plot/test/run_all_tests',
      get_plot_detail: '/plot/test/run_plot_detail_all_tests',
      validate_plot_access: '/detect/test/run_validate_plot_access_all_tests',
      call_get_logs: '/plot/test/run_call_get_logs_all_tests',
      get_plot_by_id: '/plot/test/run_get_plot_by_id_all_tests',
      set_log: '/log/test/run_set_log_all_tests',
    }

    const endpoint = endpointMap[testType]
    if (!endpoint) {
      throw new Error(`未知的测试类型: ${testType}`)
    }

    const response = await api.post(endpoint, {})
    return response.data
  },

  /**
   * 获取函数源代码
   * @param testType 测试类型
   * @returns 函数源代码
   */
  async getFunctionSource(testType: string): Promise<FunctionSourceResponse> {
    const endpointMap: Record<string, string> = {
      validate_plot_access: '/detect/test/function_source',
      call_get_logs: '/plot/test/call_get_logs_function_source',
      get_plot_by_id: '/plot/test/get_plot_by_id_function_source',
      set_log: '/log/test/set_log_function_source',
    }

    const endpoint = endpointMap[testType]
    if (!endpoint) {
      throw new Error(`该测试类型不支持查看源代码: ${testType}`)
    }

    const response = await api.get(endpoint)
    return response.data
  },
}
