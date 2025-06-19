<template>
  <div class="integration-test-container">
    <h2 class="section-title">集成测试</h2>

    <!-- 测试功能选择 -->
    <el-card class="function-selector">
      <template #header>
        <div class="card-header">
          <el-icon><Menu /></el-icon>
          <span>选择测试功能</span>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="测试模块:">
            <el-select
              v-model="selectedModule"
              placeholder="请选择测试模块"
              style="width: 100%"
              @change="onModuleChange"
            >
              <el-option-group label="管理员功能">
                <el-option label="套餐管理" value="add_package" />
                <el-option label="植物管理" value="add_plant" />
                <el-option label="城市导入" value="city_input" />
                <el-option label="病害管理" value="add_disease" />
              </el-option-group>
              <el-option-group label="地块功能">
                <el-option label="地块创建" value="add_plot" />
                <el-option label="地块详情" value="get_plot_detail" />
                <el-option label="地块查询" value="get_plot_by_id" />
              </el-option-group>
              <el-option-group label="检测功能">
                <el-option label="权限验证" value="validate_plot_access" />
                <el-option label="日志获取" value="call_get_logs" />
              </el-option-group>
              <el-option-group label="日志功能">
                <el-option label="日志创建" value="set_log" />
              </el-option-group>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="测试模式:">
            <el-radio-group v-model="testMode" @change="onTestModeChange">
              <el-radio value="predefined">预定义测试</el-radio>
              <el-radio value="custom">自定义测试</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 功能描述 -->
    <el-card v-if="selectedModule" class="function-description">
      <template #header>
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ getFunctionInfo(selectedModule).title }}</span>
        </div>
      </template>

      <p>{{ getFunctionInfo(selectedModule).description }}</p>

      <!-- 查看源代码按钮 -->
      <el-button
        v-if="canViewSource(selectedModule)"
        @click="viewFunctionSource"
        :loading="loadingSource"
        type="info"
        plain
      >
        <template #icon>
          <el-icon><View /></el-icon>
        </template>
        查看函数源代码
      </el-button>
    </el-card>

    <!-- 预定义测试模式 -->
    <div v-if="testMode === 'predefined' && selectedModule">
      <el-card class="test-section">
        <template #header>
          <div class="card-header">
            <el-icon><DataBoard /></el-icon>
            <span>预定义测试用例</span>
          </div>
        </template>

        <div class="test-actions">
          <el-button
            type="primary"
            @click="loadPredefinedCases"
            :loading="loadingCases"
            size="large"
          >
            <template #icon>
              <el-icon><Refresh /></el-icon>
            </template>
            加载预定义测试用例
          </el-button>

          <el-button
            type="success"
            @click="runAllPredefinedTests"
            :loading="runningAllTests"
            :disabled="!predefinedCases.length"
            size="large"
          >
            <template #icon>
              <el-icon><VideoPlay /></el-icon>
            </template>
            执行所有预定义测试
          </el-button>
        </div>

        <!-- 预定义测试用例列表 -->
        <div v-if="predefinedCases.length > 0" class="test-cases-list">
          <h4>测试用例列表 ({{ predefinedCases.length }} 个)</h4>
          <el-table :data="predefinedCases" border style="width: 100%">
            <el-table-column prop="test_id" label="测试ID" width="120" />
            <el-table-column prop="test_purpose" label="测试目的" min-width="150" />
            <el-table-column prop="test_type" label="测试类型" width="120">
              <template #default="scope">
                <el-tag :type="getTestTypeTag(scope.row.test_type)">
                  {{ scope.row.test_type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="expected_status" label="期望状态" width="100" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button
                  size="small"
                  @click="runSingleTest(scope.row)"
                  :loading="runningTests[scope.row.test_id]"
                >
                  执行
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>

    <!-- 自定义测试模式 -->
    <div v-if="testMode === 'custom' && selectedModule">
      <el-card class="test-section">
        <template #header>
          <div class="card-header">
            <el-icon><Edit /></el-icon>
            <span>自定义测试用例</span>
          </div>
        </template>

        <el-form :model="customTestCase" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="测试ID:">
                <el-input v-model="customTestCase.test_id" placeholder="例如: IT_TC_001_001" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="测试目的:">
                <el-input v-model="customTestCase.test_purpose" placeholder="测试目的描述" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="测试类型:">
                <el-select v-model="customTestCase.test_type" style="width: 100%">
                  <el-option label="有效等价类" value="有效等价类" />
                  <el-option label="无效等价类" value="无效等价类" />
                  <el-option label="边界值" value="边界值" />
                  <el-option label="错误处理" value="错误处理" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="期望状态:">
                <el-input v-model="customTestCase.expected_status" placeholder="例如: 200" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 动态参数输入 -->
          <div class="dynamic-params">
            <h4>测试参数:</h4>
            <el-row
              v-for="(param, index) in customTestCase.params"
              :key="index"
              :gutter="10"
              style="margin-bottom: 10px"
            >
              <el-col :span="8">
                <el-input v-model="param.key" placeholder="参数名" />
              </el-col>
              <el-col :span="12">
                <el-input v-model="param.value" placeholder="参数值" />
              </el-col>
              <el-col :span="4">
                <el-button @click="removeParam(index)" type="danger" plain size="small"
                  >删除</el-button
                >
              </el-col>
            </el-row>
            <el-button @click="addParam" type="primary" plain size="small">添加参数</el-button>
          </div>

          <el-form-item style="margin-top: 20px">
            <el-button
              type="primary"
              @click="runCustomTest"
              :loading="runningCustomTest"
              :disabled="!customTestCase.test_id || !customTestCase.test_purpose"
              size="large"
            >
              <template #icon>
                <el-icon><VideoPlay /></el-icon>
              </template>
              执行自定义测试
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 测试结果显示 -->
    <div v-if="testResults" class="test-results">
      <el-divider>测试结果</el-divider>

      <el-card>
        <template #header>
          <div class="card-header">
            <el-icon><TrendCharts /></el-icon>
            <span>执行结果</span>
          </div>
        </template>

        <!-- 结果概览 -->
        <div v-if="testResults.summary" class="result-summary">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">
                {{ testResults.summary.total_cases || testResults.test_results?.length || 1 }}
              </div>
              <div class="summary-label">总测试数</div>
            </div>
            <div class="summary-item">
              <div class="summary-value passed">
                {{ testResults.summary.passed_cases || getPassedCount() }}
              </div>
              <div class="summary-label">通过测试</div>
            </div>
            <div class="summary-item">
              <div class="summary-value failed">
                {{ testResults.summary.failed_cases || getFailedCount() }}
              </div>
              <div class="summary-label">失败测试</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">
                {{ testResults.summary.pass_rate || calculatePassRate() }}
              </div>
              <div class="summary-label">通过率</div>
            </div>
          </div>
        </div>

        <!-- 详细结果 -->
        <div class="detailed-results">
          <h4>详细结果:</h4>

          <!-- 单个测试结果 -->
          <div v-if="!testResults.test_results && testResults.status !== undefined">
            <div
              :class="[
                'test-case',
                testResults.status === 'passed' || testResults.success ? 'passed' : 'failed',
              ]"
            >
              <div class="case-header">
                <span class="case-id">{{ testResults.test_id || '自定义测试' }}</span>
                <el-tag
                  :type="
                    testResults.status === 'passed' || testResults.success ? 'success' : 'danger'
                  "
                >
                  {{
                    testResults.status === 'passed' || testResults.success ? '✅ 通过' : '❌ 失败'
                  }}
                </el-tag>
              </div>
              <div class="case-details">
                <div class="case-detail">
                  <div class="detail-label">响应状态:</div>
                  <div class="detail-value">
                    {{ testResults.actual_status || testResults.status_code }}
                  </div>
                </div>
                <div class="case-detail">
                  <div class="detail-label">响应消息:</div>
                  <div class="detail-value">
                    {{ testResults.actual_message || testResults.message }}
                  </div>
                </div>
                <div v-if="testResults.execution_time" class="case-detail">
                  <div class="detail-label">执行时间:</div>
                  <div class="detail-value">{{ testResults.execution_time }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 多个测试结果 -->
          <div v-else-if="testResults.test_results">
            <div
              v-for="(result, index) in testResults.test_results"
              :key="index"
              :class="[
                'test-case',
                result.status === 'passed' || result.success ? 'passed' : 'failed',
              ]"
            >
              <div class="case-header">
                <span class="case-id">{{ result.test_id || `测试 ${index + 1}` }}</span>
                <el-tag :type="result.status === 'passed' || result.success ? 'success' : 'danger'">
                  {{ result.status === 'passed' || result.success ? '✅ 通过' : '❌ 失败' }}
                </el-tag>
              </div>
              <div class="case-details">
                <div class="case-detail">
                  <div class="detail-label">测试目的:</div>
                  <div class="detail-value">{{ result.test_purpose }}</div>
                </div>
                <div class="case-detail">
                  <div class="detail-label">期望状态:</div>
                  <div class="detail-value">{{ result.expected_status }}</div>
                </div>
                <div class="case-detail">
                  <div class="detail-label">实际状态:</div>
                  <div class="detail-value">{{ result.actual_status }}</div>
                </div>
                <div class="case-detail">
                  <div class="detail-label">响应消息:</div>
                  <div class="detail-value">{{ result.actual_message }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 源代码查看对话框 -->
    <el-dialog
      v-model="sourceDialogVisible"
      title="函数源代码"
      width="70%"
      :close-on-click-modal="false"
    >
      <div v-if="functionSource" class="source-content">
        <el-button
          @click="copySource"
          type="primary"
          plain
          size="small"
          style="margin-bottom: 15px"
        >
          <template #icon>
            <el-icon><CopyDocument /></el-icon>
          </template>
          复制代码
        </el-button>
        <pre><code>{{ functionSource }}</code></pre>
      </div>
      <div v-else class="loading-placeholder">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Menu,
  InfoFilled,
  DataBoard,
  Edit,
  VideoPlay,
  Refresh,
  View,
  TrendCharts,
  CopyDocument,
  Loading,
} from '@element-plus/icons-vue'
import { apiService } from '@/services/api'

// 响应式状态
const selectedModule = ref('')
const testMode = ref('predefined')
const loadingCases = ref(false)
const loadingSource = ref(false)
const runningAllTests = ref(false)
const runningCustomTest = ref(false)
const runningTests = ref<Record<string, boolean>>({})
const sourceDialogVisible = ref(false)

// 数据状态
const predefinedCases = ref<any[]>([])
const testResults = ref<any>(null)
const functionSource = ref('')

// 自定义测试用例
const customTestCase = reactive({
  test_id: '',
  test_purpose: '',
  test_type: '有效等价类',
  expected_status: '200',
  params: [{ key: '', value: '' }],
})

// 功能信息映射
const functionInfoMap: Record<string, { title: string; description: string }> = {
  add_package: {
    title: '套餐创建功能测试',
    description: '测试套餐管理系统中创建新套餐的功能，包括参数验证、数据存储和响应处理。',
  },
  add_plant: {
    title: '植物添加功能测试',
    description: '测试植物管理系统中添加新植物的功能，验证植物信息的完整性和数据一致性。',
  },
  city_input: {
    title: '城市数据导入测试',
    description: '测试从CSV文件导入城市数据的功能，包括文件解析、数据验证和批量插入。',
  },
  add_disease: {
    title: '病害信息添加测试',
    description: '测试病害管理系统中添加病害信息的功能，验证病害与植物的关联关系。',
  },
  add_plot: {
    title: '地块创建功能测试',
    description: '测试地块管理系统中创建新地块的功能，包括地块信息验证和权限检查。',
  },
  get_plot_detail: {
    title: '地块详情查询测试',
    description: '测试获取地块详细信息的功能，验证数据返回的完整性和权限控制。',
  },
  get_plot_by_id: {
    title: '地块ID查询测试',
    description: '测试通过ID查询特定地块信息的功能，验证查询逻辑和异常处理。',
  },
  validate_plot_access: {
    title: '地块访问权限验证测试',
    description: '测试用户对地块访问权限的验证功能，确保数据安全和权限控制正确。',
  },
  call_get_logs: {
    title: '日志获取功能测试',
    description: '测试获取地块相关日志信息的功能，验证日志数据的完整性和时序性。',
  },
  set_log: {
    title: '日志创建功能测试',
    description: '测试创建新日志记录的功能，包括日志信息验证和数据关联性检查。',
  },
}

// 获取功能信息
const getFunctionInfo = (module: string) => {
  return functionInfoMap[module] || { title: '未知功能', description: '暂无描述' }
}

// 判断是否可以查看源代码
const canViewSource = (module: string) => {
  return ['validate_plot_access', 'call_get_logs', 'get_plot_by_id', 'set_log'].includes(module)
}

// 获取测试类型标签
const getTestTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    有效等价类: 'success',
    无效等价类: 'warning',
    边界值: 'info',
    错误处理: 'danger',
  }
  return tagMap[type] || ''
}

// 计算通过测试数量
const getPassedCount = () => {
  if (!testResults.value?.test_results) return testResults.value?.success ? 1 : 0
  return testResults.value.test_results.filter((r: any) => r.status === 'passed' || r.success)
    .length
}

// 计算失败测试数量
const getFailedCount = () => {
  if (!testResults.value?.test_results) return testResults.value?.success ? 0 : 1
  return testResults.value.test_results.filter((r: any) => r.status === 'failed' || !r.success)
    .length
}

// 计算通过率
const calculatePassRate = () => {
  const total = testResults.value?.test_results?.length || 1
  const passed = getPassedCount()
  return `${((passed / total) * 100).toFixed(1)}%`
}

// 模块改变处理
const onModuleChange = () => {
  predefinedCases.value = []
  testResults.value = null
  functionSource.value = ''
}

// 测试模式改变处理
const onTestModeChange = () => {
  testResults.value = null
}

// 加载预定义测试用例
const loadPredefinedCases = async () => {
  if (!selectedModule.value) return

  loadingCases.value = true
  try {
    const response = await apiService.getIntegrationTestCases(selectedModule.value)
    predefinedCases.value = response.test_cases || response.data || []
    ElMessage.success(`加载了 ${predefinedCases.value.length} 个预定义测试用例`)
  } catch (error) {
    console.error('加载测试用例失败:', error)
    ElMessage.error('加载测试用例失败，请检查后端服务')
  } finally {
    loadingCases.value = false
  }
}

// 执行所有预定义测试
const runAllPredefinedTests = async () => {
  if (!selectedModule.value) return

  runningAllTests.value = true
  try {
    const response = await apiService.runAllIntegrationTests(selectedModule.value)
    testResults.value = response
    ElMessage.success('所有预定义测试执行完成')
  } catch (error) {
    console.error('执行测试失败:', error)
    ElMessage.error('执行测试失败，请检查后端服务')
  } finally {
    runningAllTests.value = false
  }
}

// 执行单个测试
const runSingleTest = async (testCase: any) => {
  runningTests.value[testCase.test_id] = true
  try {
    const response = await apiService.runIntegrationTest(selectedModule.value, [testCase])
    testResults.value = response
    ElMessage.success(`测试 ${testCase.test_id} 执行完成`)
  } catch (error) {
    console.error('执行测试失败:', error)
    ElMessage.error('执行测试失败')
  } finally {
    runningTests.value[testCase.test_id] = false
  }
}

// 添加参数
const addParam = () => {
  customTestCase.params.push({ key: '', value: '' })
}

// 删除参数
const removeParam = (index: number) => {
  customTestCase.params.splice(index, 1)
}

// 执行自定义测试
const runCustomTest = async () => {
  runningCustomTest.value = true
  try {
    // 构建测试用例对象
    const testCase: any = {
      test_id: customTestCase.test_id,
      test_purpose: customTestCase.test_purpose,
      test_type: customTestCase.test_type,
      expected_status: customTestCase.expected_status,
    }

    // 添加动态参数
    customTestCase.params.forEach((param) => {
      if (param.key && param.value) {
        testCase[param.key] = param.value
      }
    })

    ElMessage.success('自定义测试执行完成')
  } catch (error) {
    console.error('执行自定义测试失败:', error)
    ElMessage.error('执行自定义测试失败')
  } finally {
    runningCustomTest.value = false
  }
}

// 查看函数源代码
const viewFunctionSource = async () => {
  if (!canViewSource(selectedModule.value)) return

  sourceDialogVisible.value = true
  functionSource.value = ''
  loadingSource.value = true

  try {
    const response = await apiService.getFunctionSource(selectedModule.value)
    functionSource.value = response.source_code || response.code || '无法获取源代码'
  } catch (error) {
    console.error('获取源代码失败:', error)
    functionSource.value = '获取源代码失败，请检查后端服务'
  } finally {
    loadingSource.value = false
  }
}

// 复制源代码
const copySource = () => {
  if (navigator.clipboard && functionSource.value) {
    navigator.clipboard
      .writeText(functionSource.value)
      .then(() => {
        ElMessage.success('源代码已复制到剪贴板')
      })
      .catch(() => {
        ElMessage.error('复制失败')
      })
  }
}
</script>

<style scoped>
.integration-test-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.function-selector {
  margin-bottom: 20px;
}

.function-description {
  margin-bottom: 20px;
}

.test-section {
  margin-bottom: 20px;
}

.test-actions {
  text-align: center;
  margin-bottom: 30px;
}

.test-actions .el-button {
  margin: 0 10px;
}

.test-cases-list {
  margin-top: 20px;
}

.test-cases-list h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.dynamic-params {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.dynamic-params h4 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.test-results {
  margin-top: 30px;
}

.result-summary {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.summary-item {
  text-align: center;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
}

.summary-value.passed {
  color: #67c23a;
}

.summary-value.failed {
  color: #f56c6c;
}

.summary-label {
  color: #7f8c8d;
  font-size: 14px;
  margin-top: 5px;
}

.detailed-results h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.test-case {
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.test-case.passed {
  border-left: 4px solid #67c23a;
}

.test-case.failed {
  border-left: 4px solid #f56c6c;
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.case-id {
  font-weight: bold;
  color: #2c3e50;
}

.case-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  font-size: 14px;
}

.case-detail {
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.detail-label {
  font-weight: bold;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.detail-value {
  color: #2c3e50;
  word-break: break-all;
}

.source-content {
  max-height: 600px;
  overflow-y: auto;
}

.source-content pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.5;
}

.source-content code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.loading-placeholder {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading-placeholder .el-icon {
  font-size: 24px;
  margin-right: 10px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #fafafa;
}

:deep(.el-dialog__body) {
  padding: 20px;
}
</style>
