import type { Ref } from 'vue'

export interface IYouTubePlayer {
  initPlayer: (elementId: string, videoId?: string) => Promise<void>
  loadVideo: (url: string) => boolean
  setSpeed: (speed: number) => void
  seekVideo: (seconds: number) => void
  pauseVideo: () => void
  playVideo: () => void
  togglePlayPause: () => void
  isReady: Ref<boolean>
  isPlaying: Ref<boolean>
  playbackRate: Ref<number>
  currentVideoId: Ref<string>
  savePlaybackState: () => void
  restorePlaybackState: () => void
  setPlaybackRate: (rate: number) => void
  getCurrentTime: () => number
  seekTo: (time: number, allowSeekAhead?: boolean) => void
}

export interface YTPlayerVars {
  playsinline?: number
  rel?: number
  modestbranding?: number
  controls?: number
  cc_load_policy?: number
  iv_load_policy?: number
  disablekb?: number
  fs?: number
  showinfo?: number
  autoplay?: number
}

// 搜尋相關類型定義
export interface VideoThumbnails {
  default: string
  medium: string
  high: string
}

export interface VideoInfo {
  id: string
  title: string
  channelTitle: string
  description: string
  thumbnails: VideoThumbnails
  duration: string
  publishedAt: string
  viewCount: number
  url: string
}

export interface SearchResult {
  items: VideoInfo[]
  nextPageToken: string | null
  totalResults: number
}

// 搜尋狀態
export interface SearchState {
  isSearching: boolean
  query: string
  results: VideoInfo[]
  error: string | null
  hasMore: boolean
  nextPageToken: string | null
}
