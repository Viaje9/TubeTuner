import type { SearchResult, VideoInfo } from '@/types/youtube'

// Invidious API 回應型別
interface InvidiousThumbnail {
  url: string
  quality: string
  width: number
  height: number
}

interface InvidiousVideoItem {
  videoId: string
  title: string
  author: string
  description: string
  videoThumbnails: InvidiousThumbnail[]
  lengthSeconds: number
  published: number
  viewCount: number
}

interface InvidiousVideoInfo {
  videoId: string
  title: string
  author: string
  description: string
  videoThumbnails: InvidiousThumbnail[]
  lengthSeconds: number
  published?: number
  viewCount: number
}

/**
 * YouTube 搜尋服務
 * 由於沒有 YouTube Data API 金鑰，這裡實作替代方案
 */
export class YouTubeSearchService {
  private static readonly INVIDIOUS_INSTANCES = [
    'https://inv.riverside.rocks',
    'https://invidious.snopyta.org', 
    'https://invidious.kavin.rocks',
    'https://invidious.flokinet.to'
  ]

  /**
   * 搜尋 YouTube 影片（使用 Invidious API）
   */
  static async searchVideos(query: string, maxResults: number = 20): Promise<SearchResult> {
    if (!query.trim()) {
      throw new Error('搜尋關鍵字不能為空')
    }

    // 如果是 YouTube 網址，直接解析
    const videoId = this.extractVideoId(query)
    if (videoId) {
      try {
        const videoInfo = await this.getVideoInfo(videoId)
        return {
          items: [videoInfo],
          nextPageToken: null,
          totalResults: 1
        }
      } catch (error) {
        console.error('獲取影片資訊失敗:', error)
        throw new Error('無效的 YouTube 網址')
      }
    }

    // 嘗試使用 Invidious API 搜尋
    for (const instance of this.INVIDIOUS_INSTANCES) {
      try {
        console.log(`嘗試使用 Invidious 實例: ${instance}`)
        // 使用 AbortController 來實現超時
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 秒超時

        const response = await fetch(
          `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&sort_by=relevance`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            signal: controller.signal
          }
        )

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (!Array.isArray(data)) {
          throw new Error('無效的回應格式')
        }

        const items: VideoInfo[] = data.slice(0, maxResults).map((item: InvidiousVideoItem) => ({
          id: item.videoId || '',
          title: item.title || '未知標題',
          channelTitle: item.author || '未知頻道',
          description: item.description || '',
          thumbnails: {
            default: item.videoThumbnails?.find((t: InvidiousThumbnail) => t.quality === 'medium')?.url || 
                     item.videoThumbnails?.[0]?.url || '',
            medium: item.videoThumbnails?.find((t: InvidiousThumbnail) => t.quality === 'medium')?.url || 
                    item.videoThumbnails?.[0]?.url || '',
            high: item.videoThumbnails?.find((t: InvidiousThumbnail) => t.quality === 'high')?.url || 
                  item.videoThumbnails?.[0]?.url || ''
          },
          duration: this.formatDuration(item.lengthSeconds || 0),
          publishedAt: new Date(item.published * 1000).toISOString(),
          viewCount: item.viewCount || 0,
          url: `https://www.youtube.com/watch?v=${item.videoId}`
        }))

        return {
          items,
          nextPageToken: null,
          totalResults: items.length
        }

      } catch (error) {
        console.warn(`Invidious 實例 ${instance} 失敗:`, error)
        continue
      }
    }

    // 如果所有 Invidious 實例都失敗，回傳模擬資料
    console.warn('所有搜尋方法都失敗，回傳模擬資料')
    return this.getMockSearchResults(query, maxResults)
  }

  /**
   * 獲取影片資訊（用於直接貼 URL 的情況）
   */
  static async getVideoInfo(videoId: string): Promise<VideoInfo> {
    for (const instance of this.INVIDIOUS_INSTANCES) {
      try {
        const response = await fetch(`${instance}/api/v1/videos/${videoId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json() as InvidiousVideoInfo

        return {
          id: videoId,
          title: data.title || '未知標題',
          channelTitle: data.author || '未知頻道',
          description: data.description || '',
          thumbnails: {
            default: data.videoThumbnails?.find((t: InvidiousThumbnail) => t.quality === 'medium')?.url || '',
            medium: data.videoThumbnails?.find((t: InvidiousThumbnail) => t.quality === 'medium')?.url || '',
            high: data.videoThumbnails?.find((t: InvidiousThumbnail) => t.quality === 'high')?.url || ''
          },
          duration: this.formatDuration(data.lengthSeconds || 0),
          publishedAt: data.published ? new Date(data.published * 1000).toISOString() : '',
          viewCount: data.viewCount || 0,
          url: `https://www.youtube.com/watch?v=${videoId}`
        }
      } catch (error) {
        console.warn(`獲取影片資訊失敗 (${instance}):`, error)
        continue
      }
    }

    throw new Error('無法獲取影片資訊')
  }

  /**
   * 提取 YouTube 影片 ID
   */
  static extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1] && match[1].length === 11) {
        return match[1]
      }
    }
    
    return null
  }

  /**
   * 格式化影片時長
   */
  private static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
  }

  /**
   * 生成模擬搜尋結果（當所有 API 都失敗時使用）
   */
  private static getMockSearchResults(query: string, maxResults: number): SearchResult {
    const mockVideos: VideoInfo[] = [
      {
        id: 'dQw4w9WgXcQ',
        title: `${query} - 示範影片 1`,
        channelTitle: '示範頻道',
        description: `這是關於 "${query}" 的示範影片說明...`,
        thumbnails: {
          default: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
          medium: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
          high: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
        },
        duration: '3:32',
        publishedAt: new Date().toISOString(),
        viewCount: 1000000,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: 'jNQXAC9IVRw',
        title: `${query} - 教學影片`,
        channelTitle: '教學頻道',
        description: `學習如何使用 ${query} 的完整教學...`,
        thumbnails: {
          default: 'https://i.ytimg.com/vi/jNQXAC9IVRw/mqdefault.jpg',
          medium: 'https://i.ytimg.com/vi/jNQXAC9IVRw/mqdefault.jpg',
          high: 'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg'
        },
        duration: '15:24',
        publishedAt: new Date().toISOString(),
        viewCount: 500000,
        url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw'
      }
    ]

    return {
      items: mockVideos.slice(0, maxResults),
      nextPageToken: null,
      totalResults: mockVideos.length
    }
  }

  /**
   * 檢查 YouTube URL 是否有效
   */
  static isValidYouTubeUrl(url: string): boolean {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/.test(url)
  }

  /**
   * 格式化觀看次數
   */
  static formatViewCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M 次觀看`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K 次觀看`
    } else {
      return `${count} 次觀看`
    }
  }

  /**
   * 格式化發布時間
   */
  static formatPublishedTime(publishedAt: string): string {
    if (!publishedAt) return '未知時間'

    const now = new Date()
    const published = new Date(publishedAt)
    const diffMs = now.getTime() - published.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 1) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      return diffHours < 1 ? '剛剛發布' : `${diffHours} 小時前`
    } else if (diffDays < 30) {
      return `${diffDays} 天前`
    } else if (diffDays < 365) {
      const diffMonths = Math.floor(diffDays / 30)
      return `${diffMonths} 個月前`
    } else {
      const diffYears = Math.floor(diffDays / 365)
      return `${diffYears} 年前`
    }
  }
}