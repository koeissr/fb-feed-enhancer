# Changelog

## v2.0.0 (2026-11-22)

### Added
- **模組化源碼 + 產出單檔架構**：將單體腳本拆解為 14 個模組（`src/core/*`、`src/modules/*`、`src/ui/*`、`src/main.js`），新增零外部依賴建置腳本 [build.mjs](file:///d:/Projects/fb-feed-enhancer/scripts/build.mjs) 產出根目錄 `fb-feed-enhancer.user.js`（維持 GitHub Raw 一鍵安裝）。
- **莫蘭迪 ⚙️ 進階設定彈窗**：於工具列頂端新增 `⚙️` 設定入口，以低飽和莫蘭迪淺色系彈窗統一管理所有進階開關、留言排序偏好、關鍵字黑名單與一鍵重置，全面汰除舊暗黑背景與純黑按鈕。
- **Phase 1 整合功能**：
  - Reels 播放時自動隱藏標題遮罩（暫停或移入滑鼠時恢復）。
  - 獨立介面深度乾淨化 CSS（右側欄、頂部商店頁籤、左側欄頁尾、限時動態／Reels 推薦區塊）。
  - 未登入訪客模式去登入牆與 `overflow` 捲動解鎖。
  - 外連網址淨化（自動展開 `l.facebook.com/l.php?u=...` 並移除 `fbclid` / `__cft__` / `__tn__` 等追蹤參數）。
  - 留言排序增強：支援設定「所有留言 / 最新留言」偏好，並支援燈箱內快捷鍵 `Insert`（觸發偏好）與 `Ctrl+Insert`（反轉切換）。
- **Phase 2 整合功能**：
  - 擴充內容淨化：非破壞式（`data-ffe-filtered="1"`）隱藏 Meta AI 卡片與「你可能認識的人」區塊。
  - 自訂關鍵字黑名單：支援多組關鍵字即時套用隱藏與重置還原，不破壞 FB 虛擬捲動結構。
- 新增真實 Chrome Headless CDP 無 Mock 實體驗收腳本 [real_physical_verification_v2.mjs](file:///d:/Projects/fb-feed-enhancer/scripts/real_physical_verification_v2.mjs)。

### Changed
- 左側浮動工具列改採莫蘭迪柔白半透明與鼠尾草綠啟用配色。
- 維持零外部網路權限邊界（僅使用 `GM_setValue`、`GM_getValue`、`unsafeWindow`）。

## v1.0.4 (2026-11-20)

### Fixed
- 恢復動態牆容器與貼文卡片之 `overflow-anchor: auto`（同時維持移除 `virtualFixCSS` 與關閉全域 `scroll-behavior: smooth`），解決向下自動載入新貼文時因上方舊貼文卸載或廣告隱藏導致畫面突然跳捲的問題。

## v1.0.3 (2026-11-20)

### Fixed
- 修復捲動至 FB 虛擬化臨界高度時頁面不自主上下不停抖動的問題：移除導致掛載／卸載高度反差的 `virtualFixCSS`（保留移除 `contain` 修復），將動態牆容器與卡片改設 `overflow-anchor: none`，並關閉全域 `:root{scroll-behavior: smooth}` 避免捲軸補償震盪。

## v1.0.2 (2026-11-20)

### Fixed
- **F1（防誤觸加好友／追蹤）**：於 `isPostSeeMore()` 加入嚴格文字白名單（僅限 `查看更多` / `顯示更多` / `See more` / `Show more`）並排除貼文標題列，徹底修復捲動時誤點「和其他 X 人」彈出用戶／加朋友視窗之缺陷。
- **F2（燈箱留言安全展開）**：於 `expandMoreComments()` 加入展開語意文字白名單，防止誤點燈箱內其他文字按鈕。
- **F3（廣告隱藏防誤關燈箱）**：`hideNextAd()` 跳過 `[role="dialog"]` 內部節點，且 `findHideButton()` 排除「關閉 / Close」按鈕。
- **F4（SPA 單一貼文頁切所有留言）**：非燈箱單一貼文頁改以網址路徑記錄，修復 SPA 換頁後第二篇貼文起不再自動切換「所有留言」的問題。
- **F5（自動點讚語意防呆）**：`likeEligible()` 若偵測到 `aria-label`，強制檢核為按讚動作且排除取消讚。
- **F6（📋 與 💬 協同防搶跑）**：切換「所有留言」期間暫停展開留言 350ms，避免重複點擊舊排序列表。

## v1.0.1 (2026-11-20)

### Added
- 完整支援中英文（繁中／簡中／英文）語系標頭（`@name:en`、`@name:zh-TW`、`@name:zh-CN`、`@description:*`）與雙語 `README.md`。
- 擴充預設「所有留言」比對規則，完整相容英文版（`Most relevant` / `Most relevant comments` / `Top comments` $\rightarrow$ `All comments`）與繁簡中文版 Facebook 介面。
- 新增腳本前置圖示（`@icon`），於 Tampermonkey 控制台清單顯示 Facebook 圖示。

## v1.0.0 (2026-11-20)

### Added
- 以 MIT 授權之 `Facebook Worker's Wisdom DX`（by Dxzy）為基底，建立獨立公開版 `FB Feed Enhancer`。
- 新增 **🔒 防止自動重新整理（`preventRefresh`）**：攔截首頁分頁切回時的 `visibilitychange` 自動重整事件。
- 新增 **📋 預設切換所有留言（`allComments`）**：於貼文燈箱或單一貼文頁自動將「最相關」切換為「所有留言」。
- 建立 `README.md`、`LICENSE`（MIT）與一鍵安裝 Raw 連結。

### Fixed
- 修復開啟 **💬 自動展開留言** 時，在首頁動態牆反覆自動彈出貼文燈箱（「關了又自動開」）的異常，改為僅限貼文燈箱與單一貼文頁觸發並補上點擊次數上限。
- 修復多欄佈局下因 `contain: content` / `contain: layout style paint` 與 `max-height` 截斷 FB 虛擬化佔位空殼，導致回捲舊貼文出現大片空白無法重載的問題。
