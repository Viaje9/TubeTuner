# 新增影片清單

- 這是關於 Angular 版本的需求說明文件。

## 需求說明

幫我在angular/src/app/views/menu 新增一個選項是上傳影片清單
然後新增一個頁面是上傳影片的清單可以在這裡面管理
每個項目會有影片名稱然後有兩個按鈕
一個是到詳細頁一個會直接播放影片
詳細頁可以編輯影片名稱
也有一個按鈕可以刪除影片
刪除會有彈窗再確認

## 待釐清問題

1. 資料來源與儲存
   - 「上傳」是否需要將檔案持久化？若需要，偏好 IndexedDB、OPFS（Origin Private File System）、或 File System Access API（儲存 FileHandle）？
   - 若影片很大（數百 MB～GB），是否可接受以 File System Access API 儲存 FileHandle 以利效率與空間管理？
   - 若不需持久化，是否僅需保存影片的外部 URL/路徑與顯示名稱？

Answer:
需要持久化
IndexedDB 即可
影片大概 500MB 以內

2. 清單建立流程
   - 是否希望「本機影片播放器」頁面選到的檔案自動加入「上傳影片清單」？
   - 或是改由「上傳影片清單」頁面本身提供新增/上傳入口（例如「新增影片」按鈕）？

Answer:
「本機影片播放器」頁面選到會自動加入
影片清單列表頁也有按鈕可以上傳影片

3. 直接播放行為
   - 直接播放是否沿用既有 `local-video` 頁面？
   - 若是本機檔案，跨頁播放需要可重建來源：可接受用路由參數 + 共享服務，或保存 FileHandle，再於播放頁要求授權存取嗎？

Answer:
就是用 local-video 頁面
用路由參數 + service

4. 詳細頁內容
   - 需求僅提「可編輯影片名稱」，是否需要顯示/保存檔案大小、格式、副檔名、建立時間等中繼資料？
   - 名稱是否需唯一？是否需要長度/字元的驗證規則？

Answer:
不需要顯示你提到的這些
名稱不需要唯一值 20 字以內

5. 刪除確認
   - 刪除確認彈窗可用原生 `confirm()` 嗎？還是要導入 Angular Material Dialog（目前專案已有使用 BottomSheet）？

Answer:
使用 Dialog 不是 BottomSheet
並設計一個 Dialog service 來共用

6. 路由命名
   - 建議列表為 `/video-list`，詳細頁為 `/video/:id`。是否同意此路由結構與命名？

Answer:
同意

## 進一步待釐清

1. 影片資料模型
   - 欄位提案：`id`、`name(<=20)`、`blobKey`、`mime`、`size`、`createdAt`、`updatedAt`。
   - 是否要再加入 `lastPlayedAt`、`lastPosition`（續播用）？

Answer:
要`lastPlayedAt`、`lastPosition`

2. 新增時命名規則
   - 預設以檔名（去副檔名）截斷至 20 字；是否同意？

Answer:
同意

3. 重複檔案處理

- 同一內容重複新增時：允許重複多筆，或以內容雜湊（hash）去重並提示已存在？

Answer:
不允許重複多筆，但也不需要雜湊比對

4. 多檔上傳

- 清單頁是否支援一次選取多個影片一併加入？

Answer:
准許

5. 清單排序與搜尋

- 排序預設：最新加入在前；是否需要名稱排序與搜尋/過濾功能？

Answer:
加入在前，不需要排序，但在清單頁面需要搜尋功能

6. 直接播放導航

- 「播放」按鈕導向 `local-video?id=...` 後是否自動播放並維持既有 UI 狀態（如字幕面板）？

Answer: 要
7. 播放位置記錄

- 是否要記住每部影片上次播放進度，返回時提供「續播」？

Answer: 要
8. 字幕關聯與持久化

- 是否需要將字幕檔也持久化並關聯到影片（0..N），於詳細頁管理新增/刪除/預設字幕？

Answer: 要
9. 容量與配額

- 是否要設定清單總容量或單檔上限（目前預期單檔 ≤ 500MB）？配額不足時顯示何種提示？

Answer: 上傳時顯示，超過時顯示上傳失敗
10. 縮圖與預覽

- 清單是否需要顯示影片縮圖（擷取幀畫面生成並快取）？若非必要可延後到後續版本。

Answer: 不需要縮圖

11. 刪除範圍

- 刪除影片時，是否同時刪除其 blob 與關聯字幕資料？是否提供「清空全部」功能（含二次確認）？

Answer: 全部刪除 要有確認

12. Dialog service 規格

- 介面提案：`confirm({ title, message, confirmText, cancelText, tone }) => Promise<boolean>`；刪除採用危險樣式（紅色）。是否同意？

Answer: Dialog service 要有兩種
一種是有同意確認一種是單純的確認

13. 目標瀏覽器

- 主要支援瀏覽器與最低版本？Safari 對大檔 IndexedDB 支援較弱，是否以 Chrome/Edge 桌面為主？

Answer:
以支援 Safari 為主考慮其他瀏覽器

14. 隱私與說明

- 僅本機儲存不經網路傳輸；是否需在 UI 顯示一段簡短說明以降低使用者疑慮？

Answer:
不需要，個人使用而已

## 第三輪待釐清

1. IndexedDB 方案細節
   - 是否可採用 Dexie.js 作為 IndexedDB 封裝以簡化開發與遷移？若不使用第三方，則以原生 IDB API 實作。

Answer:
原生 IDB API

2. 資料庫結構與物件倉儲
   - 拆分為 `videos`（中繼資料）與 `videoBlobs`（實際 Blob）兩個 object store，透過 `blobKey` 關聯，是否同意？並為 `createdAt`、`name` 建索引以支援排序/搜尋。

Answer:
好

3. 雜湊與去重策略
   - 採用 WebCrypto 的 SHA-256 對檔案計算雜湊；新增前先算雜湊比對是否已存在，存在則阻擋新增。雜湊計算可能較慢，是否允許使用 Web Worker 執行並顯示進度？

Answer:
雜湊太麻煩了不需要

4. 上傳/新增流程時機
   - 從本機播放器自動加入：是在檔案選取當下即寫入 IndexedDB，還是先顯示命名對話框讓使用者確認後再寫入？

Answer:
直接寫入，用原始檔名當預設名稱

5. 多檔上傳 UX
   - 支援多選與拖放；遇到部分檔案重複或超限時，是否逐檔顯示結果彙整（成功/失敗原因）？是否需要「全部略過重複」快速選項？

Answer:
只支援手機版的檔案上傳不支援拖放
一筆失敗全部失敗

6. 檔案大小限制與錯誤訊息
   - 單檔上限（例如 500MB）與錯誤訊息文案是否提供固定字串？QuotaExceededError 或 Safari 寫入失敗時的提示內容是否需要更詳細的建議（例如清除部分項目後再試）？

Answer:
就簡單說檔案太大無法上傳然後說是哪個檔案

7. Safari 相容性策略
   - 若 Safari 寫入大型 Blob 不穩定，是否允許自動降級為僅存中繼資料 + 重新選檔播放（提醒使用者每次播放需重選檔）？或直接限制 Safari 單檔上限更小？

Answer:
不用降，也不用限制上限，顯示錯誤訊息就好

8. 清單搜尋規格
   - 搜尋欄位僅 `name` 還是也比對 `mime`？是否支援前綴/關鍵字分詞（多詞 AND）？大小寫是否不敏感？

Answer:
用name，大小也不敏感用 includes 簡單比對就好

9. 分頁與大量資料
   - 若影片數量很多，是否需要分頁或虛擬列表？預設每頁 50 筆是否可接受？

Answer:
先單頁就好不考慮分頁

10. 路由與資料載入

- `local-video?id=...` 若查無該 id（被刪除或資料庫損毀），是否導回 `/video-list` 並顯示提示？是否需要路由 resolver 預先載入資料後再進頁？

Answer:
導回 `/video-list` 並顯示提示
好使用 resolver 預先載入資料

11. 自動播放與狀態

- 進入播放頁後是否自動播放（若瀏覽器自動播放策略阻擋，改為顯示「點擊播放」提示）？字幕面板顯示狀態是否沿用偏好設定（現有 `PlayerPreferencesService`）？

Answer:
不自動播放
"字幕面板顯示狀態是否沿用偏好設定" 不懂這是什麼請詳細說明在提問

12. 續播規格

- 續播門檻（例如最後位置 > 10 秒才提示續播）、續播提示樣式（Toast/對話框/自動續播）與是否提供「從頭播放」選項？

Answer:
不用門檻 1秒也可以續播
不用提示，就到 local-video 的時候停在上次的播放位置就好

13. 字幕關聯模型

- 每部影片可綁多個字幕：欄位提案 `id`、`videoId`、`name`、`lang`、`kind`（srt/json）、`size`、`createdAt`、`isDefault`、`blobKey`。是否同意？同一影片僅允許一個 `isDefault=true`？

Answer:
一部影片僅允許一個字幕

14. 字幕載入時機

- 進入播放頁若該影片有 `isDefault` 字幕，是否自動載入？若沒有，是否保留使用者上一個選擇的字幕語言作為偏好？

Answer:
一部影片僅允許一個字幕

15. 刪除交互細節

- 單筆刪除對話框文案是否需顯示影片名稱並用紅色確認鍵？「清空全部」是否需二次確認（例如輸入 `DELETE` 才能執行）？

Answer:
單筆刪除顯示影片名稱並用紅色確認鍵
沒有提供清空全部按鈕

16. Dialog service API

- 兩類對話框：`confirm`（確認/取消）與 `alert`（僅知道了）。是否需要 `danger` 與 `normal` 兩種樣式、以及可選 `icon`？回傳型別與可否自定按鈕文案？

Answer:
不需要，保持一個簡潔設計就好
後續再依情況調整

17. 錯誤與提示呈現

- 是否需要全域 toast/snackbar？若無，是否以 Dialog 或頁內 banner 呈現？是否需要國際化占位（未來 i18n）？

Answer:
snackbar 可以
不需要 banner
不需要 i18n

18. 匯出/匯入

- 是否需要「匯出影片清單」功能（含中繼資料與 Blob），生成一個備份檔；與「匯入」功能（從備份檔恢復）？

Answer:
不提供匯出

19. 拖放支援

- 清單頁是否支援將檔案拖入以新增？拖入多檔時是否沿用第 5 點的結果彙整？

Answer:
不需要拖入功能

20. 安全與型別限制

- 僅允許 `video/*` 中的 `mp4`、`webm`、`ogg`？是否要阻擋可疑副檔名並提示「非支援影片格式」？

Answer:
好

## 最後確認問題

1. 重複判定條件
   - 在不使用雜湊的情況下，是否以 `name + size + lastModified` 作為「重複」定義？任一不同即視為新檔。

Answer:
同意

2. 識別碼生成
   - 是否同意使用 `crypto.randomUUID()` 產生 `video.id` 與 `blobKey`？

Answer:
同意

3. 多檔上傳錯誤處理
   - 只要任一檔重複或超限，整批回滾；以 snackbar 顯示第一個錯誤訊息（不做逐檔彙整）。是否同意？

Answer:
同意

4. 續播寫入頻率
   - 每 2 秒節流保存 `lastPosition` 到 IndexedDB，且在離開頁面前（`beforeunload`）再強制寫入一次。是否同意？

Answer:
同意

5. 字幕持久化流程
   - 在 `local-video` 頁面「上傳字幕」時，直接覆蓋該影片既有字幕（僅允許 1 個），支援 `srt/json`；列表與詳細頁不提供字幕上傳/移除。是否同意？

Answer:
詳細頁要提供字幕上傳/移除

6. 字幕面板偏好
   - 是否將字幕側欄顯示/隱藏狀態存為「全域偏好」（預設顯示），而非每部影片？

Answer:
字幕面板不可以關閉

7. 錯誤提示方式
   - 採用 Angular Material `MatSnackBar`，顯示 3 秒，簡短文字即可。是否同意？

Answer:
同意

8. 刪除聯動
   - 刪除影片同時刪除影片 Blob 與字幕 Blob；若當前在播放頁中刪除，完成後導回列表並顯示 snackbar。是否同意？

Answer:
同意

## 架構規劃（Angular 版本）

1. 路由與導覽
   - 新增 `/video-list`（清單頁）、`/video/:id`（詳細頁）、`/local-video?id=...`（既有播放頁，新增以 id 載入來源）。
   - `menu` 新增入口「上傳影片清單」。
   - 新增 `VideoResolver`：於進入 `local-video` 讀取 id 的影片與字幕；查無資料則導回 `/video-list` 並顯示 snackbar。

2. 資料模型（IndexedDB 中繼資料）
   - `VideoMeta`：`id: string`、`name: string(<=20)`、`mime: string`、`size: number`、`blobKey: string`、`createdAt: number`、`updatedAt: number`、`lastPlayedAt: number`、`lastPosition: number`、`lastModified?: number`。
   - `SubtitleMeta`（每部影片僅允許一筆）：`videoId: string`、`blobKey: string`、`kind: 'srt'|'json'`、`name: string`、`size: number`、`createdAt: number`。

3. IndexedDB 結構
   - DB：`tubetuner`；stores：
     - `videos`（keyPath: `id`，index：`createdAt`、`name_lc` 用於搜尋）
     - `videoBlobs`（keyPath: `blobKey`，存放影片 Blob）
     - `subtitles`（keyPath: `videoId`，僅 0..1 筆）
     - `subtitleBlobs`（keyPath: `blobKey`，存放字幕 Blob）
   - 搜尋以程式端 `includes()` 大小寫不敏感；排序預設 `createdAt` desc。

4. 服務層與 API
   - `VideoLibraryService`（存放於 `angular/src/app/state/`）：
     - 新增：`addVideos(files: File[]): Promise<VideoMeta[]>`（批次；任一失敗則回滾並拋出第一個錯誤）
     - 查詢：`list(): Promise<VideoMeta[]>`、`get(id: string): Promise<VideoMeta | undefined>`、`searchByName(q: string): Promise<VideoMeta[]>`
     - 內容：`getVideoBlob(blobKey: string): Promise<Blob>`、`getSubtitle(videoId: string): Promise<SubtitleMeta | undefined>`、`getSubtitleBlob(blobKey: string): Promise<Blob>`
     - 更新：`rename(id: string, name: string): Promise<void>`、`savePosition(id: string, pos: number): Promise<void>`
     - 字幕：`setSubtitle(videoId: string, file: File): Promise<void>`（覆蓋）／`removeSubtitle(videoId: string): Promise<void>`
     - 刪除：`remove(id: string): Promise<void>`（同時刪 video/subtitle 與對應 blobs）
   - 識別碼：以 `crypto.randomUUID()` 產生 `id` 與 `blobKey`。
   - 重複判定：`name + size + lastModified` 相同視為重複，阻擋新增。

5. 頁面與元件
   - 清單頁 `VideoListComponent`：
     - 功能：列出影片（最新在前）、搜尋欄（依名稱 includes）、「新增影片」按鈕（支援多選）。
     - 列表每列：名稱、兩個按鈕「詳細」、「播放」。
     - 錯誤處理：多檔上傳若任一錯誤則整批失敗，snackbar 顯示第一個錯誤訊息。
   - 詳細頁 `VideoDetailComponent`：
     - 顯示並可編輯名稱（20 字驗證）。
     - 字幕管理：上傳/移除（僅允許 1 筆，支援 srt/json）。
     - 刪除：呼叫 Dialog service 確認（紅色確認），成功後返回清單並顯示 snackbar。
   - 播放頁（既有 `LocalVideoComponent`）：
     - 透過 `VideoResolver` 或 service 依 id 取得 Blob 建立 object URL；查無導回清單。
     - 自動跳至 `lastPosition`（不自動播放）。
     - 每 2 秒節流保存播放進度；`beforeunload` 觸發最後保存。
     - 若該影片有字幕，進入時自動載入；字幕側欄固定顯示（不可關閉）。

6. 共用對話框與提示
   - `DialogService`：`confirm({ title, message, confirmText?, cancelText?, tone?: 'danger'|'normal' }) => Promise<boolean>` 與 `alert({ title, message, okText? }) => Promise<void>`（先實作 confirm，alert 作精簡版）。
   - Snackbar：採用 Angular Material `MatSnackBar`，顯示 3 秒，簡短文字。

7. 本機播放器自動加入流程
   - 使用者在 `local-video` 選取影片時：
     1) 先以 `name+size+lastModified` 檢查重複；
     2) 若不重複，立即寫入 IndexedDB（以原始檔名為預設名稱）；
     3) 取得 `id` 後以該來源播放（保持當前頁，不跳轉）。

8. 錯誤與配額策略
   - 單檔超過上限或寫入失敗：顯示「檔案太大無法上傳：<檔名>」或通用錯誤訊息；Safari 不另行降級，僅提示錯誤。

9. 開發步驟
   1) 建立 `VideoLibraryService` 與 IndexedDB schema/migration。
   2) 新增路由與 `VideoResolver`。
   3) 實作 `VideoListComponent`（列表、搜尋、上傳、多選、播放/詳細）。
   4) 實作 `VideoDetailComponent`（改名、字幕上傳/移除、刪除）。
   5) 整合 `LocalVideoComponent`（依 id 播放、進度保存、自動載入字幕、固定字幕側欄）。
   6) 新增 `DialogService` 與 snackbar 通知。
   7) 調整 `menu` 增加入口並驗證整體流程。

10. 驗收重點

- 多檔新增任一失敗則整批失敗；清晰錯誤提示。
- 清單搜尋（名稱、大小寫不敏感）。
- 詳細頁可改名、管理單一字幕、刪除需確認。
- 播放頁能續播、不自動播放、字幕面板固定顯示。
- 刪除影片會同步刪除 blob 與字幕，若在播放頁刪除會導回清單。
