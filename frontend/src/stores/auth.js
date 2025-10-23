import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 设置认证信息
  const setAuth = (userData, authToken) => {
    user.value = userData
    token.value = authToken
    localStorage.setItem('token', authToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  // 清除认证信息
  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  // 登录
  const login = async (credentials) => {
    isLoading.value = true
    try {
      const response = await api.post('/auth/login', credentials)
      setAuth(response.data.data.user, response.data.data.token)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: '登录失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (userData) => {
    isLoading.value = true
    try {
      const response = await api.post('/auth/register', userData)
      setAuth(response.data.data.user, response.data.data.token)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: '注册失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // 即使API调用失败也清除本地认证
      console.error('登出失败:', error)
    } finally {
      clearAuth()
    }
  }

  // 获取当前用户信息
  const getCurrentUser = async () => {
    if (!token.value) return
    
    isLoading.value = true
    try {
      const response = await api.get('/auth/me')
      // 正确获取用户信息，应该是response.data.data.user而不是response.data.data
      user.value = response.data.data.user
      return response.data
    } catch (error) {
      // 如果token无效，清除认证信息
      if (error.response?.status === 401) {
        clearAuth()
      }
      throw error.response?.data || { message: '获取用户信息失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 初始化认证状态
  const initAuth = async () => {
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      await getCurrentUser()
    }
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    getCurrentUser,
    initAuth,
    clearAuth
  }
})