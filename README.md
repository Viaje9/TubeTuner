# TubeTuner NG

進階的本機影片播放與字幕輔助工具，結合 AI 對話協助理解內容。以 Angular 19 + TypeScript 開發，搭配 Tailwind CSS 與 Angular Material，並提供安裝用的 Web App Manifest。

> 目標：快速調整播放速度、管理字幕、收藏關鍵句，並可將已選內容帶入 Gemini 對話。

## 功能特色

- 本機影片播放：支援拖放/選擇影片，播放/暫停、倍速調整、快轉/倒轉步進可調（1–60 秒）
- 字幕處理：支援 SRT 與 YouTube events 風格的 JSON 字幕，解析後提供滾動面板瀏覽
- 字幕收藏：一鍵收藏句子，清單支援刪除/清空，持久化於瀏覽器（localStorage）
- AI 對話：整合 Google Gemini（@google/genai）；可從「收藏字幕」帶入上下文，調整模型、溫度與最大 Token
- 影片資料庫：以 IndexedDB 儲存影片/字幕 Blob 與中繼資料，記錄上次播放位置與最近使用時間
- 介面設計：行動優先、不依賴 hover；底部彈出設定面板，自訂深色 Material 風格
- PWA 基礎：包含 manifest，可安裝至桌面；未啟用 service worker 快取

## 環境需求

- Node.js 20+（建議使用 LTS）
- 現代瀏覽器（Chrome/Edge 最新版）

## 安裝與啟動

```bash
npm install      # 安裝依賴
npm start        # 等同 ng serve（預設 http://localhost:4200）
```

或直接使用 Angular CLI 指令：

```bash
ng serve --host 0.0.0.0
```

## 常用指令

```bash
npm run build         # 產生生產版（輸出至 dist/angular）
npm run build:github  # 針對 GitHub Pages 設定 base-href 後建置
npm run test          # Karma + Jasmine 單元測試
npm run lint          # ESLint 檢查
npm run format        # Prettier 格式化（src/**/*.{ts,html,css,scss}）
```

## 專案結構（摘錄）

```
src/
├── app/
│   ├── views/                 # 頁面（menu、video-list、video-detail、local-video、ai-settings）
│   ├── components/            # 共享元件（ai-chat、subtitle-scroll、icons、dialog）
│   ├── services/              # 外部與資料層（genai、video-library、dialog）
│   ├── state/                 # 設定與 UI 狀態（app-state、favorites、player-preferences）
│   ├── utils/                 # 工具（srt-parser、json-subtitle-parser 等）
│   ├── app.routes.ts          # 路由定義
│   └── app.config.ts          # 應用設定（providers、動畫、路由等）
├── styles.scss                 # Tailwind 與 Material 自訂樣式
└── index.html                  # 入口（含 manifest 連結）
public/manifest.webmanifest     # PWA Web App Manifest
```

## AI 設定（Google Gemini）

- 進入「AI 設定」頁，填入 API Key（來源：Google AI Studio）
- 可重新載入可用模型並選擇預設模型（支援本地快取）
- 可調整溫度與最大輸出 Token，修改會儲存在瀏覽器 LocalStorage
- 安全性：API Key 僅存於本機瀏覽器，不會傳至伺服器

## 使用流程（建議）

1. 啟動開發伺服器後開啟 `http://localhost:4200/`
2. 於「本機影片」頁選擇影片檔（支援最大 2GB）
3. 上傳字幕（SRT 或 JSON），即可在字幕面板瀏覽
4. 播放時可使用底部控制條（倒轉/播放或暫停/快轉），並在設定面板調整倍速與步進
5. 於字幕面板「星號」收藏關鍵句
6. 開啟 AI 對話，可自動帶入已收藏句子作為上下文並開始提問

## 限制與注意事項

- 僅支援本機影片與字幕，未整合 YouTube IFrame 播放
- 目前未啟用 service worker，離線快取體驗有限
- 字幕檔案大小上限為 10MB；影片上限為 2GB
- 影片與字幕以 IndexedDB 儲存，清除瀏覽資料可能導致內容被移除

## 授權

此倉庫未明確標註授權條款，若需添加授權或貢獻指南，請提出需求。
