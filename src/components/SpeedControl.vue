<template>
  <div class="space-y-4">
    <!-- 播放/暫停控制 -->
    <div class="flex justify-center">
      <button
        @click="handleTogglePlayPause"
        :disabled="isToggling"
        :class="[
          'font-medium py-3 px-8 rounded-lg transition-all duration-200 transform',
          isToggling ? 'scale-95 cursor-not-allowed opacity-75' : 'hover:scale-105',
          isPlaying 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-green-600 hover:bg-green-700 text-white'
        ]"
      >
        <span class="flex items-center gap-2">
          <svg v-if="!isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
          </svg>
          {{ isPlaying ? '暫停' : '播放' }}
        </span>
      </button>
    </div>

    <!-- 播放速度控制 -->
    <div class="space-y-4">
      <h2 class="text-center text-xl font-semibold">播放速度</h2>
      
      <!-- 自訂速度輸入 -->
      <div class="flex justify-center items-center gap-3">
        <button
          @click="handleSpeedChange(-0.1)"
          class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200"
          title="減速 0.1x"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 10h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <div class="flex items-center gap-2">
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
            class="w-20 text-center py-2 px-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-all duration-200"
            placeholder="1.0"
            title="使用上下方向鍵快速調整"
          />
          <span class="text-white font-medium">x</span>
        </div>
        
        <button
          @click="handleSpeedChange(0.1)"
          class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200"
          title="加速 0.1x"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 5v10M5 10h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <!-- 快速重置按鈕 -->
      <div class="flex justify-center">
        <button
          @click="handleSetSpeed(1)"
          :class="[
            'font-medium py-2 px-6 rounded-lg transition-all duration-200',
            Math.abs(currentSpeed - 1) < 0.01
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
          ]"
          title="快速重置為正常速度"
        >
          {{ Math.abs(currentSpeed - 1) < 0.01 ? '✓ 正常速度' : '重置 1x' }}
        </button>
      </div>

      <!-- 預設速度按鈕 -->
      <div class="flex flex-wrap justify-center gap-2">
        <button 
          v-for="speed in speeds" 
          :key="speed"
          @click="handleSetSpeed(speed)"
          :class="[
            'font-medium py-2 px-4 rounded-lg transition-colors duration-200',
            Math.abs(currentSpeed - speed) < 0.01
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          ]"
        >
          {{ speed === 1 ? '正常 (1x)' : `${speed}x` }}
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