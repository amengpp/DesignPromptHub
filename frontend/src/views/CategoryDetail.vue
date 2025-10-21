<template>
  <MainLayout>
    <div class="py-8">
      <div class="container">
        <!-- 面包屑导航 -->
        <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <router-link to="/" class="hover:text-primary-600">首页</router-link>
          <span>/</span>
          <router-link to="/categories" class="hover:text-primary-600">分类</router-link>
          <span>/</span>
          <span class="text-gray-900">{{ category?.name }}</span>
        </nav>

        <!-- 分类信息 -->
        <div v-if="promptsStore.isLoading" class="animate-pulse">
          <div class="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        </div>

        <div v-else-if="category" class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ category.name }}</h1>
          <p class="text-gray-600">{{ category.description }}</p>
        </div>

        <!-- 子分类 -->
        <div v-if="subcategories.length > 0" class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">子分类</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div
              v-for="subcategory in subcategories"
              :key="subcategory.id"
              class="card hover:shadow-lg transition-shadow cursor-pointer"
              @click="handleSubcategoryClick(subcategory)"
            >
              <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-2">{{ subcategory.name }}</h3>
                <p class="text-gray-600 text-sm line-clamp-2">{{ subcategory.description }}</p>
                <div class="mt-3 text-sm text-gray-500">
                  {{ subcategory.promptCount || 0 }} 个提示词
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 提示词列表 -->
        <div>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">提示词列表</h2>
            <div class="flex items-center space-x-4">
              <select
                v-model="sortBy"
                class="form-input text-sm w-auto"
                @change="handleSortChange"
              >
                <option value="newest">最新</option>
                <option value="popular">最受欢迎</option>
                <option value="title">标题排序</option>
              </select>
            </div>
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
              v-for="prompt in prompts"
              :key="prompt.id"
              class="card hover:shadow-lg transition-shadow cursor-pointer"
              @click="$router.push({ name: 'prompt-detail', params: { id: prompt.id } })"
            >
              <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                  <span class="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                    {{ prompt.subcategory?.name || '未分类' }}
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
          <div v-if="prompts.length === 0 && !promptsStore.isLoading" class="text-center py-16">
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
              class="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
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
import { ref, computed, onMounted, watch } from 'vue'
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

const loadCategoryData = async () => {
  try {
    const response = await promptsStore.fetchCategoryDetail(categoryId.value)
    category.value = response.data.category
    subcategories.value = response.data.subcategories || []
    prompts.value = response.data.prompts || []
  } catch (error) {
    console.error('加载分类详情失败:', error)
  }
}

const handleSortChange = () => {
  // 这里可以实现排序逻辑
  console.log('排序方式:', sortBy.value)
}

const handleSubcategoryClick = (subcategory) => {
  // 可以跳转到子分类页面或过滤提示词
  console.log('选择子分类:', subcategory)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadCategoryData()
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