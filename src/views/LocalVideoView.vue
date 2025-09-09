<template>
  <div
    class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-[100dvh] relative"
  >
    <!-- 訊息提示框 -->
    <MessageBox :message="errorMessage" />

    <div class="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
      <!-- 標題區域（會根據影片載入狀態調整，輸入框有焦點時隱藏） -->
      <div v-if="!hasVideoLoaded && !isInputFocused" class="text-center mb-6 sm:mb-8">
        <!-- 功能選單按鈕（固定在右上角） -->
        <div class="absolute top-3 right-3 sm:top-4 sm:right-4">
          <button
            @click="goToMenu"
            class="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg hover:shadow-lg hover:shadow-gray-500/30 transition-all duration-200 flex items-center gap-2 active:scale-95 touch-manipulation min-h-[44px] text-sm sm:text-base whitespace-nowrap"
            title="功能選單"
          >
            <svg
              class="w-4 h-4 sm:w-5 sm:h-5"
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
            <span class="hidden xs:inline sm:inline">選單</span>
          </button>
        </div>

        <h1
          class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 break-words cursor-pointer hover:scale-105 transition-transform duration-200 active:scale-95"
          @click="reloadPage"
          title="點擊重新載入頁面"
        >
          TubeTuner
        </h1>
        <p class="text-lg sm:text-xl md:text-2xl text-gray-300 break-words px-2">本機影片播放器</p>
        <div
          class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-4"
        ></div>
      </div>
      <div v-else-if="!isInputFocused" class="flex items-center justify-between mb-4">
        <div class="flex flex-col">
          <h1
            class="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent break-words cursor-pointer hover:scale-105 transition-transform duration-200 active:scale-95"
            @click="reloadPage"
            title="點擊重新載入頁面"
          >
            TubeTuner
          </h1>
          <div
            v-if="hasVideoLoaded && localPlayer.videoFile.value"
            class="text-sm sm:text-base text-gray-300 mt-1 break-words"
          >
            播放時間: {{ formatTime(localPlayer.currentTime.value) }}
          </div>
        </div>

        <!-- 控制按鈕群組 -->
        <div class="flex items-center gap-3">
          <button
            @click="toggleControlPanel"
            class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-3 sm:px-4 sm:py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-75 flex items-center gap-2 active:scale-95 touch-manipulation min-h-[44px] min-w-[44px] whitespace-nowrap"
            title="打開控制面板"
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          <button
            v-if="localPlayer.hasSubtitles.value"
            @click="toggleSubtitlePanel"
            :class="[
              'text-white px-3 py-3 sm:px-4 sm:py-3 rounded-lg transition-all duration-75 flex items-center gap-2 active:scale-95 touch-manipulation min-h-[44px] min-w-[44px] whitespace-nowrap',
              showSubtitlePanel
                ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:shadow-lg hover:shadow-green-500/30'
                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:shadow-lg hover:shadow-orange-500/30',
            ]"
            :title="showSubtitlePanel ? '關閉字幕面板' : '打開字幕面板'"
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
                d="M7 4v16l4-4h5.5c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5H7z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 9h6M9 12h4"
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

      <div class="max-w-7xl mx-auto flex-1">
        <!-- 主要內容區域 -->
        <div
          :class="
            hasVideoLoaded && showSubtitlePanel
              ? 'grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6'
              : ''
          "
        >
          <!-- 本機影片播放器區域 -->
          <div
            :class="[
              hasVideoLoaded && showSubtitlePanel ? 'lg:col-span-2' : '',
              hasVideoLoaded
                ? showSubtitlePanel
                  ? ''
                  : 'w-full sticky top-0'
                : 'max-w-4xl mx-auto',
            ]"
          >
            <LocalVideoPlayer
              :player="localPlayer"
              @player-ready="handlePlayerReady"
              @video-loaded="handleVideoLoaded"
              @error="showError"
            />
          </div>

          <!-- 字幕面板區域 -->
          <div
            v-if="hasVideoLoaded && showSubtitlePanel && localPlayer.hasSubtitles.value"
            class="lg:col-span-1"
          >
            <SubtitleScrollPanel
              :subtitles="localPlayer.subtitles.value"
              :current-time="localPlayer.currentTime.value"
              :current-subtitle="localPlayer.currentSubtitle.value"
              :is-playing="localPlayer.isPlaying.value"
              @close="showSubtitlePanel = false"
              @seek-to="handleSubtitleSeekTo"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 浮動控制面板 -->
    <FloatingControlPanel
      ref="controlPanelRef"
      v-if="hasVideoLoaded"
      :player="localPlayer"
      @speed-changed="handleSpeedChanged"
      @seeked="handleSeeked"
      @play-state-changed="handlePlayStateChanged"
      @error="showError"
      @video-loaded="handleVideoLoaded"
      @input-focused="handleInputFocused"
      @input-blurred="handleInputBlurred"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalVideoPlayer } from '@/composables/useLocalVideoPlayer'
import { useAIConfigStore } from '@/stores/aiConfig'
import LocalVideoPlayer from '@/components/LocalVideoPlayer.vue'
import FloatingControlPanel from '@/components/FloatingControlPanel.vue'
import SubtitleScrollPanel from '@/components/SubtitleScrollPanel.vue'
import MessageBox from '@/components/MessageBox.vue'

// 時間格式化工具函數
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

const router = useRouter()
const localPlayer = useLocalVideoPlayer()
const aiConfig = useAIConfigStore()
const errorMessage = ref('')
const hasVideoLoaded = ref(false)
const controlPanelRef = ref()
const isInputFocused = ref(false)
const showSubtitlePanel = ref(false)

const handlePlayerReady = () => {
  console.log('本機播放器已準備好')
}

const handleVideoLoaded = (file: File) => {
  hasVideoLoaded.value = true
  console.log('影片已載入:', file.name)

  // 如果有字幕，自動開啟字幕面板
  if (localPlayer.hasSubtitles.value) {
    showSubtitlePanel.value = true
  }
}

const handleSpeedChanged = (speed: number) => {
  console.log('播放速度已變更:', speed)
}

const handleSeeked = (seconds: number) => {
  console.log('已跳轉:', seconds, '秒')
}

const handleSubtitleSeekTo = (time: number) => {
  localPlayer.seekTo(time)
}

const handlePlayStateChanged = (isPlaying: boolean) => {
  console.log('播放狀態:', isPlaying ? '播放中' : '已暫停')
}

const showError = (message: string) => {
  // 直接設定錯誤訊息
  errorMessage.value = message
  console.error('錯誤:', message)
}

// 導航函數
const goToMenu = () => {
  router.push('/menu')
}

// 重新載入頁面函數
const reloadPage = () => {
  window.location.reload()
}

// 控制面板切換函數
const toggleControlPanel = () => {
  if (controlPanelRef.value?.expand) {
    controlPanelRef.value.expand()
  }
}

// 字幕面板切換函數
const toggleSubtitlePanel = () => {
  showSubtitlePanel.value = !showSubtitlePanel.value
}

// 輸入框焦點事件處理
const handleInputFocused = () => {
  isInputFocused.value = true
}

const handleInputBlurred = () => {
  isInputFocused.value = false
}

// 監聽字幕載入狀態，當字幕載入時自動開啟面板
watch(
  () => localPlayer.hasSubtitles.value,
  (hasSubtitles) => {
    if (hasSubtitles && hasVideoLoaded.value) {
      showSubtitlePanel.value = true
    }
  },
)

onMounted(async () => {
  // 載入 AI 配置以支援聊天功能
  aiConfig.loadFromStorage()

  // 檢查是否有上次的影片需要恢復
  // LocalVideoPlayer 元件會自動處理恢復邏輯
  // 這裡只需要檢查是否有保存的影片資訊來決定初始 UI 狀態
  try {
    const lastVideoInfo = await localPlayer.getLastVideoInfo()
    if (lastVideoInfo) {
      console.log('偵測到上次播放的影片:', lastVideoInfo.name)
      // 設定 hasVideoLoaded 為 true，讓 LocalVideoPlayer 元件觸發自動恢復
      hasVideoLoaded.value = true
    }
  } catch (error) {
    console.error('檢查影片狀態失敗:', error)
  }
})
</script>

<style scoped>
/* 標題過渡動畫 */
.header-enter-active,
.header-leave-active {
  transition: all 0.3s ease;
}

.header-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.header-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 輸入框彈出動畫 */
.input-popup-enter-active {
  transition: none;
}

.input-popup-leave-active {
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-popup-enter-from,
.input-popup-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}
</style>
