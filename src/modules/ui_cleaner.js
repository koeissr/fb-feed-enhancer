  function generateCleanerCSS() {
    const rules = [];
    // 非破壞式內容過濾隱藏規則（保護 FB 虛擬捲動結構）
    rules.push('[data-ffe-filtered="1"]{display:none !important}');
    // Reels 播放時自動隱藏底部標題與文字遮罩（滑鼠懸停底部或暫停時恢復）
    rules.push(
      '[data-ffe-reel-playing="1"] [data-ffe-reel-overlay="1"]{opacity:0 !important;transition:opacity .25s ease !important;pointer-events:none !important}',
      '[data-ffe-reel-playing="1"]:hover [data-ffe-reel-overlay="1"]:hover{opacity:1 !important;pointer-events:auto !important}'
    );
    // 隱藏右側欄（贊助廣告、聯絡人、群聊）
    if (state.buttons.cleanRightRail) {
      rules.push(
        'div[role="complementary"]{display:none !important}'
      );
    }
    // 隱藏頂部導覽列「商店 / Marketplace」頁籤
    if (state.buttons.cleanMarketplaceTab) {
      rules.push(
        'div[role="banner"] a[href*="/marketplace"]{display:none !important}',
        'div[role="navigation"] a[href*="/marketplace"][aria-label]{display:none !important}'
      );
    }
    // 隱藏左側欄頁尾服務條款與隱私權資訊
    if (state.buttons.cleanLeftFooter) {
      rules.push(
        'div[role="navigation"] footer, footer[role="contentinfo"]{display:none !important}'
      );
    }
    // 隱藏首頁限時動態與 Reels 推薦區塊
    if (state.buttons.hideStoriesReels) {
      rules.push(
        'div[aria-label="限時動態"],div[aria-label="Stories"],div[aria-label="快拍"]{display:none !important}',
        '[data-ffe-stories-reels="1"]{display:none !important}'
      );
    }
    return rules.join("\n");
  }

  function initCleanerStyleTag() {
    if (resources.cleanerStyleTag && resources.cleanerStyleTag.isConnected) return;
    const style = document.createElement("style");
    style.id = "fb-feed-enhancer-cleaner";
    style.textContent = "";
    (document.head || document.documentElement).appendChild(style);
    resources.cleanerStyleTag = style;
  }

  function applyCleanerCSS() {
    initCleanerStyleTag();
    const css = generateCleanerCSS();
    if (resources.cleanerStyleTag.textContent !== css) {
      resources.cleanerStyleTag.textContent = css;
    }
    markStoriesReelsBlocks();
  }

  const STORIES_REELS_HEADING_RE = /^(Reels 與短片|連續短片|Reels and short videos|Reels|限時動態|Stories)$/i;
  function markStoriesReelsBlocks() {
    if (!document.body) return;
    const prevMarked = document.querySelectorAll('[data-ffe-stories-reels="1"]');
    if (!state.buttons.hideStoriesReels) {
      for (let i = 0; i < prevMarked.length; i++) {
        prevMarked[i].removeAttribute("data-ffe-stories-reels");
      }
      return;
    }
    const headings = document.querySelectorAll('div[role="main"] h3, div[role="main"] h4, div[role="main"] span[dir="auto"]');
    for (let i = 0; i < headings.length; i++) {
      const el = headings[i];
      const txt = (el.textContent || "").trim();
      if (!txt || txt.length > 32 || !STORIES_REELS_HEADING_RE.test(txt)) continue;
      const container = el.closest('[aria-posinset]') || el.closest('div[role="region"]');
      if (container && !container.closest('[role="dialog"]')) {
        container.setAttribute("data-ffe-stories-reels", "1");
      }
    }
  }
