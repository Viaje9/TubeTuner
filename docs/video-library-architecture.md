# 影片清單與播放架構規劃（Angular）

## 目標與範圍

- angular/
- 建立本機影片清單（上傳/管理/搜尋），並透過 id 在播放頁播放。
- 持久化使用 IndexedDB（含影片與字幕 Blob）。
- 支援續播、刪除確認、簡單錯誤提示；行動裝置為優先場景。

不在此次範圍：縮圖、匯出/匯入、拖放上傳、多語言。

## 路由與導覽

- `/video-list`：影片清單頁（新增/搜尋/管理）。
- `/video/:id`：影片詳細頁（改名、字幕上傳/移除、刪除）。
- `/local-video?id=...`：既有播放頁，新增以 id 載入來源。
- `menu` 新增入口「上傳影片清單」。
- `VideoResolver`：進入 `/local-video` 前依 `id` 載入影片/字幕；查無資料則導回 `/video-list` 並顯示 snackbar。

## 資料模型

- VideoMeta
  - `id: string`（`crypto.randomUUID()`）
  - `name: string`（<= 20 字）
  - `mime: string`
  - `size: number`
  - `blobKey: string`（`crypto.randomUUID()`）
  - `createdAt: number`、`updatedAt: number`
  - `lastPlayedAt: number`、`lastPosition: number`
  - `lastModified?: number`（來自 File）
- SubtitleMeta（每部影片最多 1 筆）
  - `videoId: string`
  - `blobKey: string`
  - `kind: 'srt' | 'json'`
  - `name: string`
  - `size: number`
  - `createdAt: number`

重複檔判定：同時符合 `name + size + lastModified` 視為重複。

## IndexedDB 結構

- DB：`tubetuner`
- Object stores：
  - `videos`（keyPath: `id`，索引：`createdAt`、`name_lc` 用於搜尋）
  - `videoBlobs`（keyPath: `blobKey`，存影片 Blob）
  - `subtitles`（keyPath: `videoId`，0..1 筆）
  - `subtitleBlobs`（keyPath: `blobKey`，存字幕 Blob）
- 搜尋：程式端以小寫 `includes()`，大小寫不敏感；排序預設 `createdAt desc`。

## 服務層 API（VideoLibraryService）

- 新增
  - `addVideos(files: File[]): Promise<VideoMeta[]>`
    - 僅支援檔案挑選（不做拖放）。
    - 只要任一檔重複或超限，整批回滾，丟出第一個錯誤訊息。
- 查詢
  - `list(): Promise<VideoMeta[]>`
  - `get(id: string): Promise<VideoMeta | undefined>`
  - `searchByName(q: string): Promise<VideoMeta[]>`
- 內容存取
  - `getVideoBlob(blobKey: string): Promise<Blob>`
  - `getSubtitle(videoId: string): Promise<SubtitleMeta | undefined>`
  - `getSubtitleBlob(blobKey: string): Promise<Blob>`
- 更新
  - `rename(id: string, name: string): Promise<void>`（驗證長度 <= 20）
  - `savePosition(id: string, pos: number): Promise<void>`（2 秒節流；`beforeunload` 再 flush）
- 字幕（每影片僅 1 筆）
  - `setSubtitle(videoId: string, file: File): Promise<void>`（覆蓋，支援 srt/json）
  - `removeSubtitle(videoId: string): Promise<void>`
- 刪除
  - `remove(id: string): Promise<void>`（同步刪除影片/字幕與其 Blob）

## 元件與頁面

- VideoListComponent（`/video-list`）
  - 顯示列表（最新在前）、搜尋欄（名稱 includes，大小寫不敏感）。
  - 「新增影片」按鈕（支援多選；行動裝置為主）。
  - 每列提供「詳細」、「播放」兩個按鈕。
  - 錯誤：多檔新增任一失敗則整批失敗，以 snackbar 顯示第一個錯誤。
- VideoDetailComponent（`/video/:id`）
  - 顯示/編輯名稱（<= 20，超出顯示驗證錯誤）。
  - 字幕上傳/移除（只允許 1 筆，srt/json）。
  - 刪除：Dialog 確認（紅色確認鍵）；成功後返回列表並 snackbar。
- LocalVideoComponent（既有 `/local-video`）
  - 透過 `VideoResolver` 或服務以 id 載入 Blob 建 object URL。
  - 進入時移動到 `lastPosition`；不自動播放。
  - 每 2 秒保存播放位置，`beforeunload` 再次保存。
  - 若影片有字幕則自動載入；字幕側欄固定顯示（不可關閉）。
  - 在該頁挑選影片時：檢查重複→寫入 DB→以新 id 播放（留在同頁）。

## 對話框與提示

- DialogService：先實作 confirm（簡潔 API），可帶 `danger` 樣式；必要時再擴充 alert。
- Snackbar：使用 Angular Material `MatSnackBar`，3 秒，短文案。

## 錯誤與配額策略

- 單檔大小超限或寫入失敗：顯示「檔案太大無法上傳：<檔名>」或通用錯誤。
- Safari 不做降級或額外上限處理，僅顯示錯誤。

## 表單與驗證

- 名稱：必填、長度 <= 20，前後空白修剪；不需唯一。
- 可接受副檔與 MIME：`mp4`、`webm`、`ogg` 對應 `video/*`。

## 使用流程摘要

1) 使用者於清單頁新增多檔 → 驗重/限額 → 全部寫入成功 → 顯示於列表。
2) 清單頁搜尋名稱 → 即時過濾列表（客端）。
3) 清單列「播放」→ 前往 `/local-video?id=...` → 若找不到資料導回清單並提示。
4) 詳細頁可改名、上傳/移除字幕、刪除影片（需確認）。
5) 播放頁會移動到上次位置，播放過程定期保存進度，字幕側欄固定顯示。

## 開發步驟與驗收

- 步驟
  1. IndexedDB schema 與 `VideoLibraryService`。
  2. 路由與 `VideoResolver`。
  3. `VideoListComponent`（列表/搜尋/新增/導覽）。
  4. `VideoDetailComponent`（改名/字幕/刪除）。
  5. 整合 `LocalVideoComponent`（依 id 播放、續播、字幕載入、固定側欄）。
  6. `DialogService` 與 snackbar 通知。
  7. `menu` 新增清單入口並整體驗證。
- 驗收
  - 多檔新增「任一失敗整批失敗」且錯誤提示清楚。
  - 清單搜尋正確、排序新到舊。
  - 詳細頁改名驗證、字幕單一管理、刪除需確認。
  - 播放頁能續播、不自動播放、字幕側欄固定顯示。
  - 刪除會同步清理 Blob 與字幕；播放中刪除會導回清單。
