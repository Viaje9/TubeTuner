<template>
  <div>
    <!-- 浮動按鈕（收合狀態） -->
    <Transition name="float-button">
      <button
        v-if="!isExpanded"
        @click="expand"
        class="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-110 px-6 py-4 font-bold text-lg"
      >
        {{ currentSpeed }}x
      </button>
    </Transition>

    <!-- 展開的控制面板 -->
    <Transition name="panel">
      <div
        v-if="isExpanded"
        class="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-800/95 backdrop-blur-lg border-t border-gray-700/50 rounded-t-3xl shadow-2xl"
      >
        <!-- 拖曳手柄和關閉按鈕 -->
        <div class="flex items-center justify-between px-6 py-3 border-b border-gray-700/30">
          <div class="flex-1 flex justify-center">
            <div class="w-12 h-1 bg-gray-600 rounded-full"></div>
          </div>
          <button
            @click="collapse"
            class="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 控制內容 -->
        <div class="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <!-- 播放速度控制 -->
          <div class="space-y-4">
            <h3 class="text-white font-semibold text-center flex items-center justify-center gap-2">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              播放速度
            </h3>
            
            <!-- 速度滑桿 -->
            <div class="flex items-center gap-4">
              <button @click="decreaseSpeed" class="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-all">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              
              <div class="flex-1 relative">
                <input
                  type="range"
                  v-model="speed"
                  @input="updateSpeed"
                  min="0.25"
                  max="2"
                  step="0.25"
                  class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                >
                <div class="flex justify-between mt-2">
                  <span class="text-xs text-gray-500">0.25x</span>
                  <span class="text-sm font-bold text-blue-400">{{ currentSpeed }}x</span>
                  <span class="text-xs text-gray-500">2x</span>
                </div>
              </div>
              
              <button @click="increaseSpeed" class="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-all">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <!-- 快速選擇按鈕 -->
            <div class="flex gap-2 justify-center">
              <button
                v-for="preset in speedPresets"
                :key="preset"
                @click="setSpeed(preset)"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-all',
                  speed == preset 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                ]"
              >
                {{ preset === 1 ? '正常' : `${preset}x` }}
              </button>
            </div>
          </div>

          <!-- 時間控制 -->
          <div class="space-y-4">
            <h3 class="text-white font-semibold text-center flex items-center justify-center gap-2">
              <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              時間控制
            </h3>
            
            <div class="flex items-center justify-center gap-3">
              <button
                @click="rewind"
                class="bg-gray-700/50 hover:bg-gray-600/50 text-white px-5 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                </svg>
                倒轉
              </button>
              
              <input
                v-model="seekSeconds"
                type="number"
                class="w-20 text-center bg-gray-700/50 border border-gray-600 rounded-lg py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
              
              <span class="text-gray-400">秒</span>
              
              <button
                @click="forward"
                class="bg-gray-700/50 hover:bg-gray-600/50 text-white px-5 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2"
              >
                快轉
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 背景遮罩 -->
    <Transition name="backdrop">
      <div
        v-if="isExpanded"
        @click="collapse"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      ></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  player: {
    setPlaybackRate?: (rate: number) => void
    getCurrentTime?: () => number
    seekTo?: (time: number, allowSeekAhead: boolean) => void
  }
}

const props = defineProps<Props>()
const emit = defineEmits(['speed-changed', 'seeked', 'error'])

const isExpanded = ref(false)
const speed = ref(1)
const seekSeconds = ref(10)
const speedPresets = [0.5, 1, 1.5, 2]

const currentSpeed = computed(() => speed.value.toFixed(2).replace(/\.00$/, ''))

const expand = () => {
  isExpanded.value = true
}

const collapse = () => {
  isExpanded.value = false
}

const updateSpeed = () => {
  if (props.player?.setPlaybackRate) {
    props.player.setPlaybackRate(speed.value)
    emit('speed-changed', speed.value)
  }
}

const setSpeed = (newSpeed: number) => {
  speed.value = newSpeed
  updateSpeed()
}

const decreaseSpeed = () => {
  if (speed.value > 0.25) {
    speed.value = Math.max(0.25, speed.value - 0.25)
    updateSpeed()
  }
}

const increaseSpeed = () => {
  if (speed.value < 2) {
    speed.value = Math.min(2, speed.value + 0.25)
    updateSpeed()
  }
}

const rewind = () => {
  if (props.player?.getCurrentTime && props.player?.seekTo) {
    const currentTime = props.player.getCurrentTime()
    props.player.seekTo(Math.max(0, currentTime - seekSeconds.value), true)
    emit('seeked', -seekSeconds.value)
  }
}

const forward = () => {
  if (props.player?.getCurrentTime && props.player?.seekTo) {
    const currentTime = props.player.getCurrentTime()
    props.player.seekTo(currentTime + seekSeconds.value, true)
    emit('seeked', seekSeconds.value)
  }
}
</script>

<style scoped>
/* 自定義滑桿樣式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.5);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.5);
}

/* 動畫 */
.float-button-enter-active,
.float-button-leave-active {
  transition: all 0.3s ease;
}

.float-button-enter-from,
.float-button-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.panel-enter-active,
.panel-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-enter-from,
.panel-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>