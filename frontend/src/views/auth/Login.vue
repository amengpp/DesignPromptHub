<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- 头部 -->
      <div class="text-center">
        <router-link to="/" class="inline-flex items-center space-x-2">
          <div class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">P</span>
          </div>
          <span class="text-2xl font-bold text-gray-900">PromptHub</span>
        </router-link>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">登录您的账户</h2>
        <p class="mt-2 text-sm text-gray-600">
          或
          <router-link to="/register" class="font-medium text-primary-600 hover:text-primary-500">
            注册新账户
          </router-link>
        </p>
      </div>

      <!-- 登录表单 -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <!-- 用户名/邮箱 -->
          <div>
            <label for="identifier" class="form-label">用户名或邮箱</label>
            <input
              id="identifier"
              v-model="form.identifier"
              type="text"
              required
              class="form-input"
              placeholder="请输入用户名或邮箱"
              :class="{ 'border-red-300': errors.identifier }"
            >
            <p v-if="errors.identifier" class="mt-1 text-sm text-red-600">{{ errors.identifier }}</p>
          </div>

          <!-- 密码 -->
          <div>
            <label for="password" class="form-label">密码</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="form-input"
              placeholder="请输入密码"
              :class="{ 'border-red-300': errors.password }"
            >
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>
        </div>

        <!-- 记住我 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            >
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              记住我
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
              忘记密码？
            </a>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div>
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.isLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              登录中...
            </span>
            <span v-else>登录</span>
          </button>
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">登录失败</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ errorMessage }}</p>
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- 演示账户信息 -->
      <div class="mt-8 bg-blue-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-800 mb-2">演示账户</h4>
        <div class="text-sm text-blue-700 space-y-1">
          <p>用户名: <span class="font-mono">demo</span></p>
          <p>密码: <span class="font-mono">demo123</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  identifier: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  identifier: '',
  password: ''
})

const errorMessage = ref('')

const validateForm = () => {
  let isValid = true
  
  // 重置错误信息
  errors.identifier = ''
  errors.password = ''
  
  if (!form.identifier.trim()) {
    errors.identifier = '请输入用户名或邮箱'
    isValid = false
  }
  
  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度至少6位'
    isValid = false
  }
  
  return isValid
}

const handleLogin = async () => {
  errorMessage.value = ''
  
  if (!validateForm()) {
    return
  }
  
  try {
    await authStore.login({
      identifier: form.identifier,
      password: form.password
    })
    
    // 登录成功，跳转到目标页面或首页
    const redirect = route.query.redirect || '/'
    router.push(redirect)
    
  } catch (error) {
    errorMessage.value = error.message || '登录失败，请检查用户名和密码'
  }
}

onMounted(() => {
  // 如果用户已登录，跳转到首页
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>