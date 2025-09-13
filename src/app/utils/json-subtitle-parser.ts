import type { SubtitleData } from './srt-parser';

// YouTube JSON 字幕格式
interface JSONSubtitleEvent {
  tStartMs: number;
  dDurationMs: number;
  segs?: Array<{ utf8: string }>;
}

interface JSONSubtitleData {
  events: JSONSubtitleEvent[];
}

// 自訂 JSON 字幕格式（使用者提供的 content/time/end 結構）
interface CustomSubtitleItem {
  text: string;
  time: number; // 秒
  end: number; // 秒
}
interface CustomJSONSubtitleData {
  lesson?: string;
  content: CustomSubtitleItem[];
}

function isEventsJSON(data: any): data is JSONSubtitleData {
  return !!data && typeof data === 'object' && Array.isArray((data as any).events);
}

function isContentJSON(data: any): data is CustomJSONSubtitleData {
  return !!data && typeof data === 'object' && Array.isArray((data as any).content);
}

// 將自訂 content/time/end 結構轉為 YouTube events 結構（以毫秒為單位）
export function convertContentToEventsJSON(jsonString: string): string {
  const data = JSON.parse(jsonString) as unknown;
  if (isEventsJSON(data)) {
    // 已是 events 結構，直接回傳原字串
    return jsonString;
  }
  if (!isContentJSON(data)) {
    throw new Error('無效的 JSON 字幕格式：不支援的結構');
  }
  const events: JSONSubtitleEvent[] = [];
  for (const item of data.content) {
    if (
      !item ||
      typeof item.text !== 'string' ||
      typeof item.time !== 'number' ||
      typeof item.end !== 'number'
    )
      continue;
    const text = item.text.trim();
    if (!text) continue;
    const startMs = Math.max(0, Math.round(item.time * 1000));
    const endMs = Math.max(startMs, Math.round(item.end * 1000));
    const dMs = Math.max(0, endMs - startMs);
    events.push({ tStartMs: startMs, dDurationMs: dMs, segs: [{ utf8: text }] });
  }
  const normalized: JSONSubtitleData = { events };
  return JSON.stringify(normalized);
}

// 嘗試將任意輸入統一轉為 events JSON 字串
export function toEventsJSON(jsonString: string): { json: string; converted: boolean } {
  const parsed = JSON.parse(jsonString) as unknown;
  if (isEventsJSON(parsed)) return { json: jsonString, converted: false };
  return { json: convertContentToEventsJSON(jsonString), converted: true };
}

// 解析（同時支援 events 與 content，必要時先轉換）
export function parseJSONSubtitles(jsonString: string): SubtitleData[] {
  const { json } = toEventsJSON(jsonString);
  const jsonData = JSON.parse(json) as JSONSubtitleData;
  if (!jsonData.events || !Array.isArray(jsonData.events)) {
    throw new Error('無效的 JSON 字幕格式：缺少 events 陣列');
  }
  const subtitles: SubtitleData[] = [];
  jsonData.events.forEach((event, index) => {
    if (typeof event.tStartMs !== 'number' || typeof event.dDurationMs !== 'number') return;
    const text = (event.segs?.map(seg => seg.utf8 || '').join('') || '').trim();
    if (!text) return;
    const startTime = event.tStartMs / 1000;
    const endTime = (event.tStartMs + event.dDurationMs) / 1000;
    subtitles.push({ index: index + 1, startTime, endTime, text });
  });
  return subtitles.sort((a, b) => a.startTime - b.startTime);
}

export function isValidJSONSubtitle(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as unknown;
    if (isEventsJSON(data)) {
      return (data.events || []).some(
        (e: JSONSubtitleEvent) => typeof e.tStartMs === 'number' && typeof e.dDurationMs === 'number',
      );
    }
    if (isContentJSON(data)) {
      return (data.content || []).some(
        (it: CustomSubtitleItem) =>
          it && typeof it.text === 'string' && typeof it.time === 'number' && typeof it.end === 'number',
      );
    }
    return false;
  } catch {
    return false;
  }
}
