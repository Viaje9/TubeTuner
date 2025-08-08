<template>
  <div class="bg-gray-900 text-white flex flex-col items-center justify-center min-h-screen p-4">
    <!-- 訊息提示框 -->
    <MessageBox :message="errorMessage" />

    <div class="w-full max-w-4xl">
      <h1 class="text-3xl font-bold text-center mb-6">YouTube 影片速度控制器</h1>

      <!-- YouTube 播放器 -->
      <YouTubePlayer 
        :player="youtubePlayer"
        @player-ready="handlePlayerReady"
        @video-loaded="handleVideoLoaded"
        @error="showError"
      />

      <!-- 播放速度控制 -->
      <SpeedControl 
        :player="youtubePlayer"
        @speed-changed="handleSpeedChanged"
        @error="showError"
      />

      <!-- 時間控制 -->
      <TimeControl 
        :player="youtubePlayer"
        @seeked="handleSeeked"
        @error="showError"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useYouTubePlayer } from '@/composables/useYouTubePlayer'
import YouTubePlayer from '@/components/YouTubePlayer.vue'
import SpeedControl from '@/components/SpeedControl.vue'
import TimeControl from '@/components/TimeControl.vue'
import MessageBox from '@/components/MessageBox.vue'

const youtubePlayer = useYouTubePlayer()
const errorMessage = ref('')

onMounted(async () => {
  await youtubePlayer.initPlayer('youtube-player')
})

const handlePlayerReady = () => {
  console.log('播放器已準備好')
}

const handleVideoLoaded = (videoId: string) => {
  console.log('影片已載入:', videoId)
}

const handleSpeedChanged = (speed: number) => {
  console.log('播放速度已變更:', speed)
}

const handleSeeked = (seconds: number) => {
  console.log('已跳轉:', seconds, '秒')
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
</script>