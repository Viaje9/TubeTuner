<template>
  <div
    class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-[100dvh] relative"
  >
    <!-- 訊息提示框 -->
    <MessageBox :message="errorMessage" />

    <div class="container mx-auto px-4 py-6 sm:py-8">
      <!-- 標題區域 -->
      <div class="text-center mb-8">
        <h1
          class="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3"
        >
          功能選單
        </h1>
        <p class="text-base sm:text-lg text-gray-300">TubeTuner 功能設定</p>
        <div
          class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-4"
        ></div>
      </div>

      <!-- 播放器選擇區域 -->
      <div class="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="goToHome"
          class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center gap-3 active:scale-95 touch-manipulation font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          YouTube 播放器
        </button>

        <button
          @click="goToLocalVideo"
          class="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 flex items-center gap-3 active:scale-95 touch-manipulation font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 4a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h2zM14 4a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V6a2 2 0 012-2h2z"
            />
          </svg>
          本機影片播放器
        </button>
      </div>

      <!-- 功能選項卡片 -->
      <div class="max-w-sm sm:max-w-4xl mx-auto grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- AI 設定卡片 -->
        <div
          @click="goToAISettings"
          class="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all duration-300 active:scale-[0.98] touch-manipulation"
        >
          <div class="flex flex-col items-center text-center">
            <!-- AI 圖示 -->
            <div
              class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3
              class="text-lg sm:text-xl md:text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
            >
              AI 設定
            </h3>
            <p class="text-sm sm:text-base text-gray-400 leading-relaxed break-words">
              設定 AI 聊天功能，包含 API 金鑰<br class="sm:hidden" />、模型選擇和參數調整
            </p>
            <!-- 狀態指示器 -->
            <div class="mt-4 flex items-center gap-2">
              <div
                :class="aiConfig.canUseAI ? 'bg-green-400' : 'bg-orange-400'"
                class="w-2 h-2 rounded-full"
              ></div>
              <span class="text-sm text-gray-500">
                {{ aiConfig.canUseAI ? '已配置' : '需要設定' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 本機影片卡片 -->
        <div
          @click="goToLocalVideo"
          class="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 cursor-pointer hover:shadow-2xl hover:shadow-orange-500/20 hover:border-orange-500/50 transition-all duration-300 active:scale-[0.98] touch-manipulation"
        >
          <div class="flex flex-col items-center text-center">
            <!-- 本機影片圖示 -->
            <div
              class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
                />
              </svg>
            </div>
            <h3
              class="text-lg sm:text-xl md:text-2xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"
            >
              本機影片
            </h3>
            <p class="text-sm sm:text-base text-gray-400 leading-relaxed break-words">
              上傳本機影片檔案並播放<br class="sm:hidden" />支援 SRT 字幕檔案
            </p>
            <!-- 功能標籤 -->
            <div class="mt-4">
              <span class="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
                全新功能
              </span>
            </div>
          </div>
        </div>

        <!-- 搜尋影片卡片 -->
        <div
          @click="goToSearch"
          class="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 cursor-pointer hover:shadow-2xl hover:shadow-green-500/20 hover:border-green-500/50 transition-all duration-300 active:scale-[0.98] touch-manipulation"
        >
          <div class="flex flex-col items-center text-center">
            <!-- 搜尋圖示 -->
            <div
              class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3
              class="text-lg sm:text-xl md:text-2xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
            >
              搜尋影片
            </h3>
            <p class="text-sm sm:text-base text-gray-400 leading-relaxed break-words">
              搜尋 YouTube 影片並快速載入<br class="sm:hidden" />到播放器中，支援縮略圖預覽
            </p>
            <!-- 功能標籤 -->
            <div class="mt-4">
              <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                全新功能
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部版權資訊 -->
      <div class="mt-16 text-center text-gray-500 text-sm">
        <p>TubeTuner - YouTube 影片速度控制器</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAIConfigStore } from '@/stores/aiConfig'
import MessageBox from '@/components/MessageBox.vue'

const router = useRouter()
const aiConfig = useAIConfigStore()
const errorMessage = ref('')

// 導航函數
const goToHome = () => {
  router.push('/')
}

const goToAISettings = () => {
  router.push('/settings/ai')
}

const goToLocalVideo = () => {
  router.push('/local-video')
}

const goToSearch = () => {
  router.push('/search')
}
</script>

<style scoped>
/* 卡片懸停效果 */
.group:hover {
  transform: translateY(-2px);
}

/* 圖示動畫 */
.group:hover .group-hover\:scale-110 {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(1.15);
  }
}
</style>
