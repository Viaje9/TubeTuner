// OpenRouter API 服務 - 純原生實作，無需任何外部套件
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

// 熱門模型配置
export const POPULAR_MODELS: OpenRouterModel[] = [
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: '最新的 GPT-4 精簡版，速度快且成本低',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI 最新的多模態模型',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic 最強的模型，擅長推理和編程',
  },
  {
    id: 'google/gemini-pro',
    name: 'Gemini Pro',
    description: 'Google 的高效能語言模型',
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct:free',
    name: 'Llama 3.1 8B (免費)',
    description: 'Meta 的開源模型，完全免費使用',
  },
]

export class OpenRouterService {
  private apiKey: string
  private baseURL = 'https://openrouter.ai/api/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  // 驗證 API Key 是否有效
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/key`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })
      return response.ok
    } catch (error) {
      console.error('API Key 驗證失敗:', error)
      return false
    }
  }

  // 獲取可用模型列表
  async getModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('獲取模型列表失敗:', error)
      // 如果 API 調用失敗，返回預設的熱門模型
      return POPULAR_MODELS
    }
  }

  // 發送聊天請求
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'TubeTuner AI Chat',
        },
        body: JSON.stringify({
          ...request,
          stream: false, // 先實作非串流版本
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('聊天請求失敗:', error)
      throw error
    }
  }

  // 串流聊天請求 (未來實作)
  async chatCompletionStream(
    request: ChatCompletionRequest,
    onMessage: (content: string) => void,
    onError: (error: string) => void,
    onComplete: () => void,
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'TubeTuner AI Chat',
        },
        body: JSON.stringify({
          ...request,
          stream: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('無法讀取響應流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine === '') continue
            if (trimmedLine === 'data: [DONE]') {
              onComplete()
              return
            }
            if (trimmedLine.startsWith('data: ')) {
              try {
                const jsonStr = trimmedLine.slice(6)
                const data = JSON.parse(jsonStr)
                const content = data.choices?.[0]?.delta?.content
                if (content) {
                  onMessage(content)
                }
              } catch {
                // 忽略解析錯誤，繼續處理下一行
                continue
              }
            }
          }
        }
        onComplete()
      } finally {
        reader.releaseLock()
      }
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
