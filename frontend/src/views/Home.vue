<template>
  <div class="min-h-screen bg-white">
    <!-- 英雄区域 -->
    <section class="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div class="absolute top-0 left-1/3 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div class="container relative z-10 py-20 md:py-32">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            发现优质
            <span class="text-primary-200 relative inline-block">
              AI提示词
              <svg class="absolute -bottom-2 left-0 w-full h-2" viewBox="0 0 100 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 5C20 10 35 0 50 5C65 10 80 0 100 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
          </h1>
          <p class="text-xl md:text-2xl text-primary-100 mb-10 leading-relaxed opacity-90">
            专业的AI提示词管理平台，汇集海量高质量提示词模板，
            帮助您提升工作效率和创造力
          </p>
          
          <!-- 搜索框 -->
          <div class="max-w-2xl mx-auto mb-10">
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400 group-focus-within:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索提示词、分类或关键词..."
                class="w-full pl-12 pr-32 py-4 text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-white/30 focus:border-white transition-all"
                @keyup.enter="handleSearch"
              >
              <button
                @click="handleSearch"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-primary-600 px-6 py-2 rounded-full hover:bg-primary-100 transition-all shadow-lg hover:shadow-primary-200/20"
              >
                搜索
              </button>
            </div>
          </div>
          
          <!-- 热门搜索标签 -->
          <div class="flex flex-wrap justify-center gap-2">
            <span class="text-sm text-white/70">热门搜索：</span>
            <button 
              v-for="tag in popularTags" 
              :key="tag" 
              class="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              @click="searchQuery = tag; handleSearch()"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 波浪分隔线 -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" class="w-full">
          <path fill="white" fill-opacity="1" d="M0,32L48,42.7C96,53,192,75,288,74.7C384,75,480,53,576,42.7C672,32,768,32,864,42.7C960,53,1056,75,1152,74.7C1248,75,1344,53,1392,42.7L1440,32L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"></path>
        </svg>
      </div>
    </section>

    <!-- 平台优势部分已删除 -->

    <!-- 特色分类 -->
    <section class="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div class="container">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            热门分类
            <span class="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-primary-500 rounded-full"></span>
          </h2>
          <p class="text-gray-600 max-w-2xl mx-auto mt-6">
            探索我们精心整理的提示词分类，涵盖各种应用场景和需求
          </p>
        </div>

        <div v-if="promptsStore.isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="i" class="card animate-pulse">
            <div class="h-48 bg-gray-200 rounded-t-xl"></div>
            <div class="p-6">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="category in featuredCategories"
            :key="category.id"
            class="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            @click="$router.push({ name: 'category-detail', params: { id: category.id } })"
          >
            <div class="h-48 bg-gradient-to-br from-primary-100 to-primary-50 rounded-t-xl flex items-center justify-center overflow-hidden relative">
              <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity from-primary-600/10 to-primary-500/5"></div>
              <div class="w-20 h-20 bg-primary-500 rounded-xl flex items-center justify-center transform transition-transform group-hover:scale-110">
                <span class="text-white text-3xl font-bold">{{ category.name.charAt(0) }}</span>
              </div>
              <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                {{ category.promptCount || 0 }} 个提示词
              </div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{{ category.name }}</h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ category.description }}</p>
              <div class="flex justify-end items-center text-sm">
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

        <div class="text-center mt-12">
          <router-link
            to="/categories"
            class="inline-flex items-center px-8 py-3 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors font-medium shadow-sm hover:shadow"
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
    <section class="py-16 bg-white">
      <div class="container">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-3">最新提示词</h2>
            <p class="text-gray-600 max-w-2xl">
              发现社区最新分享的高质量提示词
            </p>
          </div>
          <div class="mt-4 md:mt-0">
            <router-link
              to="/search"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
            >
              查看全部
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </router-link>
          </div>
        </div>

        <div v-if="promptsStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="i in 6" :key="i" class="card animate-pulse">
            <div class="p-6">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="prompt in recentPrompts"
            :key="prompt.id"
            class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
            @click="$router.push({ name: 'prompt-detail', params: { id: prompt.id } })"
          >
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
                    <span class="text-xs font-medium text-gray-600">{{ (prompt.creator.displayName || prompt.creator.username).charAt(0) }}</span>
                  </div>
                  <span class="text-gray-500">{{ prompt.creator.displayName || prompt.creator.username }}</span>
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

        <div v-if="recentPrompts.length === 0 && !promptsStore.isLoading" class="text-center py-16 bg-gray-50 rounded-2xl">
          <div class="text-gray-400 mb-4">
            <svg class="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 class="text-xl font-medium text-gray-900 mb-2">暂无提示词</h3>
          <p class="text-gray-500 mb-6">快来创建第一个提示词，开启AI创作之旅！</p>
          <router-link
            v-if="authStore.isAuthenticated"
            to="/create-prompt"
            class="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium shadow-sm hover:shadow"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            创建提示词
          </router-link>
          <router-link
            v-else
            to="/login"
            class="inline-flex items-center px-6 py-3 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 font-medium shadow-sm hover:shadow"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1m4 0h9" />
            </svg>
            登录后创建
          </router-link>
        </div>
      </div>
    </section>

    <!-- 呼吁行动 -->
    <section class="py-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
      <div class="container">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">立即开始您的AI创作之旅</h2>
          <p class="text-xl text-primary-100 mb-10">
            加入我们的平台，发现更多创意可能，提升工作效率
          </p>
          <!-- 按钮部分已删除 -->
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
const popularTags = ref(['网站设计', '文案写作', '图像生成', '代码优化', '数据分析'])

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

@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.card {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 平滑滚动效果 */
html {
  scroll-behavior: smooth;
}
</style>