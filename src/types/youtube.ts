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
}