<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div class="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <!-- 標題列 -->
        <div class="flex items-center justify-between p-6 border-b border-gray-700">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 class="text-xl font-bold text-white">AI 助手設定</h2>
          </div>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 內容區 -->
        <div class="p-6 space-y-6">
          <!-- API Key 設定 -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-300">OpenRouter API Key</label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                取得 API Key
              </a>
            </div>
            <div class="relative">
              <input
                v-model="localApiKey"
                :type="showApiKey ? 'text' : 'password'"
                placeholder="請輸入您的 OpenRouter API Key..."
                class="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @input="clearError"
              />
              <button
                @click="showApiKey = !showApiKey"
                type="button"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <svg v-if="showApiKey" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </button>
            </div>
            <p class="text-xs text-gray-500">
              API Key 僅保存在您的瀏覽器中，不會發送到任何第三方伺服器
            </p>
          </div>

          <!-- 錯誤訊息 -->
          <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p class="text-red-400 text-sm">{{ error }}</p>
          </div>

          <!-- 成功訊息 -->
          <div v-if="aiConfig.isConfigured" class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p class="text-green-400 text-sm flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              AI 助手已成功設定！
            </p>
          </div>

          <!-- 模型選擇 -->
          <div v-if="aiConfig.isConfigured" class="space-y-3">
            <label class="text-sm font-medium text-gray-300">選擇 AI 模型</label>
            <select
              v-model="aiConfig.selectedModel"
              @change="aiConfig.saveToStorage()"
              class="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option
                v-for="model in aiConfig.availableModels"
                :key="model.id"
                :value="model.id"
                class="bg-gray-700"
              >
                {{ model.name }}
                <span v-if="model.description" class="text-gray-400">
                  - {{ model.description }}
                </span>
              </option>
            </select>
            <p class="text-xs text-gray-500">
              目前選擇：{{ aiConfig.currentModel?.name || '未知模型' }}
            </p>
          </div>

          <!-- 進階設定 -->
          <div v-if="aiConfig.isConfigured && showAdvanced" class="space-y-4">
            <!-- 溫度設定 -->
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-sm font-medium text-gray-300">創造性 (Temperature)</label>
                <span class="text-sm text-gray-400">{{ aiConfig.temperature }}</span>
              </div>
              <input
                v-model.number="aiConfig.temperature"
                @input="aiConfig.saveToStorage()"
                type="range"
                min="0"
                max="2"
                step="0.1"
                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div class="flex justify-between text-xs text-gray-500">
                <span>保守 (0)</span>
                <span>創意 (2)</span>
              </div>
            </div>

            <!-- 最大 Tokens -->
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-sm font-medium text-gray-300">最大回應長度</label>
                <span class="text-sm text-gray-400">{{ aiConfig.maxTokens }} tokens</span>
              </div>
              <input
                v-model.number="aiConfig.maxTokens"
                @input="aiConfig.saveToStorage()"
                type="range"
                min="100"
                max="4000"
                step="100"
                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div class="flex justify-between text-xs text-gray-500">
                <span>簡短 (100)</span>
                <span>詳細 (4000)</span>
              </div>
            </div>

            <!-- 系統提示 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-300">系統提示</label>
              <textarea
                v-model="aiConfig.systemPrompt"
                @input="aiConfig.saveToStorage()"
                rows="3"
                class="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="設定 AI 助手的行為和回應風格..."
              />
            </div>
          </div>

          <!-- 進階設定切換 -->
          <button
            v-if="aiConfig.isConfigured"
            @click="showAdvanced = !showAdvanced"
            class="w-full text-left text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
          >
            <svg
              :class="['w-4 h-4 transition-transform', showAdvanced ? 'rotate-90' : '']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            {{ showAdvanced ? '隱藏' : '顯示' }}進階設定
          </button>
        </div>

        <!-- 底部按鈕 -->
        <div class="flex gap-3 p-6 border-t border-gray-700">
          <button
            v-if="aiConfig.isConfigured"
            @click="resetSettings"
            class="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition-all text-sm font-medium"
          >
            重置設定
          </button>
          <button
            @click="saveSettings"
            :disabled="isSaving || !localApiKey.trim()"
            :class="[
              'flex-1 px-4 py-2 rounded-lg transition-all text-sm font-medium',
              isSaving || !localApiKey.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            ]"
          >
            {{ isSaving ? '驗證中...' : aiConfig.isConfigured ? '更新設定' : '儲存設定' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAIConfigStore } from '@/stores/aiConfig'

interface Props {
  show: boolean
}

defineProps<Props>()

const emit = defineEmits(['close'])

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

// 關閉模態框
const closeModal = () => {
  emit('close')
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
    // 設定成功後關閉模態框
    setTimeout(() => {
      closeModal()
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
/* 自定義滑桿樣式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

/* 模態框動畫 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>