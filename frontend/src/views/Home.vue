<template>
  <div class="min-h-screen">
    <!-- 头部区域 -->
    <section class="bg-gradient-to-br from-primary-50 to-white py-16">
      <div class="container">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            发现优质
            <span class="text-primary-500">AI提示词</span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 leading-relaxed">
            专业的AI提示词管理平台，汇集海量高质量提示词模板，
            帮助您提升工作效率和创造力
          </p>
          
          <!-- 搜索框 -->
          <div class="max-w-2xl mx-auto mb-8">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索提示词、分类或关键词..."
                class="w-full px-6 py-4 text-lg border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-primary-500 focus:border-transparent"
                @keyup.enter="handleSearch"
              >
              <button
                @click="handleSearch"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white px-6 py-2 rounded-full hover:bg-primary-600 transition-colors"
              >
                搜索
              </button>
            </div>
          </div>

          <!-- 快速操作按钮 -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/categories"
              class="inline-flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              浏览分类
            </router-link>
            <!-- 注册入口暂时注释掉，管理人员可直接访问http://localhost:3000/login -->
            <!-- <router-link
              v-if="!authStore.isAuthenticated"
              to="/register"
              class="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              立即注册
            </router-link> 
            <router-link
              v-else
              to="/create-prompt"
              class="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              创建提示词
            </router-link>-->
          </div>
        </div>
      </div>
    </section>

    <!-- 特色分类 -->
    <section class="py-16 bg-white">
      <div class="container">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">热门分类</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            探索我们精心整理的提示词分类，涵盖各种应用场景和需求
          </p>
        </div>

        <div v-if="promptsStore.isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="card animate-pulse">
            <div class="h-48 bg-gray-200 rounded-t-xl"></div>
            <div class="p-6">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="category in featuredCategories"
            :key="category.id"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
            @click="$router.push({ name: 'category-detail', params: { id: category.id } })"
          >
            <div class="h-48 bg-gradient-to-br from-primary-100 to-primary-50 rounded-t-xl flex items-center justify-center">
              <div class="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center">
                <span class="text-white text-2xl font-bold">{{ category.name.charAt(0) }}</span>
              </div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ category.name }}</h3>
              <p class="text-gray-600 text-sm mb-4">{{ category.description }}</p>
              <div class="flex justify-between items-center text-sm text-gray-500">
                <span>{{ category.promptCount || 0 }} 个提示词</span>
                <span class="text-primary-500 font-medium">查看详情 →</span>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-8">
          <router-link
            to="/categories"
            class="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            查看全部分类
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 最新提示词 -->
    <section class="py-16 bg-gray-50">
      <div class="container">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">最新提示词</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            发现社区最新分享的高质量提示词
          </p>
        </div>

        <div v-if="promptsStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="card animate-pulse">
            <div class="p-6">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="prompt in recentPrompts"
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
                <span class="text-gray-500">by {{ prompt.creator.displayName || prompt.creator.username }}</span>
                <span class="text-primary-500 font-medium">查看详情 →</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="recentPrompts.length === 0 && !promptsStore.isLoading" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p class="text-gray-500">暂无提示词，快来创建第一个吧！</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePromptsStore } from '@/stores/prompts'

const router = useRouter()
const authStore = useAuthStore()
const promptsStore = usePromptsStore()

const searchQuery = ref('')

const featuredCategories = computed(() => {
  return promptsStore.categories.slice(0, 3)
})

const recentPrompts = computed(() => {
  return promptsStore.prompts.slice(0, 6)
})

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ 
      name: 'search', 
      query: { q: searchQuery.value.trim() } 
    })
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1天前'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  
  return date.toLocaleDateString('zh-CN')
}

onMounted(async () => {
  try {
    await Promise.all([
      promptsStore.fetchCategories(),
      promptsStore.fetchPrompts({ limit: 6, sort: 'newest' })
    ])
  } catch (error) {
    console.error('加载首页数据失败:', error)
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