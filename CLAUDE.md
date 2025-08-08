# CLAUDE.md

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

### 專案結構
```
src/
├── App.vue          # 根元件
├── main.ts          # 應用程式進入點
├── router/          # Vue Router 設定
│   └── index.ts     # 路由設定（目前為空）
└── stores/          # Pinia 儲存
    └── counter.ts   # 範例 store（使用 composition API 風格）

layouts/
└── index.html       # 完整的 YouTube 控制器實作（舊版）
```

### 關鍵設定檔
- `vite.config.ts` - Vite 設定，包含 Vue 插件和路徑別名
- `eslint.config.ts` - 扁平化 ESLint 設定，含 Vue/TypeScript 規則
- `tsconfig.app.json` - 應用程式的 TypeScript 設定
- `tsconfig.node.json` - 建置工具的 TypeScript 設定

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

### 重要背景
專案在 `layouts/index.html` 中有一個完整的 YouTube 影片速度控制器實作，使用原生 JavaScript 搭配 YouTube IFrame API。此 HTML 檔案包含完整功能，可能需要遷移到 Vue 元件中。

## Node.js 需求
- Node.js 20.19.0+ 或 22.12.0+
- 使用 ES 模組（package.json 中設定 `"type": "module"`）