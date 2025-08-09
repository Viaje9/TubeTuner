/**
 * 本地儲存服務
 * 用於保存和恢復應用程式狀態
 */

interface PlaybackState {
  videoId: string | null
  currentTime: number
  playbackRate: number
  isPaused: boolean
  volume: number
  seekSeconds: number
  lastUpdated: number
}

interface AppSettings {
  aiApiKey: string
  selectedModel: string
  temperature: number
  maxTokens: number
}

const STORAGE_KEYS = {
  PLAYBACK_STATE: 'tubetuner_playback_state',
  APP_SETTINGS: 'tubetuner_app_settings',
  CHAT_HISTORY: 'tubetuner_chat_history'
} as const

export class LocalStorageService {
  /**
   * 保存播放狀態
   */
  static savePlaybackState(state: Partial<PlaybackState>): void {
    try {
      const currentState = this.getPlaybackState()
      const newState: PlaybackState = {
        ...currentState,
        ...state,
        lastUpdated: Date.now()
      }
      localStorage.setItem(STORAGE_KEYS.PLAYBACK_STATE, JSON.stringify(newState))
    } catch (error) {
      console.error('Failed to save playback state:', error)
    }
  }

  /**
   * 獲取播放狀態
   */
  static getPlaybackState(): PlaybackState {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAYBACK_STATE)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to get playback state:', error)
    }
    
    return {
      videoId: null,
      currentTime: 0,
      playbackRate: 1,
      isPaused: false,
      volume: 100,
      seekSeconds: 10,
      lastUpdated: 0
    }
  }

  /**
   * 清除播放狀態
   */
  static clearPlaybackState(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PLAYBACK_STATE)
    } catch (error) {
      console.error('Failed to clear playback state:', error)
    }
  }

  /**
   * 保存應用程式設定
   */
  static saveAppSettings(settings: Partial<AppSettings>): void {
    try {
      const currentSettings = this.getAppSettings()
      const newSettings = {
        ...currentSettings,
        ...settings
      }
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(newSettings))
    } catch (error) {
      console.error('Failed to save app settings:', error)
    }
  }

  /**
   * 獲取應用程式設定
   */
  static getAppSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to get app settings:', error)
    }
    
    return {
      aiApiKey: '',
      selectedModel: '',
      temperature: 0.7,
      maxTokens: 4000
    }
  }

  /**
   * 從 URL 中提取 YouTube 影片 ID
   */
  static extractVideoId(url: string): string | null {
    try {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/
      ]
      
      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) {
          return match[1]
        }
      }
    } catch (error) {
      console.error('Failed to extract video ID:', error)
    }
    
    return null
  }

  /**
   * 檢查播放狀態是否過期（超過 7 天）
   */
  static isPlaybackStateExpired(): boolean {
    const state = this.getPlaybackState()
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    return Date.now() - state.lastUpdated > sevenDaysInMs
  }
}