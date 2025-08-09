# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

此檔案為 Claude Code (claude.ai/code) 在處理此專案時提供的指引。

## 專案概述

TubeTuner 是一個用於控制 YouTube 影片播放速度的 Vue 3 + TypeScript 應用程式。專案使用 Vite 作為建置工具，並使用 Pinia 進行狀態管理。

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
├── App.vue          # 根元件
├── main.ts          # 應用程式進入點（包含 PWA service worker 註冊）
├── components/      # Vue 元件
│   └── MessageBox.vue # 訊息提示框元件
├── types/           # TypeScript 型別定義
│   └── youtube.ts   # YouTube API 相關型別
├── router/          # Vue Router 設定
│   └── index.ts     # 路由設定（目前為空）
└── stores/          # Pinia 儲存
    └── counter.ts   # 範例 store（使用 composition API 風格）

layouts/
└── index.html       # 完整的 YouTube 控制器實作（舊版，原生 JavaScript + YouTube IFrame API）
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

### 狀態管理
- Pinia stores 使用 composition 風格（參考 `stores/counter.ts`）
- 使用 `defineStore` 和 setup 函式定義 stores
- 使用 `ref()` 定義狀態、`computed()` 定義 getters、一般函式定義 actions

### PWA 設定
- 應用程式配置為 PWA（Progressive Web App）
- PWA 清單設定在 `vite.config.ts` 中，包含主題顏色、圖示等
- Service Worker 自動註冊於 `main.ts`
- 支援離線使用和安裝到裝置

### YouTube 整合
- 專案目標是建立 YouTube 影片速度控制器
- `layouts/index.html` 包含完整的原生實作作為參考，使用 YouTube IFrame API
- Vue 版本正在開發中，型別定義在 `src/types/youtube.ts`
- 需要將原生 JavaScript 功能遷移到 Vue 元件架構中

## Node.js 需求
- Node.js 20.19.0+ 或 22.12.0+
- 使用 ES 模組（package.json 中設定 `"type": "module"`）

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.