<template>
  <MainLayout>
    <div class="py-8">
      <div class="container">
        <!-- 页面标题 -->
        <div class="mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">我的提示词</h1>
              <p class="text-gray-600">管理您创建的所有提示词</p>
            </div>
            <router-link to="/create-prompt" class="btn btn-primary mt-4 sm:mt-0">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              创建新提示词
            </router-link>
          </div>
        </div>

        <!-- 提示词列表 -->
        <div v-if="promptsStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="card animate-pulse">
            <div class="p-6">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <div v-else-if="userPrompts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="prompt in userPrompts"
            :key="prompt.id"
            class="card hover:shadow-lg transition-shadow"
          >
            <div class="p-6">
              <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                  {{ prompt.category?.name }}
                </span>
                <div class="flex items-center space-x-2">
                  <button
                    @click="handleEdit(prompt)"
                    class="p-1 text-gray-400 hover:text-primary-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="handleDelete(prompt)"
                    class="p-1 text-gray-400 hover:text-red-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ prompt.title }}</h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ prompt.description }}</p>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">{{ formatDate(prompt.createdAt) }}</span>
                <span class="text-primary-500 font-medium">查看详情 →</span>
              </div>
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
          <h3 class="text-lg font-medium text-gray-900 mb-2">还没有创建提示词</h3>
          <p class="text-gray-500 mb-6">开始创建您的第一个提示词吧</p>
          <router-link to="/create-prompt" class="btn btn-primary">
            创建提示词
          </router-link>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePromptsStore } from '@/stores/prompts'
import MainLayout from '@/components/Layout/MainLayout.vue'

const router = useRouter()
const promptsStore = usePromptsStore()

const userPrompts = ref([])

const loadUserPrompts = async () => {
  try {
    const response = await promptsStore.fetchUserPrompts()
    userPrompts.value = response.data.prompts || []
  } catch (error) {
    console.error('加载用户提示词失败:', error)
  }
}

const handleEdit = (prompt) => {
  router.push({ name: 'edit-prompt', params: { id: prompt.id } })
}

const handleDelete = async (prompt) => {
  if (!confirm(`确定要删除提示词"${prompt.title}"吗？`)) {
    return
  }
  
  try {
    await promptsStore.deletePrompt(prompt.id)
    await loadUserPrompts() // 重新加载列表
  } catch (error) {
    console.error('删除提示词失败:', error)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadUserPrompts()
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