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
        <h2 class="mt-6 text-3xl font-bold text-gray-900">创建新账户</h2>
        <p class="mt-2 text-sm text-gray-600">
          或
          <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500">
            登录现有账户
          </router-link>
        </p>
      </div>

      <!-- 注册表单 -->
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <!-- 用户名 -->
          <div>
            <label for="username" class="form-label">用户名</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="form-input"
              placeholder="请输入用户名"
              :class="{ 'border-red-300': errors.username }"
            >
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
          </div>

          <!-- 显示名称 -->
          <div>
            <label for="displayName" class="form-label">显示名称</label>
            <input
              id="displayName"
              v-model="form.displayName"
              type="text"
              required
              class="form-input"
              placeholder="请输入显示名称"
              :class="{ 'border-red-300': errors.displayName }"
            >
            <p v-if="errors.displayName" class="mt-1 text-sm text-red-600">{{ errors.displayName }}</p>
          </div>

          <!-- 邮箱 -->
          <div>
            <label for="email" class="form-label">邮箱地址</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="form-input"
              placeholder="请输入邮箱地址"
              :class="{ 'border-red-300': errors.email }"
            >
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
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

          <!-- 确认密码 -->
          <div>
            <label for="confirmPassword" class="form-label">确认密码</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              class="form-input"
              placeholder="请再次输入密码"
              :class="{ 'border-red-300': errors.confirmPassword }"
            >
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>
        </div>

        <!-- 服务条款 -->
        <div class="flex items-center">
          <input
            id="terms"
            v-model="form.agreeTerms"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          >
          <label for="terms" class="ml-2 block text-sm text-gray-900">
            我同意
            <a href="#" class="text-primary-600 hover:text-primary-500">服务条款</a>
            和
            <a href="#" class="text-primary-600 hover:text-primary-500">隐私政策</a>
          </label>
        </div>
        <p v-if="errors.agreeTerms" class="text-sm text-red-600">{{ errors.agreeTerms }}</p>

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
              注册中...
            </span>
            <span v-else>注册</span>
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
              <h3 class="text-sm font-medium text-red-800">注册失败</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ errorMessage }}</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const errors = reactive({
  username: '',
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: ''
})

const errorMessage = ref('')

const validateForm = () => {
  let isValid = true
  
  // 重置错误信息
  Object.keys(errors).forEach(key => { errors[key] = '' })
  
  if (!form.username.trim()) {
    errors.username = '请输入用户名'
    isValid = false
  } else if (form.username.length < 3) {
    errors.username = '用户名长度至少3位'
    isValid = false
  }
  
  if (!form.displayName.trim()) {
    errors.displayName = '请输入显示名称'
    isValid = false
  }
  
  if (!form.email.trim()) {
    errors.email = '请输入邮箱地址'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
    isValid = false
  }
  
  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度至少6位'
    isValid = false
  }
  
  if (!form.confirmPassword) {
    errors.confirmPassword = '请确认密码'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }
  
  if (!form.agreeTerms) {
    errors.agreeTerms = '请同意服务条款和隐私政策'
    isValid = false
  }
  
  return isValid
}

const handleRegister = async () => {
  errorMessage.value = ''
  
  if (!validateForm()) {
    return
  }
  
  try {
    await authStore.register({
      username: form.username,
      displayName: form.displayName,
      email: form.email,
      password: form.password
    })
    
    // 注册成功，跳转到首页
    router.push('/')
    
  } catch (error) {
    errorMessage.value = error.message || '注册失败，请稍后重试'
  }
}

onMounted(() => {
  // 如果用户已登录，跳转到首页
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>