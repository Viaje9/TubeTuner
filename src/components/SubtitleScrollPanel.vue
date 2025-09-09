<template>
  <div v-if="subtitles.length > 0" class="w-full max-h-[370px] flex flex-col">
    <!-- 字幕滾動區域 -->
    <div
      ref="scrollContainer"
      class="flex-1 overflow-y-auto overscroll-contain scroll-smooth"
      @scroll="onScroll"
    >
      <div class="p-2 space-y-2">
        <div
          v-for="(subtitle, index) in subtitles"
          :key="subtitle.index"
          :ref="(el) => setSubtitleRef(el, index)"
          :class="[
            'p-3 rounded cursor-pointer transition-all duration-200 text-xl leading-relaxed',
            isCurrentSubtitle(subtitle)
              ? 'bg-blue-500/20 text-blue-100'
              : 'text-gray-400 hover:bg-gray-700/20',
          ]"
          @click="seekToSubtitle(subtitle)"
          :title="`跳轉到 ${formatTime(subtitle.startTime)}`"
        >
          <!-- 字幕內容 -->
          <div class="break-words">
            {{ subtitle.text }}
          </div>
        </div>

        <!-- 佔位符，確保最後一個字幕可以滾動到頂部 -->
        <div class="h-64"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, type ComponentPublicInstance } from 'vue'
import type { SubtitleData } from '@/types/player'

// Props
interface Props {
  subtitles: SubtitleData[]
  currentTime: number
  currentSubtitle?: SubtitleData | null
  isPlaying?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isPlaying: false,
})

// Emits
const emit = defineEmits<{
  seekTo: [time: number]
}>()

// 響應式變量
const scrollContainer = ref<HTMLElement>()
const subtitleRefs = ref<(HTMLElement | ComponentPublicInstance | null)[]>([])
const isUserScrolling = ref(false)
const userScrollTimeout = ref<number>()

// 計算屬性
const currentSubtitleIndex = computed(() => {
  if (!props.subtitles.length) return -1

  return props.subtitles.findIndex(
    (subtitle) => props.currentTime >= subtitle.startTime && props.currentTime <= subtitle.endTime,
  )
})

// 設定字幕元素引用
const setSubtitleRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (!subtitleRefs.value) subtitleRefs.value = []
  subtitleRefs.value[index] = el as HTMLElement | ComponentPublicInstance | null
}

// 判斷是否為當前字幕
const isCurrentSubtitle = (subtitle: SubtitleData): boolean => {
  return props.currentTime >= subtitle.startTime && props.currentTime <= subtitle.endTime
}

// 格式化時間
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

// 跳轉到指定字幕
const seekToSubtitle = (subtitle: SubtitleData) => {
  emit('seekTo', subtitle.startTime)
}

// 滾動到當前字幕
const scrollToCurrentSubtitle = async () => {
  if (isUserScrolling.value || currentSubtitleIndex.value < 0) return

  await nextTick()

  const currentElement = subtitleRefs.value[currentSubtitleIndex.value] as HTMLElement
  if (currentElement && scrollContainer.value) {
    // 計算滾動位置，讓當前字幕出現在容器頂部附近
    const containerRect = scrollContainer.value.getBoundingClientRect()
    const elementRect = currentElement.getBoundingClientRect()
    const relativeTop = elementRect.top - containerRect.top + scrollContainer.value.scrollTop

    // 滾動到讓當前字幕在頂部
    const targetScrollTop = relativeTop

    scrollContainer.value.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth',
    })
  }
}

// 處理用戶手動滾動
const onScroll = () => {
  isUserScrolling.value = true

  // 清除之前的計時器
  if (userScrollTimeout.value) {
    clearTimeout(userScrollTimeout.value)
  }

  // 3秒後重新啟用自動滾動
  userScrollTimeout.value = setTimeout(() => {
    isUserScrolling.value = false
  }, 3000) as unknown as number
}

// 監聽當前字幕變化
watch(
  () => currentSubtitleIndex.value,
  (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex >= 0 && props.isPlaying) {
      scrollToCurrentSubtitle()
    }
  },
  { immediate: true },
)

// 監聽播放狀態變化
watch(
  () => props.isPlaying,
  (isPlaying) => {
    if (isPlaying && currentSubtitleIndex.value >= 0) {
      // 播放開始時滾動到當前字幕
      setTimeout(() => {
        scrollToCurrentSubtitle()
      }, 100)
    }
  },
)
</script>

<style scoped>
/* 自定義滾動條 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* 滾動行為優化 */
.scroll-smooth {
  scroll-behavior: smooth;
}

/* 字幕項目動畫 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
