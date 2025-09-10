import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { GeminiService, type GeminiModel, GEMINI_MODELS } from '@/services/openrouter'
import { LocalStorageService } from '@/services/localStorage'

export interface AIConfig {
  apiKey: string
  selectedModel: string
  temperature: number
  maxTokens: number
  systemPrompt: string
}

export const useAIConfigStore = defineStore('aiConfig', () => {
  // 狀態
  const apiKey = ref('')
  const selectedModel = ref('gemini-2.5-flash')
  const temperature = ref(0.7)
  const maxTokens = ref(1000)
  const systemPrompt = ref(
    '你是一個專業的 YouTube 影片助手，可以幫助使用者理解和討論影片內容。請用繁體中文回答。',
  )
  const isConfigured = ref(false)
  const availableModels = ref<GeminiModel[]>(GEMINI_MODELS)

  // Gemini 服務實例
  const geminiService = ref<GeminiService | null>(null)

  // 計算屬性
  const isApiKeyValid = computed(() => apiKey.value.length > 0)
  const currentModel = computed(() => {
    return (
      availableModels.value.find((model) => model.id === selectedModel.value) ||
      availableModels.value[0]
    )
  })

  // 配置資訊
  const config = computed(
    (): AIConfig => ({
      apiKey: apiKey.value,
      selectedModel: selectedModel.value,
      temperature: temperature.value,
      maxTokens: maxTokens.value,
      systemPrompt: systemPrompt.value,
    }),
  )

  // 從 localStorage 載入設定
  const loadFromStorage = () => {
    try {
      const savedSettings = LocalStorageService.getAppSettings()

      if (savedSettings.aiApiKey) {
        apiKey.value = savedSettings.aiApiKey
        isConfigured.value = true

        // 創建 Gemini 服務實例
        geminiService.value = new GeminiService(savedSettings.aiApiKey)

        // 載入可用模型
        loadAvailableModels()
      }

      if (savedSettings.selectedModel) {
        selectedModel.value = savedSettings.selectedModel
      }

      if (savedSettings.temperature !== undefined) {
        temperature.value = savedSettings.temperature
      }

      if (savedSettings.maxTokens !== undefined) {
        maxTokens.value = savedSettings.maxTokens
      }

      // 載入舊的系統提示（如果存在）
      const savedSystemPrompt = localStorage.getItem('tubetuner_ai_system_prompt')
      if (savedSystemPrompt) {
        systemPrompt.value = savedSystemPrompt
      }
    } catch (error) {
      console.error('載入 AI 設定失敗:', error)
    }
  }

  // 儲存設定到 localStorage
  const saveToStorage = () => {
    try {
      LocalStorageService.saveAppSettings({
        aiApiKey: apiKey.value,
        selectedModel: selectedModel.value,
        temperature: temperature.value,
        maxTokens: maxTokens.value,
      })
      // 系統提示仍使用舊的方式儲存
      localStorage.setItem('tubetuner_ai_system_prompt', systemPrompt.value)
    } catch (error) {
      console.error('儲存 AI 設定失敗:', error)
    }
  }

  // 設定 API Key
  const setApiKey = async (newApiKey: string): Promise<boolean> => {
    if (!newApiKey.trim()) {
      throw new Error('API Key 不能為空')
    }

    // 直接設定 API Key，不做預先驗證
    try {
      apiKey.value = newApiKey.trim()
      geminiService.value = new GeminiService(newApiKey.trim())
      isConfigured.value = true

      // 儲存設定
      saveToStorage()

      return true
    } catch (error) {
      console.error('設定 API Key 失敗:', error)
      throw error
    }
  }

  // 使用固定的 Gemini 模型列表
  const loadAvailableModels = async () => {
    // 直接使用預設的 Gemini 模型列表
    availableModels.value = GEMINI_MODELS
    // 如果當前選擇的模型不在清單中，回退到第一個
    if (!GEMINI_MODELS.find((m) => m.id === selectedModel.value)) {
      selectedModel.value = GEMINI_MODELS[0].id
      saveToStorage()
    }
  }

  // 更新模型
  const setSelectedModel = (modelId: string) => {
    const model = availableModels.value.find((m) => m.id === modelId)
    if (model) {
      selectedModel.value = modelId
      saveToStorage()
    }
  }

  // 更新溫度
  const setTemperature = (temp: number) => {
    temperature.value = Math.max(0, Math.min(2, temp))
    saveToStorage()
  }

  // 更新最大 tokens
  const setMaxTokens = (tokens: number) => {
    maxTokens.value = Math.max(1, Math.min(4000, tokens))
    saveToStorage()
  }

  // 更新系統提示
  const setSystemPrompt = (prompt: string) => {
    systemPrompt.value = prompt
    saveToStorage()
  }

  // 重置設定
  const resetConfig = () => {
    apiKey.value = ''
    selectedModel.value = 'gemini-2.0-flash-exp'
    temperature.value = 0.7
    maxTokens.value = 1000
    systemPrompt.value =
      '你是一個專業的 YouTube 影片助手，可以幫助使用者理解和討論影片內容。請用繁體中文回答。'
    isConfigured.value = false
    geminiService.value = null
    availableModels.value = GEMINI_MODELS

    // 清除 localStorage
    try {
      localStorage.removeItem('tubetuner_ai_api_key')
      localStorage.removeItem('tubetuner_ai_model')
      localStorage.removeItem('tubetuner_ai_temperature')
      localStorage.removeItem('tubetuner_ai_max_tokens')
      localStorage.removeItem('tubetuner_ai_system_prompt')
    } catch (error) {
      console.error('清除儲存設定失敗:', error)
    }
  }

  // 獲取 Gemini 服務實例
  const getService = () => {
    return geminiService.value
  }

  // 檢查是否可以使用 AI 功能
  const canUseAI = computed(() => {
    return isConfigured.value && isApiKeyValid.value && geminiService.value !== null
  })

  // 初始化時載入設定
  loadFromStorage()

  return {
    // 狀態
    apiKey,
    selectedModel,
    temperature,
    maxTokens,
    systemPrompt,
    isConfigured,
    availableModels,

    // 計算屬性
    isApiKeyValid,
    currentModel,
    config,
    canUseAI,

    // 方法
    loadFromStorage,
    saveToStorage,
    setApiKey,
    loadAvailableModels,
    setModel: setSelectedModel,
    setSelectedModel,
    setTemperature,
    setMaxTokens,
    setSystemPrompt,
    resetConfig,
    getService,
  }
})
