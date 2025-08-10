<template>
  <div class="space-y-6">
    <!-- 影片上傳區域 -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-white">上傳本機影片</h2>

      <!-- 拖放區域 -->
      <div
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        :class="[
          'border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer',
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-700/50',
        ]"
        @click="triggerFileInput"
      >
        <div class="text-center">
          <svg
            :class="[
              'w-12 h-12 mx-auto mb-4 transition-colors',
              isDragging ? 'text-blue-500' : 'text-gray-400',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <h3 class="text-lg font-medium text-white mb-2">
            {{ isDragging ? '放下檔案來上傳' : '拖放或點擊上傳影片檔案' }}
          </h3>
          <p class="text-gray-400 text-sm">支援格式：MP4, WebM, OGG</p>
        </div>
      </div>

      <!-- 隱藏的檔案輸入 -->
      <input
        ref="videoFileInput"
        type="file"
        accept="video/*"
        class="hidden"
        @change="handleVideoFileSelect"
      />
    </div>

    <!-- 字幕上傳區域 -->
    <div v-if="hasVideo" class="space-y-4">
      <h3 class="text-lg font-semibold text-white">上傳字幕檔案（可選）</h3>

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <input
            ref="subtitleFileInput"
            type="file"
            accept=".srt,.json"
            class="hidden"
            @change="handleSubtitleFileSelect"
          />
          <button
            @click="triggerSubtitleInput"
            class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-left focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white transition-all duration-200 flex items-center gap-3"
          >
            <svg
              class="w-5 h-5 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span :class="selectedSubtitleFile ? 'text-white' : 'text-gray-400'">
              {{ selectedSubtitleFile ? selectedSubtitleFile.name : '選擇字幕檔案 (SRT/JSON)...' }}
            </span>
          </button>
        </div>

        <button
          v-if="selectedSubtitleFile"
          @click="uploadSubtitle"
          :disabled="isUploadingSubtitle"
          class="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isUploadingSubtitle ? '上傳中...' : '上傳字幕' }}
        </button>
      </div>

      <!-- 字幕狀態顯示 -->
      <div v-if="hasSubtitles" class="flex items-center gap-2 text-green-400 text-sm">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <span>字幕已載入（共 {{ subtitleCount }} 條）</span>
        <button
          @click="clearSubtitles"
          class="text-gray-400 hover:text-red-400 ml-2"
          title="清除字幕"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 已載入的影片資訊 -->
    <div v-if="hasVideo" class="bg-gray-800/50 rounded-xl p-4 space-y-2">
      <h3 class="font-medium text-white">已載入的影片</h3>
      <div class="text-sm text-gray-300">
        <p><span class="text-gray-400">檔名:</span> {{ videoFileName }}</p>
        <p><span class="text-gray-400">大小:</span> {{ formatFileSize(videoFileSize || 0) }}</p>
        <p><span class="text-gray-400">類型:</span> {{ videoFileType }}</p>
      </div>
      <button @click="clearVideo" class="text-sm text-red-400 hover:text-red-300 transition-colors">
        移除影片
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  videoLoaded: [file: File]
  subtitleLoaded: [file: File]
  videoCleared: []
  subtitleCleared: []
  error: [message: string]
}>()

defineProps<{
  hasVideo?: boolean
  hasSubtitles?: boolean
  subtitleCount?: number
  videoFileName?: string
  videoFileSize?: number
  videoFileType?: string
}>()

const isDragging = ref(false)
const selectedSubtitleFile = ref<File | null>(null)
const isUploadingSubtitle = ref(false)
const videoFileInput = ref<HTMLInputElement>()
const subtitleFileInput = ref<HTMLInputElement>()

let dragCounter = 0

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  dragCounter++
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  dragCounter--
  if (dragCounter === 0) {
    isDragging.value = false
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  dragCounter = 0
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('video/')) {
      handleVideoFile(file)
    } else {
      emit('error', '請上傳影片檔案（MP4、WebM 或 OGG 格式）')
    }
  }
}

const triggerFileInput = () => {
  videoFileInput.value?.click()
}

const triggerSubtitleInput = () => {
  subtitleFileInput.value?.click()
}

const handleVideoFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleVideoFile(file)
  }
}

const handleVideoFile = (file: File) => {
  // 檢查檔案類型
  if (!file.type.startsWith('video/')) {
    emit('error', '不支援的檔案類型，請選擇影片檔案')
    return
  }

  // 檢查檔案大小（限制 2GB）
  const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
  if (file.size > maxSize) {
    emit('error', '檔案太大，請選擇小於 2GB 的影片檔案')
    return
  }

  // 檢查瀏覽器是否支援這種影片格式
  const video = document.createElement('video')
  const canPlay = video.canPlayType(file.type)

  if (canPlay === '') {
    emit('error', `不支援的影片格式: ${file.type}。建議使用 MP4 (H.264) 格式`)
    return
  }

  emit('videoLoaded', file)

  // 清除之前選擇的檔案
  if (videoFileInput.value) {
    videoFileInput.value.value = ''
  }
}

const handleSubtitleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedSubtitleFile.value = file
  }
}

const uploadSubtitle = async () => {
  if (!selectedSubtitleFile.value) return

  isUploadingSubtitle.value = true

  try {
    const fileName = selectedSubtitleFile.value.name.toLowerCase()

    // 檢查檔案類型
    if (!fileName.endsWith('.srt') && !fileName.endsWith('.json')) {
      throw new Error('請選擇 SRT 或 JSON 格式的字幕檔案')
    }

    // 檢查檔案大小（限制 10MB）
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (selectedSubtitleFile.value.size > maxSize) {
      throw new Error('字幕檔案太大，請選擇小於 10MB 的檔案')
    }

    emit('subtitleLoaded', selectedSubtitleFile.value)
    selectedSubtitleFile.value = null

    // 清除檔案選擇
    if (subtitleFileInput.value) {
      subtitleFileInput.value.value = ''
    }
  } catch (error) {
    emit('error', error instanceof Error ? error.message : '載入字幕失敗')
  } finally {
    isUploadingSubtitle.value = false
  }
}

const clearVideo = () => {
  emit('videoCleared')
  selectedSubtitleFile.value = null
  if (videoFileInput.value) {
    videoFileInput.value.value = ''
  }
  if (subtitleFileInput.value) {
    subtitleFileInput.value.value = ''
  }
}

const clearSubtitles = () => {
  emit('subtitleCleared')
  selectedSubtitleFile.value = null
  if (subtitleFileInput.value) {
    subtitleFileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
