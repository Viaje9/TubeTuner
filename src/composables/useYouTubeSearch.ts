import { ref, computed } from 'vue'
import { YouTubeSearchService } from '@/services/youtubeSearch'
import type { SearchState } from '@/types/youtube'

export function useYouTubeSearch() {
  // 搜尋狀態
  const searchState = ref<SearchState>({
    isSearching: false,
    query: '',
    results: [],
    error: null,
    hasMore: false,
    nextPageToken: null,
  })

  // 計算屬性
  const hasResults = computed(() => searchState.value.results.length > 0)
  const isLoading = computed(() => searchState.value.isSearching)
  const isEmpty = computed(() => !hasResults.value && !isLoading.value && !searchState.value.query)

  // 執行搜尋
  const search = async (query?: string, loadMore = false): Promise<void> => {
    const searchQuery = query || searchState.value.query
    if (!searchQuery.trim()) {
      throw new Error('搜尋關鍵字不能為空')
    }

    // 更新查詢字串
    if (query) {
      searchState.value.query = query
    }

    // 設定載入狀態
    if (loadMore) {
      // 載入更多時不清除現有結果
    } else {
      searchState.value.isSearching = true
      searchState.value.results = []
      searchState.value.error = null
    }

    try {
      // 檢查是否為 YouTube 網址
      if (YouTubeSearchService.isValidYouTubeUrl(searchQuery)) {
        const videoId = YouTubeSearchService.extractVideoId(searchQuery)
        if (videoId) {
          // 對於 URL，獲取影片資訊
          const videoInfo = await YouTubeSearchService.getVideoInfo(videoId)
          searchState.value.results = [videoInfo]
          searchState.value.hasMore = false
          searchState.value.nextPageToken = null
          return
        }
      }

      // 執行關鍵字搜尋
      const searchResult = await YouTubeSearchService.searchVideos(searchQuery, 20)

      if (loadMore) {
        searchState.value.results.push(...searchResult.items)
      } else {
        searchState.value.results = searchResult.items
      }

      searchState.value.nextPageToken = searchResult.nextPageToken
      searchState.value.hasMore = !!searchResult.nextPageToken

      if (searchResult.items.length === 0 && !loadMore) {
        throw new Error('未找到相關影片，請嘗試其他關鍵字')
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '搜尋失敗，請檢查網路連線或稍後再試'
      searchState.value.error = errorMessage
      throw error
    } finally {
      searchState.value.isSearching = false
    }
  }

  // 載入更多結果
  const loadMore = async (): Promise<void> => {
    if (!searchState.value.hasMore || searchState.value.isSearching) {
      return
    }

    try {
      await search(undefined, true)
    } catch (error) {
      console.error('載入更多結果失敗:', error)
      throw error
    }
  }

  // 清除搜尋結果
  const clearSearch = (): void => {
    searchState.value.query = ''
    searchState.value.results = []
    searchState.value.error = null
    searchState.value.hasMore = false
    searchState.value.nextPageToken = null
    searchState.value.isSearching = false
  }

  // 設定查詢字串
  const setQuery = (query: string): void => {
    searchState.value.query = query
  }

  // 檢查是否為有效的 YouTube URL
  const isValidYouTubeUrl = (url: string): boolean => {
    return YouTubeSearchService.isValidYouTubeUrl(url)
  }

  // 提取影片 ID
  const extractVideoId = (url: string): string | null => {
    return YouTubeSearchService.extractVideoId(url)
  }

  // 格式化工具函數
  const formatViewCount = (count: number): string => {
    return YouTubeSearchService.formatViewCount(count)
  }

  const formatPublishedTime = (publishedAt: string): string => {
    return YouTubeSearchService.formatPublishedTime(publishedAt)
  }

  return {
    // 狀態
    searchState,

    // 計算屬性
    hasResults,
    isLoading,
    isEmpty,

    // 方法
    search,
    loadMore,
    clearSearch,
    setQuery,
    isValidYouTubeUrl,
    extractVideoId,

    // 工具函數
    formatViewCount,
    formatPublishedTime,
  }
}
