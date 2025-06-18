import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import HomeworkTest from '@/views/HomeworkTest.vue'
import UnitTest from '@/views/UnitTest.vue'

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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
