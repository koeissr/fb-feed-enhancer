  const SETTINGS_SECTIONS = [
    {
      title: "介面淨化與播放體驗（Phase 1）",
      items: [
        { key: "reelsTitleHide", label: "Reels 播放時自動隱藏標題遮罩", desc: "播放 Reels 時淡出標題文字，暫停或移入滑鼠時恢復" },
        { key: "cleanRightRail", label: "隱藏右側欄（贊助／聯絡人／群聊）", desc: "移除右側欄區塊，釋放橫向瀏覽空間" },
        { key: "cleanMarketplaceTab", label: "隱藏頂部「商店」頁籤", desc: "隱藏頂部導覽列的 Marketplace 入口" },
        { key: "cleanLeftFooter", label: "隱藏左側欄頁尾條款", desc: "移除側邊欄底部服務條款與隱私連結" },
        { key: "hideStoriesReels", label: "隱藏首頁限時動態與 Reels 推薦區塊", desc: "隱藏動態牆中的限時動態與短片推薦橫列" },
      ],
    },
    {
      title: "訪客防護與網址淨化（Phase 1）",
      items: [
        { key: "removeLoginWall", label: "訪客模式去登入牆與捲動解鎖", desc: "未登入瀏覽公開貼文時隱藏登入彈窗並恢復捲動" },
        { key: "sanitizeLinks", label: "外連網址淨化（去跳轉與追蹤碼）", desc: "自動展開 l.facebook.com 跳轉並移除 fbclid 追蹤參數" },
      ],
    },
    {
      title: "內容淨化與黑名單過濾（Phase 2）",
      items: [
        { key: "hideMetaAI", label: "隱藏 Meta AI 提示與 AI 標記卡片", desc: "以非破壞方式隱藏 Meta AI 推薦與詢問卡片" },
        { key: "hidePYMK", label: "隱藏「你可能認識的人」區塊", desc: "過濾動態牆中的好友推薦卡片" },
        { key: "keywordFilter", label: "啟用自訂關鍵字黑名單過濾", desc: "命中下方關鍵字之貼文自動隱藏（不破壞捲動）" },
      ],
    },
  ];

  function applySettingsChange(key) {
    if (key === "cleanRightRail" || key === "cleanMarketplaceTab" || key === "cleanLeftFooter" || key === "hideStoriesReels") {
      applyCleanerCSS();
    } else if (key === "reelsTitleHide") {
      if (!state.buttons.reelsTitleHide) clearAllReelPlayingStates();
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
    if (resources.settingsModal && resources.settingsModal.isConnected) return resources.settingsModal;
    if (!document.body) return null;

    const backdrop = document.createElement("div");
    backdrop.id = "ffe-settings-modal";
    backdrop.className = "ffe-modal-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.setAttribute("aria-label", "FB Feed Enhancer 進階設定");
    backdrop.style.display = "none";

    const card = document.createElement("div");
    card.className = "ffe-modal-card";

    // Header
    const header = document.createElement("div");
    header.className = "ffe-modal-header";
    const titleWrap = document.createElement("div");
    const h2 = document.createElement("h2");
    h2.className = "ffe-modal-title";
    h2.textContent = "⚙️ FB 動態牆增強器 — 進階設定";
    const sub = document.createElement("div");
    sub.className = "ffe-modal-subtitle";
    sub.textContent = "v2.0.0 莫蘭迪控制中心｜所有設定即時生效並自動儲存";
    titleWrap.appendChild(h2);
    titleWrap.appendChild(sub);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.id = "ffe-settings-close";
    closeBtn.className = "ffe-btn-icon";
    closeBtn.textContent = "✕";
    closeBtn.title = "關閉設定視窗";
    registerEventListener(closeBtn, "click", () => toggleSettingsModal(false));

    header.appendChild(titleWrap);
    header.appendChild(closeBtn);
    card.appendChild(header);

    // Body
    const body = document.createElement("div");
    body.className = "ffe-modal-body";

    for (let s = 0; s < SETTINGS_SECTIONS.length; s++) {
      const sec = SETTINGS_SECTIONS[s];
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

    // 留言排序偏好區塊（Phase 1 #8）
    const commentSec = document.createElement("div");
    commentSec.className = "ffe-section";
    const commentTitle = document.createElement("div");
    commentTitle.className = "ffe-section-title";
    commentTitle.textContent = "留言排序偏好與快捷鍵";
    commentSec.appendChild(commentTitle);

    const sortRow = document.createElement("div");
    sortRow.className = "ffe-setting-row";
    const sortInfo = document.createElement("div");
    sortInfo.className = "ffe-setting-info";
    const sortLabel = document.createElement("div");
    sortLabel.className = "ffe-setting-label";
    sortLabel.textContent = "預設留言排序目標";
    const sortDesc = document.createElement("div");
    sortDesc.className = "ffe-setting-desc";
    sortDesc.textContent = "燈箱內按 Insert 觸發偏好排序，Ctrl+Insert 反轉切換（所有留言 ↔ 最新留言）";
    sortInfo.appendChild(sortLabel);
    sortInfo.appendChild(sortDesc);

    const sortSelect = document.createElement("select");
    sortSelect.id = "ffe-comment-sort-mode";
    sortSelect.className = "ffe-select";
    const optAll = document.createElement("option");
    optAll.value = "all";
    optAll.textContent = "所有留言 (All)";
    const optNewest = document.createElement("option");
    optNewest.value = "newest";
    optNewest.textContent = "最新留言 (Newest)";
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

    // 關鍵字黑名單輸入區（Phase 2 #7）
    const kwSec = document.createElement("div");
    kwSec.className = "ffe-section";
    const kwTitle = document.createElement("div");
    kwTitle.className = "ffe-section-title";
    kwTitle.textContent = "關鍵字黑名單（以逗號或換行分隔）";
    kwSec.appendChild(kwTitle);

    const kwArea = document.createElement("textarea");
    kwArea.id = "ffe-keyword-blacklist";
    kwArea.className = "ffe-textarea";
    kwArea.rows = 3;
    kwArea.placeholder = "例如：抽獎, 限時優惠, 業配文（輸入後點擊下方套用）";
    kwArea.value = typeof state.settings.keywordBlacklist === "string" ? state.settings.keywordBlacklist : "";

    const kwActions = document.createElement("div");
    kwActions.className = "ffe-inline-actions";
    const kwStatus = document.createElement("span");
    kwStatus.id = "ffe-kw-status";
    kwStatus.className = "ffe-status-badge";
    kwStatus.textContent = `目前規則：${parseKeywordBlacklist().length} 筆`;

    const applyKwBtn = document.createElement("button");
    applyKwBtn.type = "button";
    applyKwBtn.id = "ffe-apply-keywords";
    applyKwBtn.className = "ffe-btn-primary";
    applyKwBtn.textContent = "套用關鍵字";
    registerEventListener(applyKwBtn, "click", () => {
      state.settings.keywordBlacklist = kwArea.value;
      GM_setValue("keywordBlacklist", kwArea.value);
      const count = parseKeywordBlacklist().length;
      const hidden = applyExtraContentFilters();
      kwStatus.textContent = `已套用：${count} 筆規則（已過濾 ${hidden} 則）`;
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
    resetBtn.textContent = "重置進階設定";
    registerEventListener(resetBtn, "click", () => {
      resetAdvancedSettings();
      kwStatus.textContent = "已重置為預設值";
    });

    const doneBtn = document.createElement("button");
    doneBtn.type = "button";
    doneBtn.id = "ffe-settings-done";
    doneBtn.className = "ffe-btn-primary";
    doneBtn.textContent = "完成並關閉";
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
