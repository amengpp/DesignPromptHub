import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 记录请求日志（开发环境）
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 记录响应日志（开发环境）
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.url}`)
    }
    
    return response
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回错误
      const { status, data } = error.response
      
      // 认证失败
      if (status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      
      // 记录错误日志
      console.error(`API Error: ${status} ${error.config.url}`, data)
      
      // 返回统一的错误格式
      return Promise.reject({
        status,
        message: data?.message || '请求失败',
        code: data?.error?.code || 'UNKNOWN_ERROR',
        details: data?.error?.details || []
      })
    } else if (error.request) {
      // 网络错误
      console.error('Network Error:', error.message)
      return Promise.reject({
        status: 0,
        message: '网络连接失败，请检查网络设置',
        code: 'NETWORK_ERROR'
      })
    } else {
      // 其他错误
      console.error('Request Error:', error.message)
      return Promise.reject({
        status: -1,
        message: '请求配置错误',
        code: 'REQUEST_ERROR'
      })
    }
  }
)

export default api