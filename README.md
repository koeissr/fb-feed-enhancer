# FB Feed Enhancer / FB 動態牆增強器

**[繁體中文](#繁體中文) | [English](#english)**

---

<a id="繁體中文"></a>
## 繁體中文

一款專為 Facebook 電腦版打造的 Tampermonkey / Violentmonkey 使用者腳本（約 66 KB），完整支援中英文 Facebook 介面，整合**多欄排版**、**防回捲空白修復**、**防切分頁自動重新整理**、**預設切換所有留言**、**安全版自動展開留言**與**自動隱藏廣告／推薦貼文**。

> 本專案改編自 [Dxzy](https://greasyfork.org/scripts/535843) 的 **Facebook Worker's Wisdom DX**（MIT License），針對 2026 年新版 Facebook 介面進行異常修復與功能整合。

### 一鍵安裝

1. 先於瀏覽器安裝 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)。
2. 任選以下來源一鍵安裝（支援自動更新）：
   - 👉 **[GitHub Raw 一鍵安裝](https://raw.githubusercontent.com/koeissr/fb-feed-enhancer/main/fb-feed-enhancer.user.js)**
   - 👉 **[Greasy Fork 腳本頁](https://greasyfork.org/zh-TW)**（搜尋 `FB Feed Enhancer`）

### 工具列功能對照

| 圖示 | 功能名稱 | 說明 |
| :---: | :--- | :--- |
| **📐** | 側欄收縮 | 收合左側導覽欄，釋放更多橫向瀏覽空間 |
| **🔒** | 防止自動重新整理 | 攔截切換分頁回來時 FB 首頁觸發的自動重整（不影響手動按 F5） |
| **📋** | 預設切換「所有留言」 | 於貼文燈箱或單一貼文頁自動將「最相關／Most relevant」切換為「所有留言／All comments」（每篇最多觸發一次） |
| **🗂️** | 多欄佈局（含防回捲空白修復） | 自訂欄數（`−`/`+`），移除干擾 FB 虛擬捲動的 CSS `contain`，保護虛擬化佔位空殼不被截斷 |
| **💬** | 安全版自動展開留言 | 僅限於貼文燈箱（`[role="dialog"]`）或單一貼文頁內自動展開留言／摺疊回覆／查看更多留言，杜絕首頁誤彈貼文燈箱 |
| **📖** | 貼文自動展開查看更多 | 自動展開被折疊的長貼文內容（單次點擊不重複折疊） |
| **🚫** | 自動隱藏廣告與推薦貼文 | 每 4 秒自動偵測並點擊隱藏廣告與推薦貼文 |
| **❤️ / 👍** | 游標點讚 / 貼文自動點讚 | 支援滑鼠游標點讚與每 4 秒依序幫貼文點讚（自動排除廣告） |
| **🎯** | 游標觸發範圍 | 調整游標自動展開／點讚的感應距離（`px`） |
| **🔊** | 影片音量控制 | 統一覆蓋並調整 FB 影片預設音量 |
| **↕️ / ↔️** | 高度控制 / 展開寬度 | 自訂貼文卡片最大高度（`vh`）與展開寬度比例 |

---

<a id="english"></a>
## English

A lightweight (~66 KB) Tampermonkey / Violentmonkey userscript for desktop Facebook, fully compatible with both **English and Chinese Facebook UIs**. It combines **multi-column feed layout**, **virtualization scroll-back fix**, **anti-auto-refresh on tab switch**, **default to All Comments**, **safe comment auto-expand**, and **automatic ad / suggested post hiding**.

> Based on **Facebook Worker's Wisdom DX** by [Dxzy](https://greasyfork.org/scripts/535843) (MIT License), enhanced with bug fixes and integrated quality-of-life modules for the 2026 Facebook desktop interface.

### One-Click Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) in your browser.
2. Click below to install with automatic updates enabled:
   - 👉 **[Install via GitHub Raw](https://raw.githubusercontent.com/koeissr/fb-feed-enhancer/main/fb-feed-enhancer.user.js)**

### Toolbar Features

| Icon | Feature | Description |
| :---: | :--- | :--- |
| **📐** | Toggle Sidebar | Collapses the left navigation sidebar to maximize feed width |
| **🔒** | Prevent Auto-Refresh | Blocks Facebook's tab-switch `visibilitychange` home feed reload without interfering with manual refresh (F5) |
| **📋** | Default to All Comments | Automatically switches comment sorting from "Most relevant" / "Top comments" to "All comments" inside post dialogs or single-post pages (runs at most once per post) |
| **🗂️** | Multi-Column Layout + Scroll Fix | Customizable column count (`−`/`+`); removes CSS `contain` rules that conflict with Facebook DOM virtualization and prevents empty virtualized spacers from being clipped |
| **💬** | Safe Comment Auto-Expand | Automatically expands comments, collapsed replies, and "View more comments" **strictly inside post dialogs (`[role="dialog"]`) or single-post pages**, preventing accidental modal popups on the home feed |
| **📖** | Auto-Expand "See More" | Automatically expands truncated post text (single click, never collapses back) |
| **🚫** | Auto-Hide Ads & Suggested Posts | Detects and clicks the hide button on sponsored and suggested posts every 4 seconds |
| **❤️ / 👍** | Hover Like / Scheduled Auto-Like | Hover-to-like comments/posts or auto-like organic posts every 4 seconds (ads excluded) |
| **🎯** | Hover Trigger Pad | Adjusts hover detection radius (`px`) for posts |
| **🔊** | Video Volume Control | Overrides and standardizes Facebook video volume |
| **↕️ / ↔️** | Post Height / Expand Width | Customizes max post card height (`vh`) and expanded width percentage |

---

## License & Credits

- Released under the **[MIT License](LICENSE)**.
- Original foundation by **Dxzy** (*Facebook Worker's Wisdom DX*, MIT License).
