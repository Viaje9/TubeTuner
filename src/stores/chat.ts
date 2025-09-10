import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAIConfigStore } from './aiConfig'
import { useFavoritesStore } from './favorites'
import type { ChatMessage as GeminiChatMessage } from '@/services/openrouter'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isLoading?: boolean
  error?: string
  tokens?: number
}

export interface YouTubeContext {
  videoId: string
  title: string
  currentTime: number
  duration: number
  playbackRate: number
}

export const useChatStore = defineStore('chat', () => {
  // 狀態
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const error = ref('')
  const youtubeContext = ref<YouTubeContext | null>(null)

  // AI 配置 store
  const aiConfig = useAIConfigStore()

  // 收藏 store
  const favoritesStore = useFavoritesStore()

  // 計算屬性
  const canSendMessage = computed(() => {
    return aiConfig.canUseAI && !isLoading.value
  })

  const totalTokensUsed = computed(() => {
    return messages.value.reduce((total, msg) => total + (msg.tokens || 0), 0)
  })

  const conversationHistory = computed(() => {
    return messages.value.filter((msg) => msg.role !== 'system')
  })

  // 生成唯一 ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 設定 YouTube 上下文
  const setYouTubeContext = (context: Partial<YouTubeContext>) => {
    if (youtubeContext.value) {
      youtubeContext.value = { ...youtubeContext.value, ...context }
    } else {
      youtubeContext.value = {
        videoId: context.videoId || '',
        title: context.title || '未知影片',
        currentTime: context.currentTime || 0,
        duration: context.duration || 0,
        playbackRate: context.playbackRate || 1,
      }
    }
  }

  // 建立上下文相關的系統訊息
  const buildSystemMessage = (): string => {
    let systemMessage = aiConfig.systemPrompt

    if (youtubeContext.value) {
      const timeString = formatTime(youtubeContext.value.currentTime)
      const durationString = formatTime(youtubeContext.value.duration)

      systemMessage += `\n\n當前觀看的影片資訊：
- 影片標題：${youtubeContext.value.title}
- 當前播放時間：${timeString}
- 影片總長度：${durationString}
- 播放速度：${youtubeContext.value.playbackRate}x`
    }

    // 加入選中的字幕句子作為對話上下文
    if (favoritesStore.selectedSentences.length > 0) {
      const selectedSentencesText = favoritesStore.selectedSentences
        .map((sentence, index) => {
          const timeString = formatTime(sentence.startTime)
          const endTimeString = formatTime(sentence.endTime)
          return `${index + 1}. [${timeString}-${endTimeString}] "${sentence.text}"`
        })
        .join('\n')

      systemMessage += `\n\n使用者選取的字幕句子（按選擇順序排列）：
${selectedSentencesText}

請特別關注這些選取的句子內容，並在回答時參考這些具體的字幕片段。`
    }

    if (youtubeContext.value || favoritesStore.selectedSentences.length > 0) {
      systemMessage += `\n\n請根據以上資訊來回答使用者的問題。`
    }

    return systemMessage
  }

  // 格式化時間
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
  }

  // 新增訊息
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const newMessage: ChatMessage = {
      id: generateId(),
      timestamp: new Date(),
      ...message,
    }

    messages.value.push(newMessage)
    return newMessage
  }

  // 更新訊息
  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    const index = messages.value.findIndex((msg) => msg.id === id)
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...updates }
    }
  }

  // 準備發送給 AI 的訊息陣列
  const prepareMessagesForAI = (): GeminiChatMessage[] => {
    const systemMessage: GeminiChatMessage = {
      role: 'system',
      content: buildSystemMessage(),
    }

    const conversationMessages: GeminiChatMessage[] = messages.value
      .filter((msg) => msg.role !== 'system' && !msg.error && !msg.isLoading && msg.content.trim())
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

    return [systemMessage, ...conversationMessages]
  }

  // 發送訊息給 AI
  const sendMessage = async (userMessage: string): Promise<void> => {
    console.log('Attempting to send message:', userMessage)

    if (!canSendMessage.value) {
      throw new Error('無法發送訊息：AI 未設定或正在處理中')
    }

    const aiService = aiConfig.getService()
    if (!aiService) {
      throw new Error('AI 服務未初始化')
    }

    error.value = ''
    isLoading.value = true

    // 添加使用者訊息
    addMessage({
      role: 'user',
      content: userMessage,
      tokens: aiService.estimateTokens(userMessage),
    })

    // 添加載入中的助手訊息
    const assistantMsg = addMessage({
      role: 'assistant',
      content: '',
      isLoading: true,
    })

    try {
      // 準備發送的訊息
      const messagesToSend = prepareMessagesForAI()

      // 發送請求
      const response = await aiService.chatCompletion({
        model: aiConfig.selectedModel,
        messages: messagesToSend,
        temperature: aiConfig.temperature,
        maxTokens: aiConfig.maxTokens,
      })

      console.log(messagesToSend)

      if (response) {
        const assistantResponse = response
        const responseTokens = aiService.estimateTokens(assistantResponse)

        // 更新助手訊息
        updateMessage(assistantMsg.id, {
          content: assistantResponse,
          isLoading: false,
          tokens: responseTokens,
        })
      } else {
        throw new Error('AI 回應為空')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '發生未知錯誤'
      error.value = errorMessage

      // 更新助手訊息為錯誤狀態
      updateMessage(assistantMsg.id, {
        content: '抱歉，我遇到了一個錯誤，無法回答您的問題。',
        isLoading: false,
        error: errorMessage,
      })

      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 串流發送訊息給 AI（逐步更新助手回應）
  const sendMessageStream = async (userMessage: string): Promise<void> => {
    if (!canSendMessage.value) {
      throw new Error('無法發送訊息：AI 未設定或正在處理中')
    }

    const aiService = aiConfig.getService()
    if (!aiService) {
      throw new Error('AI 服務未初始化')
    }

    error.value = ''
    isLoading.value = true
    console.log('Preparing to send message stream:', userMessage)

    // 添加使用者訊息
    addMessage({
      role: 'user',
      content: userMessage,
      tokens: aiService.estimateTokens(userMessage),
    })

    // 添加載入中的助手訊息
    const assistantMsg = addMessage({
      role: 'assistant',
      content: '',
      isLoading: true,
    })

    try {
      const messagesToSend = prepareMessagesForAI()

      await aiService.chatCompletionStream(
        {
          model: aiConfig.selectedModel,
          messages: messagesToSend,
          temperature: aiConfig.temperature,
          maxTokens: aiConfig.maxTokens,
        },
        (delta) => {
          // 追加文字（簡單串接）
          updateMessage(assistantMsg.id, {
            content: (messages.value.find((m) => m.id === assistantMsg.id)?.content || '') + delta,
          })
        },
        (errMsg) => {
          error.value = errMsg
          updateMessage(assistantMsg.id, {
            content: '抱歉，我遇到了一個錯誤，無法回答您的問題。',
            isLoading: false,
            error: errMsg,
          })
        },
        () => {
          // 完成：關閉 loading
          updateMessage(assistantMsg.id, {
            isLoading: false,
          })
        },
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '發生未知錯誤'
      error.value = errorMessage
      updateMessage(assistantMsg.id, {
        content: '抱歉，我遇到了一個錯誤，無法回答您的問題。',
        isLoading: false,
        error: errorMessage,
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 重新發送最後一條訊息
  const resendLastMessage = async (): Promise<void> => {
    const lastUserMessage = messages.value
      .slice()
      .reverse()
      .find((msg) => msg.role === 'user')

    if (!lastUserMessage) {
      throw new Error('沒有找到可以重新發送的訊息')
    }

    // 移除最後一條助手回應（如果存在錯誤）
    const lastAssistantIndex = messages.value.findIndex(
      (msg, index) =>
        msg.role === 'assistant' &&
        index > messages.value.findIndex((m) => m.id === lastUserMessage.id),
    )

    if (lastAssistantIndex !== -1) {
      messages.value.splice(lastAssistantIndex, 1)
    }

    await sendMessage(lastUserMessage.content)
  }

  // 清除對話歷史
  const clearHistory = () => {
    messages.value = []
    error.value = ''
  }

  // 刪除特定訊息
  const deleteMessage = (id: string) => {
    const index = messages.value.findIndex((msg) => msg.id === id)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  }

  // 匯出對話歷史
  const exportHistory = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      youtubeContext: youtubeContext.value,
      messages: conversationHistory.value.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      totalTokens: totalTokensUsed.value,
    }

    return JSON.stringify(exportData, null, 2)
  }

  // 載入設定時初始化
  watch(
    () => aiConfig.isConfigured,
    (isConfigured) => {
      if (isConfigured) {
        // AI 配置完成後可以執行的初始化邏輯
        console.log('AI 聊天功能已就緒')
      }
    },
    { immediate: true },
  )

  return {
    // 狀態
    messages,
    isLoading,
    error,
    youtubeContext,

    // 計算屬性
    canSendMessage,
    totalTokensUsed,
    conversationHistory,

    // 方法
    setYouTubeContext,
    addMessage,
    updateMessage,
    sendMessage,
    resendLastMessage,
    sendMessageStream,
    clearHistory,
    deleteMessage,
    exportHistory,
    formatTime,
  }
})
