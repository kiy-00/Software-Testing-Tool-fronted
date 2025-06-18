import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import HomeworkTest from '@/views/HomeworkTest.vue'

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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
