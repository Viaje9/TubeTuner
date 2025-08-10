/**
 * IndexedDB 服務
 * 用於儲存大型檔案（影片、字幕等）
 */

interface StoredVideo {
  id: string
  name: string
  size: number
  type: string
  lastModified: number
  file: File
  createdAt: number
  lastAccessedAt: number
}

interface StoredSubtitle {
  id: string
  videoId: string
  name: string
  size: number
  file: File
  createdAt: number
}

const DB_NAME = 'TubeTuner'
const DB_VERSION = 1
const STORE_VIDEOS = 'videos'
const STORE_SUBTITLES = 'subtitles'

class IndexedDBService {
  private db: IDBDatabase | null = null

  /**
   * 初始化資料庫
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('無法開啟 IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 建立影片儲存表
        if (!db.objectStoreNames.contains(STORE_VIDEOS)) {
          const videoStore = db.createObjectStore(STORE_VIDEOS, { keyPath: 'id' })
          videoStore.createIndex('name', 'name', { unique: false })
          videoStore.createIndex('lastAccessedAt', 'lastAccessedAt', { unique: false })
        }

        // 建立字幕儲存表
        if (!db.objectStoreNames.contains(STORE_SUBTITLES)) {
          const subtitleStore = db.createObjectStore(STORE_SUBTITLES, { keyPath: 'id' })
          subtitleStore.createIndex('videoId', 'videoId', { unique: false })
        }
      }
    })
  }

  /**
   * 確保資料庫已初始化
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    if (!this.db) {
      throw new Error('資料庫初始化失敗')
    }
    return this.db
  }

  /**
   * 生成檔案 ID
   */
  private generateFileId(file: File): string {
    return `${file.name}_${file.size}_${file.lastModified}`
  }

  /**
   * 儲存影片檔案
   */
  async saveVideo(file: File): Promise<string> {
    const db = await this.ensureDB()
    const id = this.generateFileId(file)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_VIDEOS], 'readwrite')
      const store = transaction.objectStore(STORE_VIDEOS)

      const videoData: StoredVideo = {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        file,
        createdAt: Date.now(),
        lastAccessedAt: Date.now(),
      }

      const request = store.put(videoData)

      request.onsuccess = () => {
        resolve(id)
      }

      request.onerror = () => {
        reject(new Error('儲存影片失敗'))
      }
    })
  }

  /**
   * 載入影片檔案
   */
  async loadVideo(id: string): Promise<File | null> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_VIDEOS], 'readwrite')
      const store = transaction.objectStore(STORE_VIDEOS)
      const request = store.get(id)

      request.onsuccess = () => {
        const result = request.result as StoredVideo | undefined
        if (result) {
          // 更新最後存取時間
          result.lastAccessedAt = Date.now()
          store.put(result)
          resolve(result.file)
        } else {
          resolve(null)
        }
      }

      request.onerror = () => {
        reject(new Error('載入影片失敗'))
      }
    })
  }

  /**
   * 檢查影片是否已存在
   */
  async hasVideo(file: File): Promise<string | null> {
    const db = await this.ensureDB()
    const id = this.generateFileId(file)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_VIDEOS], 'readonly')
      const store = transaction.objectStore(STORE_VIDEOS)
      const request = store.get(id)

      request.onsuccess = () => {
        const result = request.result as StoredVideo | undefined
        resolve(result ? id : null)
      }

      request.onerror = () => {
        reject(new Error('檢查影片失敗'))
      }
    })
  }

  /**
   * 儲存字幕檔案
   */
  async saveSubtitle(file: File, videoId: string): Promise<string> {
    const db = await this.ensureDB()
    const id = `${videoId}_${this.generateFileId(file)}`

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_SUBTITLES], 'readwrite')
      const store = transaction.objectStore(STORE_SUBTITLES)

      const subtitleData: StoredSubtitle = {
        id,
        videoId,
        name: file.name,
        size: file.size,
        file,
        createdAt: Date.now(),
      }

      const request = store.put(subtitleData)

      request.onsuccess = () => {
        resolve(id)
      }

      request.onerror = () => {
        reject(new Error('儲存字幕失敗'))
      }
    })
  }

  /**
   * 載入字幕檔案
   */
  async loadSubtitle(videoId: string): Promise<File | null> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_SUBTITLES], 'readonly')
      const store = transaction.objectStore(STORE_SUBTITLES)
      const index = store.index('videoId')
      const request = index.get(videoId)

      request.onsuccess = () => {
        const result = request.result as StoredSubtitle | undefined
        if (result) {
          resolve(result.file)
        } else {
          resolve(null)
        }
      }

      request.onerror = () => {
        reject(new Error('載入字幕失敗'))
      }
    })
  }

  /**
   * 獲取所有已儲存的影片列表
   */
  async getAllVideos(): Promise<StoredVideo[]> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_VIDEOS], 'readonly')
      const store = transaction.objectStore(STORE_VIDEOS)
      const request = store.getAll()

      request.onsuccess = () => {
        const videos = request.result as StoredVideo[]
        // 按最後存取時間排序
        videos.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)
        resolve(videos)
      }

      request.onerror = () => {
        reject(new Error('獲取影片列表失敗'))
      }
    })
  }

  /**
   * 刪除影片和相關字幕
   */
  async deleteVideo(id: string): Promise<void> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_VIDEOS, STORE_SUBTITLES], 'readwrite')
      const videoStore = transaction.objectStore(STORE_VIDEOS)
      const subtitleStore = transaction.objectStore(STORE_SUBTITLES)
      const subtitleIndex = subtitleStore.index('videoId')

      // 刪除影片
      videoStore.delete(id)

      // 刪除相關字幕
      const subtitleRequest = subtitleIndex.getAll(id)
      subtitleRequest.onsuccess = () => {
        const subtitles = subtitleRequest.result as StoredSubtitle[]
        subtitles.forEach((subtitle) => {
          subtitleStore.delete(subtitle.id)
        })
      }

      transaction.oncomplete = () => {
        console.log('影片和字幕已刪除:', id)
        resolve()
      }

      transaction.onerror = () => {
        reject(new Error('刪除影片失敗'))
      }
    })
  }

  /**
   * 清理過期的影片（超過30天未存取）
   */
  async cleanupOldVideos(): Promise<void> {
    const db = await this.ensureDB()
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_VIDEOS], 'readwrite')
      const store = transaction.objectStore(STORE_VIDEOS)
      const index = store.index('lastAccessedAt')
      const request = index.openCursor(IDBKeyRange.upperBound(thirtyDaysAgo))

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          console.log('刪除過期影片:', cursor.value.name)
          cursor.delete()
          cursor.continue()
        } else {
          console.log('清理完成')
          resolve()
        }
      }

      request.onerror = () => {
        reject(new Error('清理失敗'))
      }
    })
  }

  /**
   * 獲取存儲使用情況
   */
  async getStorageUsage(): Promise<{ videos: number; totalSize: number }> {
    const videos = await this.getAllVideos()
    const totalSize = videos.reduce((sum, video) => sum + video.size, 0)

    return {
      videos: videos.length,
      totalSize,
    }
  }

  /**
   * 清除所有 IndexedDB 資料
   */
  async clearAllData(): Promise<void> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_VIDEOS, STORE_SUBTITLES], 'readwrite')
      const videoStore = transaction.objectStore(STORE_VIDEOS)
      const subtitleStore = transaction.objectStore(STORE_SUBTITLES)

      // 清除所有影片
      const clearVideosRequest = videoStore.clear()

      // 清除所有字幕
      const clearSubtitlesRequest = subtitleStore.clear()

      let completedOperations = 0
      const totalOperations = 2

      const checkComplete = () => {
        completedOperations++
        if (completedOperations === totalOperations) {
          resolve()
        }
      }

      clearVideosRequest.onsuccess = () => {
        console.log('🗑️ 所有影片資料已清除')
        checkComplete()
      }

      clearSubtitlesRequest.onsuccess = () => {
        console.log('🗑️ 所有字幕資料已清除')
        checkComplete()
      }

      clearVideosRequest.onerror = () => {
        reject(new Error('清除影片資料失敗'))
      }

      clearSubtitlesRequest.onerror = () => {
        reject(new Error('清除字幕資料失敗'))
      }
    })
  }
}

// 單例模式
export const indexedDBService = new IndexedDBService()
