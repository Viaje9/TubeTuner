<template>
  <div
    class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-[100dvh] relative"
  >
    <div class="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <!-- 標題區域 -->
      <div class="flex items-center justify-between mb-4 sm:mb-6">
        <div class="flex flex-col">
          <h1
            class="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent break-words"
          >
            TubeTuner
          </h1>
          <p class="text-sm sm:text-base text-gray-300 break-words">AI 助手設定</p>
        </div>
        <!-- 控制按鈕群組 -->
        <div class="flex items-center gap-3">
          <button
            @click="goHome"
            class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-3 sm:px-4 sm:py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-75 flex items-center gap-2 active:scale-95 touch-manipulation min-h-[44px] min-w-[44px] whitespace-nowrap"
            title="播放器"
          >
            <svg
              class="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0V11a1 1 0 011-1h2a1 1 0 011 1v10m0 0h3a1 1 0 001-1V10m-11 10h3m-3 0v-3"
              />
            </svg>
          </button>

          <button
            @click="goToMenu"
            class="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-3 py-3 sm:px-4 sm:py-3 rounded-lg hover:shadow-lg hover:shadow-gray-500/30 transition-all duration-200 flex items-center gap-2 active:scale-95 touch-manipulation min-h-[44px] min-w-[44px] whitespace-nowrap"
            title="功能選單"
          >
            <svg
              class="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 設定內容區域 -->
      <div class="max-w-2xl mx-auto">
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl">
          <div class="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            <!-- API Key 設定 -->
            <div class="space-y-4">
              <div
                class="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-2 sm:gap-0"
              >
                <label class="text-base sm:text-lg font-semibold text-gray-200"
                  >OpenRouter API Key</label
                >
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm sm:text-base text-blue-400 hover:text-blue-300 underline transition-colors touch-manipulation min-h-[44px] flex items-center"
                >
                  取得 API Key
                </a>
              </div>
              <div class="relative">
                <input
                  v-model="localApiKey"
                  :type="showApiKey ? 'text' : 'password'"
                  placeholder="請輸入您的 OpenRouter API Key..."
                  class="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-4 pr-14 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all touch-manipulation"
                  @input="clearError"
                />
                <button
                  @click="showApiKey = !showApiKey"
                  type="button"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <svg
                    v-if="showApiKey"
                    class="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                </button>
              </div>
              <p class="text-sm sm:text-base text-gray-500">
                API Key 僅保存在您的瀏覽器中，不會發送到任何第三方伺服器
              </p>
            </div>

            <!-- 錯誤訊息 -->
            <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p class="text-red-400 text-sm sm:text-base">{{ error }}</p>
            </div>

            <!-- 成功訊息 -->
            <div
              v-if="aiConfig.isConfigured"
              class="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
            >
              <p class="text-green-400 text-sm sm:text-base flex items-center gap-2">
                <svg
                  class="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                AI 助手已成功設定！
              </p>
            </div>

            <!-- 模型選擇 -->
            <div v-if="aiConfig.isConfigured" class="space-y-4">
              <label class="text-base sm:text-lg font-semibold text-gray-200">選擇 AI 模型</label>
              <select
                v-model="aiConfig.selectedModel"
                @change="aiConfig.saveToStorage()"
                class="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-4 text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all touch-manipulation"
              >
                <option
                  v-for="model in aiConfig.availableModels"
                  :key="model.id"
                  :value="model.id"
                  class="bg-gray-700"
                >
                  {{ model.name }}
                </option>
              </select>
              <p class="text-sm sm:text-base text-gray-500">
                目前選擇：{{ aiConfig.currentModel?.name || '未知模型' }}
              </p>
            </div>

            <!-- 進階設定區域 -->
            <div v-if="aiConfig.isConfigured" class="space-y-6">
              <!-- 進階設定標題 -->
              <div class="flex items-center justify-between">
                <h3 class="text-base sm:text-lg font-semibold text-gray-200">進階設定</h3>
                <button
                  @click="showAdvanced = !showAdvanced"
                  class="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 text-sm sm:text-base touch-manipulation min-h-[44px] px-2 whitespace-nowrap"
                >
                  <svg
                    :class="['w-4 h-4 transition-transform', showAdvanced ? 'rotate-90' : '']"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  {{ showAdvanced ? '隱藏' : '顯示' }}進階設定
                </button>
              </div>

              <!-- 進階設定內容 -->
              <div v-if="showAdvanced" class="space-y-6 pt-4 border-t border-gray-700">
                <!-- 溫度設定 -->
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <label class="text-sm sm:text-base font-medium text-gray-300"
                      >創造性 (Temperature)</label
                    >
                    <span
                      class="text-sm sm:text-base text-gray-400 bg-gray-700 px-3 py-2 rounded"
                      >{{ aiConfig.temperature }}</span
                    >
                  </div>
                  <input
                    v-model.number="aiConfig.temperature"
                    @input="aiConfig.saveToStorage()"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    class="w-full h-4 sm:h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
                  />
                  <div class="flex justify-between text-xs sm:text-sm text-gray-500">
                    <span>保守 (0)</span>
                    <span>平衡 (1)</span>
                    <span>創意 (2)</span>
                  </div>
                  <p class="text-sm sm:text-base text-gray-500">
                    較低的值產生更一致的回應，較高的值更具創造性
                  </p>
                </div>

                <!-- 最大 Tokens -->
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <label class="text-sm sm:text-base font-medium text-gray-300"
                      >最大回應長度</label
                    >
                    <span class="text-sm sm:text-base text-gray-400 bg-gray-700 px-3 py-2 rounded"
                      >{{ aiConfig.maxTokens }} tokens</span
                    >
                  </div>
                  <input
                    v-model.number="aiConfig.maxTokens"
                    @input="aiConfig.saveToStorage()"
                    type="range"
                    min="100"
                    max="4000"
                    step="100"
                    class="w-full h-4 sm:h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
                  />
                  <div class="flex justify-between text-xs sm:text-sm text-gray-500">
                    <span>簡短 (100)</span>
                    <span>中等 (2000)</span>
                    <span>詳細 (4000)</span>
                  </div>
                  <p class="text-sm sm:text-base text-gray-500">
                    控制 AI 回應的最大長度，較高的值允許更詳細的回答
                  </p>
                </div>

                <!-- 系統提示 -->
                <div class="space-y-4">
                  <label class="text-sm sm:text-base font-medium text-gray-300">系統提示</label>
                  <textarea
                    v-model="aiConfig.systemPrompt"
                    @input="aiConfig.saveToStorage()"
                    rows="4"
                    class="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-4 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all touch-manipulation"
                    placeholder="設定 AI 助手的行為和回應風格..."
                  />
                  <p class="text-sm sm:text-base text-gray-500">
                    定義 AI 助手的人格和行為模式，影響所有對話的回應風格
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部按鈕區 -->
          <div
            class="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6 lg:p-8 border-t border-gray-700 bg-gray-800/30"
          >
            <button
              v-if="aiConfig.isConfigured"
              @click="resetSettings"
              class="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-6 py-4 rounded-lg transition-all font-medium touch-manipulation min-h-[48px] text-sm sm:text-base whitespace-nowrap"
            >
              重置設定
            </button>
            <button
              @click="saveSettings"
              :disabled="isSaving || !localApiKey.trim()"
              :class="[
                'flex-1 px-6 py-4 rounded-lg transition-all font-medium touch-manipulation min-h-[48px] text-sm sm:text-base whitespace-nowrap',
                isSaving || !localApiKey.trim()
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-lg hover:shadow-blue-500/20',
              ]"
            >
              {{ isSaving ? '驗證中...' : aiConfig.isConfigured ? '更新設定' : '儲存設定' }}
            </button>
          </div>
        </div>

        <!-- 使用說明 -->
        <div class="mt-6 sm:mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 sm:p-6">
          <h4 class="text-blue-400 font-medium mb-3 flex items-center gap-2 text-sm sm:text-base">
            <svg
              class="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            使用說明
          </h4>
          <ul class="text-blue-300 text-sm sm:text-base space-y-2 sm:space-y-3">
            <li>• AI 功能需要有效的 OpenRouter API Key 才能使用</li>
            <li>• 不同模型有不同的特色和性能表現，可根據需求選擇</li>
            <li>• Temperature 控制回應的創造性：0=保守準確，2=富創意性</li>
            <li>• 系統提示可以定義 AI 的人格和專業領域</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAIConfigStore } from '@/stores/aiConfig'

const router = useRouter()
const aiConfig = useAIConfigStore()

// 本地狀態
const localApiKey = ref('')
const showApiKey = ref(false)
const showAdvanced = ref(false)
const isSaving = ref(false)
const error = ref('')

// 載入當前設定
onMounted(() => {
  aiConfig.loadFromStorage()
  localApiKey.value = aiConfig.apiKey
})

// 導航函數
const goHome = () => {
  router.push('/')
}

const goToMenu = () => {
  router.push('/menu')
}

// 清除錯誤
const clearError = () => {
  error.value = ''
}

// 儲存設定
const saveSettings = async () => {
  if (!localApiKey.value.trim()) return

  isSaving.value = true
  error.value = ''

  try {
    await aiConfig.setApiKey(localApiKey.value)
    // 顯示成功訊息一段時間
    setTimeout(() => {
      // 可以選擇導航回上一頁或保持在當前頁面
      // router.back()
    }, 1000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '設定失敗'
  } finally {
    isSaving.value = false
  }
}

// 重置設定
const resetSettings = () => {
  if (confirm('確定要重置所有 AI 設定嗎？這將清除您的 API Key 和所有自訂設定。')) {
    aiConfig.resetConfig()
    localApiKey.value = ''
    showApiKey.value = false
    showAdvanced.value = false
    error.value = ''
  }
}
</script>

<style scoped>
/* 自定義滑桿樣式 - 手機版優化 */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transition: transform 0.2s ease;
}

@media (min-width: 640px) {
  .slider::-webkit-slider-thumb {
    width: 20px;
    height: 20px;
  }
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

@media (min-width: 640px) {
  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
  }
}

.slider::-webkit-slider-track {
  height: 16px;
  border-radius: 8px;
}

@media (min-width: 640px) {
  .slider::-webkit-slider-track {
    height: 12px;
    border-radius: 6px;
  }
}

.slider::-moz-range-track {
  height: 16px;
  border-radius: 8px;
}

@media (min-width: 640px) {
  .slider::-moz-range-track {
    height: 12px;
    border-radius: 6px;
  }
}

/* 觸控優化 */
.touch-manipulation {
  touch-action: manipulation;
}
</style>
