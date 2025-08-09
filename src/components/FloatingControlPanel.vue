<template>
  <div>
    <!-- AI 設定模態框 -->
    <AISettingsModal :show="showAISettings" @close="showAISettings = false" />

    <!-- 浮動按鈕（收合狀態） -->
    <Transition name="float-button">
      <button
        v-if="!isExpanded"
        @click="expand"
        class="fixed bottom-32 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-110 px-6 py-4 font-bold text-lg"
      >
        {{ currentSpeed }}x
      </button>
    </Transition>

    <!-- 展開的控制面板 -->
    <Transition name="panel">
      <div
        v-if="isExpanded"
        class="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-800 border-t border-gray-700/50 rounded-t-3xl shadow-2xl"
      >
        <!-- 頂部標籤列 -->
        <div class="flex items-center justify-between px-6 py-3 border-b border-gray-700/30">
          <!-- 標籤切換 -->
          <div class="flex gap-1 bg-gray-700/30 p-1 rounded-lg">
            <button
              @click="activeTab = 'controls'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-all',
                activeTab === 'controls'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
              ]"
            >
              控制
            </button>
            <button
              @click="activeTab = 'chat'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              AI 助手
              <span v-if="!aiConfig.canUseAI" class="w-2 h-2 bg-orange-400 rounded-full"></span>
            </button>
          </div>

          <!-- 關閉按鈕 -->
          <button
            @click="collapse"
            class="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 內容區域 -->
        <div class="max-h-[60vh] overflow-y-auto">
          <!-- 控制標籤內容 -->
          <div v-show="activeTab === 'controls'" class="p-6 space-y-6">
            <!-- 播放速度控制 -->
            <div class="space-y-4">
              <h3 class="text-white font-semibold text-center flex items-center justify-center gap-2">
                <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                播放速度
              </h3>

              <!-- 速度滑桿 -->
              <div class="flex items-center gap-4">
                <button
                  @click="decreaseSpeed"
                  class="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-all"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>

                <div class="flex-1 relative">
                  <input
                    type="range"
                    v-model="speed"
                    @input="updateSpeed"
                    min="0.25"
                    max="2"
                    step="0.25"
                    class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div class="flex justify-between mt-2">
                    <span class="text-xs text-gray-500">0.25x</span>
                    <span class="text-sm font-bold text-blue-400">{{ currentSpeed }}x</span>
                    <span class="text-xs text-gray-500">2x</span>
                  </div>
                </div>

                <button
                  @click="increaseSpeed"
                  class="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-all"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <!-- 快速選擇按鈕 -->
              <div class="flex gap-2 justify-center">
                <button
                  v-for="preset in speedPresets"
                  :key="preset"
                  @click="setSpeed(preset)"
                  :class="[
                    'px-4 py-2 rounded-lg font-medium transition-all',
                    speed == preset
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white',
                  ]"
                >
                  {{ preset === 1 ? '正常' : `${preset}x` }}
                </button>
              </div>
            </div>

            <!-- 時間控制 -->
            <div class="space-y-4">
              <h3 class="text-white font-semibold text-center flex items-center justify-center gap-2">
                <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                時間控制
              </h3>

              <div class="flex items-center justify-center gap-3">
                <button
                  @click="rewind"
                  :class="[
                    'bg-gray-700/50 hover:bg-gray-600/50 text-white px-5 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2',
                    rewindClicked ? 'bg-orange-600/70 scale-110 ring-2 ring-orange-300' : ''
                  ]"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                  </svg>
                  倒轉
                </button>

                <input
                  v-model="seekSeconds"
                  type="number"
                  class="w-20 text-center bg-gray-700/50 border border-gray-600 rounded-lg py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <span class="text-gray-400">秒</span>

                <button
                  @click="forward"
                  :class="[
                    'bg-gray-700/50 hover:bg-gray-600/50 text-white px-5 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2',
                    forwardClicked ? 'bg-green-600/70 scale-110 ring-2 ring-green-300' : ''
                  ]"
                >
                  快轉
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- AI 聊天標籤內容 -->
          <div v-show="activeTab === 'chat'" class="flex flex-col h-full">
            <!-- AI 未設定時的提示 -->
            <div v-if="!aiConfig.canUseAI" class="p-6 text-center">
              <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-white mb-2">AI 助手未設定</h3>
                <p class="text-gray-400 mb-4 text-sm">
                  設定 OpenRouter API Key 來啟用 AI 助手功能<br>
                  可與 AI 討論 YouTube 影片內容
                </p>
                <button
                  @click="showAISettings = true"
                  class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all hover:scale-105"
                >
                  立即設定
                </button>
              </div>
            </div>

            <!-- AI 已設定時的聊天介面 -->
            <div v-else class="flex flex-col h-full min-h-[400px]">
              <!-- 聊天標題列 -->
              <div class="px-6 py-4 border-b border-gray-700/30 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span class="text-white font-medium">{{ aiConfig.currentModel?.name }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="showAISettings = true"
                    class="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
                    title="AI 設定"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    v-if="chat.conversationHistory.length > 0"
                    @click="clearChat"
                    class="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
                    title="清除對話"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 聊天訊息區域 -->
              <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
                <div v-if="chat.conversationHistory.length === 0" class="text-center text-gray-500 py-8">
                  <svg class="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>開始與 AI 討論影片內容吧！</p>
                </div>

                <!-- 聊天訊息 -->
                <div
                  v-for="message in chat.conversationHistory"
                  :key="message.id"
                  :class="[
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  ]"
                >
                  <!-- AI 頭像 -->
                  <div v-if="message.role === 'assistant'" class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <!-- 訊息氣泡 -->
                  <div
                    :class="[
                      'max-w-[80%] rounded-lg px-4 py-2',
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-gray-700/50 text-white border border-gray-600'
                    ]"
                  >
                    <div v-if="message.isLoading" class="flex items-center gap-2">
                      <div class="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                      <span class="text-sm text-gray-400">思考中...</span>
                    </div>
                    <div v-else-if="message.error" class="text-red-400">
                      {{ message.content }}
                      <button
                        @click="retryMessage"
                        class="block mt-2 text-xs text-red-300 hover:text-red-200 underline"
                      >
                        重試
                      </button>
                    </div>
                    <div v-else v-html="renderMarkdown(message.content)" class="prose prose-invert prose-sm max-w-none"></div>
                  </div>

                  <!-- 使用者頭像 -->
                  <div v-if="message.role === 'user'" class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- 聊天輸入區域 -->
              <div class="p-4 border-t border-gray-700/30">
                <div class="flex gap-3">
                  <input
                    v-model="chatMessage"
                    @keydown.enter="sendChatMessage"
                    :disabled="chat.isLoading"
                    type="text"
                    placeholder="向 AI 詢問影片相關問題..."
                    data-dialog-input="true"
                    class="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    @click="sendChatMessage"
                    :disabled="chat.isLoading || !chatMessage.trim()"
                    :class="[
                      'px-6 py-3 rounded-lg transition-all flex items-center gap-2',
                      chat.isLoading || !chatMessage.trim()
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105'
                    ]"
                  >
                    <svg v-if="chat.isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {{ chat.isLoading ? '發送中' : '發送' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 背景遮罩 -->
    <Transition name="backdrop">
      <div v-if="isExpanded" @click="collapse" class="fixed inset-0 bg-black/0 z-40"></div>
    </Transition>

    <!-- 播放控制按鈕（左下角） -->
    <div 
      class="fixed left-6 z-40"
      style="bottom: calc(8rem + var(--keyboard-height, 0px) - min(var(--keyboard-height, 0px), 2rem))"
    >
      <button
        @click="togglePlayPause"
        class="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform shadow-lg hover:scale-110 active:scale-95 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/30"
      >
        <!-- 播放圖示 -->
        <svg v-if="!isPlaying" class="w-7 h-7 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
        <!-- 暫停圖示 -->
        <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
        </svg>
      </button>
    </div>

    <!-- 快速跳躍按鈕（速度按鈕上方） -->
    <div class="fixed bottom-52 right-6 z-40 flex flex-col gap-3">
      <!-- 快速前進按鈕 -->
      <button
        @click="forward"
        :class="[
          'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 transform shadow-lg hover:scale-110 active:scale-95 bg-gradient-to-br from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-green-500/30',
          forwardClicked ? 'animate-pulse scale-125 ring-4 ring-green-300 bg-gradient-to-br from-green-400 to-teal-500' : ''
        ]"
      >
        <div class="flex flex-col items-center">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
          </svg>
          <span class="text-xs font-bold">+{{ seekSeconds }}</span>
        </div>
      </button>

      <!-- 快速後退按鈕 -->
      <button
        @click="rewind"
        :class="[
          'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 transform shadow-lg hover:scale-110 active:scale-95 bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-orange-500/30',
          rewindClicked ? 'animate-pulse scale-125 ring-4 ring-orange-300 bg-gradient-to-br from-orange-400 to-red-500' : ''
        ]"
      >
        <div class="flex flex-col items-center">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
          </svg>
          <span class="text-xs font-bold">-{{ seekSeconds }}</span>
        </div>
      </button>
    </div>

    <!-- 底部固定輸入框 -->
    <div
      class="fixed inset-x-0 z-40 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-800 border-t border-gray-700/50"
      style="bottom: var(--keyboard-height, 0px)"
    >
      <div class="p-4">
        <!-- AI 未設定時的提示 -->
        <div v-if="!aiConfig.canUseAI" class="text-center text-gray-500 text-sm mb-3">
          <button
            @click="showAISettings = true"
            class="text-blue-400 hover:text-blue-300 underline"
          >
            設定 AI 助手
          </button>
          來啟用智能對話功能
        </div>

        <div class="flex gap-3">
          <input
            v-model="chatMessage"
            @keydown.enter="sendChatMessage"
            :disabled="!aiConfig.canUseAI || chat.isLoading"
            type="text"
            :placeholder="aiConfig.canUseAI ? '向 AI 詢問影片相關問題...' : '請先設定 AI 助手'"
            data-dialog-input="true"
            class="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            @click="sendChatMessage"
            :disabled="!aiConfig.canUseAI || chat.isLoading || !chatMessage.trim()"
            :class="[
              'px-6 py-3 rounded-lg transition-all flex items-center gap-2',
              !aiConfig.canUseAI || chat.isLoading || !chatMessage.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105'
            ]"
          >
            <svg v-if="chat.isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            {{ chat.isLoading ? '發送中' : '發送' }}
          </button>
        </div>

        <!-- 最近一條 AI 回應預覽 -->
        <div v-if="latestAIResponse" class="mt-3 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-gray-300 truncate">{{ latestAIResponse }}</div>
              <button
                @click="expandChatPanel"
                class="text-xs text-blue-400 hover:text-blue-300 mt-1"
              >
                查看完整對話
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import AISettingsModal from './AISettingsModal.vue'
import { useAIConfigStore } from '@/stores/aiConfig'
import { useChatStore } from '@/stores/chat'
import { renderMarkdown } from '@/utils/markdown'

interface Props {
  player: {
    setPlaybackRate?: (rate: number) => void
    getCurrentTime?: () => number
    seekTo?: (time: number, allowSeekAhead: boolean) => void
    togglePlayPause?: () => void
    isPlaying?: { value: boolean }
    currentVideoId?: { value: string }
  }
}

const props = defineProps<Props>()
const emit = defineEmits(['speed-changed', 'seeked', 'error', 'play-state-changed'])

// Stores
const aiConfig = useAIConfigStore()
const chat = useChatStore()

// 狀態
const isExpanded = ref(false)
const activeTab = ref('controls')
const speed = ref(1)
const seekSeconds = ref(10)
const speedPresets = [0.5, 1, 1.5, 2]
const chatMessage = ref('')
const isPlaying = ref(false)
const showAISettings = ref(false)
const messagesContainer = ref<HTMLElement>()

// 點擊反饋狀態
const forwardClicked = ref(false)
const rewindClicked = ref(false)

// 計算屬性
const currentSpeed = computed(() => speed.value.toFixed(2).replace(/\.00$/, ''))

// 最新 AI 回應
const latestAIResponse = computed(() => {
  const lastAssistantMessage = chat.conversationHistory
    .slice()
    .reverse()
    .find(msg => msg.role === 'assistant' && !msg.isLoading && !msg.error)
  
  if (!lastAssistantMessage) return ''
  
  // 去除 Markdown 標記並截取前 100 字符
  const plainText = lastAssistantMessage.content
    .replace(/```[\s\S]*?```/g, '[程式碼]')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim()
  
  return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText
})

// 更新 YouTube 上下文
const updateYouTubeContext = () => {
  if (props.player?.getCurrentTime) {
    chat.setYouTubeContext({
      currentTime: props.player.getCurrentTime(),
      playbackRate: speed.value
      // 這裡可以添加更多上下文信息，如影片標題等
    })
  }
}

// 滾動到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 初始化
onMounted(() => {
  aiConfig.loadFromStorage()
  updateYouTubeContext()
})

// 監聽播放狀態變化
watch(
  () => props.player?.isPlaying?.value,
  (newValue) => {
    if (newValue !== undefined) {
      isPlaying.value = newValue
      updateYouTubeContext()
    }
  },
  { immediate: true }
)

// 監聽影片變化
watch(
  () => props.player?.currentVideoId?.value,
  () => {
    updateYouTubeContext()
  }
)

// 監聽聊天訊息，自動滾動到底部
watch(
  () => chat.conversationHistory.length,
  async () => {
    await nextTick()
    scrollToBottom()
  }
)

// 面板控制
const expand = () => {
  isExpanded.value = true
}

const collapse = () => {
  isExpanded.value = false
}

// 播放控制
const updateSpeed = () => {
  if (props.player?.setPlaybackRate) {
    props.player.setPlaybackRate(speed.value)
    emit('speed-changed', speed.value)
    updateYouTubeContext()
  }
}

const setSpeed = (newSpeed: number) => {
  speed.value = newSpeed
  updateSpeed()
}

const decreaseSpeed = () => {
  if (speed.value > 0.25) {
    speed.value = Math.max(0.25, speed.value - 0.25)
    updateSpeed()
  }
}

const increaseSpeed = () => {
  if (speed.value < 2) {
    speed.value = Math.min(2, speed.value + 0.25)
    updateSpeed()
  }
}

const forward = () => {
  if (props.player?.getCurrentTime && props.player?.seekTo) {
    const currentTime = props.player.getCurrentTime()
    props.player.seekTo(currentTime + seekSeconds.value, true)
    emit('seeked', seekSeconds.value)
    updateYouTubeContext()
    
    // 觸發點擊反饋動畫
    forwardClicked.value = true
    setTimeout(() => {
      forwardClicked.value = false
    }, 200)
  }
}

const rewind = () => {
  if (props.player?.getCurrentTime && props.player?.seekTo) {
    const currentTime = props.player.getCurrentTime()
    props.player.seekTo(Math.max(0, currentTime - seekSeconds.value), true)
    emit('seeked', -seekSeconds.value)
    updateYouTubeContext()
    
    // 觸發點擊反饋動畫
    rewindClicked.value = true
    setTimeout(() => {
      rewindClicked.value = false
    }, 200)
  }
}

const togglePlayPause = () => {
  if (props.player?.togglePlayPause) {
    props.player.togglePlayPause()
    emit('play-state-changed', !isPlaying.value)
  } else {
    emit('error', '播放器尚未準備好')
  }
}

// AI 聊天功能
const sendChatMessage = async () => {
  if (!chatMessage.value.trim() || !chat.canSendMessage) return

  const message = chatMessage.value.trim()
  chatMessage.value = ''
  
  // 確保有最新的 YouTube 上下文
  updateYouTubeContext()

  try {
    await chat.sendMessage(message)
  } catch (error) {
    console.error('發送訊息失敗:', error)
  }
}

const retryMessage = async () => {
  try {
    await chat.resendLastMessage()
  } catch (error) {
    console.error('重試訊息失敗:', error)
  }
}

const clearChat = () => {
  if (confirm('確定要清除所有對話記錄嗎？')) {
    chat.clearHistory()
  }
}

// 展開聊天面板
const expandChatPanel = () => {
  isExpanded.value = true
  activeTab.value = 'chat'
}

// 清理
onUnmounted(() => {
  // 清理相關資源
})
</script>

<style scoped>
/* 自定義滑桿樣式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.5);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.5);
}

/* 動畫 */
.float-button-enter-active,
.float-button-leave-active {
  transition: all 0.3s ease;
}

.float-button-enter-from,
.float-button-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.panel-enter-active,
.panel-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-enter-from,
.panel-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>