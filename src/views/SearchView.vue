<template>
  <div
    class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-[100dvh] relative"
  >
    <!-- 訊息提示框 -->
    <MessageBox :message="errorMessage" />

    <div class="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <!-- 標題區域 -->
      <div class="flex items-center justify-between mb-4 sm:mb-6">
        <div class="flex flex-col">
          <h1
            class="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent break-words"
          >
            TubeTuner
          </h1>
          <p class="text-sm sm:text-base text-gray-300 break-words">搜尋 YouTube 影片</p>
        </div>
        <!-- 控制按鈕群組 -->
        <div class="flex items-center gap-3">
          <button
            @click="goToHome"
            class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-3 sm:px-4 sm:py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-75 flex items-center gap-2 active:scale-95 touch-manipulation min-h-[44px] min-w-[44px] whitespace-nowrap"
            title="播放器"
          >
            <svg
              class="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0V11a1 1 0 011-1h2a1 1 0 011 1v10m0 0h3a1 1 0 001-1V10m-11 10h3m-3 0v-3"
              />
            </svg>
          </button>

          <button
            @click="goToMenu"
            class="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-3 py-3 sm:px-4 sm:py-3 rounded-lg hover:shadow-lg hover:shadow-gray-500/30 transition-all duration-200 flex items-center gap-2 active:scale-95 touch-manipulation min-h-[44px] min-w-[44px] whitespace-nowrap"
            title="功能選單"
          >
            <svg
              class="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 搜尋區域 -->
      <div class="max-w-4xl mx-auto">
        <!-- 搜尋輸入框 -->
        <div class="mb-8">
          <div class="relative">
            <input
              ref="searchInputRef"
              v-model="searchState.query"
              @keypress="handleKeyPress"
              @focus="isInputFocused = true"
              @blur="isInputFocused = false"
              type="text"
              placeholder="輸入 YouTube 影片網址或搜尋關鍵字..."
              class="w-full px-6 py-4 pl-14 pr-12 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/70 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
            />
            <div class="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg
                class="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <!-- 清除按鈕 -->
            <button
              v-if="searchState.query"
              @click="clearSearch"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              title="清除搜尋"
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

          <!-- 搜尋按鈕 -->
          <div class="mt-4 flex justify-center gap-4">
            <button
              @click="() => handleSearch()"
              :disabled="!searchState.query.trim() || searchState.isSearching"
              class="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <svg
                v-if="searchState.isSearching"
                class="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {{ searchState.isSearching ? '搜尋中...' : '搜尋' }}
            </button>
          </div>
        </div>

        <!-- 搜尋結果區域 -->
        <div v-if="hasResults" class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2
              class="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
            >
              搜尋結果 ({{ searchState.results.length }})
            </h2>
            <div class="text-xs sm:text-sm text-gray-400 break-words">
              搜尋: "{{ searchState.query }}"
            </div>
          </div>

          <!-- 影片結果網格 -->
          <div class="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="video in searchState.results"
              :key="video.id"
              @click="loadVideo(video)"
              class="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-green-500/20 hover:border-green-500/50 transition-all duration-200 active:scale-[0.98] touch-manipulation"
            >
              <!-- 縮略圖 -->
              <div class="relative aspect-video bg-gray-700 rounded-t-xl overflow-hidden">
                <img
                  v-if="video.thumbnails.medium"
                  :src="video.thumbnails.medium"
                  :alt="video.title"
                  class="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  loading="lazy"
                  @error="
                    (event) => {
                      const target = event.target as HTMLImageElement
                      if (target) target.style.display = 'none'
                    }
                  "
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg
                    class="w-16 h-16 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293L12 11l.707-.707A1 1 0 0113.414 10H15M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <!-- 影片時長 -->
                <div
                  class="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-mono"
                >
                  {{ video.duration }}
                </div>
                <!-- 播放圖示覆層 -->
                <div
                  class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white drop-shadow-lg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              <!-- 影片資訊 -->
              <div class="p-3 sm:p-4">
                <h3
                  class="text-sm sm:text-base font-semibold text-white group-hover:text-green-400 transition-colors line-clamp-2 mb-2 leading-tight"
                >
                  {{ video.title }}
                </h3>
                <p class="text-xs sm:text-sm text-gray-400 mb-1 break-words">
                  {{ video.channelTitle }}
                </p>
                <div class="flex items-center gap-1 sm:gap-2 text-xs text-gray-500 flex-wrap">
                  <span>{{ formatNumber(video.viewCount) }}</span>
                  <span>•</span>
                  <span>{{ formatTime(video.publishedAt) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 載入更多按鈕 -->
          <div v-if="searchState.hasMore" class="text-center mt-6">
            <button
              @click="loadMoreResults"
              :disabled="isLoadingMore"
              class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center gap-2 mx-auto active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-base sm:text-lg font-medium whitespace-nowrap"
            >
              <svg
                v-if="isLoadingMore"
                class="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {{ isLoadingMore ? '載入中...' : '載入更多' }}
            </button>
          </div>
        </div>

        <!-- 載入狀態 -->
        <div v-else-if="searchState.isSearching" class="text-center py-12 sm:py-16">
          <div
            class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
          >
            <svg
              class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg sm:text-xl font-semibold text-blue-400 mb-2">搜尋中...</h3>
          <p class="text-sm sm:text-base text-gray-400 px-4 break-words">
            正在搜尋 "{{ searchState.query }}"
          </p>
        </div>

        <!-- 無結果狀態 -->
        <div
          v-else-if="searchState.query && !hasResults && !searchState.isSearching"
          class="text-center py-16"
        >
          <div
            class="w-24 h-24 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-orange-400 mb-2">未找到結果</h3>
          <p class="text-gray-400 mb-4">搜尋 "{{ searchState.query }}" 沒有找到相關影片</p>
          <button
            @click="clearSearch"
            class="bg-gradient-to-r from-gray-600 to-gray-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            重新搜尋
          </button>
        </div>

        <!-- 空狀態 -->
        <div v-else-if="isEmpty" class="text-center py-16">
          <div
            class="w-24 h-24 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg
              class="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-400 mb-2">開始搜尋</h3>
          <p class="text-gray-500">輸入 YouTube 網址或關鍵字來搜尋影片</p>
        </div>

        <!-- 功能說明 -->
        <div
          class="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/20"
        >
          <h3 class="text-lg font-semibold mb-4 text-blue-400">功能說明</h3>
          <div class="grid md:grid-cols-2 gap-4 text-gray-300">
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>直接貼上 YouTube 影片網址快速載入</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>使用關鍵字搜尋 YouTube 影片</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>點選搜尋結果直接載入到播放器</p>
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>支援縮略圖預覽和影片資訊</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>載入更多搜尋結果</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>使用多個搜尋來源確保可用性</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import MessageBox from '@/components/MessageBox.vue'
import { useYouTubeSearch } from '@/composables/useYouTubeSearch'
import type { VideoInfo } from '@/types/youtube'

const router = useRouter()

// 解構 YouTube 搜尋組合式函數
const {
  searchState,
  hasResults,
  isEmpty,
  search,
  loadMore,
  clearSearch: clearSearchState,
  isValidYouTubeUrl,
  extractVideoId,
  formatViewCount,
  formatPublishedTime,
} = useYouTubeSearch()

// UI 狀態
const isInputFocused = ref(false)
const errorMessage = ref('')
const isLoadingMore = ref(false)
const searchInputRef = ref<HTMLInputElement>()

// 導航函數
const goToMenu = () => {
  router.push('/menu')
}

const goToHome = () => {
  router.push('/')
}

// 搜尋處理函數
const handleSearch = async (loadMore = false) => {
  const query = searchState.value.query.trim()
  if (!query) return

  if (loadMore) {
    isLoadingMore.value = true
  }

  try {
    // 檢查是否為 YouTube 網址
    if (isValidYouTubeUrl(query)) {
      const videoId = extractVideoId(query)
      if (videoId) {
        // 直接導航到播放器並載入影片
        await navigateToPlayerWithVideo(videoId)
        return
      }
    }

    // 執行搜尋
    await search(query, loadMore)
  } catch (error) {
    console.error('搜尋失敗:', error)
    const errorMsg = error instanceof Error ? error.message : '搜尋失敗，請檢查網路連線或稍後再試'
    showError(errorMsg)
  } finally {
    isLoadingMore.value = false
  }
}

// 載入更多結果
const loadMoreResults = async () => {
  if (searchState.value.hasMore && !isLoadingMore.value) {
    isLoadingMore.value = true
    try {
      await loadMore()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '載入更多失敗'
      showError(errorMsg)
    } finally {
      isLoadingMore.value = false
    }
  }
}

// 載入影片到播放器
const loadVideo = async (video: VideoInfo) => {
  try {
    await navigateToPlayerWithVideo(video.id)
  } catch (error) {
    console.error('載入影片失敗:', error)
    showError('載入影片失敗，請稍後再試')
  }
}

// 導航到播放器並載入影片
const navigateToPlayerWithVideo = async (videoId: string) => {
  try {
    // 導航到播放器頁面，帶上影片 ID 參數
    await router.push({ path: '/', query: { v: videoId } })
  } catch (error) {
    console.error('導航失敗:', error)
    showError('載入影片失敗，請檢查網址是否正確')
  }
}

// 清除搜尋結果
const clearSearch = () => {
  clearSearchState()
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

// 錯誤訊息顯示
const showError = (message: string) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 100)
  setTimeout(() => {
    errorMessage.value = message
  }, 150)
}

// 格式化數字（觀看次數等）
const formatNumber = (num: number): string => {
  return formatViewCount(num)
}

// 格式化時間
const formatTime = (publishedAt: string): string => {
  return formatPublishedTime(publishedAt)
}

// Enter 鍵處理
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSearch()
  }
}
</script>

<style scoped>
/* 輸入框動畫效果 */
input:focus {
  animation: focusGlow 0.3s ease-out;
}

@keyframes focusGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4);
  }
  100% {
    box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.2);
  }
}

/* 載入動畫 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 多行文字截斷 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 圖片載入失敗時隱藏 */
img[style*='display: none'] + div {
  display: flex !important;
}

/* 滾動條樣式 */
:deep(.scroll-container) {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

:deep(.scroll-container)::-webkit-scrollbar {
  width: 6px;
}

:deep(.scroll-container)::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.scroll-container)::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

:deep(.scroll-container)::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}

/* 響應式縮略圖 */
.aspect-video {
  aspect-ratio: 16 / 9;
}

@media (max-width: 768px) {
  .aspect-video {
    aspect-ratio: 4 / 3;
  }
}

/* 卡片 hover 效果 */
.video-card {
  transition: all 0.2s ease;
}

.video-card:hover {
  transform: translateY(-2px);
}

.video-card:active {
  transform: translateY(0) scale(0.98);
}

/* 載入更多按鈕動畫 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading-pulse {
  animation: pulse 2s infinite;
}
</style>
