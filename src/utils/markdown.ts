// 輕量級 Markdown 渲染器 - 純原生實作，無需任何套件
export function renderMarkdown(text: string): string {
  if (!text) return ''

  let html = text
    // 轉義 HTML 特殊字符
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

  // 處理程式碼區塊 (```)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
    const languageClass = lang ? ` language-${lang}` : ''
    return `<pre class="bg-gray-800 rounded-lg p-4 overflow-x-auto my-3"><code class="text-gray-100 text-sm${languageClass}">${code.trim()}</code></pre>`
  })

  // 處理行內程式碼 (`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-700 text-blue-300 px-2 py-1 rounded text-sm">$1</code>')

  // 處理粗體 (**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')

  // 處理斜體 (*)
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-200">$1</em>')

  // 處理連結
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>')

  // 處理換行
  html = html.replace(/\n\n/g, '</p><p class="mb-3">')
  html = html.replace(/\n/g, '<br>')

  // 處理清單項目 (-)
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>')

  // 處理數字清單 (1.)
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-1 list-decimal">$1</li>')

  // 處理標題 (#)
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-4 mb-2">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-4 mb-2">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-4 mb-3">$1</h1>')

  // 包裝段落
  if (!html.includes('<p>') && !html.includes('<pre>') && !html.includes('<h1>') && !html.includes('<h2>') && !html.includes('<h3>')) {
    html = `<p class="mb-3">${html}</p>`
  }

  return html
}

// 純文字版本，用於預覽或摘要
export function stripMarkdown(text: string): string {
  if (!text) return ''

  return text
    // 移除程式碼區塊
    .replace(/```[\s\S]*?```/g, '[程式碼]')
    // 移除行內程式碼
    .replace(/`([^`]+)`/g, '$1')
    // 移除粗體和斜體標記
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // 移除連結，保留文字
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除標題標記
    .replace(/^#{1,6}\s+/gm, '')
    // 移除清單標記
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '')
    // 正規化換行
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}