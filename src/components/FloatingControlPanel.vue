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
          <!-- 標籤切換 -->
          <div class="flex gap-1">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap',
                currentTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50',
              ]"
            >
              <!-- 控制頁籤圖示 -->
              <svg
                v-if="tab.id === 'control'"
                class="w-4 h-4 flex-shrink-0"
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
              <span class="text-xs">{{ tab.name }}</span>
            </button>
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
        <div class="h-[50vh] overflow-y-auto">
          <Transition name="tab-content" mode="out-in">
            <!-- 控制頁籤內容 -->
            <div v-if="currentTab === 'control'" key="control" class="p-6 space-y-6">
              <!-- 播放速度控制 -->
              <div class="space-y-4">
                <h3
                  class="text-white font-semibold text-center flex items-center justify-center gap-2"
                >
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
                      max="2"
                      step="0.25"
                      class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div class="flex justify-between mt-2">
                      <span class="text-xs text-gray-500">0.25x</span>
                      <span class="text-sm font-bold text-blue-400">{{ currentSpeed }}x</span>
                      <span class="text-xs text-gray-500">2x</span>
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
                <div class="flex gap-2 justify-center">
                  <button
                    v-for="preset in speedPresets"
                    :key="preset"
                    @click="setSpeed(preset)"
                    :class="[
                      'px-4 py-2 rounded-lg font-medium transition-all',
                      speed == preset
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
                <h3
                  class="text-white font-semibold text-center flex items-center justify-center gap-2"
                >
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
                    :class="[
                      'bg-gray-700/50 hover:bg-gray-600/50 text-white px-5 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2',
                      rewindClicked ? 'bg-orange-600/70 scale-110 ring-2 ring-orange-300' : '',
                    ]"
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
                    v-model="seekSeconds"
                    type="number"
                    class="w-20 text-center bg-gray-700/50 border border-gray-600 rounded-lg py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  <span class="text-gray-400">秒</span>

                  <button
                    @click="forward"
                    :class="[
                      'bg-gray-700/50 hover:bg-gray-600/50 text-white px-5 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2',
                      forwardClicked ? 'bg-green-600/70 scale-110 ring-2 ring-green-300' : '',
                    ]"
                  >
                    快轉
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

    <!-- 背景遮罩 -->
    <Transition name="backdrop">
      <div v-if="isExpanded" @click="collapse" class="fixed inset-0 bg-black/0 z-40"></div>
    </Transition>

    <!-- 底部固定輸入框 -->
    <div
      class="fixed inset-x-0 z-40 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-800 border-t border-gray-700/50"
      style="bottom: var(--keyboard-height, 0px)"
    >
      <!-- 水平播放控制條 -->
      <div class="flex items-center px-6 py-3 border-b border-gray-700/30">
        <!-- 左側：快速後退 -->
        <div class="flex-1 flex justify-start">
          <button
            @click="rewind"
            :class="[
              'flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 shadow-lg',
              'bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white',
              'hover:scale-110 active:scale-95',
              rewindClicked ? 'animate-pulse scale-125 ring-2 ring-orange-300' : '',
            ]"
            :title="`後退 ${seekSeconds} 秒`"
          >
            <div class="flex flex-col items-center">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"
                />
              </svg>
              <span class="text-xs font-bold leading-tight">-{{ seekSeconds }}</span>
            </div>
          </button>
        </div>

        <!-- 中央：播放/暫停 -->
        <div class="flex justify-center">
          <button
            @click="togglePlayPause"
            class="flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:scale-110 active:scale-95"
            :title="isPlaying ? '暫停' : '播放'"
          >
            <!-- 播放圖示 -->
            <svg v-if="!isPlaying" class="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
              />
            </svg>
            <!-- 暫停圖示 -->
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z"
              />
            </svg>
          </button>
        </div>

        <!-- 右側：快速前進 -->
        <div class="flex-1 flex justify-end">
          <button
            @click="forward"
            :class="[
              'flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 shadow-lg',
              'bg-gradient-to-br from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white',
              'hover:scale-110 active:scale-95',
              forwardClicked ? 'animate-pulse scale-125 ring-2 ring-green-300' : '',
            ]"
            :title="`前進 ${seekSeconds} 秒`"
          >
            <div class="flex flex-col items-center">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"
                />
              </svg>
              <span class="text-xs font-bold leading-tight">+{{ seekSeconds }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAIConfigStore } from '@/stores/aiConfig'
import { LocalStorageService } from '@/services/localStorage'

interface Props {
  player: {
    setPlaybackRate?: (rate: number) => void
    getCurrentTime?: () => number
    seekTo?: (time: number, allowSeekAhead: boolean) => void
    togglePlayPause?: () => void
    isPlaying?: { value: boolean }
    currentVideoId?: { value: string }
  }
}

const props = defineProps<Props>()
const emit = defineEmits(['speed-changed', 'seeked', 'error', 'play-state-changed', 'video-loaded'])

// Stores
const aiConfig = useAIConfigStore()

// 頁籤系統
const currentTab = ref('control')
const tabs = [
  {
    id: 'control',
    name: '控制',
    icon: 'control-icon',
  },
]

// 狀態
const isExpanded = ref(false)

// 從 localStorage 恢復設定
const savedState = LocalStorageService.getPlaybackState()
const speed = ref(savedState.playbackRate || 1)
const seekSeconds = ref(savedState.seekSeconds || 10)
const speedPresets = [0.5, 1, 1.5, 2]
const isPlaying = ref(false)

// 載入影片相關狀態

// 點擊反饋狀態
const forwardClicked = ref(false)
const rewindClicked = ref(false)

// 計算屬性
const currentSpeed = computed(() => {
  const formatted = speed.value.toFixed(1)
  return formatted.replace(/\.0$/, '')
})

// 初始化
onMounted(() => {
  aiConfig.loadFromStorage()
})

// 監聽播放狀態變化
watch(
  () => props.player?.isPlaying?.value,
  (newValue) => {
    if (newValue !== undefined) {
      isPlaying.value = newValue
    }
  },
  { immediate: true },
)

// 監聽影片變化
watch(
  () => props.player?.currentVideoId?.value,
  () => {},
)

// 監聽 seekSeconds 變化並保存
watch(seekSeconds, (newValue) => {
  LocalStorageService.savePlaybackState({ seekSeconds: newValue })
})

// 面板控制
const expand = () => {
  isExpanded.value = true
}

const collapse = () => {
  isExpanded.value = false
}

// 播放控制
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
  if (speed.value > 0.1) {
    speed.value = Math.max(0.1, Math.round((speed.value - 0.1) * 10) / 10)
    updateSpeed()
  }
}

const increaseSpeed = () => {
  if (speed.value < 2) {
    speed.value = Math.min(2, Math.round((speed.value + 0.1) * 10) / 10)
    updateSpeed()
  }
}

const forward = () => {
  if (props.player?.getCurrentTime && props.player?.seekTo) {
    const currentTime = props.player.getCurrentTime()
    props.player.seekTo(currentTime + seekSeconds.value, true)
    emit('seeked', seekSeconds.value)

    // 觸發點擊反饋動畫
    forwardClicked.value = true
    setTimeout(() => {
      forwardClicked.value = false
    }, 200)
  }
}

const rewind = () => {
  if (props.player?.getCurrentTime && props.player?.seekTo) {
    const currentTime = props.player.getCurrentTime()
    props.player.seekTo(Math.max(0, currentTime - seekSeconds.value), true)
    emit('seeked', -seekSeconds.value)

    // 觸發點擊反饋動畫
    rewindClicked.value = true
    setTimeout(() => {
      rewindClicked.value = false
    }, 200)
  }
}

const togglePlayPause = () => {
  if (props.player?.togglePlayPause) {
    props.player.togglePlayPause()
  } else {
    emit('error', '播放器尚未準備好')
  }
}

// 暴露給父元件的方法
defineExpose({
  expand,
  collapse,
})

// 清理
onUnmounted(() => {
  // 清理相關資源
})
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

/* 頁籤內容切換動畫 */
.tab-content-enter-active,
.tab-content-leave-active {
  transition: all 0.2s ease;
}

.tab-content-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.tab-content-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
