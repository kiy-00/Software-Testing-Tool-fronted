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
            <el-table-column prop="test_id" label="测试ID" width="140" />
            <el-table-column prop="case_id" label="用例编号" width="100" />
            <el-table-column prop="test_purpose" label="测试目的" min-width="150" />
            <el-table-column prop="test_type" label="测试类型" width="120">
              <template #default="scope">
                <el-tag
                  :type="getTestTypeTag(scope.row.test_type)"
                  v-if="getTestTypeTag(scope.row.test_type)"
                >
                  {{ scope.row.test_type }}
                </el-tag>
                <el-tag v-else>
                  {{ scope.row.test_type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="expected_status" label="期望状态" width="100" />
            <el-table-column
              prop="expected_message"
              label="期望消息"
              width="150"
              show-overflow-tooltip
            />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button
                  size="small"
                  @click="runSingleTest(scope.row)"
                  :loading="runningTests[getUniqueTestKey(scope.row)]"
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

    <!-- 成功提示 -->
    <div v-if="showSuccessNotification" class="success-notification">
      <div class="notification-content">
        <div class="success-icon">✓</div>
        <div class="message">
          <h3>测试执行成功！</h3>
          <p>{{ successMessage }}</p>
        </div>
        <button @click="closeSuccessNotification" class="close-btn">×</button>
      </div>
    </div>

    <!-- 测试结果显示 -->
    <div v-if="testResults" class="test-results">
      <el-divider>测试结果</el-divider>

      <!-- 调试信息 -->
      <el-card v-if="testResults" class="debug-info" style="margin-bottom: 20px">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>调试信息</span>
          </div>
        </template>
        <div class="debug-content">
          <p><strong>后端响应结构:</strong></p>
          <pre>{{ JSON.stringify(testResults, null, 2) }}</pre>
        </div>
      </el-card>

      <el-card>
        <template #header>
          <div class="card-header">
            <el-icon><TrendCharts /></el-icon>
            <span>执行结果</span>
            <div class="result-status">
              <el-tag v-if="testResults.success" type="success" size="large">
                <el-icon><Check /></el-icon>
                执行成功
              </el-tag>
              <el-tag v-else type="danger" size="large">
                <el-icon><Close /></el-icon>
                执行失败
              </el-tag>
            </div>
          </div>
        </template>

        <!-- 执行信息 -->
        <div v-if="testResults.execution_info" class="execution-info">
          <h4>执行信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">测试模块:</span>
              <span class="value">{{ testResults.execution_info.module }}</span>
            </div>
            <div class="info-item">
              <span class="label">开始时间:</span>
              <span class="value">{{ testResults.execution_info.start_time }}</span>
            </div>
            <div class="info-item">
              <span class="label">结束时间:</span>
              <span class="value">{{ testResults.execution_info.end_time }}</span>
            </div>
            <div class="info-item">
              <span class="label">提前停止:</span>
              <span class="value">{{
                testResults.execution_info.stopped_early ? '是' : '否'
              }}</span>
            </div>
          </div>
        </div>

        <!-- 结果概览 -->
        <div v-if="testResults.summary" class="result-summary">
          <h4>测试统计</h4>
          <div class="summary-grid">
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
            <div class="summary-item">
              <div class="summary-value">
                {{ testResults.summary.avg_duration_ms?.toFixed(2) || 0 }}ms
              </div>
              <div class="summary-label">平均耗时</div>
            </div>
          </div>

          <!-- 测试类型统计 -->
          <div v-if="testResults.summary.type_statistics" class="type-statistics">
            <h5>按类型统计</h5>
            <div class="type-stats-grid">
              <div
                v-for="(stats, type) in testResults.summary.type_statistics"
                :key="type"
                class="type-stat-item"
              >
                <div class="type-name">{{ type }}</div>
                <div class="type-details">
                  <span>总数: {{ stats.total }}</span>
                  <span>通过: {{ stats.passed }}</span>
                  <span>失败: {{ stats.failed }}</span>
                  <span class="pass-rate">通过率: {{ stats.pass_rate }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 推荐建议 -->
          <div v-if="testResults.summary.recommendations?.length" class="recommendations">
            <h5>建议</h5>
            <el-alert
              v-for="(recommendation, index) in testResults.summary.recommendations"
              :key="index"
              :title="recommendation"
              type="info"
              :closable="false"
              style="margin-bottom: 10px"
            />
          </div>
        </div>

        <!-- 详细结果 -->
        <div class="detailed-results">
          <h4>详细结果</h4>

          <!-- 调试：显示 test_results 的信息 -->
          <div
            class="debug-section"
            style="background: #f0f0f0; padding: 10px; margin-bottom: 15px; border-radius: 4px"
          >
            <p><strong>test_results 调试信息:</strong></p>
            <p>存在: {{ testResults.test_results ? '是' : '否' }}</p>
            <p>类型: {{ typeof testResults.test_results }}</p>
            <p>是数组: {{ Array.isArray(testResults.test_results) ? '是' : '否' }}</p>
            <p>长度: {{ testResults.test_results ? testResults.test_results.length : 'N/A' }}</p>
          </div>

          <!-- 兼容多种后端响应格式 -->
          <div
            v-if="
              testResults.test_results &&
              Array.isArray(testResults.test_results) &&
              testResults.test_results.length > 0
            "
          >
            <p>
              <strong>显示 test_results 数组 ({{ testResults.test_results.length }} 个结果)</strong>
            </p>
            <div
              v-for="(result, index) in testResults.test_results"
              :key="index"
              :class="['test-case', result.passed ? 'passed' : 'failed']"
            >
              <div class="case-header">
                <div class="case-title">
                  <span class="case-id">{{ result.test_id || `测试 ${index + 1}` }}</span>
                  <span v-if="result.case_id" class="case-number">[{{ result.case_id }}]</span>
                </div>
                <div class="case-status">
                  <el-tag :type="result.passed ? 'success' : 'danger'">
                    {{ result.passed ? '✅ 通过' : '❌ 失败' }}
                  </el-tag>
                  <span v-if="result.duration_ms" class="duration">
                    {{ result.duration_ms?.toFixed(2) }}ms
                  </span>
                </div>
              </div>

              <div class="case-details">
                <div v-if="result.test_purpose" class="case-detail">
                  <div class="detail-label">测试目的:</div>
                  <div class="detail-value">{{ result.test_purpose }}</div>
                </div>
                <div v-if="result.test_type" class="case-detail">
                  <div class="detail-label">测试类型:</div>
                  <div class="detail-value">
                    <el-tag :type="getTestTypeTag(result.test_type)" size="small">
                      {{ result.test_type }}
                    </el-tag>
                  </div>
                </div>
                <div class="case-detail">
                  <div class="detail-label">期望状态:</div>
                  <div class="detail-value">{{ result.expected_status }}</div>
                </div>
                <div class="case-detail">
                  <div class="detail-label">实际状态:</div>
                  <div
                    class="detail-value"
                    :class="{ 'status-mismatch': result.expected_status != result.actual_status }"
                  >
                    {{ result.actual_status }}
                  </div>
                </div>
                <div v-if="result.expected_message" class="case-detail">
                  <div class="detail-label">期望消息:</div>
                  <div class="detail-value">{{ result.expected_message }}</div>
                </div>
                <div class="case-detail">
                  <div class="detail-label">实际消息:</div>
                  <div class="detail-value">{{ result.actual_message || '无消息' }}</div>
                </div>

                <!-- 输入参数 -->
                <div v-if="result.input_params" class="case-detail full-width">
                  <div class="detail-label">输入参数:</div>
                  <div class="detail-value">
                    <pre class="params-display">{{
                      JSON.stringify(result.input_params, null, 2)
                    }}</pre>
                  </div>
                </div>

                <!-- 错误信息 -->
                <div
                  v-if="result.error && !result.passed"
                  class="case-detail full-width error-detail"
                >
                  <div class="detail-label">错误信息:</div>
                  <div class="detail-value error-message">{{ result.error }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 尝试显示其他可能的结果格式 -->
          <div v-else-if="testResults.results && Array.isArray(testResults.results)">
            <p>
              <strong>显示 results 数组 ({{ testResults.results.length }} 个结果)</strong>
            </p>
            <div
              v-for="(result, index) in testResults.results"
              :key="index"
              :class="['test-case', result.passed || result.success ? 'passed' : 'failed']"
            >
              <div class="case-header">
                <div class="case-title">
                  <span class="case-id">{{
                    result.test_id || result.id || `测试 ${index + 1}`
                  }}</span>
                </div>
                <div class="case-status">
                  <el-tag :type="result.passed || result.success ? 'success' : 'danger'">
                    {{ result.passed || result.success ? '✅ 通过' : '❌ 失败' }}
                  </el-tag>
                </div>
              </div>
              <div class="case-details">
                <div class="case-detail">
                  <div class="detail-label">完整结果:</div>
                  <div class="detail-value">
                    <pre>{{ JSON.stringify(result, null, 2) }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 如果是单个测试结果 -->
          <div
            v-else-if="
              !testResults.test_results &&
              (testResults.status !== undefined || testResults.success !== undefined)
            "
          >
            <p><strong>显示单个测试结果</strong></p>
            <!-- ...existing single test result display logic... -->
          </div>

          <!-- 如果都没有匹配到，显示原始数据 -->
          <div v-else>
            <p><strong>未识别的结果格式，显示原始数据:</strong></p>
            <div class="raw-data">
              <pre>{{ JSON.stringify(testResults, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 源代码查看对话框 -->
    <el-dialog
      v-model="sourceDialogVisible"
      title="函数源代码"
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="functionSourceInfo" class="source-content">
        <!-- 函数信息 -->
        <div class="function-info">
          <div class="info-row">
            <span class="info-label">函数名:</span>
            <span class="info-value">{{ functionSourceInfo.function_name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">签名:</span>
            <span class="info-value">{{ functionSourceInfo.signature }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">文件位置:</span>
            <span class="info-value">{{ functionSourceInfo.file_location }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">行号:</span>
            <span class="info-value">{{ functionSourceInfo.line_number }}</span>
          </div>
          <div v-if="functionSourceInfo.docstring" class="info-row">
            <span class="info-label">文档:</span>
            <span class="info-value">{{ functionSourceInfo.docstring }}</span>
          </div>
        </div>

        <el-divider />

        <!-- 源代码 -->
        <div class="source-code-section">
          <div class="source-header">
            <h4>源代码</h4>
            <el-button @click="copySource" type="primary" plain size="small">
              <template #icon>
                <el-icon><CopyDocument /></el-icon>
              </template>
              复制代码
            </el-button>
          </div>
          <pre><code>{{ functionSourceInfo.source_code }}</code></pre>
        </div>
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
  Check,
  Close,
} from '@element-plus/icons-vue'
import { apiService } from '@/services/api'
import type {
  IntegrationTestCase,
  IntegrationTestResults,
  IntegrationTestResult,
  SourceInfo,
} from '@/types/index'

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
const predefinedCases = ref<IntegrationTestCase[]>([])
const testResults = ref<IntegrationTestResults | null>(null)
const functionSourceInfo = ref<SourceInfo | null>(null)

// 自定义测试用例
const customTestCase = reactive({
  test_id: '',
  test_purpose: '',
  test_type: '有效等价类',
  expected_status: '200',
  params: [{ key: '', value: '' }],
})

// 成功通知相关状态
const showSuccessNotification = ref(false)
const successMessage = ref('')

// 功能信息映射
const functionInfoMap: Record<string, { title: string; description: string }> = {
  add_package: {
    title: '套餐创建功能测试',
    description:
      '测试套餐管理系统中创建新套餐的功能，包括参数验证、数据存储和响应处理。验证套餐名称、价格、数量等字段的有效性检查。',
  },
  add_plant: {
    title: '植物添加功能测试',
    description:
      '测试植物管理系统中添加新植物的功能，验证植物信息的完整性和数据一致性。包括植物名称、特征描述、图标URL等字段验证。',
  },
  city_input: {
    title: '城市数据导入测试',
    description:
      '测试从CSV文件导入城市数据的功能，包括文件解析、数据验证和批量插入。验证CSV文件格式、数据完整性和导入流程。',
  },
  add_disease: {
    title: '病害信息添加测试',
    description:
      '测试病害管理系统中添加病害信息的功能，验证病害与植物的关联关系。包括病害名称、植物名称、处理建议等字段验证。',
  },
  add_plot: {
    title: '地块创建功能测试',
    description:
      '测试地块管理系统中创建新地块的功能，包括地块信息验证和权限检查。验证地块名称、植物关联等参数。',
  },
  get_plot_detail: {
    title: '地块详情查询测试',
    description:
      '测试获取地块详细信息的功能，验证数据返回的完整性和权限控制。包括用户权限验证和数据完整性检查。',
  },
  get_plot_by_id: {
    title: '地块ID查询测试',
    description:
      '测试通过ID查询特定地块信息的功能，验证查询逻辑和异常处理。包括有效ID验证和错误处理机制。',
  },
  validate_plot_access: {
    title: '地块访问权限验证测试',
    description:
      '测试用户对地块访问权限的验证功能，确保数据安全和权限控制正确。验证用户身份认证和地块所有权校验。',
  },
  call_get_logs: {
    title: '日志获取功能测试',
    description:
      '测试获取地块相关日志信息的功能，验证日志数据的完整性和时序性。包括日志数量验证和数据结构检查。',
  },
  set_log: {
    title: '日志创建功能测试',
    description:
      '测试创建新日志记录的功能，包括日志信息验证和数据关联性检查。验证图片URL、病害信息、地块关联等字段。',
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
const getTestTypeTag = (type: string): 'success' | 'warning' | 'info' | 'danger' | '' => {
  const tagMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
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
  return testResults.value.test_results.filter((r: IntegrationTestResult) => r.passed).length
}

// 计算失败测试数量
const getFailedCount = () => {
  if (!testResults.value?.test_results) return testResults.value?.success ? 0 : 1
  return testResults.value.test_results.filter((r: IntegrationTestResult) => !r.passed).length
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
  functionSourceInfo.value = null
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

// 显示成功通知
const showSuccessMessage = (message: string) => {
  successMessage.value = message
  showSuccessNotification.value = true

  // 3秒后自动关闭
  setTimeout(() => {
    showSuccessNotification.value = false
  }, 3000)
}

// 关闭成功通知
const closeSuccessNotification = () => {
  showSuccessNotification.value = false
}

// 检查所有测试是否通过
const checkAllTestsPassed = (results: any): boolean => {
  if (results.test_results && Array.isArray(results.test_results)) {
    return results.test_results.every((result: any) => result.passed === true)
  }
  if (results.summary) {
    return results.summary.failed_cases === 0 && results.summary.passed_cases > 0
  }
  return results.success === true
}

// 执行所有预定义测试
const runAllPredefinedTests = async () => {
  if (!selectedModule.value) return

  runningAllTests.value = true
  try {
    console.log('=== 开始执行所有预定义测试 ===')
    console.log('测试模块:', selectedModule.value)

    const response = await apiService.runAllIntegrationTests(selectedModule.value)

    console.log('=== 后端响应数据 ===')
    console.log('完整响应:', JSON.stringify(response, null, 2))
    console.log('响应类型:', typeof response)
    console.log('test_results 字段:', response.test_results)
    console.log('test_results 类型:', typeof response.test_results)
    console.log('test_results 是否为数组:', Array.isArray(response.test_results))

    testResults.value = response

    // 检查是否所有测试都通过
    const allPassed = checkAllTestsPassed(response)
    if (allPassed) {
      showSuccessMessage(`所有预定义测试执行成功！通过率: ${calculatePassRate()}`)
    }

    ElMessage.success('所有预定义测试执行完成')
  } catch (error) {
    console.error('=== 执行测试失败 ===')
    console.error('错误详情:', error)
    if (error.response) {
      console.error('错误响应:', error.response.data)
    }
    ElMessage.error('执行测试失败，请检查后端服务')
  } finally {
    runningAllTests.value = false
  }
}

// 生成唯一的测试用例标识符
const getUniqueTestKey = (testCase: IntegrationTestCase): string => {
  // 如果有用例编号，使用 测试ID + 用例编号 组合
  if (testCase.case_id) {
    return `${testCase.test_id}_${testCase.case_id}`
  }
  // 如果没有用例编号，但有其他唯一标识符，可以使用其他字段
  if (testCase.test_purpose) {
    return `${testCase.test_id}_${testCase.test_purpose.slice(0, 10)}`
  }
  // 最后回退到测试ID（这种情况下可能会有重复）
  return testCase.test_id
}

// 执行单个测试
const runSingleTest = async (testCase: IntegrationTestCase) => {
  const uniqueKey = getUniqueTestKey(testCase)

  console.log('=== 开始执行单个测试用例 ===')
  console.log('测试用例:', testCase)
  console.log('唯一标识符:', uniqueKey)
  console.log('测试模块:', selectedModule.value)

  runningTests.value[uniqueKey] = true
  try {
    // 只传递当前这一个测试用例
    const response = await apiService.runIntegrationTest(selectedModule.value, [testCase])

    console.log('=== 单个测试响应数据 ===')
    console.log('完整响应:', JSON.stringify(response, null, 2))

    testResults.value = response

    // 检查测试是否通过
    const testPassed = checkAllTestsPassed(response)
    if (testPassed) {
      const displayName = testCase.case_id
        ? `${testCase.test_id} [${testCase.case_id}]`
        : testCase.test_id
      showSuccessMessage(`测试用例 ${displayName} 执行成功！`)
    }

    const displayName = testCase.case_id
      ? `${testCase.test_id} [${testCase.case_id}]`
      : testCase.test_id
    ElMessage.success(`测试用例 ${displayName} 执行完成`)
  } catch (error) {
    console.error('=== 执行单个测试失败 ===')
    console.error('错误详情:', error)
    ElMessage.error('执行测试失败')
  } finally {
    runningTests.value[uniqueKey] = false
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
    const testCase: IntegrationTestCase = {
      test_id: customTestCase.test_id,
      test_purpose: customTestCase.test_purpose,
      test_type: customTestCase.test_type,
      expected_status: parseInt(customTestCase.expected_status) || 200,
    }

    // 添加动态参数
    customTestCase.params.forEach((param) => {
      if (param.key && param.value) {
        testCase[param.key] = param.value
      }
    })

    const response = await apiService.runIntegrationTest(selectedModule.value, [testCase])
    testResults.value = response
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
  functionSourceInfo.value = null
  loadingSource.value = true

  try {
    const response = await apiService.getFunctionSource(selectedModule.value)
    if (response.source_info) {
      functionSourceInfo.value = response.source_info
    } else {
      // 兼容旧格式
      functionSourceInfo.value = {
        function_name: selectedModule.value,
        signature: '',
        docstring: '',
        file_location: '',
        line_number: 0,
        source_code: response.source_code || response.code || '无法获取源代码',
      }
    }
  } catch (error) {
    console.error('获取源代码失败:', error)
    ElMessage.error('获取源代码失败，请检查后端服务')
  } finally {
    loadingSource.value = false
  }
}

// 复制源代码
const copySource = () => {
  const sourceCode = functionSourceInfo.value?.source_code
  if (navigator.clipboard && sourceCode) {
    navigator.clipboard
      .writeText(sourceCode)
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
  justify-content: space-between;
  gap: 8px;
  font-weight: bold;
}

.result-status {
  margin-left: auto;
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

.execution-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.execution-info h4 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-item .label {
  font-weight: bold;
  color: #7f8c8d;
}

.info-item .value {
  color: #2c3e50;
}

.result-summary {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.result-summary h4 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
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

.type-statistics {
  margin-bottom: 20px;
}

.type-statistics h5 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.type-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.type-stat-item {
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  padding: 15px;
}

.type-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.type-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.type-details span {
  color: #7f8c8d;
}

.pass-rate {
  font-weight: bold;
  color: #2c3e50 !important;
}

.recommendations h5 {
  margin-bottom: 10px;
  color: #2c3e50;
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
  margin-bottom: 15px;
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

.case-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.case-id {
  font-weight: bold;
  color: #2c3e50;
}

.case-number {
  color: #7f8c8d;
  font-size: 14px;
}

.case-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.duration {
  color: #7f8c8d;
  font-size: 14px;
}

.case-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  font-size: 14px;
}

.case-detail {
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.case-detail.full-width {
  grid-column: 1 / -1;
}

.case-detail.error-detail {
  background: #fef0f0;
  border-left: 3px solid #f56c6c;
}

.detail-label {
  font-weight: bold;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.detail-value {
  color: #2c3e50;
  word-break: break-word;
}

.detail-value.status-mismatch {
  color: #f56c6c;
  font-weight: bold;
}

.params-display {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  margin: 0;
  white-space: pre-wrap;
}

.error-message {
  color: #f56c6c;
  font-family: monospace;
}

.source-content {
  max-height: 70vh;
  overflow-y: auto;
}

.function-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
  gap: 10px;
}

.info-label {
  font-weight: bold;
  color: #7f8c8d;
  min-width: 80px;
}

.info-value {
  color: #2c3e50;
  flex: 1;
  word-break: break-all;
}

.source-code-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.source-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.source-header h4 {
  margin: 0;
  color: #2c3e50;
}

.source-code-section pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.source-code-section code {
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

:deep(.el-alert) {
  margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .integration-test-container {
    padding: 20px;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .case-details {
    grid-template-columns: 1fr;
  }

  .test-actions {
    text-align: left;
  }

  .test-actions .el-button {
    margin: 5px 0;
    width: 100%;
  }
}

/* 动画效果 */
.test-case {
  transition: all 0.3s ease;
}

.test-case:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.summary-item {
  transition: transform 0.2s ease;
}

.summary-item:hover {
  transform: scale(1.05);
}

/* 滚动条样式 */
.source-content::-webkit-scrollbar {
  width: 8px;
}

.source-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.source-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.success-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  background: #f0f9ff;
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  max-width: 400px;
}

.success-icon {
  background: #10b981;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.message h3 {
  margin: 0 0 4px 0;
  color: #065f46;
  font-size: 16px;
}

.message p {
  margin: 0;
  color: #047857;
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  margin-left: 12px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.debug-info {
  border: 2px dashed #409eff;
}

.debug-content pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.debug-section {
  font-size: 14px;
}

.debug-section p {
  margin: 4px 0;
}

.raw-data pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
  max-height: 400px;
  overflow-y: auto;
}
</style>
