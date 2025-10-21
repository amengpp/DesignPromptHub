<template>
  <MainLayout>
    <div class="py-8">
      <div class="container">
        <!-- 页面标题 -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">分类浏览</h1>
          <p class="text-gray-600">探索我们精心整理的提示词分类，涵盖各种应用场景和需求</p>
        </div>

        <!-- 分类网格 -->
        <div v-if="promptsStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="card animate-pulse">
            <div class="h-48 bg-gray-200 rounded-t-xl"></div>
            <div class="p-6">
              <div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-full mb-1"></div>
              <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="category in promptsStore.categories"
            :key="category.id"
            class="card hover:shadow-lg transition-shadow cursor-pointer group"
            @click="$router.push({ name: 'category-detail', params: { id: category.id } })"
          >
            <div class="h-48 bg-gradient-to-br from-primary-100 to-primary-50 rounded-t-xl flex items-center justify-center">
              <div class="w-20 h-20 bg-primary-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="text-white text-3xl font-bold">{{ category.name.charAt(0) }}</span>
              </div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ category.name }}</h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ category.description }}</p>
              <div class="flex justify-between items-center text-sm text-gray-500">
                <span>{{ category.promptCount || 0 }} 个提示词</span>
                <span class="text-primary-500 font-medium group-hover:translate-x-1 transition-transform">
                  查看详情 →
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="promptsStore.categories.length === 0 && !promptsStore.isLoading" class="text-center py-16">
          <div class="text-gray-400 mb-4">
            <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无分类</h3>
          <p class="text-gray-500 mb-6">当前还没有创建任何分类</p>
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
  </MainLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePromptsStore } from '@/stores/prompts'
import MainLayout from '@/components/Layout/MainLayout.vue'

const authStore = useAuthStore()
const promptsStore = usePromptsStore()

onMounted(async () => {
  try {
    await promptsStore.fetchCategories()
  } catch (error) {
    console.error('加载分类失败:', error)
  }
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>