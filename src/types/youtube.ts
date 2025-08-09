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