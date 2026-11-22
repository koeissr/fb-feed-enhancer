  function isZhLocale() {
    const docLang = (document.documentElement?.lang || "").toLowerCase();
    if (docLang) return docLang.startsWith("zh");
    const navLang = (navigator.language || "").toLowerCase();
    return navLang.startsWith("zh");
  }

  function getSettingsI18n() {
    if (isZhLocale()) {
      return {
        ariaLabel: "FB Feed Enhancer 進階設定",
        title: "⚙️ FB 動態牆增強器 — 進階設定",
        subtitle: "v2.2.0 控制中心｜所有設定即時生效並自動儲存",
        closeTitle: "關閉設定視窗",
        commentSectionTitle: "留言排序偏好與快捷鍵",
        commentSortLabel: "預設留言排序目標",
        commentSortDesc: "燈箱內按 Insert 觸發偏好排序，Ctrl+Insert 反轉切換（所有留言 ↔ 最新留言）",
        optAll: "所有留言 (All)",
        optNewest: "最新留言 (Newest)",
        kwSectionTitle: "關鍵字黑名單（以逗號或換行分隔）",
        kwPlaceholder: "例如：抽獎, 限時優惠, 業配文（輸入後點擊下方套用）",
        kwCount: (n) => `目前規則：${n} 筆`,
        kwApplied: (n, h) => `已套用：${n} 筆規則（已過濾 ${h} 則）`,
        kwApplyBtn: "套用關鍵字",
        resetBtn: "重置進階設定",
        resetDone: "已重置為預設值",
        doneBtn: "完成並關閉",
        sections: [
          {
            title: "介面淨化與播放體驗",
            items: [
              { key: "expandVirtualBuffer", label: "擴大 4 欄虛擬捲動緩衝區（防回捲變白）", desc: "延緩 FB 卸載已滑過的貼文（略增記憶體，切換後重新整理生效）；搭配自動回捲喚醒重繪" },
              { key: "hoverPlayVideo", label: "動態牆影片懸浮播放（預設暫停）", desc: "Feed 動態牆影片預設不自動播放，滑鼠移入播放、移開暫停（排除 Reels/Watch）" },
              { key: "videoHotkeys", label: "影片進度與倍速快捷鍵", desc: "播放影片時按 ←/→ 快退/快進 5 秒、[/] 即時調整倍速（自動避開輸入框）" },
              { key: "reelPauseOnEnd", label: "Reels 播完自動暫停（取消循環）", desc: "Reels 播放至結尾時自動暫停，避免重複循環洗腦" },
              { key: "reelsTitleHide", label: "Reels 播放時自動隱藏標題遮罩", desc: "播放 Reels 時淡出標題文字，暫停或移入滑鼠時恢復" },
              { key: "cleanRightRail", label: "隱藏右側欄（贊助／聯絡人／群聊）", desc: "移除右側欄區塊，釋放橫向瀏覽空間" },
              { key: "cleanMarketplaceTab", label: "隱藏頂部「商店」頁籤", desc: "隱藏頂部導覽列的 Marketplace 入口" },
              { key: "cleanLeftFooter", label: "隱藏左側欄頁尾條款", desc: "移除側邊欄底部服務條款與隱私連結" },
              { key: "hideStoriesReels", label: "隱藏首頁限時動態與 Reels 推薦區塊", desc: "隱藏動態牆中的限時動態與短片推薦橫列" },
            ],
          },
          {
            title: "訪客防護與網址淨化",
            items: [
              { key: "removeLoginWall", label: "訪客模式去登入牆與捲動解鎖", desc: "未登入瀏覽公開貼文時隱藏登入彈窗並恢復捲動" },
              { key: "sanitizeLinks", label: "外連網址淨化（去跳轉與追蹤碼）", desc: "自動展開 l.facebook.com 跳轉並移除 fbclid 追蹤參數" },
            ],
          },
          {
            title: "內容淨化與黑名單過濾",
            items: [
              { key: "hideMetaAI", label: "隱藏 Meta AI 提示與 AI 標記卡片", desc: "以非破壞方式隱藏 Meta AI 推薦與詢問卡片" },
              { key: "hidePYMK", label: "隱藏「你可能認識的人」區塊", desc: "過濾動態牆中的好友推薦卡片" },
              { key: "keywordFilter", label: "啟用自訂關鍵字黑名單過濾", desc: "命中下方關鍵字之貼文自動隱藏（不破壞捲動）" },
            ],
          },
        ],
      };
    }
    return {
      ariaLabel: "FB Feed Enhancer Advanced Settings",
      title: "⚙️ Facebook Feed Enhancer — Settings",
      subtitle: "v2.2.0 Control Center | Changes apply immediately and auto-save",
      closeTitle: "Close settings",
      commentSectionTitle: "Comment Sorting & Hotkeys",
      commentSortLabel: "Default comment sort target",
      commentSortDesc: "Press Insert inside a post dialog to trigger preferred sort, or Ctrl+Insert to toggle (All ↔ Newest)",
      optAll: "All comments",
      optNewest: "Newest comments",
      kwSectionTitle: "Keyword Blacklist (comma or newline separated)",
      kwPlaceholder: "e.g. giveaway, sponsored, promo (click Apply below)",
      kwCount: (n) => `Active rules: ${n}`,
      kwApplied: (n, h) => `Applied: ${n} rules (${h} hidden)`,
      kwApplyBtn: "Apply Keywords",
      resetBtn: "Reset Advanced Settings",
      resetDone: "Reset to defaults",
      doneBtn: "Done & Close",
      sections: [
        {
          title: "UI Cleaner & Playback",
          items: [
            { key: "expandVirtualBuffer", label: "Expand virtual scroll buffer (anti-blank scrollback)", desc: "Delays Facebook unloading scrolled posts in multi-column mode (reload to apply) + auto scroll-up wake" },
            { key: "hoverPlayVideo", label: "Feed video hover-to-play (paused by default)", desc: "Prevents Feed video autoplay; plays on hover and pauses on leave (excludes Reels/Watch)" },
            { key: "videoHotkeys", label: "Video seek & speed hotkeys", desc: "Press ←/→ to seek 5s, [/] to adjust speed (ignores text inputs)" },
            { key: "reelPauseOnEnd", label: "Pause Reels at end instead of looping", desc: "Automatically pauses Reels when reaching the end" },
            { key: "reelsTitleHide", label: "Auto-hide Reels title overlay during playback", desc: "Fades out Reels caption text while playing; restores on pause or hover" },
            { key: "cleanRightRail", label: "Hide Right Rail (Sponsored / Contacts / Chats)", desc: "Removes the right sidebar to maximize feed width" },
            { key: "cleanMarketplaceTab", label: "Hide top Marketplace tab", desc: "Hides the Marketplace shortcut in the top navigation bar" },
            { key: "cleanLeftFooter", label: "Hide left sidebar legal footer", desc: "Removes Privacy / Terms footer links in the left sidebar" },
            { key: "hideStoriesReels", label: "Hide Home Stories & Reels shelves", desc: "Hides Stories and Reels recommendation shelves on the home feed" },
          ],
        },
        {
          title: "Guest Protection & Link Sanitizer",
          items: [
            { key: "removeLoginWall", label: "Guest login-wall bypass & scroll unlock", desc: "Hides forced login popups and restores scrolling when logged out" },
            { key: "sanitizeLinks", label: "Sanitize external links (unwrap & strip trackers)", desc: "Unwraps l.facebook.com redirects and strips fbclid / tracking params" },
          ],
        },
        {
          title: "Content Filters & Keyword Blacklist",
          items: [
            { key: "hideMetaAI", label: "Hide Meta AI prompts & AI-labeled cards", desc: "Non-destructively hides Meta AI suggestion and prompt cards" },
            { key: "hidePYMK", label: 'Hide "People you may know" cards', desc: "Filters friend suggestion cards from the feed" },
            { key: "keywordFilter", label: "Enable custom keyword blacklist filter", desc: "Hides posts matching the keywords below without breaking scroll" },
          ],
        },
      ],
    };
  }

  function applySettingsChange(key) {
    if (key === "cleanRightRail" || key === "cleanMarketplaceTab" || key === "cleanLeftFooter" || key === "hideStoriesReels") {
      applyCleanerCSS();
    } else if (key === "reelsTitleHide") {
      if (!state.buttons.reelsTitleHide) clearAllReelPlayingStates();
    } else if (key === "hoverPlayVideo") {
      syncHoverPlayVideos();
      const btn = document.getElementById("ffe-btn-hover-play");
      if (btn) updateButtonStyle(btn, state.buttons.hoverPlayVideo);
      updateCategoryDots();
    } else if (key === "videoHotkeys") {
      const btn = document.getElementById("ffe-btn-hotkeys");
      if (btn) updateButtonStyle(btn, state.buttons.videoHotkeys);
      updateCategoryDots();
    } else if (key === "reelPauseOnEnd") {
      const btn = document.getElementById("ffe-btn-reel-pause");
      if (btn) updateButtonStyle(btn, state.buttons.reelPauseOnEnd);
      const list = document.querySelectorAll("video");
      for (let i = 0; i < list.length; i++) applyReelLoopPolicyTo(list[i]);
      updateCategoryDots();
    } else if (key === "removeLoginWall") {
      if (state.buttons.removeLoginWall) applyLoginWallRemoval();
    } else if (key === "sanitizeLinks") {
      if (state.buttons.sanitizeLinks && document.body) sanitizeLinksInRoot(document.body);
    } else if (key === "hideMetaAI" || key === "hidePYMK" || key === "keywordFilter") {
      applyExtraContentFilters();
    }
  }

  function resetAdvancedSettings() {
    const defaults = {
      expandVirtualBuffer: true,
      hoverPlayVideo: false,
      videoHotkeys: true,
      reelPauseOnEnd: false,
      reelsTitleHide: true,
      cleanRightRail: false,
      cleanMarketplaceTab: false,
      cleanLeftFooter: true,
      hideStoriesReels: false,
      removeLoginWall: true,
      sanitizeLinks: true,
      hideMetaAI: false,
      hidePYMK: false,
      keywordFilter: false,
    };
    for (const [k, v] of Object.entries(defaults)) {
      state.buttons[k] = v;
      GM_setValue(`${k}Enabled`, v);
    }
    state.settings.commentSortMode = "all";
    GM_setValue("commentSortMode", "all");
    state.settings.keywordBlacklist = "";
    GM_setValue("keywordBlacklist", "");

    applyCleanerCSS();
    if (!state.buttons.reelsTitleHide) clearAllReelPlayingStates();
    applyExtraContentFilters();
    if (state.buttons.sanitizeLinks && document.body) sanitizeLinksInRoot(document.body);
    syncSettingsModalValues();
  }

  function syncSettingsModalValues() {
    const modal = resources.settingsModal;
    if (!modal || !modal.isConnected) return;
    const toggles = modal.querySelectorAll('input[type="checkbox"][data-ffe-key]');
    for (let i = 0; i < toggles.length; i++) {
      const key = toggles[i].getAttribute("data-ffe-key");
      if (key && key in state.buttons) {
        toggles[i].checked = !!state.buttons[key];
      }
    }
    const sortSelect = modal.querySelector("#ffe-comment-sort-mode");
    if (sortSelect) {
      sortSelect.value = state.settings.commentSortMode === "newest" ? "newest" : "all";
    }
    const kwTextarea = modal.querySelector("#ffe-keyword-blacklist");
    if (kwTextarea) {
      kwTextarea.value = typeof state.settings.keywordBlacklist === "string" ? state.settings.keywordBlacklist : "";
    }
  }

  function createSettingsModal() {
    const currentLang = isZhLocale() ? "zh" : "en";
    if (resources.settingsModal && resources.settingsModal.isConnected) {
      if (resources.settingsModal.getAttribute("data-ffe-lang") === currentLang) {
        return resources.settingsModal;
      }
      resources.settingsModal.remove();
      resources.settingsModal = null;
    }
    if (!document.body) return null;

    const t = getSettingsI18n();
    const backdrop = document.createElement("div");
    backdrop.id = "ffe-settings-modal";
    backdrop.className = "ffe-modal-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.setAttribute("aria-label", t.ariaLabel);
    backdrop.setAttribute("data-ffe-lang", currentLang);
    backdrop.style.display = "none";

    const card = document.createElement("div");
    card.className = "ffe-modal-card";

    // Header
    const header = document.createElement("div");
    header.className = "ffe-modal-header";
    const titleWrap = document.createElement("div");
    const h2 = document.createElement("h2");
    h2.className = "ffe-modal-title";
    h2.textContent = t.title;
    const sub = document.createElement("div");
    sub.className = "ffe-modal-subtitle";
    sub.textContent = t.subtitle;
    titleWrap.appendChild(h2);
    titleWrap.appendChild(sub);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.id = "ffe-settings-close";
    closeBtn.className = "ffe-btn-icon";
    closeBtn.textContent = "✕";
    closeBtn.title = t.closeTitle;
    registerEventListener(closeBtn, "click", () => toggleSettingsModal(false));

    header.appendChild(titleWrap);
    header.appendChild(closeBtn);
    card.appendChild(header);

    // Body
    const body = document.createElement("div");
    body.className = "ffe-modal-body";

    for (let s = 0; s < t.sections.length; s++) {
      const sec = t.sections[s];
      const sectionEl = document.createElement("div");
      sectionEl.className = "ffe-section";
      const secTitle = document.createElement("div");
      secTitle.className = "ffe-section-title";
      secTitle.textContent = sec.title;
      sectionEl.appendChild(secTitle);

      for (let i = 0; i < sec.items.length; i++) {
        const item = sec.items[i];
        const row = document.createElement("label");
        row.className = "ffe-setting-row";

        const info = document.createElement("div");
        info.className = "ffe-setting-info";
        const nameEl = document.createElement("div");
        nameEl.className = "ffe-setting-label";
        nameEl.textContent = item.label;
        const descEl = document.createElement("div");
        descEl.className = "ffe-setting-desc";
        descEl.textContent = item.desc;
        info.appendChild(nameEl);
        info.appendChild(descEl);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "ffe-checkbox";
        checkbox.setAttribute("data-ffe-key", item.key);
        checkbox.checked = !!state.buttons[item.key];
        registerEventListener(checkbox, "change", () => {
          state.buttons[item.key] = checkbox.checked;
          GM_setValue(`${item.key}Enabled`, checkbox.checked);
          applySettingsChange(item.key);
        });

        row.appendChild(info);
        row.appendChild(checkbox);
        sectionEl.appendChild(row);
      }
      body.appendChild(sectionEl);
    }

    // 留言排序偏好區塊
    const commentSec = document.createElement("div");
    commentSec.className = "ffe-section";
    const commentTitle = document.createElement("div");
    commentTitle.className = "ffe-section-title";
    commentTitle.textContent = t.commentSectionTitle;
    commentSec.appendChild(commentTitle);

    const sortRow = document.createElement("div");
    sortRow.className = "ffe-setting-row";
    const sortInfo = document.createElement("div");
    sortInfo.className = "ffe-setting-info";
    const sortLabel = document.createElement("div");
    sortLabel.className = "ffe-setting-label";
    sortLabel.textContent = t.commentSortLabel;
    const sortDesc = document.createElement("div");
    sortDesc.className = "ffe-setting-desc";
    sortDesc.textContent = t.commentSortDesc;
    sortInfo.appendChild(sortLabel);
    sortInfo.appendChild(sortDesc);

    const sortSelect = document.createElement("select");
    sortSelect.id = "ffe-comment-sort-mode";
    sortSelect.className = "ffe-select";
    const optAll = document.createElement("option");
    optAll.value = "all";
    optAll.textContent = t.optAll;
    const optNewest = document.createElement("option");
    optNewest.value = "newest";
    optNewest.textContent = t.optNewest;
    sortSelect.appendChild(optAll);
    sortSelect.appendChild(optNewest);
    sortSelect.value = state.settings.commentSortMode === "newest" ? "newest" : "all";
    registerEventListener(sortSelect, "change", () => {
      const val = sortSelect.value === "newest" ? "newest" : "all";
      state.settings.commentSortMode = val;
      GM_setValue("commentSortMode", val);
    });

    sortRow.appendChild(sortInfo);
    sortRow.appendChild(sortSelect);
    commentSec.appendChild(sortRow);
    body.appendChild(commentSec);

    // 關鍵字黑名單輸入區
    const kwSec = document.createElement("div");
    kwSec.className = "ffe-section";
    const kwTitle = document.createElement("div");
    kwTitle.className = "ffe-section-title";
    kwTitle.textContent = t.kwSectionTitle;
    kwSec.appendChild(kwTitle);

    const kwArea = document.createElement("textarea");
    kwArea.id = "ffe-keyword-blacklist";
    kwArea.className = "ffe-textarea";
    kwArea.rows = 3;
    kwArea.placeholder = t.kwPlaceholder;
    kwArea.value = typeof state.settings.keywordBlacklist === "string" ? state.settings.keywordBlacklist : "";

    const kwActions = document.createElement("div");
    kwActions.className = "ffe-inline-actions";
    const kwStatus = document.createElement("span");
    kwStatus.id = "ffe-kw-status";
    kwStatus.className = "ffe-status-badge";
    kwStatus.textContent = t.kwCount(parseKeywordBlacklist().length);

    const applyKwBtn = document.createElement("button");
    applyKwBtn.type = "button";
    applyKwBtn.id = "ffe-apply-keywords";
    applyKwBtn.className = "ffe-btn-primary";
    applyKwBtn.textContent = t.kwApplyBtn;
    registerEventListener(applyKwBtn, "click", () => {
      state.settings.keywordBlacklist = kwArea.value;
      GM_setValue("keywordBlacklist", kwArea.value);
      const count = parseKeywordBlacklist().length;
      const hidden = applyExtraContentFilters();
      kwStatus.textContent = t.kwApplied(count, hidden);
    });

    kwActions.appendChild(kwStatus);
    kwActions.appendChild(applyKwBtn);
    kwSec.appendChild(kwArea);
    kwSec.appendChild(kwActions);
    body.appendChild(kwSec);

    card.appendChild(body);

    // Footer
    const footer = document.createElement("div");
    footer.className = "ffe-modal-footer";
    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.id = "ffe-reset-settings";
    resetBtn.className = "ffe-btn-secondary";
    resetBtn.textContent = t.resetBtn;
    registerEventListener(resetBtn, "click", () => {
      resetAdvancedSettings();
      kwStatus.textContent = t.resetDone;
    });

    const doneBtn = document.createElement("button");
    doneBtn.type = "button";
    doneBtn.id = "ffe-settings-done";
    doneBtn.className = "ffe-btn-primary";
    doneBtn.textContent = t.doneBtn;
    registerEventListener(doneBtn, "click", () => toggleSettingsModal(false));

    footer.appendChild(resetBtn);
    footer.appendChild(doneBtn);
    card.appendChild(footer);

    backdrop.appendChild(card);
    registerEventListener(backdrop, "click", (e) => {
      if (e.target === backdrop) toggleSettingsModal(false);
    });

    document.body.appendChild(backdrop);
    resources.settingsModal = backdrop;
    return backdrop;
  }

  function toggleSettingsModal(forceOpen = null) {
    const modal = createSettingsModal();
    if (!modal) return false;
    const isCurrentlyOpen = modal.style.display === "flex";
    const nextOpen = typeof forceOpen === "boolean" ? forceOpen : !isCurrentlyOpen;
    if (nextOpen) {
      syncSettingsModalValues();
      modal.style.display = "flex";
      modal.classList.add("ffe-modal-open");
    } else {
      modal.style.display = "none";
      modal.classList.remove("ffe-modal-open");
    }
    if (resources.settingsBtn) {
      updateButtonStyle(resources.settingsBtn, nextOpen);
    }
    return nextOpen;
  }
