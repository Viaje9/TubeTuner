<template>
  <div class="flex flex-wrap justify-center gap-2">
    <h2 class="w-full text-center text-xl font-semibold mb-2">播放速度</h2>
    <button 
      v-for="speed in speeds" 
      :key="speed"
      @click="handleSetSpeed(speed)"
      :class="[
        'font-medium py-2 px-4 rounded-lg transition-colors duration-200',
        currentSpeed === speed 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-gray-700 hover:bg-gray-600 text-white'
      ]"
    >
      {{ speed === 1 ? '正常 (1x)' : `${speed}x` }}
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
  speedChanged: [speed: number]
  error: [message: string]
}>()

const speeds = [0.5, 1, 1.5, 2]
const currentSpeed = ref(1)

const handleSetSpeed = (speed: number) => {
  if (props.player?.setSpeed) {
    props.player.setSpeed(speed)
    currentSpeed.value = speed
    emit('speedChanged', speed)
  } else {
    emit('error', '播放器尚未準備好')
  }
}
</script>