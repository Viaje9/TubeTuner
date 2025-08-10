<template>
  <div
    :class="[
      'transition-all duration-300',
      hasVideo ? '' : 'bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 space-y-6',
    ]"
  >
    <!-- 上傳區域（沒有影片時顯示） -->
    <div v-if="!hasVideo">
      <VideoUploader
        :has-video="hasVideo"
        :has-subtitles="hasSubtitles"
        :subtitle-count="subtitles.length"
        :video-file-name="videoFile?.name"
        :video-file-size="videoFile?.size"
        :video-file-type="videoFile?.type"
        @video-loaded="handleVideoLoaded"
        @subtitle-loaded="handleSubtitleLoaded"
        @video-cleared="handleVideoCleared"
        @subtitle-cleared="handleSubtitleCleared"
        @error="handleError"
      />
    </div>

    <!-- 影片播放器容器 -->
    <div v-if="hasVideo" class="relative">
      <div
        class="w-full aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 relative"
      >
        <!-- HTML5 影片元素 -->
        <video
          id="local-video-player"
          ref="videoElement"
          class="w-full h-full bg-black"
          style="object-fit: contain"
          preload="metadata"
          :src="videoUrl || undefined"
          playsinline
          @error="handleVideoError"
          @loadstart="handleLoadStart"
          @loadedmetadata="handleLoadedMetadata"
          @loadeddata="handleLoadedData"
          @canplay="handleCanPlay"
          @canplaythrough="handleCanPlayThrough"
        />

        <!-- 字幕顯示 -->
        <SubtitleDisplay
          v-if="hasSubtitles"
          :current-subtitle="currentSubtitle"
          :font-size="18"
          :text-color="'white'"
          :background-color="'semi'"
          :position="'bottom'"
          :show-shadow="true"
        />

        <!-- 載入提示 -->
        <div
          v-if="showLoadingOverlay || showIndexedDBLoading"
          class="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10"
        >
          <div class="text-center space-y-3">
            <!-- 載入動畫 -->
            <div class="w-12 h-12 mx-auto relative">
              <div class="absolute inset-0 border-2 border-blue-500/30 rounded-full"></div>
              <div
                class="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"
              ></div>
            </div>

            <!-- 載入訊息 -->
            <div class="text-white text-sm">
              {{ loadingMessage || '載入中...' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 播放器控制按鈕 -->
      <div class="absolute top-2 right-2 flex items-center gap-2">
        <!-- 移除影片按鈕 -->
        <button
          @click="handleVideoCleared"
          class="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-lg transition-colors backdrop-blur-sm"
          title="移除影片"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import VideoUploader from '@/components/VideoUploader.vue'
import SubtitleDisplay from '@/components/SubtitleDisplay.vue'
import { useLocalVideoPlayer } from '@/composables/useLocalVideoPlayer'

const props = defineProps<{
  player: ReturnType<typeof useLocalVideoPlayer>
}>()

const emit = defineEmits<{
  playerReady: []
  videoLoaded: [file: File]
  error: [message: string]
}>()

const localPlayer = props.player
const videoElement = ref<HTMLVideoElement>()
const showLoadingOverlay = ref(false)
const showIndexedDBLoading = ref(false)
const loadingMessage = ref('')

// 從 composable 中取得狀態
const {
  isReady,
  videoFile,
  videoUrl,
  subtitles,
  currentSubtitle,
  hasSubtitles,
  initPlayer,
  loadVideoFile,
  loadSubtitleFile,
  clearCurrentVideo,
} = localPlayer

const hasVideo = ref(false)

const isManualLoading = ref(false)

const handleVideoLoaded = async (file: File) => {
  try {
    isManualLoading.value = true // 標記為手動載入
    showLoadingOverlay.value = true
    loadingMessage.value = '載入影片...'

    // 首先設定 hasVideo 為 true，這樣 DOM 中就會渲染 video 元素
    hasVideo.value = true

    // 等待 DOM 更新
    await nextTick()

    // 初始化播放器
    await initPlayer('local-video-player')

    // 載入影片檔案
    const success = await loadVideoFile(file)
    if (success) {
      emit('videoLoaded', file)
    } else {
      hasVideo.value = false // 如果載入失敗，重置狀態
      throw new Error('無法載入影片檔案')
    }
  } catch (error) {
    hasVideo.value = false // 發生錯誤時重置狀態
    // 錯誤時清除所有載入狀態
    showIndexedDBLoading.value = false
    loadingMessage.value = ''
    emit('error', error instanceof Error ? error.message : '載入影片失敗')
  } finally {
    showLoadingOverlay.value = false

    // 如果成功載入，顯示儲存提示
    if (hasVideo.value) {
      showIndexedDBLoading.value = true
      loadingMessage.value = '儲存中...'

      // 短暫顯示儲存提示後隱藏
      setTimeout(() => {
        showIndexedDBLoading.value = false
        loadingMessage.value = ''
        isManualLoading.value = false // 重置手動載入標記
      }, 1500)
    } else {
      isManualLoading.value = false // 失敗時也要重置
    }
  }
}

const handleSubtitleLoaded = async (file: File) => {
  try {
    const success = await loadSubtitleFile(file)
    if (!success) {
      throw new Error('無法載入字幕檔案')
    }
  } catch (error) {
    emit('error', error instanceof Error ? error.message : '載入字幕失敗')
  }
}

const handleVideoCleared = async () => {
  hasVideo.value = false
  // 使用新的完全清除方法
  await clearCurrentVideo()
}

const handleSubtitleCleared = () => {
  // 透過 composable 清除字幕
  subtitles.value.splice(0, subtitles.value.length)
}

const handleError = (message: string) => {
  emit('error', message)
}

const handleVideoError = (e: Event) => {
  const video = e.target as HTMLVideoElement
  const error = video.error
  console.error('影片載入錯誤:', {
    error: error,
    code: error?.code,
    message: error?.message,
    videoSrc: video.src,
    videoElement: video,
  })

  let errorMessage = '影片載入失敗'
  if (error) {
    switch (error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        errorMessage = '影片載入被中止'
        break
      case MediaError.MEDIA_ERR_NETWORK:
        errorMessage = '網路錯誤'
        break
      case MediaError.MEDIA_ERR_DECODE:
        errorMessage = '影片解碼失敗，可能是不支援的格式'
        break
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorMessage = '不支援的影片格式或編解碼器'
        break
    }
  }
  emit('error', errorMessage)
}

const handleLoadStart = () => {
  // 影片開始載入
}

const handleLoadedMetadata = (e: Event) => {
  const video = e.target as HTMLVideoElement

  // 檢查是否有視訊軌道
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    emit('error', '此檔案可能只有音頻軌道，沒有視訊內容')
  }
}

const handleLoadedData = () => {
  // 影片資料載入完成
}

const handleCanPlay = () => {
  // 影片可以播放
}

const handleCanPlayThrough = () => {
  // 影片可以流暢播放
}

// 監聽播放器就緒狀態
watch(isReady, (ready) => {
  if (ready) {
    emit('playerReady')
    showLoadingOverlay.value = false
  }
})

// 監聽影片載入狀態
watch(videoFile, (file) => {
  if (file) {
    hasVideo.value = true
  } else {
    hasVideo.value = false
  }
})

// 監聽父元件傳入的 hasVideoLoaded 狀態變化（通過檢查 props 或其他方式）
// 因為沒有直接的 props，我們需要通過其他方式來檢測需要恢復的狀態
// 讓我們在 mounted 時檢查是否需要恢復，但使用延遲確保父元件已執行
onMounted(async () => {
  // 延遲一點時間，確保父元件的 onMounted 已執行
  setTimeout(async () => {
    // 檢查是否有影片需要恢復但當前沒有載入任何影片
    const lastVideoInfo = localPlayer.getLastVideoInfo()
    if (lastVideoInfo && !localPlayer.videoFile.value) {
      hasVideo.value = true
      await autoRestoreVideo()
    }
  }, 100) // 延遲 100ms
})

// 檢查是否需要自動恢復影片

// 自動恢復影片的邏輯
const autoRestoreVideo = async () => {
  try {
    // 顯示載入狀態
    showIndexedDBLoading.value = true
    loadingMessage.value = '恢復影片...'

    // 等待 DOM 更新以確保 video 元素已渲染
    await nextTick()

    // 初始化播放器
    await initPlayer('local-video-player')

    // 更新載入訊息
    loadingMessage.value = '載入中...'

    // 自動恢復影片
    const restored = await localPlayer.autoRestoreLastVideo()

    if (restored) {
      loadingMessage.value = '恢復中...'
      emit('playerReady')

      // 檢查是否有對應的影片檔案，如果有就發送 videoLoaded 事件
      if (localPlayer.videoFile.value) {
        emit('videoLoaded', localPlayer.videoFile.value)
      }
    } else {
      // 如果恢復失敗，重置狀態
      hasVideo.value = false
    }
  } catch (error) {
    console.error('自動恢復影片失敗:', error)
    hasVideo.value = false
  } finally {
    // 隱藏載入狀態
    showIndexedDBLoading.value = false
    loadingMessage.value = ''
  }
}

// 監聽 hasVideo 變化來觸發自動恢復
watch(
  hasVideo,
  async (newValue, oldValue) => {
    // 只有從 false 變成 true 且沒有影片檔案且不是手動載入時，才執行自動恢復
    if (newValue && !oldValue && !localPlayer.videoFile.value && !isManualLoading.value) {
      await autoRestoreVideo()
    }
  },
  { immediate: false },
)
</script>
