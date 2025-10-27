<template>
  <MainLayout>
    <div class="py-16">
      <div class="container">
        <!-- 面包屑导航 -->
        <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <router-link to="/" class="hover:text-primary-600 transition-colors">首页</router-link>
          <span>/</span>
          <router-link to="/categories" class="hover:text-primary-600 transition-colors">分类</router-link>
          <span>/</span>
          <span class="text-gray-900">{{ category?.name }}</span>
        </nav>

        <!-- 分类信息 -->
        <div v-if="promptsStore.isLoading" class="animate-pulse mb-12">
          <div class="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        </div>

        <div v-else-if="category" class="mb-12 text-center max-w-3xl mx-auto">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            {{ category.name }}
            <span class="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-primary-500 rounded-full"></span>
          </h1>
          <p class="text-gray-600 mt-6">{{ category.description }}</p>
        </div>

        <!-- 子分类 -->
        <div v-if="subcategories.length > 0" class="mb-12">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <h2 class="text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-0">子分类</h2>
            <button
              v-if="selectedSubcategory"
              @click="clearSubcategoryFilter"
              class="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center transition-colors"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              清除筛选
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="subcategory in subcategories"
              :key="subcategory.id"
              :class="[
                'bg-white rounded-xl overflow-hidden shadow-sm border transition-all duration-300 cursor-pointer hover:shadow-md',
                selectedSubcategory?.id === subcategory.id 
                  ? 'border-2 border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-200'
              ]"
              @click="handleSubcategoryClick(subcategory)"
            >
              <div class="p-5">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center mr-3" :class="getSubcategoryIconClass(subcategory.id)">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="subcategory.id.includes('web')" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        <path v-else-if="subcategory.id.includes('mobile')" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        <span v-else class="text-sm font-bold">{{ subcategory.name.charAt(0) }}</span>
                      </svg>
                    </div>
                    <h3 class="font-semibold text-gray-900 hover:text-primary-600 transition-colors">{{ subcategory.name }}</h3>
                  </div>
                  <span 
                    v-if="selectedSubcategory?.id === subcategory.id"
                    class="text-primary-500 bg-primary-100 w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    ✓
                  </span>
                </div>
                <p class="text-gray-600 text-sm line-clamp-2 mb-3">{{ subcategory.description }}</p>
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  {{ subcategory.promptCount || 0 }} 个提示词
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 提示词列表 -->
        <div>
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div class="flex items-center space-x-4 mb-4 sm:mb-0">
              <h2 class="text-xl md:text-2xl font-semibold text-gray-900">
                {{ selectedSubcategory ? selectedSubcategory.name + ' 的提示词' : '提示词列表' }}
              </h2>
              <span v-if="selectedSubcategory" class="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                子分类筛选中
              </span>
            </div>
            <div class="flex items-center space-x-4">
              <select
                v-model="sortBy"
                class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                @change="handleSortChange"
              >
                <option value="newest">最新</option>
                <option value="popular">最受欢迎</option>
                <option value="title">标题排序</option>
              </select>
            </div>
          </div>

          <div v-if="isLoadingPrompts" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              v-for="prompt in prompts"
              :key="prompt.id"
              class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              @click="$router.push({ name: 'prompt-detail', params: { id: prompt.id } })"
            >
              <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                  <span class="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                    {{ prompt.subcategory?.name || '未分类' }}
                  </span>
                  <span class="text-xs text-gray-500">
                    <svg class="w-3 h-3 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formatDate(prompt.createdAt) }}
                  </span>
                </div>
                <h3 class="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">{{ prompt.title }}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ getPromptPreview(prompt) }}</p>
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

          <!-- 加载更多状态 -->
          <div v-if="isLoadingMore" class="text-center py-12">
            <div class="inline-flex items-center px-6 py-3 bg-gray-50 text-gray-600 rounded-lg border border-gray-200">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在加载更多...
            </div>
          </div>

          <!-- 没有更多数据 -->
          <div v-else-if="prompts.length > 0 && !hasMore" class="text-center py-8">
            <span class="text-gray-500 text-sm">没有更多数据了</span>
          </div>

          <!-- 空状态 -->
          <div v-if="prompts.length === 0 && !isLoadingPrompts" class="text-center py-16">
            <div class="text-gray-400 mb-4">
              <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">暂无提示词</h3>
            <p class="text-gray-500 mb-6">当前分类下还没有提示词</p>
            <router-link
                v-if="authStore.isAuthenticated"
                to="/create-prompt"
                class="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium shadow-sm hover:shadow"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                创建第一个提示词
              </router-link>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePromptsStore } from '@/stores/prompts'
import MainLayout from '@/components/Layout/MainLayout.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const promptsStore = usePromptsStore()

const categoryId = computed(() => route.params.id)
const category = ref(null)
const subcategories = ref([])
const prompts = ref([])
const sortBy = ref('newest')
const isLoadingPrompts = ref(false)
const isLoadingMore = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const hasMore = ref(true)
const selectedSubcategory = ref(null) // 当前选中的子分类

// 加载分类详情
const loadCategoryData = async () => {
  try {
    const response = await promptsStore.fetchCategoryDetail(categoryId.value)
    category.value = response.data.category
    subcategories.value = response.data.subcategories || []
    // 加载分类下的提示词
    await loadCategoryPrompts()
  } catch (error) {
    console.error('加载分类详情失败:', error)
  }
}

// 加载分类下的提示词
const loadCategoryPrompts = async (loadMore = false) => {
  if (loadMore) {
    isLoadingMore.value = true
  } else {
    isLoadingPrompts.value = true
    currentPage.value = 1
    hasMore.value = true
  }
  
  try {
    const params = {
      category: categoryId.value,
      sort: sortBy.value,
      limit: 12,
      limit: 12,
      page: currentPage.value
    }
    const response = await promptsStore.fetchPrompts(params)
    
    if (loadMore) {
      // 加载更多时，将新数据追加到现有列表
      prompts.value = [...prompts.value, ...(response.data.prompts || [])]
    } else {
      // 首次加载或重新加载时，替换整个列表
      prompts.value = response.data.prompts || []
    }
    
    // 更新分页信息
    if (response.data.pagination) {
      currentPage.value = response.data.pagination.page
      totalPages.value = response.data.pagination.totalPages
      hasMore.value = currentPage.value < totalPages.value
    }
  } catch (error) {
    console.error('加载分类提示词失败:', error)
    if (!loadMore) {
      prompts.value = []
    }
  } finally {
    if (loadMore) {
      isLoadingMore.value = false
    } else {
      isLoadingPrompts.value = false
    }
  }
}

// 处理排序变化
const handleSortChange = () => {
  if (selectedSubcategory.value) {
    // 如果当前有选中的子分类，重新加载该子分类的提示词
    loadSubcategoryPrompts(selectedSubcategory.value.id)
  } else {
    // 否则加载整个分类的提示词
    loadCategoryPrompts()
  }
}

// 加载更多提示词
const loadMorePrompts = async () => {
  if (isLoadingMore.value || !hasMore.value) return
  
  currentPage.value += 1
  await loadCategoryPrompts(true)
}

// 无限滚动处理
const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
  const clientHeight = document.documentElement.clientHeight || window.innerHeight
  
  // 距离底部100px时触发加载更多
  if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore.value && !isLoadingMore.value) {
    if (selectedSubcategory.value) {
      loadMoreSubcategoryPrompts()
    } else {
      loadMorePrompts()
    }
  }
}

// 处理子分类点击
const handleSubcategoryClick = (subcategory) => {
  // 如果点击的是已选中的子分类，则清除筛选
  if (selectedSubcategory.value?.id === subcategory.id) {
    clearSubcategoryFilter()
    return
  }
  
  // 设置选中的子分类
  selectedSubcategory.value = subcategory
  
  // 加载该子分类下的提示词
  loadSubcategoryPrompts(subcategory.id)
}

// 清除子分类筛选
const clearSubcategoryFilter = () => {
  selectedSubcategory.value = null
  // 重新加载整个分类的提示词
  loadCategoryPrompts()
}

// 加载子分类提示词
const loadSubcategoryPrompts = async (subcategoryId, loadMore = false) => {
  if (loadMore) {
    isLoadingMore.value = true
  } else {
    isLoadingPrompts.value = true
    currentPage.value = 1
    hasMore.value = true
  }
  
  try {
    const params = {
      subcategory: subcategoryId,
      sort: sortBy.value,
      limit: 12,
      page: currentPage.value
    }
    const response = await promptsStore.fetchPrompts(params)
    
    if (loadMore) {
      // 加载更多时，将新数据追加到现有列表
      prompts.value = [...prompts.value, ...(response.data.prompts || [])]
    } else {
      // 首次加载或重新加载时，替换整个列表
      prompts.value = response.data.prompts || []
    }
    
    // 更新分页信息
    if (response.data.pagination) {
      currentPage.value = response.data.pagination.page
      totalPages.value = response.data.pagination.totalPages
      hasMore.value = currentPage.value < totalPages.value
    }
  } catch (error) {
    console.error('加载子分类提示词失败:', error)
    if (!loadMore) {
      prompts.value = []
    }
  } finally {
    if (loadMore) {
      isLoadingMore.value = false
    } else {
      isLoadingPrompts.value = false
    }
  }
}

// 加载更多子分类提示词
const loadMoreSubcategoryPrompts = async () => {
  if (isLoadingMore.value || !hasMore.value || !selectedSubcategory.value) return
  
  currentPage.value += 1
  await loadSubcategoryPrompts(selectedSubcategory.value.id, true)
}

// 返回提示词预览内容，使用content字段的前100个字符
const getPromptPreview = (prompt) => {
  return prompt.content ? prompt.content.substring(0, 100) + (prompt.content.length > 100 ? '...' : '') : '无内容'
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 根据子分类ID获取对应的图标背景色
const getSubcategoryIconClass = (subcategoryId) => {
  if (subcategoryId.includes('web')) {
    return 'bg-blue-500'
  } else if (subcategoryId.includes('mobile')) {
    return 'bg-green-500'
  } else if (subcategoryId.includes('website')) {
    return 'bg-purple-500'
  } else {
    return 'bg-primary-500'
  }
}

onMounted(() => {
  loadCategoryData()
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll)
})

watch(categoryId, () => {
  loadCategoryData()
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