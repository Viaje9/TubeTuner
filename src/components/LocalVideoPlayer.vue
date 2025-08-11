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
          @timeupdate="handleTimeUpdate"
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

        <!-- 自定義進度條 -->
        <div v-if="hasVideo" class="absolute bottom-0 left-0 right-0 p-4">
          <div class="relative">
            <!-- 進度條容器（擴大觸控區域） -->
            <div
              class="w-full py-2 -my-2 cursor-pointer relative"
              @mousedown="handleProgressMouseDown"
              @touchstart.prevent="handleProgressTouchStart"
              ref="progressBar"
            >
              <!-- 進度條背景 -->
              <div
                class="w-full h-2 bg-gray-600 rounded-full hover:h-3 transition-all duration-200 relative"
              >
                <!-- 已播放進度 -->
                <div
                  class="h-full bg-blue-500 rounded-full"
                  :class="{ 'transition-all duration-100': !isDragging }"
                  :style="{ width: `${progressPercentage}%` }"
                ></div>
              </div>
              <!-- 拖曳圓點 -->
              <div
                class="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full cursor-grab active:cursor-grabbing border-2 border-white shadow-lg md:w-4 md:h-4"
                :style="{ left: `calc(${progressPercentage}% - 12px)` }"
                @mousedown.stop="handleThumbMouseDown"
                @touchstart.stop.prevent="handleThumbTouchStart"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 播放器控制按鈕 -->
      <div class="absolute -top-2 -right-2 flex items-center gap-2">
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

      <!-- 字幕上傳按鈕（左上角） -->
      <div v-if="!hasSubtitles" class="absolute -top-2 -left-2 flex items-center gap-2">
        <button
          @click="triggerSubtitleUpload"
          class="bg-blue-500/80 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors backdrop-blur-sm"
          title="上傳字幕"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </button>
        <!-- 隱藏的字幕檔案輸入 -->
        <input
          ref="subtitleFileInput"
          type="file"
          accept=".srt,.json"
          class="hidden"
          @change="handleSubtitleFileSelect"
        />
      </div>

      <!-- 字幕顯示區域（支援選取和翻譯） -->
      <div v-if="hasSubtitles" class="mt-4">
        <SubtitleDisplay
          :current-subtitle="currentSubtitle"
          :position="'bottom'"
          :font-size="18"
          :text-color="'white'"
          :background-color="'semi'"
          :show-shadow="true"
          :position-style="'relative'"
        />
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
const progressBar = ref<HTMLDivElement>()
const subtitleFileInput = ref<HTMLInputElement>()
const showLoadingOverlay = ref(false)
const showIndexedDBLoading = ref(false)
const loadingMessage = ref('')

// 進度條狀態
const currentTime = ref(0)
const duration = ref(0)
const progressPercentage = ref(0)
const isDragging = ref(false)

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

// 字幕上傳相關功能
const triggerSubtitleUpload = () => {
  subtitleFileInput.value?.click()
}

const handleSubtitleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    try {
      const fileName = file.name.toLowerCase()

      // 檢查檔案類型
      if (!fileName.endsWith('.srt') && !fileName.endsWith('.json')) {
        throw new Error('請選擇 SRT 或 JSON 格式的字幕檔案')
      }

      // 檢查檔案大小（限制 10MB）
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('字幕檔案太大，請選擇小於 10MB 的檔案')
      }

      const success = await loadSubtitleFile(file)
      if (!success) {
        throw new Error('載入字幕檔案失敗')
      }

      // 清除檔案選擇
      if (subtitleFileInput.value) {
        subtitleFileInput.value.value = ''
      }
    } catch (error) {
      emit('error', error instanceof Error ? error.message : '載入字幕失敗')
    }
  }
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

  // 設定影片總長度
  duration.value = video.duration
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

// 處理時間更新
const handleTimeUpdate = (e: Event) => {
  if (isDragging.value) return // 拖曳時不更新進度

  const video = e.target as HTMLVideoElement
  currentTime.value = video.currentTime

  if (duration.value > 0) {
    progressPercentage.value = (currentTime.value / duration.value) * 100
  }
}

// 處理進度條點擊和拖曳
const updateProgress = (clientX: number) => {
  if (!progressBar.value || !videoElement.value) return

  // 獲取實際進度條（內層 div）的位置
  const progressBarElement = progressBar.value.querySelector('div') as HTMLElement
  if (!progressBarElement) return

  const rect = progressBarElement.getBoundingClientRect()
  const clickX = clientX - rect.left
  const progressWidth = rect.width
  const clickPercentage = Math.max(0, Math.min(1, clickX / progressWidth))

  const newTime = clickPercentage * duration.value
  videoElement.value.currentTime = newTime
  currentTime.value = newTime
  progressPercentage.value = clickPercentage * 100
}

// 處理進度條點擊（非拖曳）
const handleProgressMouseDown = (e: MouseEvent) => {
  updateProgress(e.clientX)
}

// 處理進度條觸控點擊
const handleProgressTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0]
  updateProgress(touch.clientX)
}

// 處理圓點拖曳（滑鼠）
const handleThumbMouseDown = (e: MouseEvent) => {
  e.preventDefault()
  isDragging.value = true

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    if (isDragging.value) {
      updateProgress(e.clientX)
    }
  }

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault()
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 處理圓點拖曳（觸控）
const handleThumbTouchStart = (e: TouchEvent) => {
  e.preventDefault()
  isDragging.value = true

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    if (isDragging.value && e.touches.length > 0) {
      const touch = e.touches[0]
      updateProgress(touch.clientX)
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault()
    isDragging.value = false
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }

  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
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

// 在組件掛載時自動檢查並恢復影片
onMounted(async () => {
  console.log('🚀 LocalVideoPlayer 組件已掛載，檢查是否需要恢復影片...')

  // 直接檢查並恢復，不使用 setTimeout
  await checkAndRestoreVideo()
})

// 精準檢查並恢復影片的邏輯
const checkAndRestoreVideo = async () => {
  try {
    // 檢查是否已有影片載入（避免重複恢復）
    if (localPlayer.videoFile.value) {
      console.log('ℹ️ 已有影片載入，跳過恢復')
      return
    }

    // 檢查 IndexedDB 中是否有影片
    const lastVideoInfo = await localPlayer.getLastVideoInfo()
    console.log('🔍 檢查最新影片資訊:', lastVideoInfo)

    if (!lastVideoInfo) {
      console.log('ℹ️ IndexedDB 中沒有找到影片')
      return
    }

    console.log('🔄 發現需要恢復的影片，開始恢復程序...')

    // 設定 hasVideo 狀態，觸發 DOM 渲染 video 元素
    hasVideo.value = true

    // 等待 DOM 更新完成
    await nextTick()

    // 確保 video 元素已存在
    await waitForVideoElement()

    // 執行恢復
    const restored = await autoRestoreVideo()
    if (!restored) {
      console.warn('⚠️ 影片恢復失敗，重置狀態')
      hasVideo.value = false
    } else {
      console.log('✅ 影片恢復成功')
    }
  } catch (error) {
    console.error('❌ 檢查恢復影片時發生錯誤:', error)
    hasVideo.value = false
  }
}

// 等待 video 元素出現的精準方法
const waitForVideoElement = async (maxAttempts = 50, interval = 500): Promise<void> => {
  return new Promise((resolve, reject) => {
    let attempts = 0

    const checkElement = () => {
      const videoEl = document.getElementById('local-video-player')
      if (videoEl) {
        console.log('✅ Video 元素已準備就緒')
        resolve()
        return
      }

      attempts++
      if (attempts >= maxAttempts) {
        reject(new Error(`Video 元素在 ${maxAttempts * interval}ms 內未出現`))
        return
      }

      setTimeout(checkElement, interval)
    }

    checkElement()
  })
}

// 檢查是否需要自動恢復影片

// 精準的自動恢復影片邏輯
const autoRestoreVideo = async (): Promise<boolean> => {
  try {
    console.log('🔄 開始自動恢復影片...')

    // 顯示載入狀態
    showIndexedDBLoading.value = true
    loadingMessage.value = '正在恢復影片...'

    // 初始化播放器（此時 video 元素已確保存在）
    console.log('🎬 初始化播放器...')
    await initPlayer('local-video-player')

    // 執行恢復
    console.log('📥 從 IndexedDB 恢復影片...')
    const restored = await localPlayer.autoRestoreLastVideo()

    if (restored) {
      console.log('✅ 影片恢復成功')
      emit('playerReady')

      // 如果有影片檔案，發送事件
      if (localPlayer.videoFile.value) {
        emit('videoLoaded', localPlayer.videoFile.value)
      }

      return true
    } else {
      console.log('❌ 影片恢復失敗')
      return false
    }
  } catch (error) {
    console.error('💥 自動恢復影片時發生錯誤:', error)
    return false
  } finally {
    // 隱藏載入狀態
    showIndexedDBLoading.value = false
    loadingMessage.value = ''
  }
}

// 移除自動觸發的監聽器，改為在 onMounted 中手動控制
// 這樣可以避免時序問題和重複觸發
</script>
