<template>
  <div class="w-full">
    <!-- 輸入影片網址的區塊 -->
    <div class="mb-6 flex flex-col sm:flex-row gap-2">
      <input 
        v-model="videoUrl"
        type="text" 
        placeholder="在此貼上 YouTube 影片網址..." 
        class="flex-grow bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        @keyup.enter="handleLoadVideo"
      >
      <button 
        @click="handleLoadVideo"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
      >
        載入影片
      </button>
    </div>

    <!-- 影片播放器容器 -->
    <div class="w-full aspect-video bg-black rounded-lg shadow-lg overflow-hidden">
      <div id="youtube-player"></div>
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