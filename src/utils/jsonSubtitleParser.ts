import type { SubtitleData } from '@/types/player'

interface JSONSubtitleEvent {
  tStartMs: number
  dDurationMs: number
  segs: Array<{
    utf8: string
  }>
}

interface JSONSubtitleData {
  wireMagic: string
  pens?: unknown[]
  wsWinStyles?: unknown[]
  wpWinPositions?: unknown[]
  events: JSONSubtitleEvent[]
}

/**
 * 解析 JSON 格式的字幕檔案（YouTube 格式）
 * @param jsonString JSON 字串
 * @returns 解析後的字幕資料陣列
 */
export function parseJSONSubtitles(jsonString: string): SubtitleData[] {
  try {
    const jsonData: JSONSubtitleData = JSON.parse(jsonString)

    if (!jsonData.events || !Array.isArray(jsonData.events)) {
      throw new Error('無效的 JSON 字幕格式：缺少 events 陣列')
    }

    const subtitles: SubtitleData[] = []

    jsonData.events.forEach((event, index) => {
      // 確保必要的欄位存在
      if (typeof event.tStartMs !== 'number' || typeof event.dDurationMs !== 'number') {
        console.warn(`跳過無效的字幕事件 #${index + 1}`)
        return
      }

      // 組合所有片段的文字
      const text =
        event.segs
          ?.map((seg) => seg.utf8 || '')
          .join('')
          .trim() || ''

      if (!text) {
        return // 跳過空白字幕
      }

      // 將毫秒轉換為秒
      const startTime = event.tStartMs / 1000
      const endTime = (event.tStartMs + event.dDurationMs) / 1000

      subtitles.push({
        index: index + 1,
        startTime,
        endTime,
        text,
      })
    })

    // 按開始時間排序
    subtitles.sort((a, b) => a.startTime - b.startTime)

    return subtitles
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('無效的 JSON 格式：' + error.message)
    }
    throw error
  }
}

/**
 * 驗證 JSON 字幕格式
 * @param jsonString JSON 字串
 * @returns 是否為有效的 JSON 字幕格式
 */
export function isValidJSONSubtitle(jsonString: string): boolean {
  try {
    const jsonData = JSON.parse(jsonString)

    // 檢查必要的欄位
    if (!jsonData.events || !Array.isArray(jsonData.events)) {
      return false
    }

    // 至少要有一個有效的事件
    return jsonData.events.some(
      (event: JSONSubtitleEvent) =>
        typeof event.tStartMs === 'number' &&
        typeof event.dDurationMs === 'number' &&
        event.segs &&
        Array.isArray(event.segs),
    )
  } catch {
    return false
  }
}

/**
 * 格式化時間為 SRT 格式
 * @param seconds 秒數
 * @returns 格式化的時間字串
 */
export function formatTimeForDisplay(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

/**
 * 將 JSON 字幕轉換為 SRT 格式（用於匯出）
 * @param subtitles 字幕資料陣列
 * @returns SRT 格式的字串
 */
export function convertJSONToSRT(subtitles: SubtitleData[]): string {
  return subtitles
    .map((subtitle, index) => {
      const startTime = formatTimeForDisplay(subtitle.startTime)
      const endTime = formatTimeForDisplay(subtitle.endTime)
      return `${index + 1}\n${startTime} --> ${endTime}\n${subtitle.text}\n`
    })
    .join('\n')
}
