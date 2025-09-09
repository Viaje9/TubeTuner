<template>
  <div>
    <!-- 展開的控制面板 -->
    <Transition name="panel">
      <div
        v-if="isExpanded"
        class="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-800 border-t border-gray-700/50 rounded-t-3xl shadow-2xl"
      >
        <!-- 頂部標籤列 -->
        <div class="flex items-center justify-between px-6 py-3 border-b border-gray-700/30">
          <!-- 標題 -->
          <div class="flex items-center gap-2">
            <svg
              class="w-5 h-5 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
              />
            </svg>
            <span class="text-white font-medium">影片控制</span>
          </div>

          <!-- 關閉按鈕 -->
          <button
            @click="collapse"
            class="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- 內容區域 -->
        <div class="h-[50vh] overflow-y-auto p-6 space-y-6">
          <!-- 播放控制 -->
          <div class="space-y-4">
            <h3 class="text-white font-semibold text-center flex items-center justify-center gap-2">
              <svg
                class="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              播放控制
            </h3>

            <div class="flex items-center justify-center gap-4">
              <!-- 播放/暫停按鈕 -->
              <button
                @click="togglePlayPause"
                :disabled="!player.isReady.value"
                class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
              >
                <svg
                  v-if="!player.isPlaying.value"
                  class="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <svg v-else class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 播放速度控制 -->
          <div class="space-y-4">
            <h3 class="text-white font-semibold text-center flex items-center justify-center gap-2">
              <svg
                class="w-5 h-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              播放速度
            </h3>

            <!-- 速度滑桿 -->
            <div class="flex items-center gap-4">
              <button
                @click="decreaseSpeed"
                class="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-all"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 12H4"
                  />
                </svg>
              </button>

              <div class="flex-1 relative">
                <input
                  type="range"
                  v-model="speed"
                  @input="updateSpeed"
                  min="0.25"
                  max="16"
                  step="0.25"
                  class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="flex justify-between mt-2">
                  <span class="text-xs text-gray-500">0.25x</span>
                  <span class="text-sm font-bold text-blue-400">{{ currentSpeed }}x</span>
                  <span class="text-xs text-gray-500">16x</span>
                </div>
              </div>

              <button
                @click="increaseSpeed"
                class="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-all"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            <!-- 快速選擇按鈕 -->
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="preset in speedPresets"
                :key="preset"
                @click="setSpeed(preset)"
                :class="[
                  'px-3 py-2 rounded-lg font-medium transition-all text-sm',
                  Math.abs(speed - preset) < 0.01
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white',
                ]"
              >
                {{ preset === 1 ? '正常' : `${preset}x` }}
              </button>
            </div>
          </div>

          <!-- 時間控制 -->
          <div class="space-y-4">
            <h3 class="text-white font-semibold text-center flex items-center justify-center gap-2">
              <svg
                class="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              時間控制
            </h3>

            <div class="flex items-center justify-center gap-3">
              <button
                @click="rewind"
                class="bg-gray-700/50 hover:bg-gray-600/50 text-white px-4 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                  />
                </svg>
                倒轉
              </button>

              <input
                v-model.number="seekSeconds"
                type="number"
                min="1"
                max="60"
                @focus="emit('inputFocused')"
                @blur="emit('inputBlurred')"
                class="w-16 text-center bg-gray-700/50 border border-gray-600 rounded-lg py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <span class="text-gray-400 text-sm">秒</span>

              <button
                @click="forward"
                class="bg-gray-700/50 hover:bg-gray-600/50 text-white px-4 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
                  />
                </svg>
                快進
              </button>
            </div>
          </div>

          <!-- 影片資訊 -->
          <div v-if="player.isReady.value" class="space-y-3">
            <h3 class="text-white font-semibold text-center flex items-center justify-center gap-2">
              <svg
                class="w-5 h-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              影片資訊
            </h3>

            <div class="bg-gray-700/30 rounded-lg p-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">當前時間:</span>
                <span class="text-white">{{ formatTime(player.currentTime.value) }}</span>
              </div>
              <div
                v-if="player.duration && player.duration.value > 0"
                class="flex justify-between text-sm"
              >
                <span class="text-gray-400">總時長:</span>
                <span class="text-white">{{ formatTime(player.duration.value) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">播放速度:</span>
                <span class="text-white">{{ currentSpeed }}x</span>
              </div>
              <div v-if="player.hasSubtitles" class="flex justify-between text-sm">
                <span class="text-gray-400">字幕:</span>
                <span class="text-green-400">已載入 {{ player.subtitles?.length || 0 }} 條</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const emit = defineEmits<{
  speedChanged: [speed: number]
  seeked: [seconds: number]
  playStateChanged: [isPlaying: boolean]
  error: [message: string]
  videoLoaded: [videoId: string]
  inputFocused: []
  inputBlurred: []
}>()

const props = defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  player: any // 使用 any 類型以支援本機影片播放器的額外屬性
}>()

const isExpanded = ref(false)
const speed = ref(1)
const seekSeconds = ref(10)

const speedPresets = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4, 8, 16]

const currentSpeed = computed(() => {
  return speed.value.toFixed(2).replace(/\.?0+$/, '')
})

// 同步播放速度
watch(
  () => props.player?.playbackRate?.value,
  (newRate) => {
    if (newRate !== undefined && Math.abs(speed.value - newRate) > 0.01) {
      speed.value = newRate
    }
  },
  { immediate: true },
)

const expand = () => {
  isExpanded.value = true
}

const collapse = () => {
  isExpanded.value = false
}

const togglePlayPause = () => {
  try {
    props.player.togglePlayPause()
    emit('playStateChanged', props.player.isPlaying.value)
  } catch {
    emit('error', '播放控制失敗')
  }
}

const updateSpeed = () => {
  try {
    const newSpeed = parseFloat(speed.value.toString())
    props.player.setPlaybackRate(newSpeed)
    emit('speedChanged', newSpeed)
  } catch {
    emit('error', '設定播放速度失敗')
  }
}

const setSpeed = (newSpeed: number) => {
  speed.value = newSpeed
  updateSpeed()
}

const decreaseSpeed = () => {
  const currentIndex = speedPresets.findIndex((s) => Math.abs(s - speed.value) < 0.01)
  if (currentIndex > 0) {
    setSpeed(speedPresets[currentIndex - 1])
  } else if (speed.value > 0.25) {
    setSpeed(Math.max(0.25, speed.value - 0.25))
  }
}

const increaseSpeed = () => {
  const currentIndex = speedPresets.findIndex((s) => Math.abs(s - speed.value) < 0.01)
  if (currentIndex >= 0 && currentIndex < speedPresets.length - 1) {
    setSpeed(speedPresets[currentIndex + 1])
  } else if (speed.value < 16) {
    setSpeed(Math.min(16, speed.value + 0.25))
  }
}

const rewind = () => {
  try {
    const currentTime = props.player.getCurrentTime()
    const newTime = Math.max(0, currentTime - seekSeconds.value)
    props.player.seekTo(newTime)
    emit('seeked', newTime)
  } catch {
    emit('error', '倒轉失敗')
  }
}

const forward = () => {
  try {
    const currentTime = props.player.getCurrentTime()
    const duration = props.player.getDuration?.() || 0
    const newTime = Math.min(duration, currentTime + seekSeconds.value)
    props.player.seekTo(newTime)
    emit('seeked', newTime)
  } catch {
    emit('error', '快進失敗')
  }
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

// 暴露給父元件的方法
defineExpose({
  expand,
  collapse,
})
</script>

<style scoped>
/* 面板動畫 */
.panel-enter-active,
.panel-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-enter-from,
.panel-leave-to {
  transform: translateY(100%);
}

/* FAB 動畫 */
.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

/* 滑桿樣式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  cursor: pointer;
  border: none;
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
}
</style>
