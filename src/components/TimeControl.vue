<template>
  <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 space-y-4">
    <div class="text-center">
      <h2 class="text-lg font-semibold text-white mb-1">時間控制</h2>
      <div class="text-sm text-gray-400">快速跳轉影片時間</div>
    </div>

    <!-- 時間跳轉控制 -->
    <div class="flex items-center justify-center gap-4">
      <button 
        @click="handleSeek(-seekSeconds)"
        class="flex-1 max-w-[100px] h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"/>
        </svg>
        <span class="hidden sm:inline">倒轉</span>
      </button>

      <!-- 時間輸入區域 -->
      <div class="bg-gray-700/50 rounded-2xl px-4 py-3 flex items-center gap-2">
        <input 
          v-model.number="seekSeconds"
          type="number" 
          class="w-12 text-center text-lg font-bold bg-transparent text-white focus:outline-none"
          min="1"
          max="60"
        />
        <span class="text-gray-300 font-medium">秒</span>
      </div>

      <button 
        @click="handleSeek(seekSeconds)"
        class="flex-1 max-w-[100px] h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
      >
        <span class="hidden sm:inline">快轉</span>
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z"/>
        </svg>
      </button>
    </div>

    <!-- 快速跳轉按鈕 -->
    <div class="grid grid-cols-4 gap-2">
      <button 
        v-for="time in [5, 10, 15, 30]" 
        :key="`back-${time}`"
        @click="handleSeek(-time)"
        class="py-2 px-3 bg-gray-700/70 hover:bg-purple-600/70 text-gray-200 hover:text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
      >
        -{{ time }}s
      </button>
    </div>

    <div class="grid grid-cols-4 gap-2">
      <button 
        v-for="time in [5, 10, 15, 30]" 
        :key="`forward-${time}`"
        @click="handleSeek(time)"
        class="py-2 px-3 bg-gray-700/70 hover:bg-blue-600/70 text-gray-200 hover:text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
      >
        +{{ time }}s
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import type { IYouTubePlayer } from '@/types/youtube'

const props = defineProps<{
  player: IYouTubePlayer
}>()

const emit = defineEmits<{
  seeked: [seconds: number]
  error: [message: string]
}>()

const seekSeconds = ref(5)

const handleSeek = (seconds: number) => {
  if (props.player?.seekVideo) {
    props.player.seekVideo(seconds)
    emit('seeked', seconds)
  } else {
    emit('error', '播放器尚未準備好')
  }
}
</script>

<style scoped>
/* 隱藏 number input 的上下箭頭 */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>