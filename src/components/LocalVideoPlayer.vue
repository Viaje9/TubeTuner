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
          :font-size="18"
          :text-color="'white'"
          :background-color="'semi'"
          :position="'bottom'"
          :show-shadow="true"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
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
  // 清理播放器狀態
  destroyPlayer()
  console.log('影片已清除')
}

const handleSubtitleCleared = () => {
  // 透過 composable 清除字幕
  subtitles.value.splice(0, subtitles.value.length)
  console.log('字幕已清除')
}

const handleError = (message: string) => {
  emit('error', message)
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
