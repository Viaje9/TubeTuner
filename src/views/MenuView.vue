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

        <!-- 分隔線 -->
        <div class="border-t border-gray-700/30 my-2"></div>

        <!-- 清除 IndexedDB 資料 -->
        <div
          @click="showClearDataDialog"
          class="group bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 cursor-pointer hover:bg-gradient-to-r hover:from-red-800/20 hover:to-red-900/20 hover:border-red-500/30 transition-all duration-200 active:scale-[0.99] touch-manipulation"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-white mb-1">清除本機資料</h3>
              <p class="text-sm text-gray-400 truncate">清除所有儲存的影片和字幕檔案</p>
            </div>
            <div class="flex-shrink-0">
              <svg
                class="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors duration-200"
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

    <!-- 清除資料確認對話框 -->
    <div
      v-if="showConfirmDialog"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click="cancelClearData"
    >
      <div
        class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700/50"
        @click.stop
      >
        <!-- 警告圖示 -->
        <div class="flex items-center justify-center mb-6">
          <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        <!-- 標題和描述 -->
        <div class="text-center mb-8">
          <h3 class="text-xl font-bold text-white mb-3">確認清除資料</h3>
          <p class="text-gray-400 leading-relaxed">
            此操作將會清除所有儲存在本機的影片和字幕檔案。
            <strong class="text-red-400">此操作無法復原</strong>，請確認是否繼續？
          </p>
          <div v-if="storageInfo" class="mt-4 p-3 bg-gray-800/50 rounded-lg text-sm text-gray-300">
            <div class="flex justify-between">
              <span>影片數量：</span>
              <span class="text-white font-medium">{{ storageInfo.videos }} 個</span>
            </div>
            <div class="flex justify-between mt-1">
              <span>佔用空間：</span>
              <span class="text-white font-medium">{{
                formatFileSize(storageInfo.totalSize)
              }}</span>
            </div>
          </div>
        </div>

        <!-- 按鈕群組 -->
        <div class="flex gap-3">
          <button
            @click="cancelClearData"
            class="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors duration-200 font-medium"
          >
            取消
          </button>
          <button
            @click="confirmClearData"
            :disabled="isClearingData"
            class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-xl transition-colors duration-200 font-medium flex items-center justify-center gap-2"
          >
            <svg
              v-if="isClearingData"
              class="w-4 h-4 animate-spin"
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
            <span>{{ isClearingData ? '清除中...' : '確認清除' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAIConfigStore } from '@/stores/aiConfig'
import { useUserPreferencesStore, type UserPreferenceFunction } from '@/stores/userPreferences'
import { indexedDBService } from '@/services/indexedDB'
import MessageBox from '@/components/MessageBox.vue'

const router = useRouter()
const aiConfig = useAIConfigStore()
const userPreferences = useUserPreferencesStore()
const errorMessage = ref('')

// 清除資料相關狀態
const showConfirmDialog = ref(false)
const isClearingData = ref(false)
const storageInfo = ref<{ videos: number; totalSize: number } | null>(null)

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

// 格式化檔案大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 顯示清除資料確認對話框
const showClearDataDialog = async () => {
  try {
    // 先獲取目前的儲存使用情況
    storageInfo.value = await indexedDBService.getStorageUsage()
    showConfirmDialog.value = true
  } catch (error) {
    console.error('獲取儲存資訊失敗:', error)
    errorMessage.value = '獲取儲存資訊失敗'
    // 觸發 MessageBox 的 watch
    setTimeout(() => {
      errorMessage.value = ''
    }, 100)
    setTimeout(() => {
      errorMessage.value = '獲取儲存資訊失敗'
    }, 150)
  }
}

// 取消清除資料
const cancelClearData = () => {
  showConfirmDialog.value = false
  storageInfo.value = null
}

// 確認清除資料
const confirmClearData = async () => {
  isClearingData.value = true

  try {
    await indexedDBService.clearAllData()

    // 清除成功提示
    showConfirmDialog.value = false
    storageInfo.value = null

    // 顯示成功訊息
    errorMessage.value = '本機資料清除成功'
    setTimeout(() => {
      errorMessage.value = ''
    }, 100)
    setTimeout(() => {
      errorMessage.value = '本機資料清除成功'
    }, 150)

    console.log('IndexedDB 資料清除成功')
  } catch (error) {
    console.error('清除 IndexedDB 資料失敗:', error)

    // 顯示錯誤訊息
    errorMessage.value = '清除資料失敗，請稍後再試'
    setTimeout(() => {
      errorMessage.value = ''
    }, 100)
    setTimeout(() => {
      errorMessage.value = '清除資料失敗，請稍後再試'
    }, 150)
  } finally {
    isClearingData.value = false
  }
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
