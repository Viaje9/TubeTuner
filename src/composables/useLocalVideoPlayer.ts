import { ref, onUnmounted, watch } from 'vue'
import type { SubtitleData } from '@/types/player'
import { getCurrentSubtitle, loadSRTFile } from '@/utils/srtParser'

export function useLocalVideoPlayer() {
  const videoElement = ref<HTMLVideoElement | null>(null)
  const isReady = ref(false)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const playbackRate = ref(1)
  const duration = ref(0)

  // 本機影片專用狀態
  const videoFile = ref<File | null>(null)
  const videoUrl = ref<string | null>(null)
  const subtitles = ref<SubtitleData[]>([])
  const currentSubtitle = ref<SubtitleData | null>(null)
  const hasSubtitles = ref(false)

  let timeUpdateInterval: number | null = null
  let saveInterval: number | null = null

  const initPlayer = (videoElementId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const element = document.getElementById(videoElementId) as HTMLVideoElement
      if (!element) {
        const error = `Video element with id ${videoElementId} not found`
        console.error(error)
        reject(new Error(error))
        return
      }

      videoElement.value = element

      // 設置影片事件監聽器
      element.addEventListener('loadedmetadata', () => {
        isReady.value = true
        duration.value = element.duration
        console.log('影片載入完成，時長:', duration.value)
      })

      element.addEventListener('play', () => {
        isPlaying.value = true
        console.log('影片開始播放')
      })

      element.addEventListener('pause', () => {
        isPlaying.value = false
        console.log('影片暫停')
      })

      element.addEventListener('ratechange', () => {
        playbackRate.value = element.playbackRate
        console.log('播放速度變更:', playbackRate.value)
      })

      element.addEventListener('timeupdate', () => {
        currentTime.value = element.currentTime
        updateCurrentSubtitle()
      })

      element.addEventListener('loadstart', () => {
        isReady.value = false
      })

      element.addEventListener('error', (e) => {
        console.error('影片播放錯誤:', e)
        isReady.value = false
      })

      // 防止右鍵選單
      element.addEventListener('contextmenu', (e) => {
        e.preventDefault()
      })

      // 初始化完成
      resolve()
    })
  }

  const loadVideoFile = (file: File): boolean => {
    try {
      if (!videoElement.value) {
        console.error('影片元素尚未初始化')
        return false
      }

      // 檢查檔案類型
      if (!file.type.startsWith('video/')) {
        console.error('不支援的檔案類型:', file.type)
        return false
      }

      // 釋放之前的 URL
      if (videoUrl.value) {
        URL.revokeObjectURL(videoUrl.value)
      }

      // 建立新的 blob URL
      const url = URL.createObjectURL(file)
      videoUrl.value = url
      videoFile.value = file

      // 載入影片
      videoElement.value.src = url
      videoElement.value.load()

      console.log('本機影片已載入:', file.name)
      return true
    } catch (error) {
      console.error('載入影片失敗:', error)
      return false
    }
  }

  const loadSubtitleFile = async (file: File): Promise<boolean> => {
    try {
      const parsedSubtitles = await loadSRTFile(file)
      subtitles.value = parsedSubtitles
      hasSubtitles.value = parsedSubtitles.length > 0

      console.log('字幕載入成功，共', parsedSubtitles.length, '條字幕')
      return true
    } catch (error) {
      console.error('載入字幕失敗:', error)
      return false
    }
  }

  const updateCurrentSubtitle = () => {
    if (subtitles.value.length > 0) {
      currentSubtitle.value = getCurrentSubtitle(subtitles.value, currentTime.value)
    }
  }

  const playVideo = () => {
    if (videoElement.value && isReady.value) {
      videoElement.value.play().catch((error) => {
        console.error('播放失敗:', error)
      })
    }
  }

  const pauseVideo = () => {
    if (videoElement.value && isReady.value) {
      videoElement.value.pause()
    }
  }

  const togglePlayPause = () => {
    if (isPlaying.value) {
      pauseVideo()
    } else {
      playVideo()
    }
  }

  const seekTo = (time: number) => {
    if (videoElement.value && isReady.value) {
      // 確保時間在有效範圍內
      const clampedTime = Math.max(0, Math.min(time, duration.value))
      videoElement.value.currentTime = clampedTime
      currentTime.value = clampedTime
      updateCurrentSubtitle()
    }
  }

  const setPlaybackRate = (rate: number) => {
    if (videoElement.value && isReady.value) {
      const clampedRate = Math.max(0.25, Math.min(16, rate))
      videoElement.value.playbackRate = clampedRate
      playbackRate.value = clampedRate
    }
  }

  const getCurrentTime = (): number => {
    return videoElement.value?.currentTime || 0
  }

  const getDuration = (): number => {
    return videoElement.value?.duration || 0
  }

  const savePlaybackState = () => {
    if (videoFile.value && videoElement.value) {
      const state = {
        videoFile: {
          name: videoFile.value.name,
          size: videoFile.value.size,
          type: videoFile.value.type,
          lastModified: videoFile.value.lastModified,
        },
        currentTime: currentTime.value,
        playbackRate: playbackRate.value,
        isPaused: !isPlaying.value,
        volume: videoElement.value.volume * 100,
        timestamp: Date.now(),
      }

      localStorage.setItem('localVideoState', JSON.stringify(state))
    }
  }

  const restorePlaybackState = () => {
    try {
      const saved = localStorage.getItem('localVideoState')
      if (!saved) return

      const state = JSON.parse(saved)

      // 檢查是否過期（7天）
      if (Date.now() - state.timestamp > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('localVideoState')
        return
      }

      // 如果是同一個檔案，恢復播放狀態
      if (
        videoFile.value &&
        state.videoFile &&
        state.videoFile.name === videoFile.value.name &&
        state.videoFile.size === videoFile.value.size
      ) {
        setTimeout(() => {
          if (videoElement.value && isReady.value) {
            setPlaybackRate(state.playbackRate)
            seekTo(state.currentTime)
            videoElement.value.volume = state.volume / 100

            console.log('已恢復播放狀態')
          }
        }, 500)
      }
    } catch (error) {
      console.error('恢復播放狀態失敗:', error)
    }
  }

  const destroyPlayer = () => {
    // 清除定時器
    if (timeUpdateInterval) {
      clearInterval(timeUpdateInterval)
      timeUpdateInterval = null
    }

    if (saveInterval) {
      clearInterval(saveInterval)
      saveInterval = null
    }

    // 保存最終狀態
    savePlaybackState()

    // 釋放 blob URL
    if (videoUrl.value) {
      URL.revokeObjectURL(videoUrl.value)
      videoUrl.value = null
    }

    // 清除狀態
    videoFile.value = null
    subtitles.value = []
    currentSubtitle.value = null
    hasSubtitles.value = false
    isReady.value = false
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0

    videoElement.value = null
  }

  // 監聽播放狀態，控制自動保存
  watch(isPlaying, (playing) => {
    if (playing) {
      // 播放中，每 5 秒保存一次
      if (!saveInterval) {
        saveInterval = setInterval(() => {
          savePlaybackState()
        }, 5000)
      }
    } else {
      // 暫停時立即保存
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
    // IVideoPlayer 介面
    isReady,
    isPlaying,
    currentTime,
    playbackRate,
    duration,
    playVideo,
    pauseVideo,
    togglePlayPause,
    seekTo,
    setPlaybackRate,
    getCurrentTime,
    getDuration,
    destroyPlayer,
    savePlaybackState,
    restorePlaybackState,

    // 本機影片專用
    videoFile,
    videoUrl,
    subtitles,
    currentSubtitle,
    hasSubtitles,

    // 本機影片專用方法
    initPlayer,
    loadVideoFile,
    loadSubtitleFile,
  } as const
}
