import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const usePromptsStore = defineStore('prompts', () => {
  const categories = ref([])
  const prompts = ref([])
  const currentPrompt = ref(null)
  const isLoading = ref(false)
  const searchResults = ref([])

  // 获取所有分类
  const fetchCategories = async () => {
    isLoading.value = true
    try {
      const response = await api.get('/categories')
      categories.value = response.data.data
      return response.data
    } catch (error) {
      throw error.response?.data || { message: '获取分类失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 获取分类详情
  const fetchCategoryDetail = async (categoryId) => {
    isLoading.value = true
    try {
      const response = await api.get(`/categories/${categoryId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: '获取分类详情失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 获取提示词列表
  const fetchPrompts = async (params = {}) => {
    isLoading.value = true
    try {
      const response = await api.get('/prompts', { params })
      prompts.value = response.data.data.prompts
      return response.data
    } catch (error) {
      throw error.response?.data || { message: '获取提示词失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 获取提示词详情
  const fetchPromptDetail = async (promptId) => {
    isLoading.value = true
    try {
      const response = await api.get(`/prompts/${promptId}`)
      currentPrompt.value = response.data.data
      return response.data
    } catch (error) {
      throw error.response?.data || { message: '获取提示词详情失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 搜索提示词
  const searchPrompts = async (query, filters = {}) => {
    isLoading.value = true
    try {
      const response = await api.get('/search', { 
        params: { q: query, ...filters }
      })
      searchResults.value = response.data.data.prompts
      return response.data
    } catch (error) {
      throw error.response?.data || { message: '搜索失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 创建提示词
  const createPrompt = async (promptData) => {
    isLoading.value = true
    try {
      const response = await api.post('/prompts', promptData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: '创建提示词失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 更新提示词
  const updatePrompt = async (promptId, promptData) => {
    isLoading.value = true
    try {
      const response = await api.put(`/prompts/${promptId}`, promptData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: '更新提示词失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 删除提示词
  const deletePrompt = async (promptId) => {
    isLoading.value = true
    try {
      const response = await api.delete(`/prompts/${promptId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: '删除提示词失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 获取用户提示词
  const fetchUserPrompts = async () => {
    isLoading.value = true
    try {
      const response = await api.get('/prompts/my')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: '获取用户提示词失败' }
    } finally {
      isLoading.value = false
    }
  }

  // 清空搜索结果
  const clearSearchResults = () => {
    searchResults.value = []
  }

  return {
    categories,
    prompts,
    currentPrompt,
    searchResults,
    isLoading,
    fetchCategories,
    fetchCategoryDetail,
    fetchPrompts,
    fetchPromptDetail,
    searchPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    fetchUserPrompts,
    clearSearchResults
  }
})