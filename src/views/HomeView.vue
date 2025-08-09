<template>
  <div class="app__content bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative">
    <!-- 訊息提示框 -->
    <MessageBox :message="errorMessage" />

    <div class="container mx-auto px-4 py-4">
      <!-- 標題區域（會根據影片載入狀態調整） -->
      <Transition name="header" mode="out-in">
        <div v-if="!hasVideoLoaded" class="text-center mb-8">
          <h1
            class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2"
          >
            TubeTuner
          </h1>
          <p class="text-xl text-gray-300">YouTube 影片速度控制器</p>
          <div
            class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-4"
          ></div>
        </div>
        <div v-else class="flex items-center justify-between mb-4">
          <h1
            class="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            TubeTuner
          </h1>
          <!-- 精簡的載入按鈕 -->
          <button
            @click="showLoadInput = !showLoadInput"
            class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-75 flex items-center gap-2 active:scale-95 active:bg-purple-700"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4"
              />
            </svg>
            載入影片
          </button>
        </div>
      </Transition>

      <!-- 輸入框（浮動在右上角） -->
      <Transition name="input-popup">
        <div v-if="showLoadInput">
          <!-- 背景遮罩 -->
          <div class="fixed inset-0 bg-black/60 z-40" @click="showLoadInput = false"></div>

          <!-- 彈窗內容 -->
          <div
            class="fixed top-20 right-4 z-50 bg-gray-800 p-4 rounded-lg shadow-2xl border border-gray-700"
          >
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <input
                  v-model="videoUrl"
                  type="text"
                  placeholder="貼上 YouTube 影片網址或影片 ID..."
                  class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-white w-64"
                  @keyup.enter="loadVideo"
                />
                <button
                  @click="clearInput"
                  class="text-gray-400 hover:text-white transition-colors p-1"
                  title="清除"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div class="flex gap-2">
                <button
                  @click="pasteFromClipboard"
                  class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  貼上
                </button>
                <button
                  @click="loadVideo"
                  class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex-1"
                >
                  載入
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <div class="max-w-7xl mx-auto flex-1">
        <!-- YouTube 播放器區域（全寬） -->
        <div :class="hasVideoLoaded ? 'w-full' : 'max-w-4xl mx-auto'">
          <YouTubePlayer
            :player="youtubePlayer"
            @player-ready="handlePlayerReady"
            @video-loaded="handleVideoLoaded"
            @error="showError"
          />
        </div>
      </div>
    </div>

    <!-- 浮動控制面板 -->
    <FloatingControlPanel
      v-if="hasVideoLoaded"
      :player="youtubePlayer"
      @speed-changed="handleSpeedChanged"
      @seeked="handleSeeked"
      @play-state-changed="handlePlayStateChanged"
      @error="showError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useYouTubePlayer } from '@/composables/useYouTubePlayer'
import YouTubePlayer from '@/components/YouTubePlayer.vue'
import FloatingControlPanel from '@/components/FloatingControlPanel.vue'
import MessageBox from '@/components/MessageBox.vue'

const youtubePlayer = useYouTubePlayer()
const errorMessage = ref('')
const hasVideoLoaded = ref(false)
const showLoadInput = ref(false)
const videoUrl = ref('https://www.youtube.com/watch?v=6XIPkMFZf-0')

onMounted(async () => {
  await youtubePlayer.initPlayer('youtube-player')
})

const handlePlayerReady = () => {
  console.log('播放器已準備好')
}

const handleVideoLoaded = (videoId: string) => {
  console.log('影片已載入:', videoId)
  hasVideoLoaded.value = true
  showLoadInput.value = false
}

const handleSpeedChanged = (speed: number) => {
  console.log('播放速度已變更:', speed)
}

const handleSeeked = (seconds: number) => {
  console.log('已跳轉:', seconds, '秒')
}

const handlePlayStateChanged = (isPlaying: boolean) => {
  console.log('播放狀態已變更:', isPlaying ? '播放中' : '已暫停')
}

const loadVideo = () => {
  if (!videoUrl.value) {
    showError('請輸入 YouTube 影片網址或 ID')
    return
  }

  // 從 URL 提取影片 ID 或直接使用 ID
  const videoId = extractVideoId(videoUrl.value)
  if (videoId && youtubePlayer.loadVideo) {
    const success = youtubePlayer.loadVideo(videoUrl.value)
    if (success) {
      // 手動觸發載入成功的處理
      handleVideoLoaded(videoId)
    }
  } else {
    showError('無法識別的 YouTube 網址')
  }
}

const extractVideoId = (urlOrId: string): string | null => {
  // 如果是純 ID（11 個字符）
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId
  }

  // 從 URL 提取 ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = urlOrId.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

const showError = (message: string) => {
  errorMessage.value = message
  // 觸發 MessageBox 的 watch
  setTimeout(() => {
    errorMessage.value = ''
  }, 100)
  setTimeout(() => {
    errorMessage.value = message
  }, 150)
}

const clearInput = () => {
  videoUrl.value = ''
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    videoUrl.value = text
  } catch {
    // 如果無法存取剪貼簿，顯示錯誤訊息
    showError('無法存取剪貼簿，請手動貼上')
  }
}
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
