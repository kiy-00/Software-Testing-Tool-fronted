// ========== 作业题测试相关类型 ==========

// 获取代码接口响应类型
export interface HomeworkCodeResponse {
  success: boolean
  code: string
  message: string
}

// 测试用例结果类型
export interface TestCase {
  ID: number
  Input: string
  Expected: string
  Actual: string
  Passed: boolean
  Duration: string
}

// 测试结果摘要类型
export interface TestSummary {
  total_cases: number
  passed_cases: number
  failed_cases: number
  pass_rate: string
}

// 完整测试结果类型
export interface TestResults {
  success: boolean
  message: string
  function_name: string
  test_method: string
  test_name: string
  description: string
  summary: TestSummary
  test_results: TestCase[]
}

// ========== 单元测试相关类型 ==========

// 方法参数信息
export interface MethodParameter {
  annotation: string
  default: string | null
  kind: string
  name: string
}

// 类信息
export interface ClassInfo {
  [methodName: string]: MethodParameter[]
}

// 扫描类结果
export interface ScanClassesResponse {
  success: boolean
  data: {
    [className: string]: ClassInfo
  }
}

// 函数信息
export interface FunctionInfo {
  name: string
  args: string[]
  async: boolean
}

// 扫描函数结果
export interface ScanFunctionsResponse {
  success: boolean
  data: {
    [moduleName: string]: FunctionInfo[]
  }
}

// 单元测试用例
export interface UnitTestCase {
  ID: number
  Expected: string | any
  Actual: any
  Passed: boolean
  Duration: string
}

// 单元测试结果
export interface UnitTestResults {
  success: boolean
  message: string
  class: string
  method_name: string
  test_method: string
  test_name: string
  description: string
  mock_config: {
    [key: string]: {
      _async_mock?: string
      mock_value: any
      [key: string]: any
    }
  }
  summary: TestSummary
  test_results: UnitTestCase[]
}

// ========== 集成测试相关类型 ==========

// 集成测试用例
export interface IntegrationTestCase {
  test_id: string
  case_id?: string
  test_purpose: string
  test_type: string
  expected_status: number | string
  expected_message?: string
  description?: string
  // 套餐管理相关字段
  packageName?: string
  price?: number
  sumNum?: number
  // 植物管理相关字段
  plantName?: string
  plantFeature?: string
  plantIconURL?: string
  // 城市导入相关字段
  csvURL?: string
  // 病害管理相关字段
  diseaseName?: string
  advice?: string
  // 地块管理相关字段
  plotName?: string
  plotId?: string
  userId?: string
  user_status?: string
  // 日志管理相关字段
  imageURL?: string
  expected_count?: number
  expected_result?: string
  // 动态参数，根据不同的测试类型会有不同的字段
  [key: string]: any
}

// 集成测试用例响应
export interface IntegrationTestCasesResponse {
  success?: boolean
  test_cases?: IntegrationTestCase[]
  data?: IntegrationTestCase[]
  message?: string
}

// 集成测试单个结果
export interface IntegrationTestResult {
  test_id: string
  case_id?: string
  test_purpose?: string
  test_type?: string
  expected_status: number | string
  actual_status: number | string
  expected_message?: string
  actual_message?: string
  passed: boolean
  duration_ms?: number
  duration?: string
  error?: string | null
  input_params?: Record<string, any>
  description?: string
}

// 执行信息
export interface ExecutionInfo {
  start_time: string
  end_time: string
  module: string
  stop_reason?: string | null
  stopped_early: boolean
}

// 类型统计
export interface TypeStatistics {
  [testType: string]: {
    passed: number
    failed: number
    total: number
    pass_rate: string
  }
}

// 集成测试摘要
export interface IntegrationTestSummary {
  module: string
  total_cases: number
  passed_cases: number
  failed_cases: number
  pass_rate: string
  avg_duration_ms: number
  type_statistics: TypeStatistics
  recommendations: string[]
  failed_cases_detail?: any[]
}

// 集成测试结果
export interface IntegrationTestResults {
  success: boolean
  message?: string
  test_module?: string
  test_id?: string
  test_purpose?: string
  test_type?: string
  test_method?: string
  test_name?: string
  description?: string
  status?: 'passed' | 'failed'
  status_code?: number
  actual_status?: number | string
  actual_message?: string
  execution_time?: string
  execution_info?: ExecutionInfo
  summary?: IntegrationTestSummary
  test_results?: IntegrationTestResult[]
  total_cases?: number
}

// 函数源代码信息
export interface SourceInfo {
  function_name: string
  signature: string
  docstring: string
  file_location: string
  line_number: number
  source_code: string
}

// 函数源代码响应
export interface FunctionSourceResponse {
  success?: boolean
  message?: string
  source_info?: SourceInfo
  source_code?: string
  code?: string
}
