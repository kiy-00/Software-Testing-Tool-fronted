<template>
  <div class="system-test-container">
    <h2 class="section-title">系统测试</h2>
    <!-- 测试配置 -->
    <el-card class="config-section">
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span>测试配置</span>
          <div class="config-actions">
            <el-button
              @click="validateEnvironment"
              :loading="validatingEnv"
              type="info"
              plain
              size="small"
            >
              <template #icon>
                <el-icon><View /></el-icon>
              </template>
              验证环境
            </el-button>
            <el-button @click="cleanupFiles" type="warning" plain size="small">
              <template #icon>
                <el-icon><Delete /></el-icon>
              </template>
              清理文件
            </el-button>
          </div>
        </div>
      </template>
      <el-form :model="testConfig" label-width="120px" size="small">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="基础URL:">
              <el-input v-model="testConfig.base_url" placeholder="http://localhost:8100" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="测试用户名:">
              <el-input v-model="testConfig.test_username" placeholder="test_user" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="测试密码:">
              <el-input
                v-model="testConfig.test_password"
                type="password"
                placeholder="test_pass"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="无头模式:">
              <el-switch v-model="testConfig.headless" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="超时时间(秒):">
              <el-input-number v-model="testConfig.timeout" :min="10" :max="600" :step="10" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-button @click="runAllTests" :loading="runningBatch" type="success" size="large">
                <template #icon>
                  <el-icon><VideoPlay /></el-icon>
                </template>
                执行所有可用测试
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 测试用例分类展示 -->
    <div class="test-categories">
      <!-- 系统级功能测试 -->
      <el-card class="category-card">
        <template #header>
          <div class="category-header">
            <el-icon><DataBoard /></el-icon>
            <span>系统级功能测试用例</span>
            <el-tag type="info" size="small">5个用例</el-tag>
          </div>
        </template>

        <div class="test-cases-grid">
          <div
            v-for="testCase in functionalTestCases"
            :key="testCase.test_id"
            :class="[
              'test-case-card',
              { executable: testCase.executable, running: runningTests[testCase.test_id] },
            ]"
            @click="handleTestCaseClick(testCase)"
          >
            <div class="case-header">
              <div class="case-info">
                <h4>{{ testCase.test_id }}</h4>
                <p class="case-title">{{ testCase.test_name }}</p>
              </div>
              <div class="case-status">
                <el-tag type="success" size="small">可执行</el-tag>
                <el-icon v-if="runningTests[testCase.test_id]" class="loading-icon">
                  <Loading />
                </el-icon>
              </div>
            </div>

            <div class="case-content">
              <p><strong>测试目的:</strong> {{ testCase.test_purpose }}</p>
              <p><strong>测试方法:</strong> {{ testCase.test_method || '场景法' }}</p>
              <p>
                <strong>前置条件:</strong>
                {{ testCase.precondition || testCase.description || '用户已注册并有权限' }}
              </p>

              <div class="test-steps">
                <strong>测试步骤:</strong>
                <ol>
                  <li v-for="step in testCase.test_steps" :key="step">{{ step }}</li>
                </ol>
              </div>

              <p><strong>预期结果:</strong> {{ testCase.expected_result }}</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 系统业务流测试 -->
      <el-card class="category-card">
        <template #header>
          <div class="category-header">
            <el-icon><Connection /></el-icon>
            <span>系统业务流测试用例</span>
            <el-tag type="warning" size="small">5个用例</el-tag>
          </div>
        </template>

        <div class="test-cases-grid">
          <div
            v-for="testCase in businessFlowTestCases"
            :key="testCase.test_id"
            :class="['test-case-card', 'executable']"
            @click="handleTestCaseClick(testCase)"
          >
            <div class="case-header">
              <div class="case-info">
                <h4>{{ testCase.test_id }}</h4>
                <p class="case-title">{{ testCase.test_name }}</p>
              </div>
              <div class="case-status">
                <el-tag type="success" size="small">可执行</el-tag>
              </div>
            </div>

            <div class="case-content">
              <p><strong>测试目的:</strong> {{ testCase.test_purpose }}</p>
              <p><strong>测试方法:</strong> {{ testCase.test_method }}</p>
              <p><strong>前置条件:</strong> {{ testCase.precondition || '无' }}</p>

              <div class="test-steps">
                <strong>测试步骤:</strong>
                <ol>
                  <li v-for="step in testCase.test_steps" :key="step">{{ step }}</li>
                </ol>
              </div>

              <p><strong>预期结果:</strong> {{ testCase.expected_result }}</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 系统接口测试 -->
      <el-card class="category-card">
        <template #header>
          <div class="category-header">
            <el-icon><Link /></el-icon>
            <span>系统级接口测试用例</span>
            <el-tag type="danger" size="small">5个用例</el-tag>
          </div>
        </template>

        <div class="test-cases-grid">
          <div
            v-for="testCase in interfaceTestCases"
            :key="testCase.test_id"
            :class="['test-case-card', 'executable']"
            @click="handleTestCaseClick(testCase)"
          >
            <div class="case-header">
              <div class="case-info">
                <h4>{{ testCase.test_id }}</h4>
                <p class="case-title">{{ testCase.test_name }}</p>
              </div>
              <div class="case-status">
                <el-tag type="success" size="small">可执行</el-tag>
              </div>
            </div>

            <div class="case-content">
              <p><strong>测试目的:</strong> {{ testCase.test_purpose }}</p>
              <p><strong>测试方法:</strong> {{ testCase.test_method }}</p>
              <p><strong>前置条件:</strong> {{ testCase.precondition }}</p>

              <div class="test-steps">
                <strong>测试步骤:</strong>
                <ol>
                  <li v-for="step in testCase.test_steps" :key="step">{{ step }}</li>
                </ol>
              </div>

              <p><strong>预期结果:</strong> {{ testCase.expected_result }}</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 测试结果显示 -->
    <div v-if="testResults.length > 0" class="test-results">
      <el-divider>测试执行结果</el-divider>

      <!-- 批量测试结果概览 -->
      <el-card v-if="batchTestReport" class="batch-results">
        <template #header>
          <div class="card-header">
            <el-icon><TrendCharts /></el-icon>
            <span>批量测试报告</span>
            <div class="batch-status">
              <el-tag :type="getBatchStatusType()" size="large">
                {{ getBatchStatusText() }}
              </el-tag>
            </div>
          </div>
        </template>

        <div class="batch-summary">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">{{ batchTestReport.summary.total_tests }}</div>
              <div class="summary-label">总测试数</div>
            </div>
            <div class="summary-item">
              <div class="summary-value passed">{{ batchTestReport.summary.passed_tests }}</div>
              <div class="summary-label">通过测试</div>
            </div>
            <div class="summary-item">
              <div class="summary-value failed">{{ batchTestReport.summary.failed_tests }}</div>
              <div class="summary-label">失败测试</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">{{ batchTestReport.summary.pass_rate.toFixed(1) }}%</div>
              <div class="summary-label">通过率</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">
                {{ formatExecutionTime(batchTestReport.summary.total_execution_time) }}
              </div>
              <div class="summary-label">总执行时间</div>
            </div>
          </div>

          <!-- 失败分析 -->
          <div
            v-if="Object.keys(batchTestReport.failure_analysis.failed_by_type).length > 0"
            class="failure-analysis"
          >
            <h4>失败类型分析</h4>
            <div class="failure-types">
              <el-tag
                v-for="(count, type) in batchTestReport.failure_analysis.failed_by_type"
                :key="type"
                type="danger"
                style="margin-right: 10px; margin-bottom: 5px"
              >
                {{ type }}: {{ count }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 单个测试结果详情 -->
      <el-card v-for="(result, index) in testResults" :key="index" class="test-result-card">
        <template #header>
          <div class="result-header">
            <div class="result-info">
              <h3>{{ result.test_name }}</h3>
              <span class="test-id">{{ result.test_id }}</span>
            </div>
            <div class="result-status">
              <el-tag :type="result.status === 'PASSED' ? 'success' : 'danger'" size="large">
                {{ result.status === 'PASSED' ? '✅ 通过' : '❌ 失败' }}
              </el-tag>
              <span class="execution-time">{{ formatExecutionTime(result.execution_time) }}</span>
            </div>
          </div>
        </template>

        <!-- 执行步骤 -->
        <div class="test-steps-result">
          <h4>执行步骤</h4>
          <div class="steps-timeline">
            <div
              v-for="(step, stepIndex) in result.steps"
              :key="stepIndex"
              :class="['step-item', getStepStatusClass(step.status)]"
            >
              <div class="step-marker">
                <el-icon v-if="step.status === '成功' || step.status === 'success'">
                  <Check />
                </el-icon>
                <el-icon v-else-if="step.status === '失败' || step.status === 'failed'">
                  <Close />
                </el-icon>
                <el-icon v-else class="is-loading">
                  <Loading />
                </el-icon>
              </div>
              <div class="step-content">
                <div class="step-name">{{ step.step_name }}</div>
                <div class="step-time">{{ step.timestamp }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 特定测试类型的额外信息 -->
        <div v-if="result.weather_data" class="weather-data">
          <h4>天气信息验证结果</h4>
          <div class="weather-info">
            <el-descriptions border size="small">
              <el-descriptions-item label="标题">{{
                result.weather_data.title
              }}</el-descriptions-item>
              <el-descriptions-item label="温度">{{
                result.weather_data.temperature
              }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{
                result.weather_data.status
              }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <div v-if="result.log_data" class="log-data">
          <h4>日志验证结果</h4>
          <div class="log-summary">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-statistic title="日志总数" :value="result.log_data.log_count" />
              </el-col>
              <el-col :span="8">
                <el-statistic title="有效日志" :value="result.log_data.validation.valid_logs" />
              </el-col>
              <el-col :span="8">
                <el-statistic
                  title="相关内容"
                  :value="result.log_data.validation.content_analysis.relevant_content"
                />
              </el-col>
            </el-row>

            <div v-if="result.log_data.logs.length > 0" class="log-entries">
              <h5>日志条目预览 (最新3条)</h5>
              <div
                v-for="(log, logIndex) in result.log_data.logs.slice(0, 3)"
                :key="logIndex"
                class="log-entry"
              >
                <div class="log-content">{{ log.content }}</div>
                <div class="log-time">{{ log.timestamp || '时间戳解析中' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="result.error_message" class="error-section">
          <h4>错误信息</h4>
          <el-alert type="error" :closable="false">
            <template #title>
              <span class="error-title">测试执行失败</span>
            </template>
            <div class="error-content">{{ result.error_message }}</div>
          </el-alert>
        </div>

        <!-- 截图信息 -->
        <div v-if="result.screenshots && result.screenshots.length > 0" class="screenshots">
          <h4>执行截图</h4>
          <div class="screenshot-list">
            <el-tag
              v-for="(screenshot, screenshotIndex) in result.screenshots"
              :key="screenshotIndex"
              type="info"
              style="margin-right: 10px"
            >
              截图 {{ screenshotIndex + 1 }}: {{ screenshot.split('/').pop() }}
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 环境验证对话框 -->
    <el-dialog
      v-model="envDialogVisible"
      title="测试环境验证"
      width="60%"
      :close-on-click-modal="false"
    >
      <div v-if="environmentStatus" class="environment-status">
        <div class="env-summary">
          <el-alert
            :type="environmentStatus.environment_ready ? 'success' : 'warning'"
            :closable="false"
            show-icon
          >
            <template #title>
              {{ environmentStatus.environment_ready ? '环境验证通过' : '环境验证失败' }}
            </template>
            <div v-if="!environmentStatus.environment_ready">
              测试环境存在问题，请按照建议进行修复
            </div>
          </el-alert>
        </div>

        <el-descriptions border column="2" style="margin-top: 20px">
          <el-descriptions-item label="Chrome浏览器">
            <el-tag :type="environmentStatus.chrome_available ? 'success' : 'danger'">
              {{ environmentStatus.chrome_available ? '已安装' : '未安装' }}
            </el-tag>
            <span v-if="environmentStatus.chrome_version" style="margin-left: 10px">
              {{ environmentStatus.chrome_version }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="ChromeDriver">
            <el-tag :type="environmentStatus.chromedriver_available ? 'success' : 'danger'">
              {{ environmentStatus.chromedriver_available ? '已安装' : '未安装' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="PIL库">
            <el-tag :type="environmentStatus.pil_available ? 'success' : 'info'">
              {{ environmentStatus.pil_available ? '已安装' : '未安装' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="环境状态">
            <el-tag :type="environmentStatus.environment_ready ? 'success' : 'danger'">
              {{ environmentStatus.environment_ready ? '就绪' : '未就绪' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="environmentStatus.recommendations?.length > 0" class="recommendations">
          <h4>建议</h4>
          <ul>
            <li v-for="(rec, index) in environmentStatus.recommendations" :key="index">
              {{ rec }}
            </li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  View,
  Delete,
  VideoPlay,
  DataBoard,
  Connection,
  Link,
  TrendCharts,
  Check,
  Close,
  Loading,
} from '@element-plus/icons-vue'
import { apiService } from '@/services/api'
import type {
  SystemTestCase,
  SystemTestResult,
  BatchTestReport,
  EnvironmentValidation,
} from '@/types/api'

// 响应式状态
const testConfig = reactive({
  base_url: 'http://localhost:8100',
  test_username: 'Jelly',
  test_password: 'lyy3366291',
  headless: false,
  timeout: 300,
})

const runningTests = ref<Record<string, boolean>>({})
const runningBatch = ref(false)
const validatingEnv = ref(false)
const envDialogVisible = ref(false)
const environmentStatus = ref<EnvironmentValidation | null>(null)

const testResults = ref<SystemTestResult[]>([])
const batchTestReport = ref<BatchTestReport | null>(null)

// 系统级功能测试用例（包含可执行和仅展示的）
const functionalTestCases = ref<
  Array<
    SystemTestCase & {
      executable: boolean
      test_method?: string
      precondition?: string
      description?: string
    }
  >
>([
  {
    test_id: 'Pguard_Sys_Test_case_fun_001',
    test_name: '用户进行地块检测',
    test_purpose: '验证用户从登录到完成地块检测的完整业务流程',
    test_type: '端到端测试',
    test_method: '场景法',
    precondition: '用户已注册账户且至少有一个地块',
    test_steps: [
      '用户访问网站',
      '用户输入用户名密码并登录，系统跳转到首页',
      '用户打开地块，系统跳转到地块详细信息',
      '用户点击"病害检测"，系统弹出选项框，选择图片',
      '用户提交图片',
    ],
    expected_result: '检测成功，返回结果',
    executable: true,
  },
  {
    test_id: 'Pguard_Sys_Test_case_fun_002',
    test_name: '用户查看天气信息',
    test_purpose: '验证用户登录后能够查看当地天气信息',
    test_type: '端到端测试',
    test_method: '场景法',
    precondition: '用户已有账户',
    test_steps: [
      '用户访问网站',
      '用户输入用户名密码并登录，系统跳转到首页',
      '系统自动获取用户当地天气信息',
    ],
    expected_result: '显示用户当地天气信息',
    executable: true,
  },
  {
    test_id: 'Pguard_Sys_Test_case_fun_003',
    test_name: '用户创建地块',
    test_purpose: '验证用户创建新地块的功能',
    test_type: '端到端测试',
    test_method: '场景法',
    precondition: '用户已有账户',
    test_steps: [
      '用户访问网站',
      '用户输入用户名密码并登录，系统跳转到首页',
      '用户点击"新建地块"，系统弹出弹窗',
      '用户选择地块植物种类并提交',
    ],
    expected_result: '创建地块成功',
    executable: true,
  },
  {
    test_id: 'Pguard_Sys_Test_case_fun_004',
    test_name: '用户查看检测日志',
    test_purpose: '验证用户能够查看地块的历史检测日志',
    test_type: '端到端测试',
    test_method: '场景法',
    precondition: '用户已有账户、已有地块、至少有一次检测',
    test_steps: [
      '用户访问网站',
      '用户输入用户名密码并登录，系统跳转到首页',
      '用户打开地块，系统跳转到地块详细信息',
    ],
    expected_result: '显示检测日志',
    executable: true,
  },
  {
    test_id: 'Pguard_Sys_Test_case_fun_005',
    test_name: '用户注册账户',
    test_purpose: '验证新用户注册功能的完整流程',
    test_type: '端到端测试',
    test_method: '场景法',
    precondition: '无',
    test_steps: [
      '用户访问网站',
      '用户点击注册，系统跳转到注册页',
      '用户输入用户名密码',
      '用户输入城市，系统搜索城市列表',
      '用户选择城市并提交',
    ],
    expected_result: '注册成功',
    executable: true,
  },
])

// 系统业务流测试用例（仅展示）
const businessFlowTestCases = ref<
  Array<SystemTestCase & { test_method: string; precondition: string }>
>([
  {
    test_id: 'Pguard_Sys_Test_case_business_001',
    test_name: '未注册用户完成注册并登录系统',
    test_purpose: '验证完整的用户注册和登录业务流程',
    test_type: '业务流测试',
    test_method: '场景法 + 等价类划分',
    precondition: '无',
    test_steps: [
      '用户访问网站',
      '点击"注册"按钮，跳转至注册页面',
      '填写有效用户名/密码/所在地，表单验证通过',
      '点击"提交注册"，显示"注册成功"提示',
      '自动跳转至登录页面，用户可正常填写用户名、密码进行登录',
      '用户填写正确的用户名和密码并点击登录按钮',
    ],
    expected_result: '用户成功登录，进入系统主界面',
  },
  {
    test_id: 'Pguard_Sys_Test_case_business_002',
    test_name: '用户完整的病害检测业务流',
    test_purpose: '验证从获取地块列表到完成病害检测的完整业务流程',
    test_type: '业务流测试',
    test_method: '状态迁移法 + 场景法',
    precondition: '用户已登录且已创建地块',
    test_steps: [
      '用户在主界面查看地块列表',
      'GET /plot 请求获取地块列表，返回地块信息包含plotId、plotName、plantName、plantIconURL',
      'POST /plot/{plotId}/detect 上传图片文件，文件验证通过，开始检测处理',
      'YOLO模型处理图片，返回disease、confidence检测结果',
      '系统自动获取防治建议并记录日志',
    ],
    expected_result:
      '用户获得完整的病害检测结果，包括病害名称、置信度、防治建议，系统自动生成检测日志',
  },
  {
    test_id: 'Pguard_Sys_Test_case_business_003',
    test_name: '用户充值套餐到获取统计分析的完整流',
    test_purpose: '验证用户充值套餐并获取统计分析报告的完整业务流程',
    test_type: '业务流测试',
    test_method: '端到端场景法',
    precondition: '用户已登录，sumCount为0，已有历史检测数据',
    test_steps: [
      '用户尝试GET /summary获取统计报告',
      '系统检查user.sumCount，返回400错误"余额不足，请充值"',
      'GET /package 获取套餐列表，返回可购买的套餐信息',
      'POST /recharge/{package_id} 购买套餐，user.sumCount增加，返回充值成功信息',
      '重新GET /summary 获取统计报告',
    ],
    expected_result: '用户成功充值并获取统计分析报告，包含地块统计、病害趋势、预测建议等完整信息',
  },
  {
    test_id: 'Pguard_Sys_Test_case_business_004',
    test_name: '地块完整生命周期管理业务流',
    test_purpose: '验证地块从创建到删除的完整生命周期管理',
    test_type: '业务流测试',
    test_method: '状态迁移法',
    precondition: '用户已登录',
    test_steps: [
      '用户查看可用植物类型',
      'GET /plot/plant 获取植物列表，返回系统支持的植物名称列表',
      'POST /plot/add 创建地块{plotName, plantName}，成功创建地块，返回plotId和创建信息',
      'GET /plot/{plotId} 查看地块详情，返回PlotDetails包含logs、plantFeature等详细信息',
      'DELETE /plot/{plotId} 删除地块',
    ],
    expected_result: '完成地块从创建到删除的完整生命周期，验证地块管理功能的完整性',
  },
  {
    test_id: 'Pguard_Sys_Test_case_business_005',
    test_name: '用户城市定位和信息管理业务流',
    test_purpose: '验证用户城市信息搜索、更新和管理的完整业务流程',
    test_type: '业务流测试',
    test_method: '综合场景法',
    precondition: '用户已登录，系统已导入城市数据',
    test_steps: [
      '用户搜索城市信息',
      'GET /city/{keyword} 搜索城市，返回匹配的城市列表包含cityName和cityCode',
      'GET /city 获取用户城市，根据user.location返回对应城市信息',
      'PATCH /update 更新用户信息，验证新location并更新用户信息',
      'GET /me 获取用户信息',
    ],
    expected_result: '用户成功搜索城市、更新位置信息，系统正确关联城市数据',
  },
])

// 系统级接口测试用例（仅展示）
const interfaceTestCases = ref<
  Array<SystemTestCase & { test_method: string; precondition: string }>
>([
  {
    test_id: 'Pguard_Sys_Test_case_interface_001',
    test_name: '用户认证接口集成测试',
    test_purpose: '验证用户认证相关接口的集成功能',
    test_type: '接口测试',
    test_method: '边界值分析 + 等价类划分',
    precondition: '系统正常运行，数据库包含测试用户数据',
    test_steps: [
      '前端发送登录请求',
      'POST /signin {userName:"Jelly", password:"lyy3366291"}，返回200和access_token、refresh_token',
      '使用无效用户名登录，返回400 "用户不存在"',
      '使用错误密码登录，返回400 "密码错误"',
      'POST /refresh 刷新token',
    ],
    expected_result: '认证接口正确处理各种登录场景，token刷新机制正常工作',
  },
  {
    test_id: 'Pguard_Sys_Test_case_interface_002',
    test_name: '图像检测接口端到端数据流测试',
    test_purpose: '验证图像上传到检测结果返回的完整数据流',
    test_type: '接口测试',
    test_method: '数据流测试 + 文件处理测试',
    precondition: '用户已登录，地块已创建，YOLO模型正常加载',
    test_steps: [
      '上传.jpg格式图片文件',
      'POST /plot/{plotId}/detect 上传图片，文件格式验证通过，保存到指定路径',
      '调用detect()函数处理图片，YOLO模型返回disease和confidence结果',
      'get_advice()获取防治建议，从Disease表获取对应advice内容',
      'call_set_log()记录检测日志',
    ],
    expected_result:
      '图像从上传到检测结果存储的完整链路正常，返回包含diseaseName、advice、percent、imageURL的结果',
  },
  {
    test_id: 'Pguard_Sys_Test_case_interface_003',
    test_name: '管理员数据导入接口测试',
    test_purpose: '验证管理员CSV数据导入接口的功能',
    test_type: '接口测试',
    test_method: '批量数据处理测试',
    precondition: '具有管理员权限，CSV文件格式正确',
    test_steps: [
      '管理员上传城市数据CSV',
      'POST /admin/weather/city_input?csvURL=amap.csv，validate_city_file()验证文件格式',
      '读取CSV文件内容，解析城市名称和代码数据',
      'City.all().delete() 清空现有数据，旧数据清理完成',
      'City.bulk_create() 批量插入',
    ],
    expected_result: 'CSV数据成功导入数据库，城市信息可正常被用户搜索和使用',
  },
  {
    test_id: 'Pguard_Sys_Test_case_interface_004',
    test_name: '跨service层数据一致性测试',
    test_purpose: '验证不同服务层之间的数据一致性',
    test_type: '接口测试',
    test_method: '数据一致性测试 + 事务完整性测试',
    precondition: '用户已登录，系统各service模块正常运行',
    test_steps: [
      'service.plot.add_plot()创建地块',
      '验证Plant.get(plantName)存在，Plot.create()成功创建地块记录',
      'service.detect.do_detect()检测病害，validate_plot_access()验证用户权限通过',
      'call_set_log()创建检测日志，Log表中新增记录关联plotId',
      'service.log.get_summary()获取统计',
    ],
    expected_result: '各service层间数据传递一致，用户操作在所有相关模块中都正确体现',
  },
  {
    test_id: 'Pguard_Sys_Test_case_interface_005',
    test_name: '文件系统和数据库接口协调测试',
    test_purpose: '验证文件系统与数据库之间的协调一致性',
    test_type: '接口测试',
    test_method: '存储一致性测试',
    precondition: '文件系统权限正常，数据库连接稳定',
    test_steps: [
      '上传检测图片文件',
      '生成uuid文件名保存到/resource/log/，文件物理存储成功',
      '数据库记录imageURL路径，Log表中imagesURL字段记录正确路径',
      'GET /plot/{plotId}获取地块详情，logs数组包含正确的图片URL',
      'validate_image_file()验证图片',
    ],
    expected_result: '文件存储和数据库记录保持一致，图片文件可通过URL正常访问',
  },
])

// API映射：将功能测试用例ID映射到对应的API调用
const executableTestsMap: Record<string, string> = {
  Pguard_Sys_Test_case_fun_001: 'plot_detection',
  Pguard_Sys_Test_case_fun_002: 'weather_info',
  Pguard_Sys_Test_case_fun_003: 'plot_management', // 新增这一行
  Pguard_Sys_Test_case_fun_004: 'plot_logs',
}

// 组件初始化
onMounted(() => {
  // 可以在这里加载一些初始数据
})

// 处理测试用例点击
const handleTestCaseClick = async (testCase: any) => {
  // 检查是否为真正可执行的测试用例
  if (!executableTestsMap[testCase.test_id]) {
    ElMessage.info('此测试用例暂未实现，敬请期待后续版本')
    return
  }

  if (runningTests.value[testCase.test_id]) {
    ElMessage.warning('测试正在执行中，请稍候')
    return
  }

  // 验证测试配置
  if (!testConfig.base_url || !testConfig.test_username || !testConfig.test_password) {
    ElMessage.error('请先完善测试配置信息')
    return
  }

  try {
    runningTests.value[testCase.test_id] = true

    const apiType = executableTestsMap[testCase.test_id]
    let result: any

    switch (apiType) {
      case 'plot_detection':
        result = await apiService.runPlotDetectionTest(testConfig, {
          image_path: 'test_data/disease_sample.jpg',
        })
        break
      case 'weather_info':
        result = await apiService.runWeatherInfoTest(testConfig)
        break
      case 'plot_management':
        result = await apiService.runPlotManagementTest(testConfig)
        break
      case 'plot_logs':
        result = await apiService.runPlotLogsTest(testConfig)
        break
      default:
        ElMessage.error('未知的测试类型')
        return
    }

    if (result.success) {
      testResults.value.unshift(result.data)
      ElMessage.success(`测试 ${testCase.test_name} 执行成功`)
    } else {
      ElMessage.error(`测试 ${testCase.test_name} 执行失败: ${result.message}`)
    }
  } catch (error: any) {
    console.error('测试执行失败:', error)
    ElMessage.error(`测试执行失败: ${error.message || '未知错误'}`)
  } finally {
    runningTests.value[testCase.test_id] = false
  }
}

// 执行所有可用测试
const runAllTests = async () => {
  if (!testConfig.base_url || !testConfig.test_username || !testConfig.test_password) {
    ElMessage.error('请先完善测试配置信息')
    return
  }

  try {
    runningBatch.value = true

    const result = await apiService.runBatchE2ETests(
      testConfig,
      { image_path: 'test_data/disease_sample.jpg' },
      ['plot_detection', 'weather_info', 'plot_management', 'plot_logs'],
    )

    if (result.success) {
      batchTestReport.value = result.data

      // 将批量测试结果中的各个测试结果添加到testResults中
      if (result.data.test_results) {
        const newResults = result.data.test_results.map((testResult) => ({
          test_id: getTestIdFromType(testResult.test_type),
          test_name: getTestNameFromType(testResult.test_type),
          start_time: testResult.start_time || '',
          end_time: testResult.end_time || '',
          status: testResult.status,
          steps: [],
          execution_time: testResult.execution_time,
          error_message: testResult.error_message,
          message: testResult.message,
        }))

        testResults.value = newResults.concat(testResults.value)
      }

      ElMessage.success(`批量测试执行完成，通过率: ${result.data.summary.pass_rate.toFixed(1)}%`)
    } else {
      ElMessage.error(`批量测试执行失败: ${result.message}`)
    }
  } catch (error: any) {
    console.error('批量测试执行失败:', error)
    ElMessage.error(`批量测试执行失败: ${error.message || '未知错误'}`)
  } finally {
    runningBatch.value = false
  }
}

// 验证测试环境
const validateEnvironment = async () => {
  try {
    validatingEnv.value = true
    const result = await apiService.validateTestEnvironment()

    if (result.success) {
      environmentStatus.value = result.data
      envDialogVisible.value = true

      if (result.data.environment_ready) {
        ElMessage.success('测试环境验证通过')
      } else {
        ElMessage.warning('测试环境存在问题，请查看详细信息')
      }
    } else {
      ElMessage.error(`环境验证失败: ${result.message}`)
    }
  } catch (error: any) {
    console.error('环境验证失败:', error)
    ElMessage.error(`环境验证失败: ${error.message || '未知错误'}`)
  } finally {
    validatingEnv.value = false
  }
}

// 清理测试文件
const cleanupFiles = async () => {
  try {
    await ElMessageBox.confirm('确定要清理测试文件吗？这将删除旧的截图和临时文件。', '确认清理', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const result = await apiService.cleanupTestFiles(5)
    if (result.success) {
      ElMessage.success('测试文件清理完成')
    } else {
      ElMessage.error(`清理失败: ${result.message}`)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('清理文件失败:', error)
      ElMessage.error(`清理文件失败: ${error.message || '未知错误'}`)
    }
  }
}

// 辅助函数
const formatExecutionTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds.toFixed(1)}秒`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小时${minutes}分`
  }
}

const getBatchStatusType = (): string => {
  if (!batchTestReport.value) return 'info'
  const passRate = batchTestReport.value.summary.pass_rate
  if (passRate === 100) return 'success'
  if (passRate >= 50) return 'warning'
  return 'danger'
}

const getBatchStatusText = (): string => {
  if (!batchTestReport.value) return '未执行'
  const passRate = batchTestReport.value.summary.pass_rate
  if (passRate === 100) return '全部通过'
  if (passRate >= 50) return '部分通过'
  return '大部分失败'
}

const getStepStatusClass = (status: string): string => {
  const normalizedStatus = status.toLowerCase()
  if (normalizedStatus.includes('成功') || normalizedStatus.includes('success')) {
    return 'success'
  } else if (normalizedStatus.includes('失败') || normalizedStatus.includes('failed')) {
    return 'failed'
  } else {
    return 'running'
  }
}

const getTestIdFromType = (testType: string): string => {
  const typeMap: Record<string, string> = {
    plot_detection: 'E2E_TC_001',
    weather_info: 'Pguard_Sys_Test_case_fun_002',
    plot_management: 'E2E_TC_003', // 新增这一行
    plot_logs: 'E2E_TC_004',
  }
  return typeMap[testType] || testType
}

const getTestNameFromType = (testType: string): string => {
  const nameMap: Record<string, string> = {
    plot_detection: '地块检测完整流程测试',
    weather_info: '用户查看天气信息',
    plot_management: '地块管理完整流程测试', // 新增这一行
    plot_logs: '地块日志查看测试',
  }
  return nameMap[testType] || testType
}
</script>

<style scoped>
.system-test-container {
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

.config-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.config-section {
  margin-bottom: 30px;
}

.test-categories {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.category-card {
  border: 1px solid #e0e6ed;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
}

.test-cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.test-case-card {
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: white;
}

.test-case-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.test-case-card.executable {
  border-left: 4px solid #67c23a;
  cursor: pointer;
}

.test-case-card.executable:hover {
  border-left-color: #529b2e;
}

/* 移除 display-only 相关样式 */

.test-case-card.running {
  border-left-color: #409eff;
  background: #f0f9ff;
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.case-info h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 16px;
}

.case-title {
  margin: 0;
  color: #606266;
  font-size: 14px;
  font-weight: bold;
}

.case-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-icon {
  color: #409eff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.case-content p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.5;
}

.test-steps {
  margin: 10px 0;
}

.test-steps strong {
  color: #2c3e50;
  font-size: 14px;
}

.test-steps ol {
  margin: 8px 0 0 20px;
  padding: 0;
}

.test-steps li {
  margin: 5px 0;
  font-size: 13px;
  line-height: 1.4;
  color: #606266;
}

.test-results {
  margin-top: 30px;
}

.batch-results {
  margin-bottom: 20px;
}

.batch-status {
  margin-left: auto;
}

.batch-summary {
  padding: 20px 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.summary-item {
  text-align: center;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
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
}

.failure-analysis h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.failure-types {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.test-result-card {
  margin-bottom: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-info h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.test-id {
  color: #909399;
  font-size: 14px;
}

.result-status {
  display: flex;
  align-items: center;
  gap: 15px;
}

.execution-time {
  color: #606266;
  font-size: 14px;
}

.test-steps-result {
  margin: 20px 0;
}

.test-steps-result h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.steps-timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-radius: 6px;
  background: #f8f9fa;
}

.step-item.success {
  background: #f0f9ff;
  border-left: 3px solid #67c23a;
}

.step-item.failed {
  background: #fef0f0;
  border-left: 3px solid #f56c6c;
}

.step-item.running {
  background: #f0f9ff;
  border-left: 3px solid #409eff;
}

.step-marker {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e0e6ed;
}

.step-item.success .step-marker {
  border-color: #67c23a;
  color: #67c23a;
}

.step-item.failed .step-marker {
  border-color: #f56c6c;
  color: #f56c6c;
}

.step-item.running .step-marker {
  border-color: #409eff;
  color: #409eff;
}

.step-content {
  flex: 1;
}

.step-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 2px;
}

.step-time {
  font-size: 12px;
  color: #909399;
}

.weather-data,
.log-data {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.weather-data h4,
.log-data h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.log-summary {
  margin-top: 15px;
}

.log-entries {
  margin-top: 15px;
}

.log-entries h5 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.log-entry {
  background: white;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.log-content {
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.log-time {
  font-size: 12px;
  color: #909399;
}

.error-section {
  margin: 20px 0;
}

.error-section h4 {
  color: #f56c6c;
  margin-bottom: 10px;
}

.error-title {
  font-weight: bold;
}

.error-content {
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.screenshots {
  margin: 20px 0;
}

.screenshots h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.screenshot-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.environment-status {
  padding: 20px 0;
}

.recommendations {
  margin-top: 20px;
}

.recommendations h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.recommendations ul {
  margin: 0;
  padding-left: 20px;
}

.recommendations li {
  margin: 5px 0;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-test-container {
    padding: 20px;
  }

  .test-cases-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .config-actions {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
