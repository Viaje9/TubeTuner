import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { SubtitleData } from '@/types/player'

// 收藏字幕的型別定義
export interface FavoriteSubtitle {
  id: string // 唯一識別碼 (videoId + startTime)
  videoId: string
  text: string
  startTime: number
  endTime: number
  timestamp: number // 收藏時間
}

export const useFavoritesStore = defineStore('favorites', () => {
  // 狀態
  const favorites = ref<FavoriteSubtitle[]>([])
  const selectedSentences = ref<FavoriteSubtitle[]>([]) // 選取的句子陣列，按點擊順序排列

  // 初始化時從 localStorage 載入
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('tubetuner-favorite-subtitles')
      if (stored) {
        favorites.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('載入收藏字幕失敗:', error)
      favorites.value = []
    }
  }

  // 儲存到 localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem('tubetuner-favorite-subtitles', JSON.stringify(favorites.value))
    } catch (error) {
      console.error('儲存收藏字幕失敗:', error)
    }
  }

  // 計算屬性
  const favoriteIds = computed(() => {
    return new Set(favorites.value.map((fav) => fav.id))
  })

  // 檢查字幕是否已收藏
  const isFavorite = (videoId: string, subtitle: SubtitleData): boolean => {
    const id = `${videoId}-${subtitle.startTime}`
    return favoriteIds.value.has(id)
  }

  // 添加收藏
  const addFavorite = (videoId: string, subtitle: SubtitleData) => {
    const id = `${videoId}-${subtitle.startTime}`

    // 避免重複收藏
    if (favoriteIds.value.has(id)) return

    const favorite: FavoriteSubtitle = {
      id,
      videoId,
      text: subtitle.text,
      startTime: subtitle.startTime,
      endTime: subtitle.endTime,
      timestamp: Date.now(),
    }

    favorites.value.unshift(favorite) // 新收藏放在最前面
    saveToStorage()
  }

  // 移除收藏
  const removeFavorite = (videoId: string, subtitle: SubtitleData) => {
    const id = `${videoId}-${subtitle.startTime}`
    favorites.value = favorites.value.filter((fav) => fav.id !== id)
    saveToStorage()
  }

  // 切換收藏狀態
  const toggleFavorite = (videoId: string, subtitle: SubtitleData) => {
    if (isFavorite(videoId, subtitle)) {
      removeFavorite(videoId, subtitle)
    } else {
      addFavorite(videoId, subtitle)
    }
  }

  // 獲取特定影片的收藏字幕
  const getFavoritesByVideo = (videoId: string) => {
    return favorites.value.filter((fav) => fav.videoId === videoId)
  }

  // 清空所有收藏
  const clearAllFavorites = () => {
    favorites.value = []
    saveToStorage()
  }

  // 選取/取消選取句子
  const toggleSelectSentence = (favorite: FavoriteSubtitle) => {
    const index = selectedSentences.value.findIndex((item) => item.id === favorite.id)

    if (index >= 0) {
      // 如果已經選取，則移除
      selectedSentences.value.splice(index, 1)
    } else {
      // 如果未選取，則加入到陣列末尾（保持點擊順序）
      selectedSentences.value.push(favorite)
    }
  }

  // 檢查句子是否已被選取
  const isSelected = (favoriteId: string): boolean => {
    return selectedSentences.value.some((item) => item.id === favoriteId)
  }

  // 獲取句子的選取順序（1-based）
  const getSelectionOrder = (favoriteId: string): number => {
    const index = selectedSentences.value.findIndex((item) => item.id === favoriteId)
    return index >= 0 ? index + 1 : 0
  }

  // 清空選取的句子
  const clearSelectedSentences = () => {
    selectedSentences.value = []
  }

  // 初始化
  loadFromStorage()

  return {
    favorites,
    favoriteIds,
    selectedSentences,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    getFavoritesByVideo,
    clearAllFavorites,
    loadFromStorage,
    toggleSelectSentence,
    isSelected,
    getSelectionOrder,
    clearSelectedSentences,
  }
})
