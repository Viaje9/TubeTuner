<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <!-- 頁面標題 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-white">我的收藏</h1>
        <div class="flex items-center gap-4">
          <!-- 清空收藏按鈕 -->
          <button
            v-if="favorites.length > 0"
            @click="showClearConfirm = true"
            class="px-4 py-2 bg-red-600 rounded-lg text-sm font-medium"
          >
            清空收藏
          </button>
          <!-- 返回按鈕 -->
          <button
            @click="$router.back()"
            class="px-4 py-2 bg-gray-700 rounded-lg text-sm font-medium"
          >
            返回
          </button>
        </div>
      </div>
      <p class="text-gray-400 mt-2">共 {{ favorites.length }} 個收藏的句子</p>
      <p v-if="selectedSentences.length > 0" class="text-blue-400 mt-1">
        已選取 {{ selectedSentences.length }} 個句子
      </p>
    </div>

    <!-- 收藏列表 -->
    <div v-if="favorites.length > 0" class="space-y-3">
      <div
        v-for="favorite in favorites"
        :key="favorite.id"
        :class="[
          'rounded-lg p-4 border transition-all cursor-pointer relative',
          favoritesStore.isSelected(favorite.id)
            ? 'bg-blue-800/30 border-blue-500'
            : 'bg-gray-800 border-gray-700',
        ]"
        @click="toggleSelect(favorite)"
      >
        <!-- 選取順序標示 -->
        <div
          v-if="favoritesStore.isSelected(favorite.id)"
          class="absolute top-2 left-2 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
        >
          {{ favoritesStore.getSelectionOrder(favorite.id) }}
        </div>

        <div class="flex items-center justify-between gap-4">
          <!-- 字幕內容 -->
          <p
            :class="[
              'text-lg leading-relaxed flex-1',
              favoritesStore.isSelected(favorite.id) ? 'text-blue-200 ml-8' : 'text-white',
            ]"
          >
            {{ favorite.text }}
          </p>

          <!-- 取消收藏按鈕 -->
          <button
            @click.stop="showRemoveConfirm(favorite)"
            class="p-2 text-red-400 rounded-lg"
            title="取消收藏"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else class="text-center py-16">
      <div class="w-24 h-24 mx-auto mb-6 text-gray-600">
        <svg fill="currentColor" viewBox="0 0 20 20" class="w-full h-full">
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      </div>
      <h3 class="text-xl font-medium text-gray-300 mb-2">還沒有收藏的句子</h3>
      <p class="text-gray-500 mb-6">在播放影片時點擊星號圖示來收藏您喜歡的字幕句子</p>
      <router-link
        to="/local-video"
        class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 4h3a1 1 0 011 1v14a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1h3m2-3a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V1z"
          />
        </svg>
        開始播放影片
      </router-link>
    </div>

    <!-- 清空收藏確認對話框 -->
    <div
      v-if="showClearConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showClearConfirm = false"
    >
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">確認清空收藏</h3>
        <p class="text-gray-300 mb-6">您確定要清空所有收藏的句子嗎？這個操作無法復原。</p>
        <div class="flex gap-3 justify-end">
          <button
            @click="showClearConfirm = false"
            class="px-4 py-2 bg-gray-600 rounded-lg text-sm font-medium"
          >
            取消
          </button>
          <button @click="confirmClear" class="px-4 py-2 bg-red-600 rounded-lg text-sm font-medium">
            確認清空
          </button>
        </div>
      </div>
    </div>

    <!-- 移除單個收藏確認對話框 -->
    <div
      v-if="showRemoveDialog"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showRemoveDialog = false"
    >
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">確認移除收藏</h3>
        <p class="text-gray-300 mb-4">您確定要移除這個收藏的句子嗎？</p>
        <div v-if="selectedFavorite" class="p-3 bg-gray-700 rounded-lg mb-6 text-sm text-gray-200">
          "{{ selectedFavorite.text }}"
        </div>
        <div class="flex gap-3 justify-end">
          <button
            @click="showRemoveDialog = false"
            class="px-4 py-2 bg-gray-600 rounded-lg text-sm font-medium"
          >
            取消
          </button>
          <button
            @click="confirmRemove"
            class="px-4 py-2 bg-red-600 rounded-lg text-sm font-medium"
          >
            確認移除
          </button>
        </div>
      </div>
    </div>

    <!-- Sticky AI 對話按鈕區域 -->
    <div
      v-if="selectedSentences.length > 0"
      class="sticky bottom-0 mt-6 p-6 pb-16 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent"
    >
      <div class="max-w-md mx-auto flex items-center gap-3">
        <!-- 清空選取按鈕 -->
        <button
          @click="clearSelected"
          class="px-4 py-3 bg-gray-600 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg hover:bg-gray-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span class="text-base whitespace-nowrap py-1">清空選取</span>
        </button>

        <!-- AI 對話按鈕 -->
        <button
          @click="goToAIChat"
          class="flex-1 px-3 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-3 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span class="text-base whitespace-nowrap">開始 AI 對話</span>
          <span class="bg-blue-500 text-white px-2 py-1 rounded-full text-base">{{
            selectedSentences.length
          }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import type { FavoriteSubtitle } from '@/stores/favorites'

// Router
const router = useRouter()

// Store
const favoritesStore = useFavoritesStore()

// 響應式變量
const showClearConfirm = ref(false)
const showRemoveDialog = ref(false)
const selectedFavorite = ref<FavoriteSubtitle | null>(null)

// 計算屬性
const favorites = computed(() => favoritesStore.favorites)
const selectedSentences = computed(() => favoritesStore.selectedSentences)

// 方法
const showRemoveConfirm = (favorite: FavoriteSubtitle) => {
  selectedFavorite.value = favorite
  showRemoveDialog.value = true
}

const confirmRemove = () => {
  if (selectedFavorite.value) {
    const subtitle = {
      text: selectedFavorite.value.text,
      startTime: selectedFavorite.value.startTime,
      endTime: selectedFavorite.value.endTime,
      index: 0,
    }
    favoritesStore.removeFavorite(selectedFavorite.value.videoId, subtitle)
  }
  showRemoveDialog.value = false
  selectedFavorite.value = null
}

const confirmClear = () => {
  favoritesStore.clearAllFavorites()
  showClearConfirm.value = false
}

// 選取/取消選取句子
const toggleSelect = (favorite: FavoriteSubtitle) => {
  favoritesStore.toggleSelectSentence(favorite)
}

// 清空選取
const clearSelected = () => {
  favoritesStore.clearSelectedSentences()
}

// 前往 AI 對話頁面
const goToAIChat = () => {
  if (selectedSentences.value.length > 0) {
    router.push('/ai-chat')
  }
}
</script>

<style scoped>
.bg-gray-750 {
  background-color: rgb(55 65 81 / 0.8);
}
</style>
