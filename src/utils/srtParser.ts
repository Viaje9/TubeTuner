export interface Subtitle {
  index: number
  startTime: number
  endTime: number
  text: string
}

export function parseSRT(srtContent: string): Subtitle[] {
  const subtitles: Subtitle[] = []

  // 正規化換行符號並分割字幕區塊
  const blocks = srtContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n\n')
    .filter((block) => block.trim())

  for (const block of blocks) {
    const lines = block.trim().split('\n')

    if (lines.length < 3) continue

    // 解析索引
    const index = parseInt(lines[0])
    if (isNaN(index)) continue

    // 解析時間碼
    const timeMatch = lines[1].match(
      /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/,
    )

    if (!timeMatch) continue

    // 轉換時間為秒數
    const startTime =
      parseInt(timeMatch[1]) * 3600 + // 小時
      parseInt(timeMatch[2]) * 60 + // 分鐘
      parseInt(timeMatch[3]) + // 秒
      parseInt(timeMatch[4]) / 1000 // 毫秒

    const endTime =
      parseInt(timeMatch[5]) * 3600 + // 小時
      parseInt(timeMatch[6]) * 60 + // 分鐘
      parseInt(timeMatch[7]) + // 秒
      parseInt(timeMatch[8]) / 1000 // 毫秒

    // 合併剩餘行作為字幕文字
    const text = lines.slice(2).join('\n').trim()

    if (text) {
      subtitles.push({
        index,
        startTime,
        endTime,
        text,
      })
    }
  }

  // 按時間排序
  return subtitles.sort((a, b) => a.startTime - b.startTime)
}

export function getCurrentSubtitle(subtitles: Subtitle[], currentTime: number): Subtitle | null {
  return (
    subtitles.find(
      (subtitle) => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime,
    ) || null
  )
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

export async function loadSRTFile(file: File): Promise<Subtitle[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const subtitles = parseSRT(content)
        resolve(subtitles)
      } catch {
        reject(new Error('無法解析 SRT 檔案'))
      }
    }

    reader.onerror = () => {
      reject(new Error('無法讀取檔案'))
    }

    reader.readAsText(file, 'UTF-8')
  })
}
