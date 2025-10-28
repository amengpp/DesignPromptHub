<template>
  <MainLayout>
    <div class="py-16">
      <div class="container">
        <!-- 面包屑导航 -->
        <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <router-link to="/" class="hover:text-primary-600 transition-colors">首页</router-link>
          <span>/</span>
          <router-link 
            :to="{ name: 'category-detail', params: { id: prompt?.category?.id } }" 
            class="hover:text-primary-600 transition-colors"
          >
            {{ prompt?.category?.name }}
          </router-link>
          <span>/</span>
          <span class="text-gray-900">{{ prompt?.title }}</span>
        </nav>

        <!-- 提示词详情 -->
        <div v-if="promptsStore.isLoading" class="animate-pulse max-w-4xl mx-auto">
          <div class="h-14 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div class="flex space-x-2 mb-6">
            <div class="h-6 bg-gray-200 rounded w-24 mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          </div>
          <div class="h-12 bg-gray-200 rounded w-full mb-6"></div>
          <div class="space-y-4">
            <div class="h-6 bg-gray-200 rounded w-full mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-full mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-full mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div class="mt-12 flex justify-between">
            <div class="h-8 bg-gray-200 rounded w-32"></div>
            <div class="h-8 bg-gray-200 rounded w-48"></div>
          </div>
        </div>

        <div v-else-if="prompt" class="max-w-4xl mx-auto bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <!-- 头部信息 -->
          <div class="p-6 border-b border-gray-100">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
              {{ prompt.title }}
              <span class="absolute -bottom-2 left-0 right-20 h-1 bg-primary-500 rounded-full"></span>
            </h1>
            <div class="flex flex-wrap gap-3 mb-6 mt-6">
              <span class="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                {{ prompt.category?.name }}
              </span>
              <span v-if="prompt.subcategory" class="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                {{ prompt.subcategory?.name }}
              </span>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between">
              <div class="flex items-center text-sm text-gray-500 mb-4 sm:mb-0">
                <div class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                  <span class="text-xs font-medium text-gray-600">{{ (prompt.creator?.displayName || prompt.creator?.username || '未知用户').charAt(0) }}</span>
                </div>
                <span>由 {{ prompt.creator?.displayName || prompt.creator?.username || '未知用户' }} 创建</span>
                <span class="mx-2">•</span>
                <span>
                  <svg class="w-3 h-3 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatDate(prompt.createdAt) }}
                </span>
              </div>
              
              <!-- 操作按钮 -->
              <div class="flex items-center space-x-4">
                <button
                  @click="handleCopy"
                  class="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center transition-colors hover:border-primary-200"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制内容
                </button>
                <button
                  v-if="authStore.isAuthenticated && (authStore.user?.id === prompt.user?.id || authStore.user?.role === 'admin')"
                  @click="$router.push({ name: 'edit-prompt', params: { id: prompt.id } })"
                  class="px-5 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center shadow-sm hover:shadow transition-all duration-300"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  编辑
                </button>
              </div>
            </div>
          </div>

          <!-- 标签 -->
          <div v-if="prompt.tags && prompt.tags.length > 0" class="px-6 py-4 border-b border-gray-100">
            <div class="flex flex-wrap gap-3">
              <span
                v-for="tag in prompt.tags"
                :key="tag"
                class="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm border border-gray-200"
              >
                #{{ tag }}
              </span>
            </div>
          </div>

          <!-- 图片展示区域 -->
          <div v-if="prompt.imageUrl" class="p-6 border-t border-gray-100 bg-gray-50">
            <div class="rounded-xl overflow-hidden shadow-sm">
              <img 
                :src="prompt.imageUrl" 
                :alt="prompt.title" 
                class="w-full h-auto object-cover hover:scale-105 transition-transform duration-300 ease-in-out"
                loading="lazy"
              />
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="p-6">
            <div class="whitespace-pre-wrap bg-white p-6 rounded-xl overflow-x-auto border border-gray-100 shadow-sm">
              <div class="prose prose-sm max-w-none">
                <p v-html="formatContent(prompt.content)"></p>
              </div>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="px-6 py-5 border-t border-gray-100 bg-gray-50">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center space-x-6">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span class="text-gray-600">{{ prompt.usageCount || 0 }} 次使用</span>
                </div>
                <div v-if="false" class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span class="text-gray-600">{{ prompt.averageRating || 0 }} 平均评分</span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-gray-600">更新于: {{ formatDate(prompt.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="max-w-2xl mx-auto text-center py-20">
          <div class="mb-8 text-gray-400">
            <svg class="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">提示词不存在</h3>
          <p class="text-gray-600 mb-8">您要查看的提示词可能已被删除或不存在</p>
          <router-link to="/categories" class="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium shadow-sm hover:shadow transition-all duration-300">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            浏览分类列表
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