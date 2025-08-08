<template>
  <div class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen">
    <!-- 訊息提示框 -->
    <MessageBox :message="errorMessage" />

    <div class="container mx-auto px-4 py-8">
      <!-- 標題區域 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          TubeTuner
        </h1>
        <p class="text-xl text-gray-300">YouTube 影片速度控制器</p>
        <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-4"></div>
      </div>

      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- YouTube 播放器區域 -->
          <div class="lg:col-span-2">
            <YouTubePlayer 
              :player="youtubePlayer"
              @player-ready="handlePlayerReady"
              @video-loaded="handleVideoLoaded"
              @error="showError"
            />
          </div>

          <!-- 控制面板區域 -->
          <div class="space-y-6">
            <!-- 播放控制 -->
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
      </div>
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