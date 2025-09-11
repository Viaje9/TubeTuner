export interface SubtitleData {
  index: number;
  startTime: number;
  endTime: number;
  text: string;
}

export function parseSRT(srtContent: string): SubtitleData[] {
  const subtitles: SubtitleData[] = [];
  const blocks = srtContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n\n')
    .filter(block => block.trim());

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;
    const index = parseInt(lines[0]);
    if (Number.isNaN(index)) continue;
    const timeMatch = lines[1].match(
      /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/,
    );
    if (!timeMatch) continue;
    const startTime =
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000;
    const endTime =
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000;
    const text = lines.slice(2).join('\n').trim();
    if (text) subtitles.push({ index, startTime, endTime, text });
  }
  return subtitles.sort((a, b) => a.startTime - b.startTime);
}

export function getCurrentSubtitle(subtitles: SubtitleData[], currentTime: number) {
  return (
    subtitles.find(s => currentTime >= s.startTime && currentTime <= s.endTime) || null
  );
}

export async function loadSRTFile(file: File): Promise<SubtitleData[]> {
  const content = await file.text();
  return parseSRT(content);
}

