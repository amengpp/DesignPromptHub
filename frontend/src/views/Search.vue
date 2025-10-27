<template>
  <MainLayout>
    <div class="py-16">
      <div class="container">
        <!-- 搜索头部 -->
        <div class="text-center mb-12 max-w-3xl mx-auto">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">搜索提示词</h1>
          
          <!-- 搜索框 -->
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400 group-focus-within:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="输入关键词搜索提示词..."
              class="w-full pl-12 pr-32 py-4 text-lg bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-500 focus:border-transparent transition-all"
              @keyup.enter="handleSearch"
            >
            <button
              @click="handleSearch"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-sm hover:shadow"
            >
              搜索
            </button>
          </div>

          <!-- 搜索统计 -->
          <div v-if="searchResults.length > 0" class="mt-4 text-sm text-gray-600 text-center">
            找到 {{ searchResults.length }} 个相关结果
          </div>
        </div>

        <!-- 搜索结果 -->
        <div v-if="promptsStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="card animate-pulse">
            <div class="p-6">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <div v-else-if="searchResults.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="prompt in searchResults"
            :key="prompt.id"
            class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
            @click="$router.push({ name: 'prompt-detail', params: { id: prompt.id } })">
            <div class="p-6">
              <div class="flex items-center justify-between mb-3">
                <span class="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                  {{ prompt.category?.name }}
                </span>
                <span class="text-xs text-gray-500">
                  <svg class="w-3 h-3 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatDate(prompt.createdAt) }}
                </span>
              </div>
              <h3 class="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">{{ prompt.title }}</h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ prompt.description }}</p>
              <div class="pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <div class="flex items-center">
                  <div class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                    <span class="text-xs font-medium text-gray-600">{{ (prompt.creator?.displayName || prompt.creator?.username || '未知用户').charAt(0) }}</span>
                  </div>
                  <span class="text-gray-500">{{ prompt.creator?.displayName || prompt.creator?.username || '未知用户' }}</span>
                </div>
                <span class="text-primary-500 font-medium inline-flex items-center group-hover:translate-x-1 transition-transform">
                  查看详情 
                  <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="searchQuery" class="text-center py-16">
          <div class="text-gray-400 mb-4">
            <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">未找到相关结果</h3>
          <p class="text-gray-500 mb-6">尝试使用不同的关键词或浏览分类</p>
          <router-link 
                to="/categories" 
                class="inline-flex items-center px-6 py-3 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors font-medium shadow-sm hover:shadow">
                浏览分类
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </router-link>
        </div>

        <!-- 初始状态 -->
        <div v-else class="text-center py-16">
          <div class="text-gray-400 mb-4">
            <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">搜索提示词</h3>
          <p class="text-gray-500 mb-6">输入关键词搜索您需要的提示词</p>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePromptsStore } from '@/stores/prompts'
import MainLayout from '@/components/Layout/MainLayout.vue'

const route = useRoute()
const promptsStore = usePromptsStore()

const searchQuery = ref(route.query.q || '')
const searchResults = ref([])

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  try {
    await promptsStore.searchPrompts(searchQuery.value.trim())
    searchResults.value = promptsStore.searchResults
  } catch (error) {
    console.error('搜索失败:', error)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  if (searchQuery.value) {
    handleSearch()
  }
})

watch(() => route.query.q, (newQuery) => {
  searchQuery.value = newQuery || ''
  if (newQuery) {
    handleSearch()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>