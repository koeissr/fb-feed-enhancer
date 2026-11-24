# Facebook Feed Enhancer / FB 動態牆增強器 (Facebook 淨化與多欄)

**[繁體中文](#繁體中文) | [English](#english)**

---

<a id="繁體中文"></a>
## 繁體中文

一款專為 Facebook 電腦版（`www.facebook.com` / `web.facebook.com`）打造的 Tampermonkey / Violentmonkey 全方位淨化與增強腳本（零外部網路權限、模組化源碼建置單檔），完整支援中英文介面，整合**多欄排版與防回捲修復**、**雙語 ⚙️ 進階設定彈窗**、**防切分頁自動重整**、**所有／最新留言切換與快捷鍵**、**Reels 播放隱藏標題**、**介面深度乾淨化**、**訪客去登入牆與捲動解鎖**、**外連網址淨化**、**廣告／Meta AI／推薦區塊與關鍵字黑名單過濾**。

> 本專案改編自 [Dxzy](https://greasyfork.org/scripts/535843) 的 **Facebook Worker's Wisdom DX**（MIT License），針對 2026 年新版 Facebook 介面進行模組化重構、異常修復與多項實戰功能整合。

### 一鍵安裝

1. 先於瀏覽器安裝 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)。
2. 任選以下來源一鍵安裝（支援自動更新）：
   - 👉 **[GitHub Raw 一鍵安裝](https://raw.githubusercontent.com/koeissr/fb-feed-enhancer/main/fb-feed-enhancer.user.js)**
   - 👉 **[Greasy Fork 腳本頁](https://greasyfork.org/zh-TW)**（搜尋 `Facebook Feed Enhancer` 或 `FB 動態牆增強器`）

### 左側精簡分類抽屜工具列（v2.1+）

左側浮動工具列精簡為 **4 顆縱向分類按鈕**，點擊向右橫拉出對應抽屜（點擊外部區域自動收合）：

| 分類按鈕 | 抽屜內含功能 |
| :---: | :--- |
| **🗂️ 版面排版** | `📐` 側欄收縮、`🗂️` 多欄佈局（`−`/`+` 與欄數顯示）、`↕️` 高度控制（`vh` 數值顯示） |
| **⚡ 互動淨化** | `🔒` 防切分頁自動重整、`📋` 所有／最新留言切換（`Insert` / `Ctrl+Insert`）、`📖` 貼文自動展開、`💬` 安全版展開留言、`🚫` 自動隱藏廣告、`❤️`/`👍` 游標與自動點讚、`🎯` 感應範圍 |
| **🎬 影片媒體** | `🔊` 音量控制與 FB 原生靜音聯動（`%` 顯示）、`⏩` 統一倍速控制（`0.5x~3.0x`）、`▶️` 動態牆影片懸浮播放、`🖼️` 一鍵子母畫面（PiP）、`⌨️` 快捷鍵（`←`/`→` 5s、`[`/`]` 調速）、`🔁` Reels 播完自動暫停 |
| **⚙️ 進階設定** | 開啟雙語進階設定彈窗（4 欄虛擬捲動緩衝區防回捲變白、Reels 隱藏標題、介面深度乾淨化、訪客去登入牆與透明遮罩、外連網址淨化、留言排序偏好、Meta AI／PYMK／關鍵字黑名單、一鍵重置） |

### ⚙️ 進階設定彈窗整合功能（v2.0+）
- **Reels 播放時自動隱藏標題遮罩**：播放連續短片時自動淡出底部標題文字，暫停或滑鼠懸停時恢復。
- **介面深度乾淨化**：獨立 CSS 開關隱藏右側欄（贊助／聯絡人／群聊）、頂部「商店」頁籤、左側欄頁尾條款、首頁限時動態與 Reels 推薦區塊（不依賴多欄模式）。
- **訪客模式去登入牆 & 捲動解鎖**：未登入瀏覽公開貼文時隱藏強制登入彈窗並解鎖 `overflow` 捲動。
- **外連網址淨化（Link Sanitizer）**：自動展開 `l.facebook.com/l.php?u=...` 跳轉連結並移除 `fbclid`、`__cft__`、`__tn__` 等追蹤參數。
- **內容淨化與關鍵字黑名單**：非破壞式（保護虛擬捲動）隱藏 Meta AI 卡片、「你可能認識的人」及命中自訂關鍵字之貼文。

### 開發與建置（零外部相依）
```bash
# 從多個模組建置根目錄單檔 fb-feed-enhancer.user.js
node scripts/build.mjs

# 執行真實 Chrome Headless CDP 無 Mock 端到端實體驗收
node scripts/real_physical_verification_v2.mjs
```

---

<a id="english"></a>
## English

An all-in-one desktop **Facebook Cleaner & Feed Enhancer** userscript (`www.facebook.com` & `web.facebook.com`) for Tampermonkey / Violentmonkey, built from modular source files with **zero external network permissions** (`GM_setValue`, `GM_getValue`, `unsafeWindow` only). Fully compatible with both **English and Chinese Facebook UIs**.

> Based on **Facebook Worker's Wisdom DX** by [Dxzy](https://greasyfork.org/scripts/535843) (MIT License), refactored into a modular architecture with bug fixes and integrated quality-of-life features for the 2026 Facebook desktop interface.

### One-Click Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) in your browser.
2. Click below to install with automatic updates enabled:
   - 👉 **[Install via GitHub Raw](https://raw.githubusercontent.com/koeissr/fb-feed-enhancer/main/fb-feed-enhancer.user.js)**

### Key Features

- **⚙️ Bilingual Advanced Settings Modal**: Clean light-toned settings panel (auto-switches between English and Traditional Chinese) consolidating all cleaners, filters, comment sort preference, keyword blacklist, and one-click reset.
- **🗂️ Multi-Column Layout + Virtualization Scroll Fix**: Customizable column count and max card height (`vh`) without clipping Facebook virtualized spacers.
- **🔒 Prevent Auto-Refresh on Tab Switch**: Blocks Facebook's `visibilitychange` home feed reload without interfering with manual refresh (F5).
- **📋 All / Newest Comments + Hotkeys**: Automatically switches comment sorting to **All comments** or **Newest** inside post dialogs and single-post pages; press `Insert` to trigger preferred sort or `Ctrl+Insert` to toggle between All and Newest.
- **💬 Safe Comment Auto-Expand**: Expands comments, collapsed replies, and "View more comments" strictly inside `[role="dialog"]` or single-post pages.
- **🎬 Reels Title Auto-Hide**: Fades out Reels title overlays during playback and restores them on pause or hover.
- **🧹 Deep UI Cleaner**: Independently hide Right Rail (Sponsored / Contacts / Group chats), Marketplace nav tab, left sidebar footer, and Stories / Reels shelves.
- **🔓 Guest Login-Wall Bypass & Scroll Unlock**: Removes forced login overlays and restores page scrolling when browsing public Facebook pages logged out.
- **🔗 Link Sanitizer**: Unwraps `l.facebook.com/l.php?u=...` redirects and strips `fbclid`, `__cft__`, and tracking parameters.
- **🚫 Ad, Meta AI, PYMK & Keyword Blacklist Filter**: Automatically hides Sponsored/Suggested posts, Meta AI prompts, "People you may know" cards, and posts matching custom keywords without breaking virtual scrolling.

### Build & Verification (Zero Dependencies)
```bash
node scripts/build.mjs
node scripts/real_physical_verification_v2.mjs
```

### License

MIT License — see [LICENSE](LICENSE).
