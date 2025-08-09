import { ref, onUnmounted, watch } from 'vue'
import { LocalStorageService } from '@/services/localStorage'

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
  videoId?: string
  playerVars: {
    playsinline: number
    rel: number
    modestbranding: number
    controls: number
    cc_load_policy?: number
    iv_load_policy?: number
    disablekb?: number
    fs?: number
    showinfo?: number
    autoplay?: number
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
  cueVideoById: (videoId: string) => void
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
  let saveInterval: number | null = null

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
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        controls: 1,
        cc_load_policy: 0,
        iv_load_policy: 3,
        disablekb: 0,
        fs: 1,
        showinfo: 0,
      },
      events: {
        onReady: () => {
          isReady.value = true
          // 檢查是否需要自動載入保存的影片
          tryAutoLoadSavedVideo()
        },
        onStateChange: (event: YTPlayerStateChangeEvent) => {
          // YouTube API 狀態: -1=未開始, 0=結束, 1=播放中, 2=暫停, 3=緩衝中, 5=影片提示
          console.log('YouTube 播放狀態變更:', event.data)
          isPlaying.value = event.data === 1

          // 保存播放狀態
          if (event.data === 1 || event.data === 2) {
            savePlaybackState()
          }
        },
      },
    })
  }

  const loadVideo = (url: string) => {
    const videoId = extractVideoId(url)
    if (videoId) {
      if (player.value && isReady.value) {
        // 使用 cueVideoById 載入影片但不自動播放
        player.value.cueVideoById(videoId)
        currentVideoId.value = videoId
        console.log('影片已載入:', videoId)

        // 延遲恢復播放狀態，等待影片載入完成
        setTimeout(() => {
          restorePlaybackState()
        }, 1000)

        return true
      } else {
        // 如果播放器還沒初始化，創建新的播放器並載入影片
        if (playerElement) {
          player.value = new window.YT.Player(playerElement.id, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
              playsinline: 1,
              rel: 0,
              modestbranding: 1,
              controls: 1,
              cc_load_policy: 0,
              iv_load_policy: 3,
              disablekb: 0,
              fs: 1,
              showinfo: 0,
              autoplay: 0,
            },
            events: {
              onReady: () => {
                isReady.value = true
                // 載入後暫停，確保不自動播放
                player.value?.pauseVideo()
                // 檢查是否需要恢復播放狀態
                restorePlaybackState()
              },
              onStateChange: (event: YTPlayerStateChangeEvent) => {
                console.log('YouTube 播放狀態變更:', event.data)
                isPlaying.value = event.data === 1

                // 保存播放狀態
                if (event.data === 1 || event.data === 2) {
                  savePlaybackState()
                }
              },
            },
          })
        }
        currentVideoId.value = videoId
        return true
      }
    }
    return false
  }

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const setSpeed = (speed: number) => {
    if (player.value && isReady.value) {
      player.value.setPlaybackRate(speed)
      playbackRate.value = speed
      // 保存播放速度
      LocalStorageService.savePlaybackState({ playbackRate: speed })
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

  const savePlaybackState = () => {
    if (player.value && currentVideoId.value) {
      try {
        const currentTime = player.value.getCurrentTime()
        const rate = player.value.getPlaybackRate()
        const playerState = player.value.getPlayerState()

        LocalStorageService.savePlaybackState({
          videoId: currentVideoId.value,
          currentTime: currentTime,
          playbackRate: rate,
          isPaused: playerState === 2 || playerState === -1 || playerState === 0,
          volume: 100, // YouTube API 不提供音量 API
        })
      } catch (error) {
        console.error('Failed to save playback state:', error)
      }
    }
  }

  const restorePlaybackState = () => {
    if (!player.value || !isReady.value) {
      console.log('播放器尚未準備好，無法恢復狀態')
      return
    }

    const state = LocalStorageService.getPlaybackState()
    console.log('嘗試恢復播放狀態:', state)

    // 如果有保存的狀態且不過期
    if (state.videoId && !LocalStorageService.isPlaybackStateExpired()) {
      // 如果是同一個影片，恢復播放位置
      if (state.videoId === currentVideoId.value) {
        console.log(`恢復播放位置: ${state.currentTime}秒, 速度: ${state.playbackRate}x`)

        // 跳轉到上次播放位置
        player.value.seekTo(state.currentTime, true)

        // 設定播放速度
        player.value.setPlaybackRate(state.playbackRate)
        playbackRate.value = state.playbackRate

        // 不管上次是什麼狀態，都保持暫停
        console.log('已恢復到播放位置，保持暫停狀態')
        player.value.pauseVideo()
      } else {
        console.log('影片 ID 不匹配，不恢復狀態')
      }
    } else {
      console.log('沒有有效的狀態可以恢復')
    }
  }

  const tryAutoLoadSavedVideo = () => {
    const savedState = LocalStorageService.getPlaybackState()
    console.log('檢查保存的播放狀態:', savedState)

    if (savedState.videoId && !LocalStorageService.isPlaybackStateExpired()) {
      console.log('自動載入保存的影片:', savedState.videoId)
      const videoUrl = `https://www.youtube.com/watch?v=${savedState.videoId}`
      loadVideo(videoUrl)
    } else {
      console.log('沒有有效的保存狀態需要載入')
    }
  }

  const destroyPlayer = () => {
    // 清除自動保存定時器
    if (saveInterval) {
      clearInterval(saveInterval)
      saveInterval = null
    }

    // 最後保存一次狀態
    savePlaybackState()

    if (player.value) {
      player.value.destroy()
      player.value = null
      isReady.value = false
      isPlaying.value = false
    }
  }

  // 當播放狀態改變時，啟動或停止自動保存
  watch(isPlaying, (playing) => {
    if (playing) {
      // 播放中，每 5 秒保存一次
      if (!saveInterval) {
        saveInterval = setInterval(() => {
          savePlaybackState()
        }, 5000)
      }
    } else {
      // 暫停時立即保存並停止定時器
      if (saveInterval) {
        clearInterval(saveInterval)
        saveInterval = null
      }
      savePlaybackState()
    }
  })

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
    savePlaybackState,
    restorePlaybackState,
    // 為 FloatingControlPanel 提供的方法
    setPlaybackRate: setSpeed,
    getCurrentTime: () => player.value?.getCurrentTime() || 0,
    seekTo: (time: number, allowSeekAhead: boolean = true) => {
      if (player.value && isReady.value) {
        player.value.seekTo(time, allowSeekAhead)
      }
    },
  }
}
