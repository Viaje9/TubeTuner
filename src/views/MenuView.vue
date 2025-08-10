<template>
  <div
    class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-[100dvh] relative"
  >
    <!-- 訊息提示框 -->
    <MessageBox :message="errorMessage" />

    <div class="container mx-auto px-4 py-8">
      <!-- 標題區域 -->
      <div class="text-center mb-12">
        <h1
          class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2"
        >
          功能選單
        </h1>
        <p class="text-xl text-gray-300">TubeTuner 功能設定</p>
        <div
          class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-4"
        ></div>
      </div>

      <!-- 返回播放器按鈕 -->
      <div class="mb-8 flex justify-center">
        <button
          @click="goToHome"
          class="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-gray-500/30 transition-all duration-200 flex items-center gap-2 active:scale-95"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          返回播放器
        </button>
      </div>

      <!-- 功能選項卡片 -->
      <div class="max-w-2xl mx-auto grid gap-6 md:grid-cols-2">
        <!-- AI 設定卡片 -->
        <div
          @click="goToAISettings"
          class="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all duration-300 active:scale-95"
        >
          <div class="flex flex-col items-center text-center">
            <!-- AI 圖示 -->
            <div
              class="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
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
              class="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
            >
              AI 設定
            </h3>
            <p class="text-gray-400 leading-relaxed">
              設定 AI 聊天功能，包含 API 金鑰、模型選擇和參數調整
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

        <!-- 搜尋影片卡片 -->
        <div
          @click="goToSearch"
          class="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 cursor-pointer hover:shadow-2xl hover:shadow-green-500/20 hover:border-green-500/50 transition-all duration-300 active:scale-95"
        >
          <div class="flex flex-col items-center text-center">
            <!-- 搜尋圖示 -->
            <div
              class="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
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
              class="text-2xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
            >
              搜尋影片
            </h3>
            <p class="text-gray-400 leading-relaxed">
              搜尋 YouTube 影片並快速載入到播放器中，支援縮略圖預覽
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
