import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由组件
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const Categories = () => import('@/views/Categories.vue')
const CategoryDetail = () => import('@/views/CategoryDetail.vue')
const PromptDetail = () => import('@/views/PromptDetail.vue')
const Search = () => import('@/views/Search.vue')
const UserProfile = () => import('@/views/user/Profile.vue')
const UserPrompts = () => import('@/views/user/Prompts.vue')
const CreatePrompt = () => import('@/views/user/CreatePrompt.vue')
const EditPrompt = () => import('@/views/user/EditPrompt.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: '登录', guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { title: '注册', guestOnly: true }
  },
  {
    path: '/categories',
    name: 'categories',
    component: Categories,
    meta: { title: '分类浏览' }
  },
  {
    path: '/categories/:id',
    name: 'category-detail',
    component: CategoryDetail,
    meta: { title: '分类详情' }
  },
  {
    path: '/prompts/:id',
    name: 'prompt-detail',
    component: PromptDetail,
    meta: { title: '提示词详情' }
  },
  {
    path: '/search',
    name: 'search',
    component: Search,
    meta: { title: '搜索' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: UserProfile,
    meta: { title: '个人资料', requiresAuth: true }
  },
  {
    path: '/my-prompts',
    name: 'my-prompts',
    component: UserPrompts,
    meta: { title: '我的提示词', requiresAuth: true }
  },
  {
    path: '/create-prompt',
    name: 'create-prompt',
    component: CreatePrompt,
    meta: { title: '创建提示词', requiresAuth: true }
  },
  {
    path: '/edit-prompt/:id',
    name: 'edit-prompt',
    component: EditPrompt,
    meta: { title: '编辑提示词', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Prompt提示词管理平台`
  }
  
  // 如果有token但没有用户信息，尝试获取用户信息
  if (authStore.token && !authStore.user) {
    try {
      await authStore.getCurrentUser()
    } catch (error) {
      // 获取用户信息失败，清除token
      authStore.clearAuth()
    }
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  // 检查是否仅允许游客访问
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }
  
  next()
})

export default router