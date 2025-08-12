<template>
  <div
    v-if="currentSubtitle"
    :class="[
      positionStyle === 'absolute'
        ? `absolute left-1/2 transform -translate-x-1/2 z-10 transition-all duration-200 ${position === 'bottom' ? 'bottom-4' : 'top-4'}`
        : 'flex justify-center transition-all duration-200',
    ]"
  >
    <div
      :class="[
        'px-4 py-2 rounded-lg max-w-4xl mx-auto shadow-lg backdrop-blur-sm relative',
        backgroundStyle,
      ]"
      :style="{ fontSize: fontSize + 'px' }"
    >
      <!-- 字幕文字 -->
      <div
        ref="subtitleTextRef"
        :class="[
          'text-center font-medium leading-relaxed select-text subtitle-interactive',
          textColorClass,
        ]"
        data-subtitle-text="true"
        :style="{
          textShadow: showShadow ? '2px 2px 4px rgba(0, 0, 0, 0.8)' : 'none',
        }"
        v-html="formattedText"
        @click="handleClick"
        @selectstart="handleSelectionStart"
        title="點擊選取文字進行翻譯"
      />

      <!-- 翻譯按鈕 -->
      <div
        v-if="selectedText && !isTranslating"
        class="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-20"
      >
        <button
          @click="translateSelectedText"
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-sm shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
          翻譯
        </button>
      </div>

      <!-- 翻譯載入中 -->
      <div
        v-if="isTranslating"
        class="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div
          class="bg-gray-700 text-white px-3 py-1 rounded-full text-sm shadow-lg flex items-center gap-2"
        >
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          翻譯中...
        </div>
      </div>

      <!-- 翻譯結果 -->
      <div
        v-if="translationResult"
        :class="[
          'mt-2 p-2 rounded border border-blue-500/30',
          'bg-blue-900/20 text-blue-100 text-sm',
        ]"
      >
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-blue-300">翻譯結果：</span>
          <button
            @click="clearTranslation"
            class="text-blue-400 hover:text-blue-300 transition-colors"
            title="清除翻譯"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div>{{ translationResult }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { SubtitleData } from '@/types/player'
import { useAIConfigStore } from '@/stores/aiConfig'

const props = withDefaults(
  defineProps<{
    currentSubtitle: SubtitleData | null
    fontSize?: number
    textColor?: 'white' | 'yellow' | 'blue' | 'green'
    backgroundColor?: 'dark' | 'black' | 'transparent' | 'semi'
    position?: 'top' | 'bottom'
    showShadow?: boolean
    positionStyle?: 'absolute' | 'relative' | 'static'
  }>(),
  {
    fontSize: 18,
    textColor: 'white',
    backgroundColor: 'semi',
    position: 'bottom',
    showShadow: true,
    positionStyle: 'absolute',
  },
)

const textColorClass = computed(() => {
  switch (props.textColor) {
    case 'yellow':
      return 'text-yellow-300'
    case 'blue':
      return 'text-blue-300'
    case 'green':
      return 'text-green-300'
    default:
      return 'text-white'
  }
})

const backgroundStyle = computed(() => {
  switch (props.backgroundColor) {
    case 'dark':
      return 'bg-gray-900/90 border border-gray-700/50'
    case 'black':
      return 'bg-black/80'
    case 'transparent':
      return 'bg-transparent'
    case 'semi':
    default:
      return 'bg-black/60 border border-gray-800/30'
  }
})

// 響應式變數
const subtitleTextRef = ref<HTMLElement>()
const selectedText = ref('')
const isTranslating = ref(false)
const translationResult = ref('')

// AI 配置
const aiConfig = useAIConfigStore()

const formattedText = computed(() => {
  if (!props.currentSubtitle?.text) return ''

  // 將換行符轉換為 HTML <br> 標籤
  return props.currentSubtitle.text.replace(/\n/g, '<br>').replace(/\\n/g, '<br>')
})

// 點擊處理
const handleClick = () => {
  console.log('字幕被點擊')
  selectAllText()
}

// 選取開始
const handleSelectionStart = () => {
  // 允許選取
}

// 全域選取變更檢測
const handleGlobalSelectionChange = () => {
  const selection = window.getSelection()
  if (selection && subtitleTextRef.value) {
    // 檢查選取是否在我們的字幕元素內
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null
    if (range && subtitleTextRef.value.contains(range.commonAncestorContainer)) {
      console.log('字幕文字被選取')
      checkSelection()
    }
  }
}

// 檢查選取的文字
const checkSelection = () => {
  const selection = window.getSelection()
  console.log('checkSelection:', {
    selection,
    selectionString: selection?.toString(),
    rangeCount: selection?.rangeCount,
    isCollapsed: selection?.isCollapsed,
  })

  if (selection && selection.toString().trim()) {
    selectedText.value = selection.toString().trim()
    translationResult.value = '' // 清除之前的翻譯
    console.log('✅ 文字選取成功:', selectedText.value)
  } else {
    selectedText.value = ''
    translationResult.value = ''
    console.log('❌ 沒有選取到文字')
  }
}

// 選取全部文字（適用於行動裝置）
const selectAllText = () => {
  if (!subtitleTextRef.value || !props.currentSubtitle?.text) {
    console.log('selectAllText: 缺少必要元素', {
      subtitleTextRef: !!subtitleTextRef.value,
      currentSubtitle: !!props.currentSubtitle?.text,
    })
    return
  }

  try {
    const range = document.createRange()
    range.selectNodeContents(subtitleTextRef.value)

    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)

      // 設定選取的文字
      selectedText.value = props.currentSubtitle.text.trim()
      translationResult.value = '' // 清除之前的翻譯
      console.log('程式化選取成功:', selectedText.value)
    }
  } catch (error) {
    console.warn('文字選取失敗:', error)
    // 備用方案：直接設定文字
    selectedText.value = props.currentSubtitle.text.trim()
    translationResult.value = ''
    console.log('使用備用方案選取:', selectedText.value)
  }
}

// 翻譯選取的文字
const translateSelectedText = async () => {
  if (!selectedText.value || !aiConfig.canUseAI) {
    console.warn('無法翻譯：沒有選取文字或 AI 未設定')
    return
  }

  isTranslating.value = true

  try {
    const aiService = aiConfig.getService()
    if (!aiService) {
      throw new Error('AI 服務未初始化')
    }

    const response = await aiService.chatCompletion({
      model: aiConfig.selectedModel,
      messages: [
        {
          role: 'system',
          content:
            aiConfig.systemPrompt ||
            '你是一個專業的翻譯助手。請將用戶提供的文字翻譯成繁體中文。只需要提供翻譯結果，不需要額外的解釋或說明。',
        },
        {
          role: 'user',
          content: `請將以下文字翻譯成繁體中文：${selectedText.value}`,
        },
      ],
      temperature: aiConfig.temperature || 0.3,
      max_tokens: aiConfig.maxTokens || 500,
    })

    if (response.choices && response.choices.length > 0) {
      translationResult.value = response.choices[0].message.content.trim()
    } else {
      throw new Error('翻譯服務回應格式錯誤')
    }
  } catch (error) {
    console.error('翻譯失敗:', error)
    translationResult.value = '翻譯失敗，請稍後再試'
  } finally {
    isTranslating.value = false
  }
}

// 清除翻譯結果
const clearTranslation = () => {
  translationResult.value = ''
  selectedText.value = ''
  // 清除選取
  const selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
  }
}

// 點擊外部時清除選取
const handleClickOutside = (event: Event) => {
  if (subtitleTextRef.value && !subtitleTextRef.value.contains(event.target as Node)) {
    clearTranslation()
  }
}

// 生命週期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('selectionchange', handleGlobalSelectionChange)
  aiConfig.loadFromStorage()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('selectionchange', handleGlobalSelectionChange)
})
</script>

<style scoped>
/* 確保字幕在所有情況下都清晰可見 */
.subtitle-text {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 響應式字幕大小 */
@media (max-width: 640px) {
  .subtitle-container {
    max-width: calc(100vw - 2rem);
    left: 1rem;
    right: 1rem;
    transform: none;
  }
}

/* 字幕現在可以互動 */
.select-text {
  user-select: all;
  -webkit-user-select: all;
  -moz-user-select: all;
  -ms-user-select: all;
  cursor: pointer;
  /* 行動裝置觸控優化 */
  -webkit-touch-callout: default;
  -webkit-tap-highlight-color: rgba(59, 130, 246, 0.2);
  /* 確保文字可以被選取 */
  pointer-events: auto;
  /* 覆蓋全局的 touch-action 設定 */
  touch-action: auto;
  -webkit-touch-action: auto;
}

/* 字幕互動指示 */
.subtitle-interactive {
  border: 1px dashed rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  padding: 2px;
  transition: all 0.2s ease;
}

.subtitle-interactive:hover {
  border-color: rgba(59, 130, 246, 0.6);
  background-color: rgba(59, 130, 246, 0.05);
}

/* 選取效果 */
::selection {
  background-color: rgba(59, 130, 246, 0.3);
  color: white;
}

::-moz-selection {
  background-color: rgba(59, 130, 246, 0.3);
  color: white;
}

/* 字幕動畫效果 */
.subtitle-fade-enter-active,
.subtitle-fade-leave-active {
  transition: opacity 0.2s ease;
}

.subtitle-fade-enter-from,
.subtitle-fade-leave-to {
  opacity: 0;
}
</style>
