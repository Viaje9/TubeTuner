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
  const isPlaying = ref(false)

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

  const initPlayer = async (elementId: string) => {
    await loadYouTubeAPI()
    
    playerElement = document.getElementById(elementId)
    if (!playerElement) {
      console.error(`Element with id ${elementId} not found`)
      return
    }

    // 建立空的播放器，不載入任何影片
    player.value = new window.YT.Player(elementId, {
      height: '100%',
      width: '100%',
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
        'onStateChange': (event: YTPlayerStateChangeEvent) => {
          // YouTube API 狀態: -1=未開始, 0=結束, 1=播放中, 2=暫停, 3=緩衝中, 5=影片提示
          console.log('YouTube 播放狀態變更:', event.data)
          isPlaying.value = event.data === 1
        }
      }
    })
  }

  const loadVideo = (url: string) => {
    const videoId = extractVideoId(url)
    if (videoId) {
      if (player.value) {
        player.value.loadVideoById(videoId)
      } else {
        // 如果播放器還沒初始化，創建新的播放器並載入影片
        if (playerElement) {
          player.value = new window.YT.Player(playerElement.id, {
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
              'onStateChange': (event: YTPlayerStateChangeEvent) => {
                console.log('YouTube 播放狀態變更:', event.data)
                isPlaying.value = event.data === 1
              }
            }
          })
        }
      }
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

  const pauseVideo = () => {
    if (player.value && isReady.value) {
      player.value.pauseVideo()
      // 不在這裡立即更新狀態，讓 onStateChange 處理
    }
  }

  const playVideo = () => {
    if (player.value && isReady.value) {
      player.value.playVideo()
      // 不在這裡立即更新狀態，讓 onStateChange 處理
    }
  }

  const togglePlayPause = () => {
    if (isPlaying.value) {
      pauseVideo()
    } else {
      playVideo()
    }
  }

  const destroyPlayer = () => {
    if (player.value) {
      player.value.destroy()
      player.value = null
      isReady.value = false
      isPlaying.value = false
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
    isPlaying,
    initPlayer,
    loadVideo,
    setSpeed,
    seekVideo,
    pauseVideo,
    playVideo,
    togglePlayPause,
    destroyPlayer,
    // 為 FloatingControlPanel 提供的方法
    setPlaybackRate: setSpeed,
    getCurrentTime: () => player.value?.getCurrentTime() || 0,
    seekTo: (time: number, allowSeekAhead: boolean = true) => {
      if (player.value && isReady.value) {
        player.value.seekTo(time, allowSeekAhead)
      }
    }
  }
}