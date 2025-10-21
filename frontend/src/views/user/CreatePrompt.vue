<template>
  <MainLayout>
    <div class="py-8">
      <div class="container">
        <!-- 页面标题 -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">创建提示词</h1>
          <p class="text-gray-600">分享您的优质提示词给其他用户</p>
        </div>

        <div class="max-w-4xl">
          <form @submit.prevent="handleSubmit" class="card">
            <div class="card-body space-y-6">
              <!-- 标题 -->
              <div>
                <label class="form-label">提示词标题</label>
                <input
                  v-model="form.title"
                  type="text"
                  class="form-input"
                  placeholder="请输入提示词标题"
                  required
                >
              </div>

              <!-- 分类选择 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label">主分类</label>
                  <select
                    v-model="form.categoryId"
                    class="form-input"
                    required
                    @change="handleCategoryChange"
                  >
                    <option value="">请选择分类</option>
                    <option 
                      v-for="category in promptsStore.categories" 
                      :key="category.id" 
                      :value="category.id"
                    >
                      {{ category.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="form-label">子分类</label>
                  <select
                    v-model="form.subcategoryId"
                    class="form-input"
                    :disabled="!form.categoryId"
                  >
                    <option value="">请选择子分类（可选）</option>
                    <option 
                      v-for="subcategory in availableSubcategories" 
                      :key="subcategory.id" 
                      :value="subcategory.id"
                    >
                      {{ subcategory.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- 标签 -->
              <div>
                <label class="form-label">标签</label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <span
                    v-for="(tag, index) in form.tags"
                    :key="index"
                    class="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {{ tag }}
                    <button
                      type="button"
                      @click="removeTag(index)"
                      class="ml-1 text-primary-500 hover:text-primary-700"
                    >
                      ×
                    </button>
                  </span>
                </div>
                <div class="flex space-x-2">
                  <input
                    v-model="newTag"
                    type="text"
                    class="form-input flex-1"
                    placeholder="输入标签后按回车添加"
                    @keydown.enter.prevent="addTag"
                  >
                  <button
                    type="button"
                    @click="addTag"
                    class="btn btn-outline"
                  >
                    添加
                  </button>
                </div>
              </div>

              <!-- 内容 -->
              <div>
                <label class="form-label">提示词内容</label>
                <textarea
                  v-model="form.content"
                  rows="12"
                  class="form-input"
                  placeholder="请输入提示词的具体内容..."
                  required
                ></textarea>
              </div>

              <!-- 描述 -->
              <div>
                <label class="form-label">描述（可选）</label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  class="form-input"
                  placeholder="请输入提示词的简要描述..."
                ></textarea>
              </div>

              <!-- 可见性 -->
              <div>
                <label class="form-label">可见性设置</label>
                <div class="flex items-center space-x-4">
                  <label class="flex items-center">
                    <input
                      v-model="form.isPublic"
                      type="radio"
                      :value="true"
                      class="mr-2"
                    >
                    <span>公开（所有用户可见）</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="form.isPublic"
                      type="radio"
                      :value="false"
                      class="mr-2"
                    >
                    <span>私有（仅自己可见）</span>
                  </label>
                </div>
              </div>

              <!-- 提交按钮 -->
              <div class="flex space-x-4">
                <button
                  type="submit"
                  :disabled="promptsStore.isLoading"
                  class="btn btn-primary"
                >
                  <span v-if="promptsStore.isLoading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    创建中...
                  </span>
                  <span v-else>创建提示词</span>
                </button>
                <router-link to="/my-prompts" class="btn btn-outline">
                  取消
                </router-link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePromptsStore } from '@/stores/prompts'
import MainLayout from '@/components/Layout/MainLayout.vue'

const router = useRouter()
const promptsStore = usePromptsStore()

const newTag = ref('')

const form = reactive({
  title: '',
  categoryId: '',
  subcategoryId: '',
  tags: [],
  content: '',
  description: '',
  isPublic: true
})

const availableSubcategories = computed(() => {
  if (!form.categoryId) return []
  const category = promptsStore.categories.find(c => c.id === form.categoryId)
  return category?.subcategories || []
})

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index) => {
  form.tags.splice(index, 1)
}

const handleCategoryChange = () => {
  form.subcategoryId = ''
}

const handleSubmit = async () => {
  try {
    await promptsStore.createPrompt(form)
    router.push('/my-prompts')
  } catch (error) {
    console.error('创建提示词失败:', error)
  }
}

onMounted(async () => {
  await promptsStore.fetchCategories()
})
</script>