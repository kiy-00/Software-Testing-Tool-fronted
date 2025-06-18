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
