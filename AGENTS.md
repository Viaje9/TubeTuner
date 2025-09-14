# AGENTS.md

This file provides guidance to code agents (Claude Code, GPT‑Code, etc.) when working with this repository.

此檔案為程式代理（例如 Claude Code、GPT‑Code）在處理本專案時的工作指引。

重要：請使用繁體中文與使用者溝通，除非使用者明確要求使用英文。

## 專案概述

TubeTuner NG 是一個進階的本機影片播放器與字幕輔助工具，結合 Gemini AI 對話協助理解內容。以 Angular 19 + TypeScript 開發，採用 Tailwind CSS 與 Angular Material，並以 IndexedDB 儲存影片/字幕與中繼資料。

## 必要指令

開發與建置

```bash
npm start             # 啟動開發伺服器（等同 ng serve）
npm run build         # 生產建置（輸出 dist/angular）
npm run build:github  # 針對 GitHub Pages 設定 base-href 後建置
```

品質與測試

```bash
npm run lint       # ESLint 檢查
npm run format     # Prettier 格式化（src/**/*.{ts,html,css,scss}）
npm test           # Karma + Jasmine 測試
```

## 架構總覽

技術堆疊

- Angular 19（Standalone Components）
- TypeScript 5.7（ESM）
- Tailwind CSS 3.4 + Angular Material
- Signals 為主要狀態管理；少量 RxJS
- IndexedDB（影片與字幕儲存）
- Web App Manifest（PWA 基礎，未啟用 service worker）

專案結構（摘要）

```
src/
├── index.html
├── main.ts
├── styles.scss
└── app/
    ├── app.config.ts           # providers/動畫/路由
    ├── app.routes.ts           # 路由定義
    ├── components/             # 共用元件（icons、ai-chat、dialogs、subtitle-scroll）
    ├── services/               # genai、video-library、dialog
    ├── state/                  # app-state、favorites、player-preferences
    ├── utils/                  # srt-parser、json-subtitle-parser、uuid
    └── views/                  # menu、video-list、video-detail、local-video、ai-settings
public/manifest.webmanifest     # PWA manifest
```

關鍵設定檔

- angular.json：建置/開發設定、資產與樣式注入
- tsconfig*.json：TypeScript 設定
- styles.scss：Tailwind 與 Material 主題覆寫（含自訂底部彈窗/對話框樣式）
- tailwind.config.js：Tailwind 設定
- package.json：腳本與依賴（type: module）

## 開發模式與規範

元件與服務

- 採用 Standalone Component；新元件預設 `style: 'scss'`
- 依現有風格優先使用「建構式注入」；在函式/非建構情境可用 `inject()`
- 優先以 Angular Signals 管理 UI 狀態；必要時再引入 RxJS
- 保持檔名與目錄結構一致性（views/components/services/state/utils）

UI 設計

- 不使用 hover 效果；行動優先、可觸控友善
- 使用 Tailwind 實作樣式；Material 作為對話框/底部面板等互動容器
- 預設深色風格；沿用 `.tt-bottom-sheet`、`.tt-material-dialog` 類別覆寫

狀態與資料

- 全域/跨頁設定集中於 `AppStateService`（Signals，含 AI 設定與聊天訊息）
- 收藏資料於 `FavoritesService`（localStorage）
- 播放偏好於 `PlayerPreferencesService`（Signals + localStorage）
- 影片/字幕庫於 `VideoLibraryService`（IndexedDB）：
  - 儲存影片與字幕 Blob、影片中繼資料與上次播放位置
  - 變更 schema 或 version 前需審慎評估遷移與相容性

字幕處理

- `utils/srt-parser.ts`：SRT 解析與時間計算
- `utils/json-subtitle-parser.ts`：YouTube 事件風格 JSON 解析與 content→events 轉換
- 檔案限制：字幕 10MB、影片 2GB（與現有驗證一致）

AI 對話（Gemini）

- `GenAIService` 使用 `@google/genai`，API Key 由 `AppStateService` 管理
- 透過 `listModels()` 取得可用模型（含快取），`chatCompletion()` 進行對話
- 請勿硬編 API Key 或模型清單；尊重現有本地快取與 UI 設定流程

路由

- 入口 `/` 與 `/menu`：MenuComponent
- `/video-list`、`/video/:id`：清單與細節頁
- `/local-video`：本機影片播放（可解析字幕、收藏、AI）
- `/ai-settings`：AI 設定頁

PWA 與資產

- 僅提供 `manifest.webmanifest`；目前未啟用 service worker
- 若需離線快取或安裝支援擴充，須經需求確認後新增

## Node.js 需求

- Node.js 20+（建議 LTS）
- ESM 專案（`"type": "module"`）

## 提交訊息規範

- 使用繁體中文撰寫提交訊息（commit message）
- 採用 Conventional Commits：`feat`、`fix`、`refactor`、`docs`、`test`、`style`、`build`、`ci`、`chore`
- 主旨簡潔，必要時在內文補充影響範圍與動機
- 範例：
  - `(feat) 新增本機影片頁的快進/回退步進設定`
  - `(fix) 修正 SRT 解析在行尾時間碼的錯誤`

## 其他工作守則

- 嚴格遵守：不做未被要求的變更；小心修改現有行為
- 優先編輯既有檔案，除非確有需要才新增檔案/依賴
- 不主動啟用 service worker 或導入大型框架調整
- 保持程式碼與現有風格一致，避免過度重構

---

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

