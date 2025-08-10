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
          class="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3 cursor-pointer hover:scale-105 transition-transform duration-200 active:scale-95"
          @click="reloadPage"
          title="點擊重新載入頁面"
        >
          TubeTuner
        </h1>
        <div
          class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-4"
        ></div>
      </div>

      <!-- 功能選項列表 -->
      <div class="max-w-2xl mx-auto space-y-3">
        <!-- YouTube 播放器 -->
        <div
          @click="selectFunction('youtube')"
          class="group bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 cursor-pointer hover:bg-gradient-to-r hover:from-blue-800/20 hover:to-blue-900/20 hover:border-blue-500/30 transition-all duration-200 active:scale-[0.99] touch-manipulation"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-white mb-1">YouTube 播放器</h3>
              <p class="text-sm text-gray-400 truncate">載入 YouTube 影片並控制播放速度</p>
            </div>
            <div class="flex-shrink-0">
              <svg
                class="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors duration-200"
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
            </div>
          </div>
        </div>

        <!-- 本機影片播放器 -->
        <div
          @click="selectFunction('local')"
          class="group bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 cursor-pointer hover:bg-gradient-to-r hover:from-orange-800/20 hover:to-orange-900/20 hover:border-orange-500/30 transition-all duration-200 active:scale-[0.99] touch-manipulation"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-lg font-semibold text-white">本機影片播放器</h3>
                <span class="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full text-xs"
                  >新功能</span
                >
              </div>
              <p class="text-sm text-gray-400 truncate">上傳本機影片檔案，支援字幕功能</p>
            </div>
            <div class="flex-shrink-0">
              <svg
                class="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-colors duration-200"
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
            </div>
          </div>
        </div>

        <!-- 搜尋影片 -->
        <div
          @click="selectFunction('search')"
          class="group bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 cursor-pointer hover:bg-gradient-to-r hover:from-green-800/20 hover:to-green-900/20 hover:border-green-500/30 transition-all duration-200 active:scale-[0.99] touch-manipulation"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-lg font-semibold text-white">搜尋影片</h3>
                <span class="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs"
                  >新功能</span
                >
              </div>
              <p class="text-sm text-gray-400 truncate">搜尋 YouTube 影片並快速載入播放</p>
            </div>
            <div class="flex-shrink-0">
              <svg
                class="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors duration-200"
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
            </div>
          </div>
        </div>

        <!-- AI 設定 -->
        <div
          @click="selectFunction('ai-settings')"
          class="group bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 cursor-pointer hover:bg-gradient-to-r hover:from-purple-800/20 hover:to-purple-900/20 hover:border-purple-500/30 transition-all duration-200 active:scale-[0.99] touch-manipulation"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-white mb-1">AI 設定</h3>
              <p class="text-sm text-gray-400 truncate">設定 AI 聊天功能和參數調整</p>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <div class="flex items-center gap-2">
                <div
                  :class="aiConfig.canUseAI ? 'bg-green-400' : 'bg-orange-400'"
                  class="w-2 h-2 rounded-full"
                ></div>
                <span class="text-xs text-gray-500">
                  {{ aiConfig.canUseAI ? '已配置' : '需要設定' }}
                </span>
              </div>
              <svg
                class="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors duration-200"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAIConfigStore } from '@/stores/aiConfig'
import { useUserPreferencesStore, type UserPreferenceFunction } from '@/stores/userPreferences'
import MessageBox from '@/components/MessageBox.vue'

const router = useRouter()
const aiConfig = useAIConfigStore()
const userPreferences = useUserPreferencesStore()
const errorMessage = ref('')

// 功能選擇處理
const selectFunction = (func: UserPreferenceFunction) => {
  // 記錄使用者選擇
  userPreferences.setLastSelectedFunction(func)

  // 導航到相應頁面
  switch (func) {
    case 'youtube':
      router.push('/youtube')
      break
    case 'local':
      router.push('/local-video')
      break
    case 'search':
      router.push('/search')
      break
    case 'ai-settings':
      router.push('/settings/ai')
      break
  }
}

// 重新載入頁面函數
const reloadPage = () => {
  window.location.reload()
}

onMounted(() => {
  // 載入 AI 配置
  aiConfig.loadFromStorage()
  // 載入使用者偏好設定
  userPreferences.loadPreferences()
})
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
