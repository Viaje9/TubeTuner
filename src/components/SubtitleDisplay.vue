<template>
  <div
    v-if="currentSubtitle"
    :class="[
      'absolute left-1/2 transform -translate-x-1/2 z-10 transition-all duration-200 pointer-events-none',
      position === 'bottom' ? 'bottom-4' : 'top-4',
    ]"
  >
    <div
      :class="[
        'px-4 py-2 rounded-lg max-w-4xl mx-auto shadow-lg backdrop-blur-sm',
        backgroundStyle,
      ]"
      :style="{ fontSize: fontSize + 'px' }"
    >
      <div
        :class="['text-center font-medium leading-relaxed', textColorClass]"
        :style="{
          textShadow: showShadow ? '2px 2px 4px rgba(0, 0, 0, 0.8)' : 'none',
        }"
        v-html="formattedText"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SubtitleData } from '@/types/player'

const props = withDefaults(
  defineProps<{
    currentSubtitle: SubtitleData | null
    fontSize?: number
    textColor?: 'white' | 'yellow' | 'blue' | 'green'
    backgroundColor?: 'dark' | 'black' | 'transparent' | 'semi'
    position?: 'top' | 'bottom'
    showShadow?: boolean
  }>(),
  {
    fontSize: 18,
    textColor: 'white',
    backgroundColor: 'semi',
    position: 'bottom',
    showShadow: true,
  },
)

const textColorClass = computed(() => {
  switch (props.textColor) {
    case 'yellow':
      return 'text-yellow-300'
    case 'blue':
      return 'text-blue-300'
    case 'green':
      return 'text-green-300'
    default:
      return 'text-white'
  }
})

const backgroundStyle = computed(() => {
  switch (props.backgroundColor) {
    case 'dark':
      return 'bg-gray-900/90 border border-gray-700/50'
    case 'black':
      return 'bg-black/80'
    case 'transparent':
      return 'bg-transparent'
    case 'semi':
    default:
      return 'bg-black/60 border border-gray-800/30'
  }
})

const formattedText = computed(() => {
  if (!props.currentSubtitle?.text) return ''

  // 將換行符轉換為 HTML <br> 標籤
  return props.currentSubtitle.text.replace(/\n/g, '<br>').replace(/\\n/g, '<br>')
})
</script>

<style scoped>
/* 確保字幕在所有情況下都清晰可見 */
.subtitle-text {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 響應式字幕大小 */
@media (max-width: 640px) {
  .subtitle-container {
    max-width: calc(100vw - 2rem);
    left: 1rem;
    right: 1rem;
    transform: none;
  }
}

/* 確保字幕不會影響影片控制 */
.pointer-events-none {
  pointer-events: none;
}

/* 字幕動畫效果 */
.subtitle-fade-enter-active,
.subtitle-fade-leave-active {
  transition: opacity 0.2s ease;
}

.subtitle-fade-enter-from,
.subtitle-fade-leave-to {
  opacity: 0;
}
</style>
