<template>
  <div class="homework-container">
    <h2 class="section-title">作业题测试</h2>

    <!-- 题目选择 -->
    <div class="problem-selector">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="选择题目:">
            <el-select
              v-model="state.selectedProblem"
              placeholder="请选择题目"
              @change="onProblemChange"
              style="width: 100%"
              size="large"
            >
              <el-option
                v-for="option in problemOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="选择测试方法:">
            <el-select
              v-model="state.selectedMethod"
              placeholder="请选择测试方法"
              style="width: 100%"
              size="large"
              :disabled="!state.selectedProblem"
            >
              <el-option
                v-for="option in methodOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <!-- 代码编辑器 -->
    <div class="code-editor">
      <el-form-item label="代码编辑:">
        <el-input
          v-model="state.code"
          type="textarea"
          :rows="15"
          placeholder="请输入或修改代码..."
          :disabled="state.loadingCode"
        />
        <div v-if="state.loadingCode" class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span style="margin-left: 10px">正在加载代码...</span>
        </div>
      </el-form-item>
    </div>

    <!-- 测试控制 -->
    <div class="test-controls">
      <el-button
        type="primary"
        size="large"
        @click="runTest"
        :loading="state.loading"
        :disabled="!state.selectedProblem || !state.selectedMethod || !state.code.trim()"
      >
        <template #icon>
          <el-icon><VideoPlay /></el-icon>
        </template>
        {{ state.loading ? '测试中...' : '运行测试' }}
      </el-button>

      <el-button
        size="large"
        @click="loadCode"
        :disabled="!state.selectedProblem || state.loadingCode"
      >
        <template #icon>
          <el-icon><Refresh /></el-icon>
        </template>
        重新加载代码
      </el-button>
    </div>

    <!-- 测试结果 -->
    <div v-if="state.testResults" class="results-container">
      <el-divider>测试结果</el-divider>

      <!-- 测试概要 -->
      <div class="result-summary">
        <h3>{{ state.testResults.test_name }}</h3>
        <p>{{ state.testResults.description }}</p>

        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-value">{{ state.testResults.summary.total_cases }}</div>
            <div class="summary-label">总用例数</div>
          </div>
          <div class="summary-item">
            <div class="summary-value passed">{{ state.testResults.summary.passed_cases }}</div>
            <div class="summary-label">通过用例</div>
          </div>
          <div class="summary-item">
            <div class="summary-value failed">{{ state.testResults.summary.failed_cases }}</div>
            <div class="summary-label">失败用例</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">{{ state.testResults.summary.pass_rate }}</div>
            <div class="summary-label">通过率</div>
          </div>
        </div>
      </div>

      <!-- 详细测试用例 -->
      <div v-if="state.testResults.test_results && state.testResults.test_results.length > 0">
        <h4 style="margin-bottom: 20px">测试用例详情</h4>
        <div
          v-for="testCase in state.testResults.test_results"
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
              <div class="detail-label">输入参数:</div>
              <div class="detail-value">{{ testCase.Input }}</div>
            </div>
            <div class="case-detail">
              <div class="detail-label">期望结果:</div>
              <div class="detail-value">{{ testCase.Expected }}</div>
            </div>
            <div class="case-detail">
              <div class="detail-label">实际结果:</div>
              <div class="detail-value">{{ testCase.Actual }}</div>
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
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, VideoPlay, Refresh } from '@element-plus/icons-vue'
import { apiService } from '@/services/api'
import { problemConfig } from '@/config/problems'
import type { TestResults } from '@/types/api'

interface State {
  selectedProblem: string
  selectedMethod: string
  code: string
  loading: boolean
  testResults: TestResults | null
  loadingCode: boolean
}

const state = reactive<State>({
  selectedProblem: '',
  selectedMethod: '',
  code: '',
  loading: false,
  testResults: null,
  loadingCode: false,
})

const problemOptions = computed(() => {
  return Object.keys(problemConfig).map((key) => ({
    value: key,
    label: problemConfig[key].name,
  }))
})

const methodOptions = computed(() => {
  if (!state.selectedProblem) return []
  return problemConfig[state.selectedProblem].methods
})

const loadCode = async () => {
  if (!state.selectedProblem) return

  state.loadingCode = true
  try {
    const response = await apiService.getHomeworkCode(state.selectedProblem)
    if (response.success) {
      state.code = response.code
    } else {
      ElMessage.error(response.message || '获取代码失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请检查后端服务是否正常运行')
  } finally {
    state.loadingCode = false
  }
}

const runTest = async () => {
  if (!state.selectedProblem || !state.selectedMethod || !state.code.trim()) {
    ElMessage.warning('请选择题目、测试方法并输入代码')
    return
  }

  state.loading = true
  state.testResults = null

  try {
    const response = await apiService.runTest(
      state.code,
      state.selectedProblem,
      state.selectedMethod,
    )

    if (response.success) {
      state.testResults = response
      ElMessage.success('测试完成')
    } else {
      ElMessage.error(response.message || '测试失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请检查后端服务是否正常运行')
  } finally {
    state.loading = false
  }
}

const onProblemChange = () => {
  state.selectedMethod = ''
  state.code = ''
  state.testResults = null
  loadCode()
}
</script>

<style scoped>
.homework-container {
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

.problem-selector {
  margin-bottom: 30px;
}

.code-editor {
  margin-bottom: 30px;
}

.loading-container {
  text-align: center;
  padding: 20px;
  color: #666;
}

.test-controls {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.results-container {
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
</style>
