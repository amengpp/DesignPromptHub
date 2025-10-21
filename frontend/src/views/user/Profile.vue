<template>
  <MainLayout>
    <div class="py-8">
      <div class="container">
        <!-- 页面标题 -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">个人资料</h1>
          <p class="text-gray-600">管理您的个人信息和账户设置</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 左侧信息 -->
          <div class="lg:col-span-2">
            <div class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold text-gray-900">基本信息</h2>
              </div>
              <div class="card-body">
                <form @submit.prevent="handleUpdateProfile">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="form-label">用户名</label>
                      <input
                        v-model="form.username"
                        type="text"
                        class="form-input"
                        disabled
                      >
                      <p class="text-sm text-gray-500 mt-1">用户名不可修改</p>
                    </div>
                    
                    <div>
                      <label class="form-label">显示名称</label>
                      <input
                        v-model="form.displayName"
                        type="text"
                        class="form-input"
                        placeholder="请输入显示名称"
                      >
                    </div>
                    
                    <div>
                      <label class="form-label">邮箱地址</label>
                      <input
                        v-model="form.email"
                        type="email"
                        class="form-input"
                        placeholder="请输入邮箱地址"
                      >
                    </div>
                    
                    <div>
                      <label class="form-label">注册时间</label>
                      <input
                        :value="formatDate(authStore.user?.createdAt)"
                        type="text"
                        class="form-input"
                        disabled
                      >
                    </div>
                  </div>
                  
                  <div class="mt-6">
                    <button
                      type="submit"
                      :disabled="isLoading"
                      class="btn btn-primary"
                    >
                      <span v-if="isLoading" class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        保存中...
                      </span>
                      <span v-else>保存修改</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- 右侧统计 -->
          <div class="space-y-6">
            <!-- 用户信息卡片 -->
            <div class="card">
              <div class="text-center p-6">
                <div class="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-white text-2xl font-bold">
                    {{ authStore.user?.displayName?.charAt(0) || authStore.user?.username?.charAt(0) || 'U' }}
                  </span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-1">
                  {{ authStore.user?.displayName || authStore.user?.username }}
                </h3>
                <p class="text-gray-500 text-sm">{{ authStore.user?.email }}</p>
              </div>
            </div>

            <!-- 统计信息 -->
            <div class="card">
              <div class="card-header">
                <h3 class="font-semibold text-gray-900">统计信息</h3>
              </div>
              <div class="card-body space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">创建的提示词</span>
                  <span class="font-semibold text-gray-900">{{ stats.createdPrompts || 0 }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">总使用次数</span>
                  <span class="font-semibold text-gray-900">{{ stats.totalUsage || 0 }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">平均评分</span>
                  <span class="font-semibold text-gray-900">{{ stats.averageRating || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/components/Layout/MainLayout.vue'

const authStore = useAuthStore()

const isLoading = ref(false)
const stats = ref({
  createdPrompts: 0,
  totalUsage: 0,
  averageRating: 0
})

const form = reactive({
  username: '',
  displayName: '',
  email: ''
})

const handleUpdateProfile = async () => {
  isLoading.value = true
  try {
    // 添加调试日志
    console.log('API调用前的准备：', { tokenExists: !!authStore.token, displayName: form.displayName });
    
    // 发送更新请求到后端API，使用正确的后端端口3002
    const response = await fetch('http://localhost:3002/api/v1/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        displayName: form.displayName,
        email: form.email
      })
    })
    
    console.log('API响应状态码：', response.status);
    
    // 只读取一次JSON响应
    let data;
    try {
      data = await response.json();
      console.log('响应数据:', data);
    } catch (jsonError) {
      console.error('无法解析响应为JSON:', jsonError);
      throw new Error(`无法解析响应: ${jsonError.message}`);
    }
    
    // 检查响应数据中的success字段
    if (!response.ok || (data && !data.success)) {
      // 构建更详细的错误信息
      let errorMessage;
      if (data && data.error) {
        errorMessage = `更新失败: ${data.error.message}`;
        if (data.error.details) {
          errorMessage += ` - 详情: ${data.error.details}`;
        }
        if (data.error.code) {
          errorMessage += ` (错误代码: ${data.error.code})`;
        }
      } else {
        errorMessage = `更新失败: HTTP ${response.status} ${response.statusText}`;
      }
      
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // 更新成功后重新获取用户信息
    await authStore.getCurrentUser()
    
    // 可以添加一个成功提示
    console.log('个人资料更新成功')
  } catch (error) {
    console.error('更新个人资料失败:', error)
    // 这里可以添加错误提示逻辑
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  // 初始化表单数据
  if (authStore.user) {
    form.username = authStore.user.username || ''
    form.displayName = authStore.user.displayName || ''
    form.email = authStore.user.email || ''
  }
  
  // 加载统计信息
  loadStats()
})

const loadStats = async () => {
  try {
    // 这里实现获取用户统计信息的逻辑
    // 模拟数据
    stats.value = {
      createdPrompts: 12,
      totalUsage: 156,
      averageRating: 4.5
    }
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}
</script>