import { ref, onUnmounted } from 'vue'

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: YTPlayerOptions) => YouTubePlayer
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YTPlayerOptions {
  height: string
  width: string
  videoId: string
  playerVars: {
    playsinline: number
    rel: number
    modestbranding: number
    controls: number
  }
  events: {
    onReady: () => void
    onStateChange: (event: YTPlayerStateChangeEvent) => void
  }
}

interface YTPlayerStateChangeEvent {
  data: number
  target: YouTubePlayer
}

export interface YouTubePlayer {
  loadVideoById: (videoId: string) => void
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  setPlaybackRate: (rate: number) => void
  getPlaybackRate: () => number
  getCurrentTime: () => number
  getDuration: () => number
  getVideoLoadedFraction: () => number
  getPlayerState: () => number
  destroy: () => void
}

export function useYouTubePlayer() {
  const player = ref<YouTubePlayer | null>(null)
  const isReady = ref(false)
  const currentVideoId = ref('')
  const playbackRate = ref(1)

  let playerElement: HTMLElement | null = null

  const loadYouTubeAPI = () => {
    return new Promise<void>((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve()
        return
      }

      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        resolve()
      }
    })
  }

  const initPlayer = async (elementId: string, videoId: string = 'dQw4w9WgXcQ') => {
    await loadYouTubeAPI()
    
    playerElement = document.getElementById(elementId)
    if (!playerElement) {
      console.error(`Element with id ${elementId} not found`)
      return
    }

    currentVideoId.value = videoId

    player.value = new window.YT.Player(elementId, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        'playsinline': 1,
        'rel': 0,
        'modestbranding': 1,
        'controls': 1
      },
      events: {
        'onReady': () => {
          isReady.value = true
        },
        'onStateChange': () => {
          // 可以在這裡處理播放狀態變化
        }
      }
    })
  }

  const loadVideo = (url: string) => {
    const videoId = extractVideoId(url)
    if (videoId && player.value) {
      player.value.loadVideoById(videoId)
      currentVideoId.value = videoId
      return true
    }
    return false
  }

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const setSpeed = (speed: number) => {
    if (player.value && isReady.value) {
      player.value.setPlaybackRate(speed)
      playbackRate.value = speed
    }
  }

  const seekVideo = (seconds: number) => {
    if (player.value && isReady.value) {
      const currentTime = player.value.getCurrentTime()
      player.value.seekTo(currentTime + seconds, true)
    }
  }

  const destroyPlayer = () => {
    if (player.value) {
      player.value.destroy()
      player.value = null
      isReady.value = false
    }
  }

  onUnmounted(() => {
    destroyPlayer()
  })

  return {
    player,
    isReady,
    currentVideoId,
    playbackRate,
    initPlayer,
    loadVideo,
    setSpeed,
    seekVideo,
    destroyPlayer
  }
}