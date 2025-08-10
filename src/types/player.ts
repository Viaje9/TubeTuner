import type { Ref } from 'vue'

export interface IVideoPlayer {
  // 播放器狀態
  isReady: Ref<boolean>
  isPlaying: Ref<boolean>
  currentTime: Ref<number>
  playbackRate: Ref<number>
  currentVideoId?: Ref<string>
  duration?: Ref<number>

  // 播放控制方法
  playVideo: () => void
  pauseVideo: () => void
  togglePlayPause: () => void
  seekTo: (time: number, allowSeekAhead?: boolean) => void
  setPlaybackRate: (rate: number) => void

  // 取得狀態方法
  getCurrentTime: () => number
  getDuration?: () => number

  // 載入影片
  loadVideo?: (url: string) => boolean
  loadVideoFile?: (file: File) => boolean

  // 銷毀播放器
  destroyPlayer: () => void

  // 狀態保存
  savePlaybackState?: () => void
  restorePlaybackState?: () => void
}

export interface LocalVideoState {
  videoFile: File | null
  videoUrl: string | null
  subtitles: SubtitleData[]
  currentSubtitle: SubtitleData | null
  hasSubtitles: boolean
}

export interface SubtitleData {
  index: number
  startTime: number
  endTime: number
  text: string
}

export interface PlaybackState {
  currentTime: number
  playbackRate: number
  isPaused: boolean
  volume: number
  videoId?: string
  videoFile?: {
    name: string
    size: number
    type: string
    lastModified: number
  }
}
