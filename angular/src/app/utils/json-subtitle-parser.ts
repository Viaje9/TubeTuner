import type { SubtitleData } from './srt-parser';

interface JSONSubtitleEvent {
  tStartMs: number;
  dDurationMs: number;
  segs?: Array<{ utf8: string }>;
}

interface JSONSubtitleData {
  events: JSONSubtitleEvent[];
}

export function parseJSONSubtitles(jsonString: string): SubtitleData[] {
  const jsonData = JSON.parse(jsonString) as JSONSubtitleData;
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
    const jsonData = JSON.parse(jsonString) as JSONSubtitleData;
    if (!jsonData.events || !Array.isArray(jsonData.events)) return false;
    return jsonData.events.some(
      (e: JSONSubtitleEvent) => typeof e.tStartMs === 'number' && typeof e.dDurationMs === 'number',
    );
  } catch {
    return false;
  }
}

