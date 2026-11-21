  const META_AI_RE = /(Meta AI|由 AI 生成|AI 資訊|AI info|向 Meta AI 提問|Ask Meta AI|試用 Meta AI|Try Meta AI)/i;
  const PYMK_RE = /^(你可能認識的人|你可能认识的人|People you may know)$/i;

  function parseKeywordBlacklist() {
    const raw = typeof state.settings.keywordBlacklist === "string" ? state.settings.keywordBlacklist : "";
    if (!raw.trim()) return [];
    const tokens = raw
      .split(/[\n,，;；]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);
    return Array.from(new Set(tokens));
  }

  function matchExtraContentFilter(root, keywords) {
    if (!root || !root.isConnected) return null;
    if (root.closest('[role="dialog"]')) return null;

    // 1. Meta AI 提示卡片或 AI 標記推薦
    if (state.buttons.hideMetaAI) {
      const aiNode = root.querySelector('a[href*="meta.ai"], [aria-label*="Meta AI"]');
      if (aiNode) return "meta_ai";
      const headerTxt = (root.textContent || "").slice(0, 260);
      if (META_AI_RE.test(headerTxt)) return "meta_ai";
    }

    // 2. 你可能認識的人 (PYMK)
    if (state.buttons.hidePYMK) {
      const headings = root.querySelectorAll("h3, h4, span[dir='auto']");
      for (let i = 0; i < headings.length; i++) {
        const txt = (headings[i].textContent || "").trim();
        if (txt && txt.length <= 24 && PYMK_RE.test(txt)) return "pymk";
      }
    }

    // 3. 自訂關鍵字黑名單
    if (state.buttons.keywordFilter && keywords.length > 0) {
      const bodyText = (root.textContent || "").toLowerCase();
      for (let i = 0; i < keywords.length; i++) {
        if (bodyText.includes(keywords[i])) return `keyword:${keywords[i]}`;
      }
    }

    return null;
  }

  function applyExtraContentFilters() {
    if (!document.body) return 0;
    const anyEnabled = state.buttons.hideMetaAI || state.buttons.hidePYMK || state.buttons.keywordFilter;
    const keywords = state.buttons.keywordFilter ? parseKeywordBlacklist() : [];

    // 若全部過濾皆關閉，還原先前被標記的貼文
    if (!anyEnabled || (state.buttons.keywordFilter && !state.buttons.hideMetaAI && !state.buttons.hidePYMK && keywords.length === 0)) {
      const marked = document.querySelectorAll('[data-ffe-filtered="1"][data-ffe-filter-reason]');
      for (let i = 0; i < marked.length; i++) {
        marked[i].removeAttribute("data-ffe-filtered");
        marked[i].removeAttribute("data-ffe-filter-reason");
      }
      return 0;
    }

    let hiddenCount = 0;
    const candidates = new Set(postRoots);
    const articles = document.querySelectorAll('div[role="main"] [aria-posinset], div[role="main"] div[role="article"]');
    for (let i = 0; i < articles.length; i++) {
      candidates.add(articles[i]);
    }

    for (const root of candidates) {
      if (!root || !root.isConnected) continue;
      const reason = matchExtraContentFilter(root, keywords);
      if (reason) {
        root.setAttribute("data-ffe-filtered", "1");
        root.setAttribute("data-ffe-filter-reason", reason);
        hiddenCount++;
      } else if (root.hasAttribute("data-ffe-filter-reason")) {
        root.removeAttribute("data-ffe-filtered");
        root.removeAttribute("data-ffe-filter-reason");
      }
    }
    return hiddenCount;
  }
