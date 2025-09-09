// Gemini API 服務（Google Generative Language API）
import { GoogleGenAI } from '@google/genai'
export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface OpenRouterModel {
  id: string
  name: string
  description?: string
  pricing?: {
    prompt: string
    completion: string
  }
}

export interface ChatCompletionRequest {
  model: string
  messages: OpenRouterMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  stream?: boolean
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 熱門模型配置（Gemini）
export const POPULAR_MODELS: OpenRouterModel[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: '最新一代快速模型，極佳性價比與串流體驗',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: '快速且性價比高，適合一般對話與摘要',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: '高可靠度與推理能力，適合進階任務',
  },
  {
    id: 'gemini-1.0-pro',
    name: 'Gemini 1.0 Pro',
    description: '穩定版本，通用文字生成',
  },
]

export class OpenRouterService {
  private apiKey: string
  // Google Generative Language API base
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta'
  private client: GoogleGenAI

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.client = new GoogleGenAI({ apiKey: this.apiKey })
  }

  // 驗證 API Key 是否有效：呼叫 models 列表
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/models?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.ok
    } catch (error) {
      console.error('API Key 驗證失敗:', error)
      return false
    }
  }

  // 獲取可用模型列表（Gemini）
  async getModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch(`${this.baseURL}/models?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      // API 回傳格式：{ models: [{ name: 'models/gemini-1.5-pro', ...}, ...] }
      const models = (data.models || []) as Array<{ name: string; displayName?: string; description?: string }>
      if (!Array.isArray(models) || models.length === 0) {
        return POPULAR_MODELS
      }
      return models.map((m) => {
        const id = m.name?.replace(/^models\//, '') || 'gemini-1.5-pro'
        return {
          id,
          name: m.displayName || id,
          description: m.description,
        }
      })
    } catch (error) {
      console.error('獲取模型列表失敗:', error)
      // 如果 API 調用失敗，返回預設的熱門模型
      return POPULAR_MODELS
    }
  }

  // 將通用訊息轉換為 Gemini contents / systemInstruction
  private buildGeminiPayload(request: ChatCompletionRequest) {
    const systemParts: string[] = []
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []

    for (const msg of request.messages) {
      if (msg.role === 'system') {
        if (msg.content && msg.content.trim()) systemParts.push(msg.content.trim())
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })
      }
    }

    const payload: any = {
      contents,
      generationConfig: {
        temperature: typeof request.temperature === 'number' ? request.temperature : 0.7,
        maxOutputTokens: typeof request.max_tokens === 'number' ? request.max_tokens : undefined,
        topP: typeof request.top_p === 'number' ? request.top_p : undefined,
      },
    }

    if (systemParts.length > 0) {
      payload.systemInstruction = { parts: [{ text: systemParts.join('\n\n') }] }
    }

    return payload
  }

  // 發送聊天請求（Gemini generateContent）
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const modelId = request.model?.replace(/^models\//, '')
      const url = `${this.baseURL}/models/${encodeURIComponent(modelId)}:generateContent?key=${this.apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.buildGeminiPayload(request)),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`
        throw new Error(message)
      }

      const data = await response.json()
      // Gemini 回傳格式：
      // { candidates: [{ content: { parts: [{ text }] }, finishReason }], usageMetadata: { promptTokenCount, candidatesTokenCount, totalTokenCount } }
      const candidate = (data.candidates && data.candidates[0]) || null
      const parts = candidate?.content?.parts || []
      const text = parts.map((p: any) => p.text || '').join('')
      const finishReason = candidate?.finishReason || 'stop'
      const usage = data.usageMetadata || {}

      const mapped: ChatCompletionResponse = {
        choices: [
          {
            message: { role: 'assistant', content: text },
            finish_reason: typeof finishReason === 'string' ? finishReason : 'stop',
          },
        ],
        usage: {
          prompt_tokens: usage.promptTokenCount ?? 0,
          completion_tokens: usage.candidatesTokenCount ?? 0,
          total_tokens: usage.totalTokenCount ?? 0,
        },
      }
      return mapped
    } catch (error) {
      console.error('聊天請求失敗:', error)
      throw error
    }
  }

  // 串流聊天請求（使用 @google/genai SDK）
  async chatCompletionStream(
    request: ChatCompletionRequest,
    onMessage: (content: string) => void,
    onError: (error: string) => void,
    onComplete: () => void,
  ): Promise<void> {
    try {
      const modelId = request.model?.replace(/^models\//, '')
      const payload = this.buildGeminiPayload({ ...request, model: modelId })

      const contents = Array.isArray(payload.contents) ? [...payload.contents] : []
      if (payload.systemInstruction?.parts?.length) {
        const systemText = payload.systemInstruction.parts.map((p: any) => p.text || '').join('\n\n')
        if (systemText.trim()) {
          contents.unshift({ role: 'user', parts: [{ text: systemText.trim() }] })
        }
      }

      const stream = await this.client.models.generateContentStream({
        model: modelId,
        contents,
        config: payload.generationConfig,
      } as any)

      for await (const chunk of stream as any) {
        // 官方 SDK chunk 物件提供 chunk.text 方便讀取增量文本
        const delta: string = (chunk && (chunk.text as string)) || ''
        if (delta) onMessage(delta)
      }

      onComplete()
    } catch (error) {
      console.error('串流聊天請求失敗:', error)
      onError(error instanceof Error ? error.message : '未知錯誤')
    }
  }

  // 計算估算成本 (基於 token 數量)
  estimateTokens(text: string): number {
    // 簡單估算：中文字符約 1.5-2 tokens，英文單詞約 1-1.5 tokens
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
    const englishWords = text.split(/\s+/).filter((word) => /[a-zA-Z]/.test(word)).length
    return Math.ceil(chineseChars * 1.8 + englishWords * 1.3)
  }
}
