<template>
  <footer class="bg-white border-t border-gray-200 mt-auto">
    <div class="container py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Logo和描述 -->
        <div class="md:col-span-2">
          <div class="flex items-center space-x-2 mb-4">
            <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">P</span>
            </div>
            <span class="text-xl font-bold text-gray-900">PromptHub</span>
          </div>
          <p class="text-gray-600 max-w-md">
            专业的AI提示词管理平台，帮助您发现、分享和管理高质量的AI提示词，提升工作效率和创造力。
          </p>
        </div>

        <!-- 快速链接 -->
        <div>
          <h3 class="font-semibold text-gray-900 mb-4">快速链接</h3>
          <ul class="space-y-2">
            <li>
              <router-link to="/" class="text-gray-600 hover:text-primary-600">
                首页
              </router-link>
            </li>
            <li>
              <router-link to="/categories" class="text-gray-600 hover:text-primary-600">
                分类浏览
              </router-link>
            </li>
            <li>
              <router-link to="/search" class="text-gray-600 hover:text-primary-600">
                搜索
              </router-link>
            </li>
          </ul>
        </div>

        <!-- 用户相关 -->
        <div>
          <h3 class="font-semibold text-gray-900 mb-4">用户</h3>
          <ul class="space-y-2">
            <li v-if="!authStore.isAuthenticated">
              <router-link to="/login" class="text-gray-600 hover:text-primary-600">
                登录
              </router-link>
            </li>
            <li v-if="!authStore.isAuthenticated">
              <router-link to="/register" class="text-gray-600 hover:text-primary-600">
                注册
              </router-link>
            </li>
            <li v-if="authStore.isAuthenticated">
              <router-link to="/profile" class="text-gray-600 hover:text-primary-600">
                个人资料
              </router-link>
            </li>
            <li v-if="authStore.isAuthenticated">
              <router-link to="/my-prompts" class="text-gray-600 hover:text-primary-600">
                我的提示词
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- 底部版权 -->
      <div class="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500 text-sm">
        <p>&copy; 2025 Prompt提示词管理平台. 保留所有权利.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>