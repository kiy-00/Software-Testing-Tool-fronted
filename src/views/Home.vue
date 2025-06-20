<template>
  <div>
    <div class="home-hero">
      <h1 class="hero-title">软件测试工具</h1>
      <p class="hero-subtitle">专业的软件测试解决方案，支持多种测试方法和场景</p>
    </div>

    <div class="feature-grid">
      <div class="feature-card" @click="$router.push('/homework')">
        <div class="feature-icon">📝</div>
        <h3 class="feature-title">作业题测试</h3>
        <p class="feature-desc">
          支持三角形判断、计算机销售、电信系统、日历问题等经典题目的测试，
          提供边界值测试、等价类测试、决策表测试等多种测试方法。
        </p>
      </div>

      <div class="feature-card" @click="$router.push('/unit-test')">
        <div class="feature-icon">🔧</div>
        <h3 class="feature-title">单元测试</h3>
        <p class="feature-desc">
          针对单个函数或方法进行测试，验证其功能是否符合预期。
          支持项目扫描、Mock配置和Excel测试用例。
        </p>
      </div>

      <div class="feature-card" @click="$router.push('/integration-test')">
        <div class="feature-icon">🔗</div>
        <h3 class="feature-title">集成测试</h3>
        <p class="feature-desc">
          测试多个模块之间的接口和交互，确保系统各部分能够正确协作。
          支持预定义测试用例和自定义测试场景。
        </p>
      </div>

      <div class="feature-card" @click="$router.push('/system-test')">
        <div class="feature-icon">🏗️</div>
        <h3 class="feature-title">系统测试</h3>
        <p class="feature-desc">
          对完整系统进行全面测试，包括功能测试、性能测试、安全测试等。
          模拟真实使用场景验证系统整体质量。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 首页组件逻辑
</script>

<style scoped>
.home-hero {
  text-align: center;
  margin-bottom: 50px;
}

.hero-title {
  font-size: 48px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 20px;
}

.hero-subtitle {
  font-size: 20px;
  color: #7f8c8d;
  margin-bottom: 40px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.feature-card.disabled-section {
  opacity: 0.6;
  cursor: not-allowed;
}

.feature-card.disabled-section:hover {
  transform: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 20px;
  color: #667eea;
}

.feature-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #2c3e50;
}

.feature-desc {
  color: #7f8c8d;
  line-height: 1.6;
}
</style>
