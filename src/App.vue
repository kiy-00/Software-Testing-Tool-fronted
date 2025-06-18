<template>
  <div class="app-container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">🧪 软件测试工具</div>
        <nav class="nav-menu">
          <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
            首页
          </router-link>
          <router-link
            to="/homework"
            class="nav-item"
            :class="{ active: $route.path === '/homework' }"
          >
            作业题测试
          </router-link>
          <router-link
            to="/unit-test"
            class="nav-item"
            :class="{ active: $route.path === '/unit-test' }"
          >
            单元测试
          </router-link>
          <span class="nav-item disabled-section">集成测试</span>
          <span class="nav-item disabled-section">系统测试</span>
        </nav>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// 无需额外逻辑
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 28px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-item.disabled-section {
  opacity: 0.5;
  cursor: not-allowed;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}
</style>
