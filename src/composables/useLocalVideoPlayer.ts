import { ref, onUnmounted, watch } from 'vue'
import type { SubtitleData } from '@/types/player'
import { getCurrentSubtitle, loadSRTFile } from '@/utils/srtParser'
import { indexedDBService } from '@/services/indexedDB'

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

  // 初始化 IndexedDB
  const initIndexedDB = async () => {
    try {
      await indexedDBService.init()
    } catch (error) {
      console.error('IndexedDB 初始化失敗:', error)
    }
  }

  // 初始化時調用
  initIndexedDB()

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
      })

      element.addEventListener('loadeddata', () => {
        // 影片資料載入完成
      })

      element.addEventListener('canplay', () => {
        // 影片可以播放
      })

      element.addEventListener('play', () => {
        isPlaying.value = true
      })

      element.addEventListener('pause', () => {
        isPlaying.value = false
      })

      element.addEventListener('ratechange', () => {
        playbackRate.value = element.playbackRate
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

  const loadVideoFile = async (file: File): Promise<boolean> => {
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

      // 先建立 blob URL 並載入影片
      const url = URL.createObjectURL(file)
      videoUrl.value = url
      videoFile.value = file
      videoElement.value.src = url

      // 等待一下再調用 load()，確保 src 已設置
      setTimeout(() => {
        if (videoElement.value) {
          videoElement.value.load()
        }
      }, 10)

      // 在背景儲存到 IndexedDB，不影響播放
      try {
        const existingVideoId = await indexedDBService.hasVideo(file)
        if (!existingVideoId) {
          // 如果檔案不存在，儲存到 IndexedDB（背景進行）
          indexedDBService.saveVideo(file).catch((error) => {
            console.warn('背景儲存到 IndexedDB 失敗:', error)
          })
        }
      } catch (error) {
        console.warn('IndexedDB 操作失敗:', error)
      }
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

      // 如果有影片檔案，將字幕儲存到 IndexedDB
      if (videoFile.value) {
        try {
          const videoId = `${videoFile.value.name}_${videoFile.value.size}_${videoFile.value.lastModified}`
          await indexedDBService.saveSubtitle(file, videoId)
        } catch (error) {
          console.warn('儲存字幕到 IndexedDB 失敗:', error)
        }
      }

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
    if (videoElement.value) {
      const playPromise = videoElement.value.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('播放失敗:', error)
        })
      }
    }
  }

  const pauseVideo = () => {
    if (videoElement.value) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const seekTo = (time: number, _allowSeekAhead: boolean = true) => {
    if (videoElement.value) {
      // 確保時間在有效範圍內
      const clampedTime = Math.max(0, Math.min(time, duration.value || time))
      videoElement.value.currentTime = clampedTime
      currentTime.value = clampedTime
      updateCurrentSubtitle()
    }
  }

  const setPlaybackRate = (rate: number) => {
    if (videoElement.value) {
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

  const restorePlaybackState = (forceRestore = false) => {
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
      const isSameFile =
        videoFile.value &&
        state.videoFile &&
        state.videoFile.name === videoFile.value.name &&
        state.videoFile.size === videoFile.value.size

      if (isSameFile || forceRestore) {
        const attemptRestore = () => {
          if (videoElement.value && videoElement.value.readyState >= 1) {
            // 設置播放速度
            setPlaybackRate(state.playbackRate)

            // 跳轉到時間
            seekTo(state.currentTime)

            // 設置音量
            videoElement.value.volume = state.volume / 100

            // 確保播放器狀態正確
            if (!state.isPaused) {
              playVideo()
            }
          } else if (videoElement.value) {
            setTimeout(attemptRestore, 200)
          } else {
            setTimeout(attemptRestore, 500)
          }
        }

        attemptRestore()
      }
    } catch (error) {
      console.error('恢復播放狀態失敗:', error)
    }
  }

  // 獲取上次影片的資訊（不載入檔案）
  const getLastVideoInfo = () => {
    try {
      const saved = localStorage.getItem('localVideoState')
      if (!saved) return null

      const state = JSON.parse(saved)

      // 檢查是否過期（7天）
      if (Date.now() - state.timestamp > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('localVideoState')
        return null
      }

      return state.videoFile || null
    } catch (error) {
      console.error('獲取影片資訊失敗:', error)
      return null
    }
  }

  // 自動恢復上次的影片（需要 video 元素已初始化）
  const autoRestoreLastVideo = async () => {
    try {
      const lastVideoInfo = getLastVideoInfo()
      if (!lastVideoInfo) return false

      // 嘗試從 IndexedDB 載入影片
      const videoId = `${lastVideoInfo.name}_${lastVideoInfo.size}_${lastVideoInfo.lastModified}`
      const storedFile = await indexedDBService.loadVideo(videoId)

      if (storedFile) {
        const success = await loadVideoFile(storedFile)

        if (success) {
          // 嘗試載入相關字幕
          try {
            const subtitleFile = await indexedDBService.loadSubtitle(videoId)
            if (subtitleFile) {
              await loadSubtitleFile(subtitleFile)
            }
          } catch {
            // 字幕載入失敗，繼續
          }

          // 等待影片準備好後恢復播放狀態
          const waitForReady = () => {
            if (isReady.value && videoElement.value && videoElement.value.readyState >= 1) {
              setTimeout(() => {
                restorePlaybackState(true) // 強制恢復
              }, 100)
            } else {
              setTimeout(waitForReady, 200)
            }
          }
          waitForReady()
        }

        return success
      } else {
        return false
      }
    } catch (error) {
      console.error('自動恢復影片失敗:', error)
      return false
    }
  }

  const destroyPlayer = (shouldSaveState = true) => {
    // 清除定時器
    if (timeUpdateInterval) {
      clearInterval(timeUpdateInterval)
      timeUpdateInterval = null
    }

    if (saveInterval) {
      clearInterval(saveInterval)
      saveInterval = null
    }

    // 只有在需要時才保存最終狀態
    if (shouldSaveState) {
      savePlaybackState()
    }

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

  // 獲取已儲存的影片列表
  const getStoredVideos = async () => {
    try {
      const videos = await indexedDBService.getAllVideos()
      return videos
    } catch (error) {
      console.error('獲取影片列表失敗:', error)
      return []
    }
  }

  // 載入已儲存的影片
  const loadStoredVideo = async (videoId: string) => {
    try {
      const file = await indexedDBService.loadVideo(videoId)
      if (file) {
        return await loadVideoFile(file)
      }
      return false
    } catch (error) {
      console.error('載入已儲存影片失敗:', error)
      return false
    }
  }

  // 刪除已儲存的影片
  const deleteStoredVideo = async (videoId: string) => {
    try {
      await indexedDBService.deleteVideo(videoId)
      console.log('影片已刪除:', videoId)
      return true
    } catch (error) {
      console.error('刪除影片失敗:', error)
      return false
    }
  }

  // 完全清除當前影片（包括從 IndexedDB 中刪除）
  const clearCurrentVideo = async () => {
    try {
      // 如果有當前影片，從 IndexedDB 中刪除
      if (videoFile.value) {
        const videoId = `${videoFile.value.name}_${videoFile.value.size}_${videoFile.value.lastModified}`
        await indexedDBService.deleteVideo(videoId)
      }

      // 清除 localStorage
      localStorage.removeItem('localVideoState')

      // 清理播放器狀態，不保存狀態
      destroyPlayer(false)

      return true
    } catch (error) {
      console.error('清除影片失敗:', error)
      return false
    }
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
    getLastVideoInfo,
    autoRestoreLastVideo,

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

    // IndexedDB 相關方法
    getStoredVideos,
    loadStoredVideo,
    deleteStoredVideo,
    clearCurrentVideo,
  } as const
}
