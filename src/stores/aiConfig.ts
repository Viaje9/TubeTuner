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
  const maxTokens = ref(65536)
  const systemPrompt = ref(
    '你是一個專業的 YouTube 影片助手，可以幫助使用者理解和討論影片內容。請用繁體中文回答。',
  )
  const isConfigured = ref(false)
  const availableModels = ref<GeminiModel[]>(GEMINI_MODELS)
  const isLoadingModels = ref(false)
  const modelsLoadError = ref('')

  // 模型快取相關
  const MODELS_CACHE_KEY = 'tubetuner_models_cache'
  const MODELS_CACHE_EXPIRY_KEY = 'tubetuner_models_cache_expiry'
  const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 小時

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

        // 載入可用模型（異步）
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

      // 載入可用模型列表
      await loadAvailableModels()

      return true
    } catch (error) {
      console.error('設定 API Key 失敗:', error)
      throw error
    }
  }

  // 從快取載入模型列表
  const loadModelsFromCache = (): GeminiModel[] | null => {
    try {
      const cached = localStorage.getItem(MODELS_CACHE_KEY)
      const expiry = localStorage.getItem(MODELS_CACHE_EXPIRY_KEY)

      if (cached && expiry) {
        const expiryTime = parseInt(expiry)
        if (Date.now() < expiryTime) {
          return JSON.parse(cached)
        }
      }
    } catch (error) {
      console.warn('載入模型快取失敗:', error)
    }
    return null
  }

  // 儲存模型列表到快取
  const saveModelsToCache = (models: GeminiModel[]) => {
    try {
      localStorage.setItem(MODELS_CACHE_KEY, JSON.stringify(models))
      localStorage.setItem(MODELS_CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString())
    } catch (error) {
      console.warn('儲存模型快取失敗:', error)
    }
  }

  // 從 API 載入可用模型列表
  const loadAvailableModels = async (forceRefresh = false) => {
    if (!geminiService.value) {
      console.warn('Gemini 服務未初始化')
      return
    }

    // 如果不是強制重新載入，先嘗試從快取載入
    if (!forceRefresh) {
      const cachedModels = loadModelsFromCache()
      if (cachedModels && cachedModels.length > 0) {
        availableModels.value = cachedModels

        // 檢查當前選擇的模型是否還在列表中
        if (!cachedModels.find((m) => m.id === selectedModel.value)) {
          selectedModel.value = cachedModels[0].id
          saveToStorage()
        }

        console.log('從快取載入模型列表')
        return
      }
    }

    isLoadingModels.value = true
    modelsLoadError.value = ''

    try {
      const models = await geminiService.value.listModels()

      if (models && models.length > 0) {
        availableModels.value = models

        // 儲存到快取
        saveModelsToCache(models)

        // 如果當前選擇的模型不在新的清單中，選擇第一個可用的模型
        if (!models.find((m) => m.id === selectedModel.value)) {
          selectedModel.value = models[0].id
          saveToStorage()
        }

        console.log('從 API 載入模型列表')
      } else {
        // 如果沒有獲得模型，使用預設列表
        availableModels.value = GEMINI_MODELS
        modelsLoadError.value = '無法載入模型列表，使用預設模型'
      }
    } catch (error) {
      console.error('載入模型列表失敗:', error)
      modelsLoadError.value = error instanceof Error ? error.message : '載入模型失敗'
      // 發生錯誤時使用預設模型列表
      availableModels.value = GEMINI_MODELS
    } finally {
      isLoadingModels.value = false
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
    selectedModel.value = 'gemini-2.5-flash'
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
      // 清除模型快取
      localStorage.removeItem(MODELS_CACHE_KEY)
      localStorage.removeItem(MODELS_CACHE_EXPIRY_KEY)
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
    isLoadingModels,
    modelsLoadError,

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
