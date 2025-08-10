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
          class="w-full h-full object-contain"
          controls
          preload="metadata"
          :src="videoUrl || undefined"
        />

        <!-- 字幕顯示 -->
        <SubtitleDisplay
          v-if="hasSubtitles"
          :current-subtitle="currentSubtitle"
          :font-size="subtitleSettings.fontSize"
          :text-color="subtitleSettings.textColor"
          :background-color="subtitleSettings.backgroundColor"
          :position="subtitleSettings.position"
          :show-shadow="subtitleSettings.showShadow"
        />

        <!-- 載入提示 -->
        <div
          v-if="showLoadingOverlay"
          class="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm"
        >
          <div class="text-center space-y-4">
            <div class="w-16 h-16 mx-auto relative">
              <div class="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
              <div
                class="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"
              ></div>
            </div>
            <div class="text-white font-medium">正在載入影片...</div>
            <div class="text-gray-400 text-sm">請稍候</div>
          </div>
        </div>
      </div>

      <!-- 播放器狀態指示器 -->
      <div class="absolute top-2 right-2">
        <div v-if="isReady" class="w-2 h-2 rounded-full bg-green-400"></div>
      </div>

      <!-- 影片資訊和控制區域 -->
      <div class="mt-4 space-y-4">
        <!-- 影片資訊 -->
        <div class="bg-gray-800/50 rounded-xl p-4">
          <div class="flex items-start justify-between">
            <div class="space-y-2">
              <h3 class="font-medium text-white">{{ videoFile?.name }}</h3>
              <div class="text-sm text-gray-300 space-y-1">
                <p>
                  <span class="text-gray-400">大小:</span>
                  {{ formatFileSize(videoFile?.size || 0) }}
                </p>
                <p><span class="text-gray-400">類型:</span> {{ videoFile?.type }}</p>
                <p v-if="duration > 0">
                  <span class="text-gray-400">時長:</span> {{ formatTime(duration) }}
                </p>
                <p v-if="hasSubtitles">
                  <span class="text-gray-400">字幕:</span> 已載入 {{ subtitles.length }} 條
                </p>
              </div>
            </div>

            <!-- 操作按鈕 -->
            <div class="flex gap-2">
              <!-- 字幕設定按鈕 -->
              <button
                v-if="hasSubtitles"
                @click="showSubtitleSettings = !showSubtitleSettings"
                class="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
                title="字幕設定"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
              </button>

              <!-- 移除影片按鈕 -->
              <button
                @click="handleVideoCleared"
                class="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700/50 transition-colors"
                title="移除影片"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <!-- 字幕設定面板 -->
        <div
          v-if="showSubtitleSettings && hasSubtitles"
          class="bg-gray-800/50 rounded-xl p-4 space-y-4"
        >
          <h4 class="font-medium text-white mb-4">字幕設定</h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- 字體大小 -->
            <div>
              <label class="block text-sm text-gray-300 mb-2">字體大小</label>
              <select
                v-model="subtitleSettings.fontSize"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option :value="14">小 (14px)</option>
                <option :value="16">中小 (16px)</option>
                <option :value="18">中 (18px)</option>
                <option :value="20">中大 (20px)</option>
                <option :value="24">大 (24px)</option>
                <option :value="28">特大 (28px)</option>
              </select>
            </div>

            <!-- 文字顏色 -->
            <div>
              <label class="block text-sm text-gray-300 mb-2">文字顏色</label>
              <select
                v-model="subtitleSettings.textColor"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="white">白色</option>
                <option value="yellow">黃色</option>
                <option value="blue">藍色</option>
                <option value="green">綠色</option>
              </select>
            </div>

            <!-- 背景樣式 -->
            <div>
              <label class="block text-sm text-gray-300 mb-2">背景樣式</label>
              <select
                v-model="subtitleSettings.backgroundColor"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="semi">半透明</option>
                <option value="dark">深色</option>
                <option value="black">黑色</option>
                <option value="transparent">透明</option>
              </select>
            </div>

            <!-- 顯示位置 -->
            <div>
              <label class="block text-sm text-gray-300 mb-2">顯示位置</label>
              <select
                v-model="subtitleSettings.position"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="bottom">底部</option>
                <option value="top">頂部</option>
              </select>
            </div>
          </div>

          <!-- 文字陰影開關 -->
          <div class="flex items-center gap-3">
            <input
              id="shadow-toggle"
              v-model="subtitleSettings.showShadow"
              type="checkbox"
              class="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <label for="shadow-toggle" class="text-sm text-gray-300">顯示文字陰影</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, nextTick } from 'vue'
import VideoUploader from '@/components/VideoUploader.vue'
import SubtitleDisplay from '@/components/SubtitleDisplay.vue'
import { useLocalVideoPlayer } from '@/composables/useLocalVideoPlayer'

const emit = defineEmits<{
  playerReady: []
  videoLoaded: [file: File]
  error: [message: string]
}>()

const localPlayer = useLocalVideoPlayer()
const videoElement = ref<HTMLVideoElement>()
const showLoadingOverlay = ref(false)
const showSubtitleSettings = ref(false)

// 字幕設定
const subtitleSettings = reactive({
  fontSize: 18,
  textColor: 'white' as const,
  backgroundColor: 'semi' as const,
  position: 'bottom' as const,
  showShadow: true,
})

// 從 composable 中取得狀態
const {
  isReady,
  duration,
  videoFile,
  videoUrl,
  subtitles,
  currentSubtitle,
  hasSubtitles,
  initPlayer,
  loadVideoFile,
  loadSubtitleFile,
  destroyPlayer,
} = localPlayer

const hasVideo = ref(false)

const handleVideoLoaded = async (file: File) => {
  try {
    showLoadingOverlay.value = true

    // 首先設定 hasVideo 為 true，這樣 DOM 中就會渲染 video 元素
    hasVideo.value = true

    // 等待 DOM 更新
    await nextTick()

    // 初始化播放器
    await initPlayer('local-video-player')
    console.log('播放器初始化完成')

    // 載入影片檔案
    const success = loadVideoFile(file)
    if (success) {
      emit('videoLoaded', file)
      console.log('影片載入成功:', file.name)
    } else {
      hasVideo.value = false // 如果載入失敗，重置狀態
      throw new Error('無法載入影片檔案')
    }
  } catch (error) {
    hasVideo.value = false // 發生錯誤時重置狀態
    emit('error', error instanceof Error ? error.message : '載入影片失敗')
  } finally {
    showLoadingOverlay.value = false
  }
}

const handleSubtitleLoaded = async (file: File) => {
  try {
    const success = await loadSubtitleFile(file)
    if (success) {
      console.log('字幕載入成功，共', subtitles.value.length, '條')
    } else {
      throw new Error('無法載入字幕檔案')
    }
  } catch (error) {
    emit('error', error instanceof Error ? error.message : '載入字幕失敗')
  }
}

const handleVideoCleared = () => {
  hasVideo.value = false
  showSubtitleSettings.value = false
  // 清理播放器狀態
  destroyPlayer()
  console.log('影片已清除')
}

const handleSubtitleCleared = () => {
  // 透過 composable 清除字幕
  subtitles.value.splice(0, subtitles.value.length)
  showSubtitleSettings.value = false
  console.log('字幕已清除')
}

const handleError = (message: string) => {
  emit('error', message)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

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

// 不在 onMounted 時初始化，而是在影片載入時初始化
// onMounted(() => {
//   console.log('本機影片頁面組件已掛載')
// })
</script>
