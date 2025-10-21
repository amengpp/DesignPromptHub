<template>
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <div class="container">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">P</span>
          </div>
          <span class="text-xl font-bold text-gray-900">PromptHub</span>
        </router-link>

        <!-- 搜索框（桌面端） -->
        <div class="hidden md:flex flex-1 max-w-md mx-8">
          <div class="relative w-full">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索提示词..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              @keyup.enter="handleSearch"
            >
            <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 导航菜单 -->
        <nav class="flex items-center space-x-4">
          <!-- 移动端搜索按钮 -->
          <button
            class="md:hidden p-2 text-gray-500 hover:text-gray-700"
            @click="showMobileSearch = true"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- 分类链接 -->
          <router-link
            to="/categories"
            class="hidden sm:block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
          >
            分类浏览
          </router-link>

          <!-- 用户菜单 -->
          <div v-if="authStore.isAuthenticated" class="flex items-center space-x-3">
            <router-link
              to="/create-prompt"
              class="hidden sm:flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              创建
            </router-link>
            
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              >
                <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span class="text-gray-700 font-medium text-sm">
                    {{ authStore.user?.displayName?.charAt(0) || authStore.user?.username?.charAt(0) || 'U' }}
                  </span>
                </div>
                <span class="hidden sm:block text-gray-700 font-medium">
                  {{ authStore.user?.displayName || authStore.user?.username }}
                </span>
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- 用户下拉菜单 -->
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                v-click-outside="() => showUserMenu = false"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  个人资料
                </router-link>
                <router-link
                  to="/my-prompts"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  我的提示词
                </router-link>
                <div class="border-t border-gray-200 my-1"></div>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>

          <!-- 登录/注册按钮 -->
          <div v-else class="flex items-center space-x-2">
            <router-link
              to="/login"
              class="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium"
            >
              登录
            </router-link>
            <router-link
              to="/register"
              class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
            >
              注册
            </router-link>
          </div>
        </nav>
      </div>

      <!-- 移动端搜索栏 -->
      <div v-if="showMobileSearch" class="pb-4 md:hidden">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索提示词..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            @keyup.enter="handleSearch"
          >
          <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            @click="showMobileSearch = false"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const showMobileSearch = ref(false)
const showUserMenu = ref(false)

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ 
      name: 'search', 
      query: { q: searchQuery.value.trim() } 
    })
    searchQuery.value = ''
    showMobileSearch.value = false
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    showUserMenu.value = false
    router.push('/')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

// 点击外部关闭菜单指令
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>