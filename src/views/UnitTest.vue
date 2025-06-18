<template>
  <div class="unit-test-container">
    <h2 class="section-title">单元测试</h2>

    <!-- 项目配置步骤 -->
    <el-steps :active="currentStep" finish-status="success" align-center class="steps-container">
      <el-step title="项目扫描" description="扫描项目结构"></el-step>
      <el-step title="选择测试目标" description="选择类和方法"></el-step>
      <el-step title="配置参数" description="设置Mock和测试文件"></el-step>
      <el-step title="执行测试" description="运行单元测试"></el-step>
    </el-steps>

    <!-- 步骤1: 项目路径和扫描 -->
    <div v-if="currentStep === 0" class="step-content">
      <el-card>
        <template #header>
          <div class="card-header">
            <el-icon><FolderOpened /></el-icon>
            <span>项目扫描</span>
          </div>
        </template>

        <el-form :model="projectForm" label-width="120px">
          <el-form-item label="项目根路径:">
            <el-input
              v-model="projectForm.directory"
              placeholder="请输入项目根路径，如 D:/P-guard/backend"
              style="width: 100%"
              clearable
            >
              <template #prepend>
                <el-icon><Folder /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="scanProject"
              :loading="scanning"
              :disabled="!projectForm.directory.trim()"
              size="large"
            >
              <template #icon>
                <el-icon><Search /></el-icon>
              </template>
              {{ scanning ? '扫描中...' : '开始扫描项目' }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 步骤2: 选择测试目标 -->
    <div v-if="currentStep === 1" class="step-content">
      <el-row :gutter="20">
        <!-- 类选择 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <el-icon><Collection /></el-icon>
                <span>选择类</span>
              </div>
            </template>

            <el-select
              v-model="testForm.selectedClass"
              placeholder="请选择要测试的类"
              style="width: 100%; margin-bottom: 20px"
              filterable
              @change="onClassChange"
            >
              <el-option
                v-for="className in availableClasses"
                :key="className"
                :label="className"
                :value="className"
              />
            </el-select>

            <!-- 类方法列表 -->
            <div v-if="testForm.selectedClass && classDetails[testForm.selectedClass]">
              <h4>类方法:</h4>
              <div class="method-list">
                <el-tag
                  v-for="method in Object.keys(classDetails[testForm.selectedClass])"
                  :key="method"
                  class="method-tag"
                  :type="testForm.selectedMethod === method ? 'success' : 'info'"
                  @click="selectMethod(method)"
                >
                  {{ method }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 函数选择 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <el-icon><Operation /></el-icon>
                <span>选择函数</span>
              </div>
            </template>

            <el-select
              v-model="testForm.selectedModule"
              placeholder="请选择模块"
              style="width: 100%; margin-bottom: 20px"
              filterable
              @change="onModuleChange"
            >
              <el-option
                v-for="moduleName in availableModules"
                :key="moduleName"
                :label="moduleName"
                :value="moduleName"
              />
            </el-select>

            <!-- 模块函数列表 -->
            <div v-if="testForm.selectedModule && functionDetails[testForm.selectedModule]">
              <h4>模块函数:</h4>
              <div class="function-list">
                <div
                  v-for="func in functionDetails[testForm.selectedModule]"
                  :key="func.name"
                  class="function-item"
                  :class="{ active: testForm.selectedFunction === func.name }"
                  @click="selectFunction(func.name)"
                >
                  <div class="function-name">
                    {{ func.name }}
                    <el-tag v-if="func.async" size="small" type="warning">async</el-tag>
                  </div>
                  <div class="function-args">参数: {{ func.args.join(', ') || '无' }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 测试目标信息 -->
      <el-card v-if="testForm.selectedClass || testForm.selectedFunction" class="target-info">
        <template #header>
          <div class="card-header">
            <el-icon><Aim /></el-icon>
            <span>测试目标</span>
          </div>
        </template>

        <div class="target-display">
          <div v-if="testForm.selectedClass && testForm.selectedMethod">
            <strong>类方法测试:</strong><br />
            类名: {{ testForm.selectedClass }}<br />
            方法名: {{ testForm.selectedMethod }}
          </div>
          <div v-if="testForm.selectedModule && testForm.selectedFunction">
            <strong>函数测试:</strong><br />
            模块名: {{ testForm.selectedModule }}<br />
            函数名: {{ testForm.selectedFunction }}
          </div>
        </div>

        <el-button
          type="primary"
          @click="nextStep"
          :disabled="
            !(testForm.selectedClass && testForm.selectedMethod) && !testForm.selectedFunction
          "
          style="margin-top: 20px"
        >
          下一步
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </el-card>
    </div>

    <!-- 步骤3: 配置参数 -->
    <div v-if="currentStep === 2" class="step-content">
      <el-row :gutter="20">
        <!-- Mock配置 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <el-icon><Setting /></el-icon>
                <span>Mock配置</span>
              </div>
            </template>

            <el-form label-width="100px">
              <el-form-item label="Mock配置:">
                <el-input
                  v-model="testForm.mockConfig"
                  type="textarea"
                  :rows="8"
                  placeholder="请输入Mock配置，格式为JSON字符串"
                />
              </el-form-item>

              <el-form-item>
                <el-button @click="formatMockConfig" size="small">
                  <el-icon><MagicStick /></el-icon>
                  格式化JSON
                </el-button>
                <el-button @click="clearMockConfig" size="small">
                  <el-icon><Delete /></el-icon>
                  清空
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 测试文件上传 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <el-icon><Upload /></el-icon>
                <span>测试用例文件</span>
              </div>
            </template>

            <el-upload
              ref="uploadRef"
              class="upload-demo"
              drag
              accept=".xlsx,.xls"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">将Excel文件拖拽到这里，或 <em>点击上传</em></div>
              <template #tip>
                <div class="el-upload__tip">只能上传 .xlsx/.xls 文件</div>
              </template>
            </el-upload>

            <!-- 文件预览 -->
            <div v-if="testForm.uploadedFile" class="file-info">
              <el-alert
                :title="`已选择文件: ${testForm.uploadedFile.name}`"
                type="success"
                :closable="false"
                show-icon
              />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 操作按钮 -->
      <div class="step-actions">
        <el-button @click="prevStep">
          <el-icon class="el-icon--left"><ArrowLeft /></el-icon>
          上一步
        </el-button>
        <el-button type="primary" @click="nextStep" :disabled="!testForm.uploadedFile">
          下一步
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 步骤4: 执行测试 -->
    <div v-if="currentStep === 3" class="step-content">
      <el-card>
        <template #header>
          <div class="card-header">
            <el-icon><VideoPlay /></el-icon>
            <span>执行单元测试</span>
          </div>
        </template>

        <!-- 测试配置摘要 -->
        <div class="test-summary">
          <el-descriptions title="测试配置" :column="2" border>
            <el-descriptions-item label="项目路径">{{
              projectForm.directory
            }}</el-descriptions-item>
            <el-descriptions-item label="测试目标">
              <div v-if="testForm.selectedClass && testForm.selectedMethod">
                类名: {{ testForm.selectedClass }}<br />
                方法名: {{ testForm.selectedMethod }}
              </div>
              <div v-if="testForm.selectedModule && testForm.selectedFunction">
                模块名: {{ testForm.selectedModule }}<br />
                函数名: {{ testForm.selectedFunction }}
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="测试文件">{{
              testForm.uploadedFile?.name
            }}</el-descriptions-item>
            <el-descriptions-item label="Mock配置">
              {{ testForm.mockConfig && testForm.mockConfig !== '{}' ? '已配置' : '未配置' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 执行按钮 -->
        <div class="test-actions">
          <el-button
            type="primary"
            size="large"
            @click="runUnitTest"
            :loading="testing"
            :disabled="!canRunTest"
          >
            <template #icon>
              <el-icon><VideoPlay /></el-icon>
            </template>
            {{ testing ? '测试中...' : '开始单元测试' }}
          </el-button>

          <el-button @click="prevStep" size="large">
            <el-icon class="el-icon--left"><ArrowLeft /></el-icon>
            上一步
          </el-button>

          <el-button @click="resetTest" size="large">
            <el-icon><RefreshLeft /></el-icon>
            重新开始
          </el-button>
        </div>
      </el-card>

      <!-- 测试结果 -->
      <div v-if="testResults || apiDebugInfo" class="test-results">
        <el-divider>测试结果</el-divider>

        <!-- API调试信息 -->
        <div v-if="apiDebugInfo" class="api-debug-info">
          <el-card>
            <template #header>
              <div class="card-header">
                <el-icon><Monitor /></el-icon>
                <span>API调试信息</span>
                <el-tag :type="apiDebugInfo.success ? 'success' : 'danger'" size="small">
                  {{ apiDebugInfo.success ? '成功' : '失败' }}
                </el-tag>
              </div>
            </template>

            <el-collapse>
              <!-- 请求信息 -->
              <el-collapse-item title="请求信息" name="request">
                <div class="debug-section">
                  <h5>请求参数:</h5>
                  <pre class="debug-code">{{
                    JSON.stringify(apiDebugInfo.request.params, null, 2)
                  }}</pre>
                  <h5>请求时间:</h5>
                  <p>{{ apiDebugInfo.request.timestamp }}</p>
                  <h5>请求URL:</h5>
                  <p>{{ apiDebugInfo.request.url }}</p>
                </div>
              </el-collapse-item>

              <!-- 响应信息 -->
              <el-collapse-item title="响应信息" name="response">
                <div class="debug-section">
                  <h5>响应状态:</h5>
                  <p>{{ apiDebugInfo.response.status }}</p>
                  <h5>响应时间:</h5>
                  <p>{{ apiDebugInfo.response.timestamp }}</p>
                  <h5>响应数据:</h5>
                  <pre class="debug-code">{{
                    JSON.stringify(
                      apiDebugInfo.response.data || apiDebugInfo.response.error,
                      null,
                      2,
                    )
                  }}</pre>
                </div>
              </el-collapse-item>

              <!-- 错误详情（仅失败时显示） -->
              <el-collapse-item v-if="!apiDebugInfo.success" title="错误详情" name="error">
                <div class="debug-section">
                  <div v-if="apiDebugInfo.response.error.response">
                    <h5>HTTP错误:</h5>
                    <p>
                      <strong>状态码:</strong> {{ apiDebugInfo.response.error.response.status }}
                    </p>
                    <p>
                      <strong>状态文本:</strong>
                      {{ apiDebugInfo.response.error.response.statusText }}
                    </p>

                    <!-- 后端返回的具体错误信息 -->
                    <div v-if="apiDebugInfo.response.error.response.data" class="backend-error">
                      <h5>后端错误信息:</h5>
                      <div class="error-details">
                        <p>
                          <strong>测试类/模块:</strong>
                          {{ apiDebugInfo.response.error.response.data.class }}
                        </p>
                        <p>
                          <strong>测试方法:</strong>
                          {{ apiDebugInfo.response.error.response.data.method_name }}
                        </p>
                        <p><strong>错误消息:</strong></p>
                        <div class="error-message">
                          {{ apiDebugInfo.response.error.response.data.message }}
                        </div>

                        <!-- 错误分析和建议 -->
                        <div class="error-suggestions">
                          <h6>可能的解决方案:</h6>
                          <ul>
                            <li
                              v-if="
                                apiDebugInfo.response.error.response.data.message.includes(
                                  'signal only works in main thread',
                                )
                              "
                            >
                              <strong>多线程问题:</strong>
                              后端代码可能在非主线程中使用了signal，建议检查异步处理逻辑
                            </li>
                            <li
                              v-if="
                                apiDebugInfo.response.error.response.data.message.includes(
                                  '数据类型转换失败',
                                )
                              "
                            >
                              <strong>数据类型转换:</strong>
                              Excel文件中的数据格式与期望的数据结构不匹配
                            </li>
                            <li>
                              检查Excel文件中用例ID
                              {{
                                extractCaseId(apiDebugInfo.response.error.response.data.message)
                              }}
                              的数据格式
                            </li>
                            <li>
                              确认参数 "{{
                                extractParameterName(
                                  apiDebugInfo.response.error.response.data.message,
                                )
                              }}" 的数据类型是否正确
                            </li>
                            <li>检查Mock配置是否与实际需要的数据结构匹配</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <h5>完整错误响应数据:</h5>
                    <pre class="debug-code">{{
                      JSON.stringify(apiDebugInfo.response.error.response.data, null, 2)
                    }}</pre>
                  </div>
                  <h5>前端错误信息:</h5>
                  <p><strong>错误类型:</strong> {{ apiDebugInfo.response.error.name }}</p>
                  <p><strong>错误消息:</strong> {{ apiDebugInfo.response.error.message }}</p>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </div>

        <!-- 原有的测试结果显示 -->
        <div v-if="testResults">
          <!-- 测试概要 -->
          <div class="result-summary">
            <h3>{{ testResults.test_name || testResults.method_name }}</h3>
            <p v-if="testResults.description">{{ testResults.description }}</p>

            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-value">{{ testResults.summary.total_cases }}</div>
                <div class="summary-label">总用例数</div>
              </div>
              <div class="summary-item">
                <div class="summary-value passed">{{ testResults.summary.passed_cases }}</div>
                <div class="summary-label">通过用例</div>
              </div>
              <div class="summary-item">
                <div class="summary-value failed">{{ testResults.summary.failed_cases }}</div>
                <div class="summary-label">失败用例</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">{{ testResults.summary.pass_rate }}</div>
                <div class="summary-label">通过率</div>
              </div>
            </div>
          </div>

          <!-- Mock配置信息 -->
          <div
            v-if="testResults.mock_config && Object.keys(testResults.mock_config).length > 0"
            class="mock-info"
          >
            <h4>Mock配置:</h4>
            <el-collapse>
              <el-collapse-item
                v-for="(config, key) in testResults.mock_config"
                :key="key"
                :title="key"
              >
                <pre>{{ JSON.stringify(config, null, 2) }}</pre>
              </el-collapse-item>
            </el-collapse>
          </div>

          <!-- 详细测试用例 -->
          <div
            v-if="testResults.test_results && testResults.test_results.length > 0"
            class="test-cases"
          >
            <h4 style="margin-bottom: 20px">测试用例详情</h4>
            <div
              v-for="testCase in testResults.test_results"
              :key="testCase.ID"
              :class="['test-case', testCase.Passed ? 'passed' : 'failed']"
            >
              <div class="case-header">
                <span class="case-id">用例 #{{ testCase.ID }}</span>
                <el-tag :type="testCase.Passed ? 'success' : 'danger'">
                  {{ testCase.Passed ? '✅ 通过' : '❌ 失败' }}
                </el-tag>
              </div>

              <div class="case-details">
                <div class="case-detail">
                  <div class="detail-label">期望结果:</div>
                  <div class="detail-value">
                    <pre>{{ formatResultValue(testCase.Expected) }}</pre>
                  </div>
                </div>
                <div class="case-detail">
                  <div class="detail-label">实际结果:</div>
                  <div class="detail-value">
                    <pre>{{ formatResultValue(testCase.Actual) }}</pre>
                  </div>
                </div>
                <div class="case-detail">
                  <div class="detail-label">执行时间:</div>
                  <div class="detail-value">{{ testCase.Duration }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  FolderOpened,
  Folder,
  Search,
  Collection,
  Operation,
  Aim,
  Setting,
  Upload,
  UploadFilled,
  VideoPlay,
  ArrowRight,
  ArrowLeft,
  RefreshLeft,
  MagicStick,
  Delete,
  Files,
  Monitor,
} from '@element-plus/icons-vue'
import { apiService } from '@/services/api'
import type {
  ScanClassesResponse,
  ScanFunctionsResponse,
  UnitTestResults,
  ClassInfo,
  FunctionInfo,
} from '@/types/api'

// 响应式状态
const currentStep = ref(0)
const scanning = ref(false)
const testing = ref(false)
const uploadRef = ref()

// 项目表单
const projectForm = reactive({
  directory: '',
})

// 测试表单
const testForm = reactive({
  selectedClass: '',
  selectedMethod: '',
  selectedModule: '',
  selectedFunction: '',
  mockConfig: '{}',
  uploadedFile: null as File | null,
})

// 扫描结果数据
const classDetails = ref<Record<string, ClassInfo>>({})
const functionDetails = ref<Record<string, FunctionInfo[]>>({})
const testResults = ref<UnitTestResults | null>(null)
const apiDebugInfo = ref<any>(null) // 添加API调试信息

// 计算属性
const availableClasses = computed(() => Object.keys(classDetails.value))
const availableModules = computed(() => Object.keys(functionDetails.value))

const canRunTest = computed(() => {
  return (
    projectForm.directory.trim() &&
    ((testForm.selectedClass && testForm.selectedMethod) || testForm.selectedFunction) &&
    testForm.uploadedFile
  )
})

// 扫描项目
const scanProject = async () => {
  if (!projectForm.directory.trim()) {
    ElMessage.warning('请输入项目根路径')
    return
  }

  scanning.value = true

  try {
    // 并行扫描类和函数
    const [classResponse, functionResponse] = await Promise.all([
      apiService.scanClasses(projectForm.directory),
      apiService.scanFunctions(projectForm.directory),
    ])

    if (classResponse.success && functionResponse.success) {
      classDetails.value = classResponse.data
      functionDetails.value = functionResponse.data

      const classCount = Object.keys(classResponse.data).length
      const functionCount = Object.values(functionResponse.data).reduce(
        (sum, funcs) => sum + funcs.length,
        0,
      )

      ElMessage.success(`扫描完成！发现 ${classCount} 个类，${functionCount} 个函数`)
      nextStep()
    } else {
      ElMessage.error('扫描失败：' + (classResponse.success ? functionResponse : classResponse))
    }
  } catch (error) {
    console.error('扫描错误:', error)
    ElMessage.error('扫描失败，请检查项目路径是否正确')
  } finally {
    scanning.value = false
  }
}

// 选择类时的处理
const onClassChange = () => {
  testForm.selectedMethod = ''
  // 清空函数选择
  testForm.selectedModule = ''
  testForm.selectedFunction = ''
}

// 选择模块时的处理
const onModuleChange = () => {
  testForm.selectedFunction = ''
  // 清空类选择
  testForm.selectedClass = ''
  testForm.selectedMethod = ''
}

// 选择方法
const selectMethod = (method: string) => {
  testForm.selectedMethod = method
  // 清空函数选择
  testForm.selectedModule = ''
  testForm.selectedFunction = ''
}

// 选择函数
const selectFunction = (funcName: string) => {
  testForm.selectedFunction = funcName
  // 清空类选择
  testForm.selectedClass = ''
  testForm.selectedMethod = ''
}

// 步骤控制
const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 重置测试
const resetTest = async () => {
  try {
    await ElMessageBox.confirm('确定要重新开始吗？这将清空所有配置。', '确认重置', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    currentStep.value = 0
    Object.assign(projectForm, { directory: '' })
    Object.assign(testForm, {
      selectedClass: '',
      selectedMethod: '',
      selectedModule: '',
      selectedFunction: '',
      mockConfig: '{}',
      uploadedFile: null,
    })
    classDetails.value = {}
    functionDetails.value = {}
    testResults.value = null

    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
  } catch {
    // 用户取消了重置
  }
}

// 文件上传处理
const handleFileChange = (file: any) => {
  testForm.uploadedFile = file.raw
  ElMessage.success(`文件 ${file.name} 已选择`)
}

const handleFileRemove = () => {
  testForm.uploadedFile = null
}

// Mock配置处理
const formatMockConfig = () => {
  try {
    const parsed = JSON.parse(testForm.mockConfig)
    testForm.mockConfig = JSON.stringify(parsed, null, 2)
    ElMessage.success('JSON格式化成功')
  } catch (error) {
    ElMessage.error('JSON格式错误，请检查语法')
  }
}

const clearMockConfig = () => {
  testForm.mockConfig = '{}'
}

// 运行单元测试
const runUnitTest = async () => {
  if (!canRunTest.value) {
    ElMessage.warning('请完善测试配置')
    return
  }

  if (!apiService) {
    console.error('API服务未正确初始化')
    ElMessage.error('系统错误：API服务未初始化')
    return
  }

  testing.value = true
  testResults.value = null
  apiDebugInfo.value = null // 清空调试信息

  try {
    // 确定测试目标
    let className = ''
    let methodName = ''

    if (testForm.selectedClass && testForm.selectedMethod) {
      className = testForm.selectedClass
      methodName = testForm.selectedMethod
    } else if (testForm.selectedModule && testForm.selectedFunction) {
      className = testForm.selectedModule
      methodName = testForm.selectedFunction
    }

    const params = {
      root: projectForm.directory,
      className: className,
      methodName: methodName,
      mockConfig: testForm.mockConfig,
      excelFile: testForm.uploadedFile!,
    }

    // 记录请求信息
    const requestInfo = {
      timestamp: new Date().toISOString(),
      url: '/api/run_unit_test',
      method: 'POST',
      params: {
        root: params.root,
        class_name: params.className,
        method_name: params.methodName,
        mock_config: params.mockConfig,
        excel_file: params.excelFile?.name,
        excel_file_size: params.excelFile?.size,
      },
    }

    console.log('=== 单元测试请求信息 ===')
    console.log('请求时间:', requestInfo.timestamp)
    console.log('请求URL:', requestInfo.url)
    console.log('请求参数:', requestInfo.params)

    const response = await apiService.runUnitTest(params)

    // 记录响应信息
    const responseInfo = {
      timestamp: new Date().toISOString(),
      status: 'success',
      data: response,
    }

    console.log('=== API响应成功 ===')
    console.log('响应时间:', responseInfo.timestamp)
    console.log('响应数据:', response.data)

    // 保存调试信息
    apiDebugInfo.value = {
      request: requestInfo,
      response: responseInfo,
      success: true,
    }

    if (response.success) {
      testResults.value = response
      ElMessage.success('单元测试执行完成')

      setTimeout(() => {
        const resultsElement = document.querySelector('.test-results')
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } else {
      ElMessage.error(response.message || '单元测试执行失败')
    }
  } catch (error) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      status: 'error',
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        response: error.response
          ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
              headers: error.response.headers,
            }
          : null,
        request: error.request
          ? {
              url: error.config?.url,
              method: error.config?.method,
              headers: error.config?.headers,
            }
          : null,
      },
    }

    console.error('=== 单元测试错误详情 ===')
    console.error('错误时间:', errorInfo.timestamp)
    console.error('错误对象:', error)
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', error.response.data)
      console.error('响应头:', error.response.headers)
    }
    if (error.request) {
      console.error('请求配置:', error.request)
    }

    // 保存错误信息
    apiDebugInfo.value = {
      request: {
        timestamp: new Date().toISOString(),
        params: {
          root: projectForm.directory,
          class_name: testForm.selectedClass || testForm.selectedModule,
          method_name: testForm.selectedMethod || testForm.selectedFunction,
        },
      },
      response: errorInfo,
      success: false,
    }

    ElMessage.error('单元测试执行失败，请检查配置和网络连接')
  } finally {
    testing.value = false
  }
}

// 格式化结果值
const formatResultValue = (value: any): string => {
  if (typeof value === 'string') {
    try {
      // 尝试解析为JSON并格式化
      const parsed = JSON.parse(value)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return value
    }
  } else if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

// 提取用例ID的辅助方法
const extractCaseId = (message: string): string => {
  const match = message.match(/用例ID (\d+)/)
  return match ? match[1] : '未知'
}

// 提取参数名的辅助方法
const extractParameterName = (message: string): string => {
  const match = message.match(/参数 (\w+):/)
  return match ? match[1] : '未知'
}
</script>

<style scoped>
.unit-test-container {
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

.steps-container {
  margin-bottom: 40px;
}

.step-content {
  margin-top: 30px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.method-list,
.function-list {
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.method-tag {
  margin: 5px 8px 5px 0;
  cursor: pointer;
  transition: all 0.3s;
}

.method-tag:hover {
  transform: scale(1.05);
}

.function-item {
  padding: 12px;
  border: 1px solid #e0e6ed;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.function-item:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.function-item.active {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.function-name {
  font-weight: bold;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.function-args {
  font-size: 12px;
  color: #7f8c8d;
}

.target-info {
  margin-top: 20px;
}

.target-display {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.step-actions {
  margin-top: 30px;
  text-align: center;
}

.step-actions .el-button {
  margin: 0 10px;
}

.test-summary {
  margin-bottom: 30px;
}

.test-actions {
  text-align: center;
  margin-top: 30px;
}

.test-actions .el-button {
  margin: 0 10px;
}

.file-info {
  margin-top: 15px;
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
  margin-top: 20px;
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

.mock-info {
  margin-bottom: 20px;
}

.mock-info h4 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.mock-info pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

.test-cases h4 {
  color: #2c3e50;
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
}

.detail-value pre {
  background: none;
  padding: 0;
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  word-break: break-all;
  white-space: pre-wrap;
}

.upload-demo {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

.api-debug-info {
  margin-bottom: 20px;
}

.debug-section {
  padding: 10px 0;
}

.debug-section h5 {
  margin: 15px 0 8px 0;
  color: #409eff;
  font-weight: bold;
}

.debug-code {
  background: #f5f5f5;
  border: 1px solid #e0e6ed;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

.debug-section p {
  margin: 5px 0;
  color: #2c3e50;
}

.backend-error {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
}

.error-details p {
  margin: 8px 0;
}

.error-message {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.error-suggestions {
  margin-top: 15px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 4px;
}

.error-suggestions h6 {
  margin: 0 0 10px 0;
  color: #0369a1;
  font-weight: bold;
}

.error-suggestions ul {
  margin: 0;
  padding-left: 20px;
}

.error-suggestions li {
  margin: 8px 0;
  line-height: 1.4;
}

.error-suggestions strong {
  color: #dc2626;
}
</style>
