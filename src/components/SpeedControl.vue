<template>
  <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 space-y-6">
    <!-- 播放/暫停控制 -->
    <div class="text-center">
      <button
        @click="handleTogglePlayPause"
        :disabled="isToggling"
        :class="[
          'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform shadow-lg',
          isToggling ? 'scale-90 cursor-not-allowed opacity-75' : 'hover:scale-110 active:scale-95',
          isPlaying 
            ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/30' 
            : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/30'
        ]"
      >
        <svg v-if="!isPlaying" class="w-7 h-7 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
        <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
        </svg>
      </button>
    </div>

    <!-- 播放速度控制區域 -->
    <div class="space-y-4">
      <div class="text-center">
        <h2 class="text-lg font-semibold text-white mb-1">播放速度</h2>
        <div class="text-2xl font-bold text-blue-400">{{ currentSpeed.toFixed(1) }}x</div>
      </div>
      
      <!-- 速度調整控制 -->
      <div class="flex items-center justify-center gap-4">
        <button
          @click="handleSpeedChange(-0.1)"
          class="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
          title="減速 0.1x"
        >
          −
        </button>
        
        <div class="bg-gray-700/50 rounded-2xl px-4 py-3 min-w-[140px]">
          <input
            v-model.number="customSpeed"
            @blur="handleCustomSpeed"
            @keyup.enter="handleCustomSpeed"
            @keydown.up="handleSpeedChange(0.1)"
            @keydown.down="handleSpeedChange(-0.1)"
            type="number"
            min="0.25"
            max="4"
            step="0.1"
            class="w-full text-center text-lg font-semibold bg-transparent text-white placeholder-gray-400 focus:outline-none"
            placeholder="1.0"
          />
        </div>
        
        <button
          @click="handleSpeedChange(0.1)"
          class="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
          title="加速 0.1x"
        >
          +
        </button>
      </div>
      
      <!-- 快速選擇按鈕 -->
      <div class="grid grid-cols-4 gap-2">
        <button 
          v-for="speed in speeds" 
          :key="speed"
          @click="handleSetSpeed(speed)"
          :class="[
            'py-3 px-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95',
            Math.abs(currentSpeed - speed) < 0.01
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
              : 'bg-gray-700/70 hover:bg-gray-600/70 text-gray-200 hover:text-white'
          ]"
        >
          {{ speed === 1 ? '正常' : `${speed}x` }}
        </button>
      </div>

      <!-- 重置按鈕 -->
      <div class="text-center pt-2">
        <button
          @click="handleSetSpeed(1)"
          v-if="Math.abs(currentSpeed - 1) > 0.01"
          class="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/25"
        >
          重置為正常速度
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import type { IYouTubePlayer } from '@/types/youtube'

const props = defineProps<{
  player: IYouTubePlayer
}>()

const emit = defineEmits<{
  speedChanged: [speed: number]
  error: [message: string]
  playStateChanged: [isPlaying: boolean]
}>()

const speeds = [0.5, 1, 1.5, 2]
const currentSpeed = ref(1)
const customSpeed = ref(1)

// 立即響應的本地狀態
const localIsPlaying = ref(false)
const isToggling = ref(false)

// 同步 YouTube API 狀態與本地狀態
watch(() => props.player?.isPlaying?.value, (newValue) => {
  if (newValue !== undefined && !isToggling.value) {
    localIsPlaying.value = newValue
  }
}, { immediate: true })

// 同步播放速度
watch(() => props.player?.playbackRate?.value, (newValue) => {
  if (newValue !== undefined) {
    currentSpeed.value = newValue
    customSpeed.value = newValue
  }
}, { immediate: true })

const isPlaying = computed(() => localIsPlaying.value)

const validateSpeed = (speed: number): number => {
  return Math.max(0.25, Math.min(4, Math.round(speed * 10) / 10))
}

const handleSetSpeed = (speed: number) => {
  const validSpeed = validateSpeed(speed)
  if (props.player?.setSpeed) {
    props.player.setSpeed(validSpeed)
    currentSpeed.value = validSpeed
    customSpeed.value = validSpeed
    emit('speedChanged', validSpeed)
  } else {
    emit('error', '播放器尚未準備好')
  }
}

const handleSpeedChange = (delta: number) => {
  const newSpeed = validateSpeed(currentSpeed.value + delta)
  handleSetSpeed(newSpeed)
}

const handleCustomSpeed = () => {
  if (customSpeed.value && !isNaN(customSpeed.value)) {
    handleSetSpeed(customSpeed.value)
  } else {
    // 如果輸入無效，重置為當前速度
    customSpeed.value = currentSpeed.value
    emit('error', '請輸入有效的播放速度 (0.25-4.0)')
  }
}

const handleTogglePlayPause = () => {
  if (props.player?.togglePlayPause && !isToggling.value) {
    isToggling.value = true
    
    // 立即更新本地狀態以提供即時 UI 回饋
    localIsPlaying.value = !localIsPlaying.value
    
    // 呼叫 YouTube API
    props.player.togglePlayPause()
    emit('playStateChanged', localIsPlaying.value)
    
    // 300ms 後允許下次切換，並同步實際狀態
    setTimeout(() => {
      isToggling.value = false
      // 確保與實際狀態同步
      if (props.player?.isPlaying?.value !== undefined) {
        localIsPlaying.value = props.player.isPlaying.value
      }
    }, 300)
  } else if (isToggling.value) {
    // 如果正在切換中，忽略快速點擊
    return
  } else {
    emit('error', '播放器尚未準備好')
  }
}
</script>