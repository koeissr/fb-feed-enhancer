# Changelog

## v1.0.0 (2026-11-20)

### Added
- 以 MIT 授權之 `Facebook Worker's Wisdom DX`（by Dxzy）為基底，建立獨立公開版 `FB Feed Enhancer`。
- 新增 **🔒 防止自動重新整理（`preventRefresh`）**：攔截首頁分頁切回時的 `visibilitychange` 自動重整事件。
- 新增 **📋 預設切換所有留言（`allComments`）**：於貼文燈箱或單一貼文頁自動將「最相關」切換為「所有留言」。
- 建立 `README.md`、`LICENSE`（MIT）與一鍵安裝 Raw 連結。

### Fixed
- 修復開啟 **💬 自動展開留言** 時，在首頁動態牆反覆自動彈出貼文燈箱（「關了又自動開」）的異常，改為僅限貼文燈箱與單一貼文頁觸發並補上點擊次數上限。
- 修復多欄佈局下因 `contain: content` / `contain: layout style paint` 與 `max-height` 截斷 FB 虛擬化佔位空殼，導致回捲舊貼文出現大片空白無法重載的問題。
