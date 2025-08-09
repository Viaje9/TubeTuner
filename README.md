# 🎬 TubeTuner

TubeTuner 是一個先進的 YouTube 影片速度控制器，結合了 AI 聊天功能的漸進式網頁應用程式（PWA）。使用 Vue 3 + TypeScript 構建，提供直觀的影片控制介面和智慧對話體驗。

![TubeTuner Interface](screenshots/截圖%202025-08-09%20下午5.26.20.jpeg)

## ✨ 主要功能

- 🎮 **YouTube 影片控制** - 完整的播放、暫停、速度調整功能
- 🤖 **AI 智慧聊天** - 整合 OpenRouter API，支援多種 AI 模型與影片內容相關的討論
- 📱 **響應式設計** - 完美適配桌面和行動裝置
- ⚡ **PWA 支援** - 可安裝到裝置，支援離線使用
- 🎯 **浮動控制面板** - 便捷的懸浮式快速控制介面
- 🔧 **靈活配置** - 自訂 AI 設定、溫度參數等

![Mobile Interface](screenshots/截圖%202025-08-09%20下午4.10.39.jpeg)

## 🛠️ 技術棧

### 核心技術
- **前端框架**: Vue 3.5 + Composition API
- **程式語言**: TypeScript 5.8
- **建置工具**: Vite 7
- **狀態管理**: Pinia
- **路由管理**: Vue Router 4
- **樣式框架**: TailwindCSS 4

### 整合服務
- **YouTube API**: 影片播放和控制
- **OpenRouter API**: 多模型 AI 聊天服務
- **PWA**: 離線支援和應用程式安裝

### 開發工具
- **程式碼品質**: ESLint + Prettier
- **型別檢查**: Vue TSC
- **開發體驗**: Vite DevTools

## 🚀 快速開始

### 環境需求
- Node.js 20.19.0+ 或 22.12.0+
- npm 或 yarn

### 安裝

```bash
# 複製專案
git clone https://github.com/Viaje9/TubeTuner.git
cd TubeTuner

# 安裝依賴
npm install
```

### 開發

```bash
# 啟動開發伺服器
npm run dev

# 在瀏覽器中開啟 http://localhost:5173
```

### 建置

```bash
# 型別檢查並建置生產版本
npm run build

# 僅建置（不進行型別檢查）
npm run build-only

# 預覽生產版本
npm run preview
```

### 程式碼品質

```bash
# 執行 linter 並自動修復
npm run lint

# 格式化程式碼
npm run format

# 型別檢查
npm run type-check
```

## 📁 專案架構

```
src/
├── components/                # Vue 元件
│   ├── YouTubePlayer.vue      # YouTube 播放器主元件
│   ├── FloatingControlPanel.vue # 浮動控制面板
│   ├── AISettingsModal.vue    # AI 設定模態框
│   ├── ChatHistory.vue        # 聊天記錄元件
│   └── MessageBox.vue         # 訊息提示框元件
├── composables/               # 組合式函數
│   └── useYouTubePlayer.ts    # YouTube 播放器邏輯封裝
├── services/                  # 外部服務整合
│   ├── openrouter.ts          # OpenRouter AI API 服務
│   └── localStorage.ts        # 本地儲存服務
├── stores/                    # Pinia 狀態管理
│   ├── aiConfig.ts            # AI 設定 store
│   ├── chat.ts                # 聊天記錄 store
│   └── counter.ts             # 範例 store
├── types/                     # TypeScript 型別定義
│   └── youtube.ts             # YouTube API 相關型別
├── utils/                     # 工具函數
│   └── markdown.ts            # Markdown 處理工具
├── views/                     # 頁面元件
│   └── HomeView.vue           # 主頁面
└── router/                    # 路由設定
    └── index.ts               # 路由配置
```

## 🎯 使用說明

### 基本操作
1. 開啟應用程式後，點擊「載入影片」按鈕
2. 輸入 YouTube 影片 URL 或 ID
3. 使用播放控制按鈕進行播放/暫停
4. 點擊速度按鈕（1x）調整播放速度

### AI 聊天功能
1. 點擊右上角設定按鈕配置 AI API
2. 輸入 OpenRouter API 金鑰
3. 選擇偏好的 AI 模型
4. 在聊天框中與 AI 討論影片內容

### PWA 安裝
1. 在支援的瀏覽器中，點擊「安裝應用程式」提示
2. 或透過瀏覽器選單選擇「安裝 TubeTuner」
3. 安裝後可在裝置上獨立運行

## 🔧 配置說明

### AI 設定
- **API 金鑰**: 在 AI 設定中輸入您的 OpenRouter API 金鑰
- **模型選擇**: 支援多種 AI 模型（GPT、Claude 等）
- **溫度設定**: 調整 AI 回應的創造性程度

### 環境變數
```bash
# .env.local
VITE_OPENROUTER_API_KEY=your_api_key_here
```

## 👨‍💻 開發指南

### 程式碼風格
- 使用 `<script setup lang="ts">` 語法
- 遵循 Composition API 模式
- 使用 TypeScript 進行型別安全
- 遵循 ESLint 和 Prettier 配置

### 狀態管理
- 使用 Pinia stores 進行狀態管理
- 採用 composition 風格定義 stores
- 使用 `ref()` 定義狀態，`computed()` 定義 getters

### 元件開發
- 單檔元件 (.vue) 模式
- TypeScript 型別支援
- TailwindCSS 樣式系統

## 📋 待辦事項

- [ ] 新增更多 AI 模型支援
- [ ] 實作播放列表功能
- [ ] 新增快速鍵支援
- [ ] 改善行動版使用體驗
- [ ] 新增多語言支援

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權條款

此專案使用 [MIT 授權條款](LICENSE)。

## 🔗 相關連結

- [Vue.js 官方文件](https://vuejs.org/)
- [TypeScript 官方文件](https://www.typescriptlang.org/)
- [Vite 官方文件](https://vite.dev/)
- [OpenRouter API 文件](https://openrouter.ai/docs)

---

❤️ 使用 Vue.js 和 TypeScript 開發，並以 ❤️ 製作