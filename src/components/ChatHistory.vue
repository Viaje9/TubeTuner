<template>
  <div v-if="chat.conversationHistory.length > 0" class="w-full">
    <!-- 自訂確認對話框 -->
    <Teleport to="body">
      <div 
        v-if="showConfirmDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="showConfirmDialog = false"
      >
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        
        <!-- 對話框 -->
        <div class="relative bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-700/50 animate-in">
          <div class="text-center">
            <!-- 圖示 -->
            <div class="mx-auto w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <!-- 標題 -->
            <h3 class="text-lg font-semibold text-white mb-2">清除對話記錄</h3>
            
            <!-- 說明 -->
            <p class="text-sm text-gray-400 mb-6">
              確定要清除所有 AI 對話記錄嗎？此操作無法復原。
            </p>
            
            <!-- 按鈕 -->
            <div class="flex gap-3">
              <button
                @click="showConfirmDialog = false"
                class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm font-medium"
              >
                取消
              </button>
              <button
                @click="confirmClear"
                class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                確定清除
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- 頂部控制區 -->
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs text-gray-400 font-mono">{{ formatTokenCount(chat.totalTokensUsed) }} tokens</span>
      <button
        @click="showConfirmDialog = true"
        class="text-gray-400 hover:text-red-400 transition-colors p-1"
        title="清除對話記錄"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <!-- 對話區域 -->
    <div 
      ref="chatContainer"
      class="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
    >
      <div
        v-for="message in chat.conversationHistory"
        :key="message.id"
        :class="[
          'flex gap-3',
          message.role === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <!-- 使用者訊息 -->
        <div
          v-if="message.role === 'user'"
          class="flex items-start gap-3 max-w-[80%]"
        >
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl rounded-br-sm px-4 py-3 shadow-lg">
            <p class="text-white text-sm leading-relaxed">{{ message.content }}</p>
            <div class="flex items-center justify-end gap-2 mt-2">
              <span class="text-xs text-blue-200 opacity-70">
                {{ formatTime(message.timestamp) }}
              </span>
            </div>
          </div>
          <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-white text-sm font-medium">我</span>
          </div>
        </div>

        <!-- AI 訊息 -->
        <div
          v-else
          class="flex items-start gap-3 max-w-[85%]"
        >
          <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <span class="text-white text-xs font-medium">AI</span>
          </div>
          <div class="bg-gray-700/50 rounded-2xl rounded-bl-sm px-4 py-3">
            <!-- 載入狀態 -->
            <div v-if="message.isLoading" class="flex items-center gap-2 text-gray-400">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm">AI 正在思考...</span>
            </div>
            <!-- 錯誤狀態 -->
            <div v-else-if="message.error" class="space-y-2">
              <p class="text-red-400 text-sm">{{ message.content }}</p>
              <div class="flex items-center gap-2">
                <span class="text-xs text-red-300">錯誤: {{ message.error }}</span>
                <button
                  @click="retryMessage()"
                  class="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  重試
                </button>
              </div>
            </div>
            <!-- 正常內容 -->
            <div v-else>
              <div 
                class="text-gray-100 text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                v-html="renderMarkdown(message.content)"
              ></div>
              <div class="flex items-center justify-between mt-3">
                <span class="text-xs text-gray-400">
                  {{ formatTime(message.timestamp) }}
                </span>
                <button
                  @click="copyMessage(message.content)"
                  class="text-gray-400 hover:text-gray-300 transition-colors"
                  title="複製訊息"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部間距 -->
      <div class="h-4"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { renderMarkdown } from '@/utils/markdown'

const chat = useChatStore()
const chatContainer = ref<HTMLElement>()
const showConfirmDialog = ref(false)

// 格式化時間
const formatTime = (timestamp: Date): string => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return '剛剛'
  if (minutes < 60) return `${minutes} 分鐘前`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} 小時前`
  
  return timestamp.toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化 token 數量
const formatTokenCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

// 滾動到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// 監聽訊息變化，自動滾動到底部
watch(
  () => chat.conversationHistory.length,
  () => {
    scrollToBottom()
  }
)

// 監聽載入狀態變化
watch(
  () => chat.isLoading,
  (isLoading) => {
    if (isLoading) {
      scrollToBottom()
    }
  }
)

// 確認清除對話記錄
const confirmClear = () => {
  chat.clearHistory()
  showConfirmDialog.value = false
}

// 重試訊息
const retryMessage = async () => {
  try {
    await chat.resendLastMessage()
  } catch (error) {
    console.error('重試失敗:', error)
  }
}

// 複製訊息
const copyMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    // 可以添加提示訊息
  } catch (error) {
    console.error('複製失敗:', error)
  }
}

// 初始化時滾動到底部
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
/* 自訂滾動條 */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 3px;
}

.scrollbar-thumb-gray-600::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}

.scrollbar-track-transparent::-webkit-scrollbar-track {
  background-color: transparent;
}

/* Prose 樣式調整 */
:deep(.prose) {
  color: #f3f4f6;
}

:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3),
:deep(.prose h4),
:deep(.prose h5),
:deep(.prose h6) {
  color: #f9fafb;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

:deep(.prose p) {
  margin-bottom: 0.75em;
}

:deep(.prose code) {
  background-color: #374151;
  color: #fbbf24;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

:deep(.prose pre) {
  background-color: #1f2937;
  color: #e5e7eb;
  border-radius: 0.5rem;
  margin: 1em 0;
}

:deep(.prose blockquote) {
  border-left: 4px solid #6b7280;
  padding-left: 1em;
  color: #d1d5db;
  font-style: italic;
}

:deep(.prose ul),
:deep(.prose ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

:deep(.prose li) {
  margin: 0.25em 0;
}

:deep(.prose a) {
  color: #60a5fa;
  text-decoration: underline;
}

:deep(.prose a:hover) {
  color: #93c5fd;
}

:deep(.prose strong) {
  color: #f9fafb;
  font-weight: 600;
}

:deep(.prose em) {
  color: #e5e7eb;
  font-style: italic;
}

/* 動畫效果 */
@keyframes animate-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-in {
  animation: animate-in 0.2s ease-out;
}
</style>