<template>
  <MainLayout>
    <div class="py-8">
      <div class="container">
        <!-- 面包屑导航 -->
        <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <router-link to="/" class="hover:text-primary-600">首页</router-link>
          <span>/</span>
          <router-link 
            :to="{ name: 'category-detail', params: { id: prompt?.category?.id } }" 
            class="hover:text-primary-600"
          >
            {{ prompt?.category?.name }}
          </router-link>
          <span>/</span>
          <span class="text-gray-900">{{ prompt?.title }}</span>
        </nav>

        <!-- 提示词详情 -->
        <div v-if="promptsStore.isLoading" class="animate-pulse">
          <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div class="h-64 bg-gray-200 rounded mb-8"></div>
        </div>

        <div v-else-if="prompt" class="card">
          <!-- 头部信息 -->
          <div class="card-header">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ prompt.title }}</h1>
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span class="px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                    {{ prompt.category?.name }}
                  </span>
                  <span v-if="prompt.subcategory">
                    {{ prompt.subcategory?.name }}
                  </span>
                  <span>by {{ prompt.createdBy || '系统' }}</span>
                  <span>{{ formatDate(prompt.createdAt) }}</span>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="flex items-center space-x-2 mt-4 sm:mt-0">
                <button
                  class="btn btn-outline"
                  @click="handleCopy"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制内容
                </button>
                <button
                  v-if="authStore.isAuthenticated && authStore.user?.id === prompt.user?.id"
                  class="btn btn-secondary"
                  @click="$router.push({ name: 'edit-prompt', params: { id: prompt.id } })"
                >
                  编辑
                </button>
              </div>
            </div>
          </div>

          <!-- 标签 -->
          <div v-if="prompt.tags && prompt.tags.length > 0" class="px-6 py-4 border-b border-gray-200">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in prompt.tags"
                :key="tag"
                class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="card-body">
            <div class="prose max-w-none">
              <div class="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg overflow-x-auto">
                <h2 class="text-xl font-semibold mb-4">{{ prompt.title }}</h2>
                <div class="prose prose-sm">
                  <p v-html="formatContent(prompt.content)"></p>
                </div>
              </div>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between text-sm text-gray-500">
              <div class="flex items-center space-x-4">
                <span>使用次数: {{ prompt.usageCount || 0 }}</span>
                <span>平均评分: {{ prompt.averageRating || 0 }}</span>
              </div>
              <span>最后更新: {{ formatDate(prompt.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-16">
          <div class="text-gray-400 mb-4">
            <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">提示词不存在</h3>
          <p class="text-gray-500 mb-6">您要查看的提示词可能已被删除或不存在</p>
          <router-link to="/" class="btn btn-primary">
            返回首页
          </router-link>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePromptsStore } from '@/stores/prompts'
import MainLayout from '@/components/Layout/MainLayout.vue'

const route = useRoute()
const authStore = useAuthStore()
const promptsStore = usePromptsStore()

const prompt = ref(null)

const loadPrompt = async () => {
  try {
    await promptsStore.fetchPromptDetail(route.params.id)
    // 根据API返回的数据结构，正确获取提示词详情
    prompt.value = promptsStore.currentPrompt?.prompt || promptsStore.currentPrompt
  } catch (error) {
    console.error('加载提示词详情失败:', error)
  }
}

const handleCopy = async () => {
  if (!prompt.value?.content) return
  
  try {
    await navigator.clipboard.writeText(prompt.value.content)
    // 这里可以添加复制成功的提示
    console.log('内容已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return '未知时间'
    }
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    console.error('日期格式化错误:', error)
    return '未知时间'
  }
}

const formatContent = (content) => {
  if (!content) return ''
  
  // 将Markdown格式的内容转换为HTML
  return content
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

onMounted(() => {
  loadPrompt()
})
</script>