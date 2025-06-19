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
  // 动态参数，根据不同的测试类型会有不同的字段
  [key: string]: any
}

// 集成测试用例响应
export interface IntegrationTestCasesResponse {
  success?: boolean
  test_cases: IntegrationTestCase[]
  data?: IntegrationTestCase[]
  message?: string
}

// 集成测试单个结果
export interface IntegrationTestResult {
  test_id: string
  test_purpose?: string
  test_type?: string
  expected_status: number | string
  actual_status: number | string
  expected_message?: string
  actual_message?: string
  status: 'passed' | 'failed'
  success?: boolean
  execution_time?: string
  duration?: string
  description?: string
  case_id?: string
}

// 集成测试结果
export interface IntegrationTestResults {
  success: boolean
  message: string
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
  summary?: {
    total_cases: number
    passed_cases: number
    failed_cases: number
    pass_rate: string
  }
  test_results?: IntegrationTestResult[]
}

// 函数源代码响应
export interface FunctionSourceResponse {
  success?: boolean
  source_code?: string
  code?: string
  message?: string
}
