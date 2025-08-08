export interface IYouTubePlayer {
  initPlayer: (elementId: string, videoId?: string) => Promise<void>
  loadVideo: (url: string) => boolean
  setSpeed: (speed: number) => void
  seekVideo: (seconds: number) => void
  isReady: { value: boolean }
}