<template>
  <div :class="[
    'transition-all duration-300',
    hasVideo ? '' : 'bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 space-y-6'
  ]">
    <!-- 輸入影片網址的區塊（只在沒有影片時顯示） -->
    <div v-if="!hasVideo" class="space-y-3">
      <h2 class="text-lg font-semibold text-white">載入 YouTube 影片</h2>
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-grow relative">
          <input 
            v-model="videoUrl"
            type="text" 
            placeholder="貼上 YouTube 影片網址或影片 ID..." 
            class="w-full bg-gray-700/50 border border-gray-600/50 rounded-2xl px-4 py-3 pl-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-400 transition-all duration-200"
            @keyup.enter="handleLoadVideo"
          >
          <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
          </svg>
        </div>
        <button 
          @click="handleLoadVideo"
          :disabled="!videoUrl.trim()"
          :class="[
            'px-8 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg',
            videoUrl.trim() 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/25 hover:scale-105 active:scale-95' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          ]"
        >
          載入影片
        </button>
      </div>
    </div>

    <!-- 影片播放器容器 -->
    <div class="relative">
      <div class="w-full aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50">
        <div id="youtube-player" class="w-full h-full"></div>
        
        <!-- 載入提示 -->
        <div 
          v-if="!props.player?.isReady?.value" 
          class="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm"
        >
          <div class="text-center space-y-4">
            <div class="w-16 h-16 mx-auto relative">
              <div class="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <div class="text-white font-medium">正在初始化播放器...</div>
            <div class="text-gray-400 text-sm">請稍候</div>
          </div>
        </div>
      </div>
      
      <!-- 播放器狀態指示器 -->
      <div class="absolute top-4 right-4">
        <div 
          v-if="props.player?.isReady?.value"
          class="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium backdrop-blur-sm"
        >
          ● 就緒
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import type { IYouTubePlayer } from '@/types/youtube'

const emit = defineEmits<{
  playerReady: [player: IYouTubePlayer]
  videoLoaded: [videoId: string]
  error: [message: string]
}>()

const props = defineProps<{
  player: IYouTubePlayer
}>()

const videoUrl = ref('')
const hasVideo = ref(false)

const handleLoadVideo = () => {
  if (!videoUrl.value) {
    emit('error', '請先輸入 YouTube 影片網址！')
    return
  }

  const videoId = extractVideoId(videoUrl.value)
  if (videoId) {
    if (props.player?.loadVideo) {
      const success = props.player.loadVideo(videoUrl.value)
      if (success) {
        hasVideo.value = true
        emit('videoLoaded', videoId)
      } else {
        emit('error', '無法載入影片，請確認網址是否正確')
      }
    }
  } else {
    emit('error', '無法識別的 YouTube 網址，請確認格式。')
  }
}

const extractVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

onMounted(() => {
  // 播放器初始化由父元件處理
})
</script>