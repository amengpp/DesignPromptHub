<template>
  <MainLayout>
    <div class="py-8">
      <div class="container">
        <!-- 搜索头部 -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">搜索提示词</h1>
          
          <!-- 搜索框 -->
          <div class="max-w-2xl">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="输入关键词搜索提示词..."
                class="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-500 focus:border-transparent"
                @keyup.enter="handleSearch"
              >
              <button
                @click="handleSearch"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                搜索
              </button>
            </div>
          </div>

          <!-- 搜索统计 -->
          <div v-if="searchResults.length > 0" class="mt-4 text-sm text-gray-600">
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

        <div v-else-if="searchResults.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="prompt in searchResults"
            :key="prompt.id"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
            @click="$router.push({ name: 'prompt-detail', params: { id: prompt.id } })"
          >
            <div class="p-6">
              <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                  {{ prompt.category?.name }}
                </span>
                <span class="text-xs text-gray-500">{{ formatDate(prompt.createdAt) }}</span>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ prompt.title }}</h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ prompt.description }}</p>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">by {{ prompt.user?.displayName || prompt.user?.username }}</span>
                <span class="text-primary-500 font-medium">查看详情 →</span>
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
          <router-link to="/categories" class="btn btn-primary">
            浏览分类
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