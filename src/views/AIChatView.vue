<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col">
    <!-- 頁面標題 -->
    <div class="p-6 border-b border-gray-800">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-white">AI 對話</h1>
        <div class="flex items-center gap-4">
          <!-- 返回收藏頁面按鈕 -->
          <button
            @click="$router.back()"
            class="px-4 py-2 bg-gray-700 rounded-lg text-sm font-medium"
          >
            返回
          </button>
        </div>
      </div>

      <!-- 選取的句子預覽 -->
      <div v-if="selectedSentences.length > 0" class="mt-4">
        <h3 class="text-lg font-medium mb-3 text-gray-300">
          已選取的句子 ({{ selectedSentences.length }})
        </h3>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          <div
            v-for="(sentence, index) in selectedSentences"
            :key="sentence.id"
            class="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-start gap-3"
          >
            <!-- 順序標示 -->
            <div
              class="w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              {{ index + 1 }}
            </div>
            <!-- 句子內容 -->
            <p class="text-sm text-gray-200 flex-1 leading-relaxed">{{ sentence.text }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天區域 -->
    <div class="flex-1 flex flex-col">
      <!-- 聊天記錄 -->
      <div class="flex-1 p-6 overflow-y-auto">
        <div v-if="messages.length === 0" class="text-center py-16">
          <div class="w-16 h-16 mx-auto mb-4 text-gray-600">
            <svg fill="currentColor" viewBox="0 0 20 20" class="w-full h-full">
              <path
                fill-rule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h3 class="text-xl font-medium text-gray-300 mb-2">開始與 AI 對話</h3>
          <p class="text-gray-500 mb-4">AI 將基於您選取的句子進行討論</p>
          <button
            v-if="selectedSentences.length > 0"
            @click="startDiscussion"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium"
          >
            開始討論這些句子
          </button>
        </div>

        <!-- 訊息列表 -->
        <div v-else class="space-y-4 max-w-4xl mx-auto">
          <div
            v-for="message in messages"
            :key="message.id"
            :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']"
          >
            <div
              :class="[
                'max-w-[80%] rounded-lg p-4',
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100 border border-gray-700',
              ]"
            >
              <div v-html="formatMessage(message.content)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 輸入區域 -->
      <div class="p-6 border-t border-gray-800">
        <div class="max-w-4xl mx-auto">
          <div class="flex gap-4">
            <textarea
              v-model="inputMessage"
              @keydown.enter.prevent="handleEnterKey"
              placeholder="輸入您的訊息..."
              class="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            ></textarea>
            <button
              @click="sendMessage"
              :disabled="!inputMessage.trim() || isLoading"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                v-if="isLoading"
                class="animate-spin w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              {{ isLoading ? '發送中...' : '發送' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useChatStore } from '@/stores/chat'
import { renderMarkdown } from '@/utils/markdown'

// Stores
const favoritesStore = useFavoritesStore()
const chatStore = useChatStore()

// 響應式變數
const inputMessage = ref('')
const isLoading = ref(false)

// 計算屬性
const selectedSentences = computed(() => favoritesStore.selectedSentences)
const messages = computed(() => chatStore.messages)

// 格式化訊息 (支援 Markdown)
const formatMessage = (content: string): string => {
  return renderMarkdown(content)
}

// 處理 Enter 鍵
const handleEnterKey = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    // Shift + Enter：換行
    return
  }
  // Enter：發送訊息
  sendMessage()
}

// 發送訊息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

  try {
    isLoading.value = true

    // 使用 chatStore 的 sendMessage 方法
    await chatStore.sendMessage(userMessage)
  } catch (error) {
    console.error('AI 回覆失敗:', error)
    // 錯誤已由 chatStore 處理，這裡不需要額外處理
  } finally {
    isLoading.value = false
  }
}

// 開始討論選取的句子
const startDiscussion = async () => {
  if (selectedSentences.value.length === 0) return

  const sentences = selectedSentences.value
    .map((sentence, index) => `${index + 1}. "${sentence.text}"`)
    .join('\n')

  const initialMessage = `請幫我分析以下這些句子：\n\n${sentences}\n\n這些句子有什麼共同特點？它們可能在討論什麼主題？請提供您的見解。`

  inputMessage.value = initialMessage
  await sendMessage()
}

// 頁面載入時清空聊天記錄
onMounted(() => {
  chatStore.clearHistory()
})
</script>
