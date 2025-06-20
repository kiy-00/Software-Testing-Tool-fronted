import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import HomeworkTest from '@/views/HomeworkTest.vue'
import UnitTest from '@/views/UnitTest.vue'
import IntegrationTest from '@/views/IntegrationTest.vue'
import SystemTest from '@/views/SystemTest.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/homework',
    name: 'HomeworkTest',
    component: HomeworkTest,
  },
  {
    path: '/unit-test',
    name: 'UnitTest',
    component: UnitTest,
  },
  {
    path: '/integration-test',
    name: 'IntegrationTest',
    component: IntegrationTest,
  },
  {
    path: '/system-test',
    name: 'SystemTest',
    component: SystemTest,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
