<template>
  <div class="mt-6 flex flex-wrap justify-center items-center gap-3">
    <h2 class="w-full text-center text-xl font-semibold mb-2">時間控制</h2>
    <button 
      @click="handleSeek(-seekSeconds)"
      class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-5 rounded-lg transition-colors duration-200"
    >
      倒轉
    </button>
    <input 
      v-model.number="seekSeconds"
      type="number" 
      class="w-20 text-center bg-gray-800 border border-gray-600 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
      min="1"
      max="60"
    >
    <span class="text-gray-400">秒</span>
    <button 
      @click="handleSeek(seekSeconds)"
      class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-5 rounded-lg transition-colors duration-200"
    >
      快轉
    </button>
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