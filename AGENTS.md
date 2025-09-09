# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

此檔案為 Claude Code (claude.ai/code) 在處理此專案時提供的指引。

**重要：請使用繁體中文與使用者溝通，除非使用者明確要求使用英文。**

## 專案概述

TubeTuner 是一個先進的 YouTube 影片速度控制器，結合了 AI 聊天功能的 Vue 3 + TypeScript PWA 應用程式。專案使用 Vite 作為建置工具，Pinia 進行狀態管理，並整合 OpenRouter AI API 提供影片內容討論功能。

## 必要指令

### 開發
```bash
npm run dev          # 啟動開發伺服器 (Vite)
npm run build        # 生產環境建置（含型別檢查）
npm run preview      # 本地預覽生產版本
```

### 程式碼品質
```bash
npm run lint         # 執行 ESLint 並自動修復
npm run format       # 使用 Prettier 格式化程式碼 (src/ 目錄)
npm run type-check   # 使用 vue-tsc 檢查 TypeScript 型別
```

### 建置變體
```bash
npm run build-only   # 建置但不檢查型別（較快）
```

## 架構總覽

### 技術堆疊
- **Vue 3.5** 搭配 Composition API (`<script setup>`)
- **TypeScript 5.8** 嚴格型別檢查
- **Vite 7** 用於開發和建置
- **Pinia** 狀態管理
- **Vue Router 4** 路由管理（已設定但尚未定義路由）
- **TailwindCSS 4** 用於樣式設計
- **PWA** 支援（使用 vite-plugin-pwa）

### 專案結構
```
src/
├── App.vue                    # 根元件（Router 出口）
├── main.ts                    # 應用程式進入點（包含 PWA service worker 註冊）
├── app.css                    # 全域樣式
├── components/                # Vue 元件
│   ├── MessageBox.vue         # 訊息提示框元件
│   ├── YouTubePlayer.vue      # YouTube 播放器主元件
│   ├── FloatingControlPanel.vue # 浮動控制面板
│   └── AISettingsModal.vue    # AI 設定模態框
├── composables/               # Vue 組合式函數
│   └── useYouTubePlayer.ts    # YouTube 播放器邏輯封裝
├── services/                  # 外部服務整合
│   └── openrouter.ts          # OpenRouter AI API 服務
├── stores/                    # Pinia 狀態管理
│   ├── aiConfig.ts            # AI 設定 store
│   ├── chat.ts                # 聊天記錄 store
│   ├── favorites.ts           # 字幕收藏功能 store
│   └── counter.ts             # 範例 store（使用 composition API 風格）
├── types/                     # TypeScript 型別定義
│   └── youtube.ts             # YouTube API 相關型別
├── utils/                     # 工具函數
│   └── markdown.ts            # Markdown 處理工具
├── views/                     # 頁面元件
│   ├── HomeView.vue           # 主頁面
│   ├── LocalVideoView.vue     # 本地影片播放頁面
│   ├── MenuView.vue           # 主選單頁面
│   ├── AISettingsView.vue     # AI 設定頁面
│   └── FavoritesView.vue      # 收藏字幕列表頁面
└── router/                    # Vue Router 設定
    └── index.ts               # 路由設定

layouts/
└── index.html                 # 完整的 YouTube 控制器實作（舊版參考，原生 JavaScript）
```

### 關鍵設定檔
- `vite.config.ts` - Vite 設定，包含 Vue 插件、路徑別名、TailwindCSS 和 PWA 設定
- `eslint.config.ts` - 扁平化 ESLint 設定，含 Vue/TypeScript 規則
- `tsconfig.app.json` - 應用程式的 TypeScript 設定
- `tsconfig.node.json` - 建置工具的 TypeScript 設定
- `package.json` - 依賴管理和腳本定義（使用 ES 模組）

### 路徑別名
- `@/*` 映射到 `./src/*`（在 Vite 和 TypeScript 都有設定）

## 開發模式

### 元件開發
- 使用單檔元件 (.vue) 搭配 TypeScript
- 優先使用 `<script setup lang="ts">` 語法
- 元件應使用 Composition API

### UI 設計規範
- **不使用 hover 樣式**：專案設計為避免使用 hover 效果，確保在觸控裝置上的一致體驗
- 所有互動元件應保持靜態視覺狀態，不依賴滑鼠懸停效果
- 按鈕和互動元素應始終可見和可操作

### 狀態管理
- Pinia stores 使用 composition 風格（參考 `stores/counter.ts`）
- 使用 `defineStore` 和 setup 函式定義 stores
- 使用 `ref()` 定義狀態、`computed()` 定義 getters、一般函式定義 actions
- 重要 stores：
  - `aiConfig.ts` - AI API 設定（金鑰、模型、參數）
  - `chat.ts` - 聊天記錄和 AI 對話狀態
  - `favorites.ts` - 字幕收藏功能，支援 localStorage 持久化儲存

### PWA 設定
- 應用程式配置為 PWA（Progressive Web App）
- PWA 清單設定在 `vite.config.ts` 中，包含主題顏色、圖示等
- Service Worker 自動註冊於 `main.ts`
- 支援離線使用和安裝到裝置

### YouTube 整合
- 使用 YouTube IFrame API 進行影片控制
- `useYouTubePlayer.ts` 組合式函數封裝播放器邏輯
- `YouTubePlayer.vue` 主要播放器元件，支援影片載入、速度控制、播放/暫停
- `FloatingControlPanel.vue` 提供浮動式快速控制介面
- 型別定義在 `src/types/youtube.ts`

### AI 聊天功能
- 整合 OpenRouter API 提供多種 AI 模型選擇
- `aiConfig.ts` store 管理 API 金鑰、模型選擇、溫度等設定
- `chat.ts` store 處理聊天記錄和對話狀態
- `AISettingsModal.vue` 提供 AI 設定介面
- 支援與 YouTube 影片內容相關的 AI 對話

### 字幕收藏功能
- `SubtitleScrollPanel.vue` 元件提供字幕收藏按鈕（星號圖示）
- `favorites.ts` store 管理收藏的字幕，支援 localStorage 持久化
- `FavoritesView.vue` 顯示收藏列表，支援刪除和清空功能
- 收藏資料包含句子內容、時間範圍、影片 ID 和收藏時間戳記

## 重要架構模式

### 組合式函數模式
- `useYouTubePlayer.ts` 示範了如何將複雜的 YouTube API 邏輯封裝成可重用的組合式函數
- 處理 YouTube IFrame API 的載入、播放器初始化、狀態管理
- 提供響應式的播放器狀態（isReady, isPlaying, playbackRate）

### 服務層架構
- `services/openrouter.ts` 封裝第三方 API 呼叫邏輯
- 提供型別安全的 API 介面和錯誤處理
- 支援多種 AI 模型的統一介面

### 元件間通訊
- 使用 Pinia stores 進行跨元件狀態共享
- 透過 props/emit 進行父子元件通訊
- 組合式函數提供邏輯共享機制

## 開發注意事項

### 外部 API 整合
- YouTube IFrame API 需要全域載入，在 `useYouTubePlayer.ts` 中處理載入邏輯
- OpenRouter API 需要 API 金鑰，透過 `aiConfig.ts` store 管理
- 所有 API 呼叫都應包含適當的錯誤處理和載入狀態

### 型別安全
- YouTube API 相關型別定義在 `src/types/youtube.ts`
- OpenRouter API 型別定義在 `services/openrouter.ts`
- 嚴格的 TypeScript 設定確保型別安全

## Node.js 需求
- Node.js 20.19.0+ 或 22.12.0+
- 使用 ES 模組（package.json 中設定 `"type": "module"`）

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.