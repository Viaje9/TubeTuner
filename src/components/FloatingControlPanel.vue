<template>
  <div>
    <!-- 展開的控制面板 -->
    <Transition name="panel">
      <div
        v-if="isExpanded"
        class="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-800 border-t border-gray-700/50 rounded-t-3xl shadow-2xl"
      >
        <!-- 頂部標籤列 -->
        <div class="flex items-center justify-between px-6 py-3 border-b border-gray-700/30">
          <!-- 標籤切換 -->
          <div class="flex gap-1">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap',
                currentTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50',
              ]"
            >
              <!-- 控制頁籤圖示 -->
              <svg
                v-if="tab.id === 'control'"
                class="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
              <!-- 載入影片頁籤圖示 -->
              <svg
                v-else-if="tab.id === 'load'"
                class="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <!-- AI 設定頁籤圖示 -->
              <svg
                v-else-if="tab.id === 'ai'"
                class="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span class="text-xs">{{ tab.name }}</span>
              <span
                v-if="tab.id === 'ai' && !aiConfig.canUseAI"
                class="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"
              ></span>
            </button>
          </div>

          <!-- 關閉按鈕 -->
          <button
            @click="collapse"
            class="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- 內容區域 -->
        <div class="h-[50vh] overflow-y-auto">
          <Transition name="tab-content" mode="out-in">
            <!-- 控制頁籤內容 -->
            <div v-if="currentTab === 'control'" key="control" class="p-6 space-y-6">
              <!-- 播放速度控制 -->
              <div class="space-y-4">
                <h3
                  class="text-white font-semibold text-center flex items-center justify-center gap-2"
                >
                  <svg
                    class="w-5 h-5 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
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
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 12H4"
                      />
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
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
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
                <h3
                  class="text-white font-semibold text-center flex items-center justify-center gap-2"
                >
                  <svg
                    class="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  時間控制
                </h3>

                <div class="flex items-center justify-center gap-3">
                  <button
                    @click="rewind"
                    :class="[
                      'bg-gray-700/50 hover:bg-gray-600/50 text-white px-5 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2',
                      rewindClicked ? 'bg-orange-600/70 scale-110 ring-2 ring-orange-300' : '',
                    ]"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                      />
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
                      forwardClicked ? 'bg-green-600/70 scale-110 ring-2 ring-green-300' : '',
                    ]"
                  >
                    快轉
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 載入影片頁籤內容 -->
            <div v-else-if="currentTab === 'load'" key="load" class="p-6 space-y-6">
              <h3
                class="text-white font-semibold text-center flex items-center justify-center gap-2"
              >
                <svg
                  class="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4"
                  />
                </svg>
                載入 YouTube 影片
              </h3>

              <div class="space-y-4">
                <!-- 輸入框 -->
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-300">YouTube 網址或影片 ID</label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="videoUrl"
                      type="text"
                      placeholder="貼上 YouTube 影片網址或影片 ID..."
                      class="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      @keyup.enter="loadVideo"
                    />
                    <button
                      @click="clearVideoInput"
                      class="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
                      title="清除"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- 操作按鈕 -->
                <div class="flex gap-2">
                  <button
                    @click="pasteFromClipboard"
                    class="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    貼上
                  </button>
                  <button
                    @click="loadVideo"
                    :disabled="!videoUrl.trim()"
                    :class="[
                      'flex-1 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2',
                      videoUrl.trim()
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed',
                    ]"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    載入影片
                  </button>
                </div>

                <!-- 說明文字 -->
                <div class="text-xs text-gray-500 text-center">
                  <p>支援 YouTube 完整網址或 11 位影片 ID</p>
                  <p>例如：https://youtube.com/watch?v=xxxxx 或 xxxxx</p>
                </div>
              </div>
            </div>

            <!-- AI 設定頁籤內容 -->
            <div v-else-if="currentTab === 'ai'" key="ai" class="p-6 space-y-6">
              <h3
                class="text-white font-semibold text-center flex items-center justify-center gap-2"
              >
                <svg
                  class="w-5 h-5 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                AI 助手設定
              </h3>

              <!-- API Key 設定 -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-300">OpenRouter API Key</label>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    取得 API Key
                  </a>
                </div>
                <div class="relative">
                  <input
                    v-model="localApiKey"
                    :type="showApiKey ? 'text' : 'password'"
                    placeholder="請輸入您的 OpenRouter API Key..."
                    class="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    @input="clearError"
                  />
                  <button
                    @click="showApiKey = !showApiKey"
                    type="button"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <svg
                      v-if="showApiKey"
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  </button>
                </div>
                <p class="text-xs text-gray-500">
                  API Key 僅保存在您的瀏覽器中，不會發送到任何第三方伺服器
                </p>
              </div>

              <!-- 錯誤訊息 -->
              <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p class="text-red-400 text-sm">{{ error }}</p>
              </div>

              <!-- 成功訊息 -->
              <div
                v-if="aiConfig.isConfigured"
                class="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
              >
                <p class="text-green-400 text-sm flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  AI 助手已成功設定！
                </p>
              </div>

              <!-- 操作按鈕 -->
              <div class="flex gap-2">
                <button
                  v-if="aiConfig.isConfigured"
                  @click="resetAISettings"
                  class="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition-all text-sm font-medium"
                >
                  重置設定
                </button>
                <button
                  @click="saveAISettings"
                  :disabled="isSavingAI || !localApiKey.trim()"
                  :class="[
                    'flex-1 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                    isSavingAI || !localApiKey.trim()
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
                  ]"
                >
                  {{ isSavingAI ? '驗證中...' : aiConfig.isConfigured ? '更新設定' : '儲存設定' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

    <!-- 背景遮罩 -->
    <Transition name="backdrop">
      <div v-if="isExpanded" @click="collapse" class="fixed inset-0 bg-black/0 z-40"></div>
    </Transition>

    <!-- 底部固定輸入框 -->
    <div
      class="fixed inset-x-0 z-40 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-800 border-t border-gray-700/50"
      style="bottom: var(--keyboard-height, 0px)"
    >
      <!-- 水平播放控制條 -->
      <div class="flex items-center px-6 py-3 border-b border-gray-700/30">
        <!-- 左側：快速後退 -->
        <div class="flex-1 flex justify-start">
          <button
            @click="rewind"
            :class="[
              'flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 shadow-lg',
              'bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white',
              'hover:scale-110 active:scale-95',
              rewindClicked ? 'animate-pulse scale-125 ring-2 ring-orange-300' : '',
            ]"
            :title="`後退 ${seekSeconds} 秒`"
          >
            <div class="flex flex-col items-center">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"
                />
              </svg>
              <span class="text-xs font-bold leading-tight">-{{ seekSeconds }}</span>
            </div>
          </button>
        </div>

        <!-- 中央：播放/暫停 -->
        <div class="flex justify-center">
          <button
            @click="togglePlayPause"
            class="flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:scale-110 active:scale-95"
            :title="isPlaying ? '暫停' : '播放'"
          >
            <!-- 播放圖示 -->
            <svg v-if="!isPlaying" class="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
              />
            </svg>
            <!-- 暫停圖示 -->
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z"
              />
            </svg>
          </button>
        </div>

        <!-- 右側：快速前進 -->
        <div class="flex-1 flex justify-end">
          <button
            @click="forward"
            :class="[
              'flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 shadow-lg',
              'bg-gradient-to-br from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white',
              'hover:scale-110 active:scale-95',
              forwardClicked ? 'animate-pulse scale-125 ring-2 ring-green-300' : '',
            ]"
            :title="`前進 ${seekSeconds} 秒`"
          >
            <div class="flex flex-col items-center">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"
                />
              </svg>
              <span class="text-xs font-bold leading-tight">+{{ seekSeconds }}</span>
            </div>
          </button>
        </div>
      </div>

      <div class="p-4">
        <!-- AI 未設定時的提示 -->
        <div v-if="!aiConfig.canUseAI" class="text-center text-gray-500 text-sm mb-3">
          設定完成後即可開始與 AI 對話
        </div>

        <div class="flex gap-3">
          <input
            v-model="chatMessage"
            @keydown="handleKeydown"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
            @click="handleInputClick"
            :disabled="chat.isLoading"
            :readonly="!aiConfig.canUseAI"
            type="text"
            :placeholder="
              aiConfig.canUseAI ? '向 AI 詢問影片相關問題 (Ctrl+Enter 送出)...' : '點擊設定 AI 助手'
            "
            data-dialog-input="true"
            :class="[
              'flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
              !aiConfig.canUseAI ? 'cursor-pointer hover:bg-gray-700/70' : '',
              chat.isLoading ? 'opacity-50 cursor-not-allowed' : '',
            ]"
          />
          <button
            @click="sendChatMessage"
            :disabled="!aiConfig.canUseAI || chat.isLoading || !chatMessage.trim()"
            :class="[
              'px-6 py-3 rounded-lg transition-all flex items-center gap-2',
              !aiConfig.canUseAI || chat.isLoading || !chatMessage.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105',
            ]"
          >
            <svg v-if="chat.isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAIConfigStore } from '@/stores/aiConfig'
import { useChatStore } from '@/stores/chat'
import { LocalStorageService } from '@/services/localStorage'

interface Props {
  player: {
    setPlaybackRate?: (rate: number) => void
    getCurrentTime?: () => number
    seekTo?: (time: number, allowSeekAhead: boolean) => void
    togglePlayPause?: () => void
    loadVideo?: (url: string) => boolean
    isPlaying?: { value: boolean }
    currentVideoId?: { value: string }
  }
}

const props = defineProps<Props>()
const emit = defineEmits([
  'speed-changed',
  'seeked',
  'error',
  'play-state-changed',
  'video-loaded',
  'input-focused',
  'input-blurred',
])

// Stores
const aiConfig = useAIConfigStore()
const chat = useChatStore()

// 頁籤系統
const currentTab = ref('control')
const tabs = [
  {
    id: 'control',
    name: '控制',
    icon: 'control-icon',
  },
  {
    id: 'load',
    name: '載入影片',
    icon: 'video-icon',
  },
  {
    id: 'ai',
    name: 'AI 設定',
    icon: 'ai-icon',
  },
]

// 狀態
const isExpanded = ref(false)

// 從 localStorage 恢復設定
const savedState = LocalStorageService.getPlaybackState()
const speed = ref(savedState.playbackRate || 1)
const seekSeconds = ref(savedState.seekSeconds || 10)
const speedPresets = [0.5, 1, 1.5, 2]
const chatMessage = ref('')
const isPlaying = ref(false)

// 載入影片相關狀態
const videoUrl = ref('https://www.youtube.com/watch?v=6XIPkMFZf-0')

// AI 設定相關狀態
const localApiKey = ref('')
const showApiKey = ref(false)
const isSavingAI = ref(false)
const error = ref('')

// 點擊反饋狀態
const forwardClicked = ref(false)
const rewindClicked = ref(false)

// 計算屬性
const currentSpeed = computed(() => {
  const formatted = speed.value.toFixed(1)
  return formatted.replace(/\.0$/, '')
})

// 更新 YouTube 上下文
const updateYouTubeContext = () => {
  if (props.player?.getCurrentTime) {
    chat.setYouTubeContext({
      currentTime: props.player.getCurrentTime(),
      playbackRate: speed.value,
    })
  }
}

// 初始化
onMounted(() => {
  aiConfig.loadFromStorage()
  localApiKey.value = aiConfig.apiKey
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
  { immediate: true },
)

// 監聽影片變化
watch(
  () => props.player?.currentVideoId?.value,
  () => {
    updateYouTubeContext()
  },
)

// 監聽 seekSeconds 變化並保存
watch(seekSeconds, (newValue) => {
  LocalStorageService.savePlaybackState({ seekSeconds: newValue })
})

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
  if (speed.value > 0.1) {
    speed.value = Math.max(0.1, Math.round((speed.value - 0.1) * 10) / 10)
    updateSpeed()
  }
}

const increaseSpeed = () => {
  if (speed.value < 2) {
    speed.value = Math.min(2, Math.round((speed.value + 0.1) * 10) / 10)
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

// 中文輸入法狀態追蹤
const isComposing = ref(false)

// 輸入法事件處理
const handleCompositionStart = () => {
  isComposing.value = true
}

const handleCompositionEnd = () => {
  isComposing.value = false
}

// 輸入框焦點和點擊事件處理
const handleInputFocus = () => {
  emit('input-focused')
}

const handleInputClick = () => {
  // 如果 AI 還沒設定，自動切換到 AI 設定頁籤並展開控制面板
  if (!aiConfig.canUseAI) {
    currentTab.value = 'ai'
    isExpanded.value = true
  }
}

const handleInputBlur = () => {
  emit('input-blurred')
}

// 鍵盤事件處理
const handleKeydown = (event: KeyboardEvent) => {
  // 如果正在使用中文輸入法選字，不處理 Enter 鍵
  if (isComposing.value) return

  // 只有在按下 Ctrl+Enter 或 Cmd+Enter 時才發送訊息
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    sendChatMessage()
  }
  // 防止單獨的 Enter 鍵觸發事件
  else if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()
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

// 載入影片功能
const loadVideo = () => {
  if (!videoUrl.value.trim()) {
    emit('error', '請輸入 YouTube 影片網址或 ID')
    return
  }

  // 從 URL 提取影片 ID 或直接使用 ID
  const videoId = extractVideoId(videoUrl.value)
  if (videoId && props.player?.loadVideo) {
    const success = props.player.loadVideo(videoUrl.value)
    if (success) {
      emit('video-loaded', videoId)
      collapse() // 載入成功後關閉面板
    }
  } else {
    emit('error', '無法識別的 YouTube 網址')
  }
}

const extractVideoId = (urlOrId: string): string | null => {
  // 如果是純 ID（11 個字符）
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId
  }

  // 從 URL 提取 ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = urlOrId.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

const clearVideoInput = () => {
  videoUrl.value = ''
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    videoUrl.value = text
  } catch {
    emit('error', '無法存取剪貼簿，請手動貼上')
  }
}

// AI 設定功能
const clearError = () => {
  error.value = ''
}

const saveAISettings = async () => {
  if (!localApiKey.value.trim()) return

  isSavingAI.value = true
  error.value = ''

  try {
    await aiConfig.setApiKey(localApiKey.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '設定失敗'
  } finally {
    isSavingAI.value = false
  }
}

const resetAISettings = () => {
  if (confirm('確定要重置所有 AI 設定嗎？這將清除您的 API Key 和所有自訂設定。')) {
    aiConfig.resetConfig()
    localApiKey.value = ''
    showApiKey.value = false
    error.value = ''
  }
}

// 暴露給父元件的方法
defineExpose({
  expand,
  collapse,
})

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

/* 頁籤內容切換動畫 */
.tab-content-enter-active,
.tab-content-leave-active {
  transition: all 0.2s ease;
}

.tab-content-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.tab-content-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
