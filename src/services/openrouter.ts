// Google Generative AI 服務
import { GoogleGenAI } from '@google/genai'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface GeminiModel {
  id: string
  name: string
  description?: string
}

// Google GenAI 模型型別定義
interface GenAIModel {
  name: string
  displayName?: string
  description?: string
  version?: string
  supportedActions?: string[]
}

// 熱門 Gemini 模型
export const GEMINI_MODELS: GeminiModel[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: '最新且最快的多模態模型，平衡性能與效率',
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (實驗版)',
    description: '實驗版本，極佳性能與速度',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: '快速且性價比高，適合一般對話',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: '高可靠度與推理能力，適合複雜任務',
  },
]

export class GeminiService {
  private client: GoogleGenAI

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey })
  }

  // 列出可用的模型
  async listModels(): Promise<GeminiModel[]> {
    try {
      const modelsResponse = await this.client.models.list()
      const modelsList: GenAIModel[] = []

      // 處理分頁結果
      for await (const model of modelsResponse) {
        modelsList.push(model as GenAIModel)
      }

      // 過濾出支援 generateContent 的模型，並轉換為我們的格式
      return modelsList
        .filter((model: GenAIModel) => model.supportedActions?.includes('generateContent'))
        .map((model: GenAIModel) => ({
          id: model.name.replace('models/', ''), // 移除 'models/' 前綴
          name: model.displayName || model.name.replace('models/', ''),
          description: `${model.description || ''} (${model.version || 'latest'})`.trim(),
        }))
        .sort((a: GeminiModel, b: GeminiModel) => a.name.localeCompare(b.name)) // 按名稱排序
    } catch (error) {
      console.error('載入模型列表失敗:', error)
      // 發生錯誤時返回預設模型列表
      return GEMINI_MODELS
    }
  }

  // 將聊天訊息轉換為 Gemini 格式
  private convertMessages(messages: ChatMessage[]) {
    const systemMessages: string[] = []
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []

    for (const message of messages) {
      if (message.role === 'system') {
        systemMessages.push(message.content)
      } else {
        contents.push({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }],
        })
      }
    }

    return {
      contents,
      systemInstruction:
        systemMessages.length > 0 ? { parts: [{ text: systemMessages.join('\n\n') }] } : undefined,
    }
  }

  // 聊天完成
  async chatCompletion(options: {
    model: string
    messages: ChatMessage[]
    temperature?: number
    maxTokens?: number
  }): Promise<string> {
    const { contents, systemInstruction } = this.convertMessages(options.messages)

    const requestData = {
      model: options.model,
      contents,
      ...(systemInstruction && { systemInstruction }),
      config: {
        ...(options.temperature !== undefined && { temperature: options.temperature }),
        ...(options.maxTokens !== undefined && { maxOutputTokens: options.maxTokens }),
      },
    }

    const response = await this.client.models.generateContent(requestData)

    return response.text || ''
  }

  // 串流聊天
  async chatCompletionStream(
    options: {
      model: string
      messages: ChatMessage[]
      temperature?: number
      maxTokens?: number
    },
    onMessage: (text: string) => void,
    onError: (error: string) => void,
    onComplete: () => void,
  ): Promise<void> {
    try {
      const { contents, systemInstruction } = this.convertMessages(options.messages)

      const requestData = {
        model: options.model,
        contents,
        ...(systemInstruction && { systemInstruction }),
        config: {
          ...(options.temperature !== undefined && { temperature: options.temperature }),
          ...(options.maxTokens !== undefined && { maxOutputTokens: options.maxTokens }),
        },
      }

      const stream = await this.client.models.generateContentStream(requestData)

      for await (const chunk of stream) {
        const text = chunk.text || ''
        if (text) {
          onMessage(text)
        }
      }

      onComplete()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知錯誤'
      onError(errorMessage)
    }
  }

  // 估算 token 數量
  estimateTokens(text: string): number {
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
    const englishWords = text.split(/\s+/).filter((word) => /[a-zA-Z]/.test(word)).length
    return Math.ceil(chineseChars * 1.8 + englishWords * 1.3)
  }
}
