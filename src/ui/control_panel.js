  function updateButtonStyle(btn, isActive) {
    btn.style.backgroundColor = isActive ? "#7D9D8B" : "#E5E7EB";
    btn.style.color = isActive ? "#FFFFFF" : "#2D3748";
  }
  function updatePadLabel() {
    if (resources.padBtn?.isConnected) {
      resources.padBtn.title = `游標觸發範圍 ${state.settings.hoverPad}px（僅貼文）/ Post-only hover pad`;
    }
    if (resources.padLabel?.isConnected) {
      resources.padLabel.textContent = state.buttons.hoverPad ? `${state.settings.hoverPad}px` : "off";
      resources.padLabel.style.color = state.buttons.hoverPad ? "#6B8E9F" : "#718096";
    }
  }
  function updateModeLabels() {
    if (resources.likeBtn?.isConnected) {
      resources.likeBtn.title = state.buttons.autoLikePost
        ? "游標自動點讚（僅留言）/ Hover like (comments only)"
        : "游標自動點讚 / Hover auto-like";
    }
    if (resources.expandBtn?.isConnected) {
      resources.expandBtn.title = state.buttons.postExpand
        ? "自動展開留言／回覆／更多留言（游標展開已停用）/ Comments, replies and more-comments auto-expand"
        : "自動展開留言／回覆／更多留言 / Comments, replies and more-comments auto-expand";
    }
    updateCategoryDots();
  }
  function updateCategoryDots() {
    const map = {
      layout: state.buttons.sidebar || state.buttons.columns || state.buttons.height || state.buttons.expandWidth,
      feed: state.buttons.preventRefresh || state.buttons.allComments || state.buttons.postExpand || state.buttons.otherExpand || state.buttons.adHide || state.buttons.like || state.buttons.autoLikePost || state.buttons.hoverPad,
      media: state.buttons.volume || state.buttons.hoverPlayVideo,
    };
    for (const [cat, hasOn] of Object.entries(map)) {
      const btn = resources.drawerTriggers?.[cat];
      if (btn?.isConnected) {
        btn.classList.toggle("ffe-cat-has-on", !!hasOn);
      }
    }
  }
  function closeAllDrawers() {
    resources.activeDrawer = null;
    for (const [cat, drawer] of Object.entries(resources.drawerContainers || {})) {
      if (drawer?.isConnected) {
        drawer.classList.remove("ffe-drawer-open");
        drawer.style.display = "none";
      }
      const trig = resources.drawerTriggers?.[cat];
      if (trig?.isConnected) trig.classList.remove("ffe-cat-active");
    }
  }
  function toggleDrawer(cat) {
    const drawer = resources.drawerContainers?.[cat];
    const trig = resources.drawerTriggers?.[cat];
    if (!drawer || !trig) return false;
    const willOpen = resources.activeDrawer !== cat;
    closeAllDrawers();
    if (willOpen) {
      const r = trig.getBoundingClientRect();
      const topPos = Math.max(12, Math.min(window.innerHeight - 86, r.top - 6));
      drawer.style.top = `${Math.round(topPos)}px`;
      drawer.style.display = "flex";
      drawer.classList.add("ffe-drawer-open");
      trig.classList.add("ffe-cat-active");
      resources.activeDrawer = cat;
    }
    return willOpen;
  }
  function createSmallButton(text, action) {
    const btn = document.createElement("button");
    Object.assign(btn.style, {
      padding: "2px 0",
      border: "1px solid #CBD5E0",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
      width: "19px",
      textAlign: "center",
      backgroundColor: "#F2F4F7",
      color: "#2D3748",
      lineHeight: "1",
    });
    btn.textContent = text;
    registerEventListener(btn, "click", action);
    return btn;
  }
  function createControlGroup(buttons) {
    const group = document.createElement("div");
    Object.assign(group.style, {
      display: "flex",
      justifyContent: "space-between",
      width: "40px",
      gap: "2px",
    });
    for (let i = 0; i < buttons.length; i++) group.append(buttons[i]);
    return group;
  }
  function createDrawerCell(elements) {
    const cell = document.createElement("div");
    cell.className = "ffe-drawer-cell";
    for (let i = 0; i < elements.length; i++) cell.appendChild(elements[i]);
    return cell;
  }
  function createControlPanel() {
    if (!state.isActivePage || !document.body) return;
    if (state.panelCreated && resources.panel?.isConnected) return;
    if (resources.panel && !resources.panel.isConnected) {
      resources.panel = null;
      resources.drawerContainers = {};
      resources.drawerTriggers = {};
      resources.activeDrawer = null;
      resources.padBtn = null;
      resources.padLabel = null;
      resources.likeBtn = null;
      resources.expandBtn = null;
      resources.settingsBtn = null;
      state.panelCreated = false;
    }

    const panel = document.createElement("div");
    panel.className = "ww-rail";
    panel.id = "ffe-dock";
    Object.assign(panel.style, {
      position: "fixed",
      left: "8px",
      bottom: "36px",
      zIndex: "9999",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      backgroundColor: "rgba(247,248,250,0.95)",
      border: "1px solid #CBD5E0",
      boxShadow: "0 6px 20px rgba(45,55,72,0.14)",
      backdropFilter: "blur(6px)",
      padding: "8px",
      borderRadius: "12px",
    });

    const createIconButton = (icon, key, action, title = "", id = "") => {
      const btn = document.createElement("button");
      if (id) btn.id = id;
      Object.assign(btn.style, {
        padding: "8px 0",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        width: "40px",
        textAlign: "center",
        fontSize: "16px",
        lineHeight: "1",
        flex: "0 0 auto",
      });
      btn.textContent = icon;
      btn.title = title;
      btn.setAttribute("data-ffe-btn", key);
      const handler = () => {
        state.buttons[key] = !state.buttons[key];
        GM_setValue(`${key}Enabled`, state.buttons[key]);
        updateButtonStyle(btn, state.buttons[key]);
        action?.();
        updateModeLabels();
      };
      registerEventListener(btn, "click", handler);
      updateButtonStyle(btn, state.buttons[key]);
      return btn;
    };

    // === 1. 版面與排版抽屜元件 ===
    const sidebarBtn = createIconButton("📐", "sidebar", applyMultiColumnCSS, "側欄收縮 / Toggle sidebar");
    const columnBtn = createIconButton("🗂️", "columns", applyMultiColumnCSS, "多欄佈局 / Multi-column layout");
    const columnControlGroup = createControlGroup([
      createSmallButton("−", () => adjustColumnCount(-1)),
      createSmallButton("+", () => adjustColumnCount(1)),
    ]);
    const heightBtn = createIconButton("↕️", "height", applyMultiColumnCSS, `高度控制（${CONFIG.HEIGHT_MIN}～${CONFIG.HEIGHT_MAX}vh，每次${CONFIG.HEIGHT_STEP}）/ Height control`);
    const heightControlGroup = createControlGroup([
      createSmallButton("−", () => adjustMaxHeight(-CONFIG.HEIGHT_STEP)),
      createSmallButton("+", () => adjustMaxHeight(CONFIG.HEIGHT_STEP)),
    ]);
    const expandWidthBtn = createIconButton("↔️", "expandWidth", applyMultiColumnCSS, "展開寬度 / Expand width");
    const expandWidthControlGroup = createControlGroup([
      createSmallButton("−", () => adjustExpandWidth(-CONFIG.EXPAND_WIDTH_STEP)),
      createSmallButton("+", () => adjustExpandWidth(CONFIG.EXPAND_WIDTH_STEP)),
    ]);

    // === 2. 自動互動與淨化抽屜元件 ===
    const preventRefreshBtn = createIconButton("🔒", "preventRefresh", null, "防止切換分頁自動重新整理 / Prevent auto-refresh on tab switch");
    const allCommentsBtn = createIconButton("📋", "allComments", () => { if (state.buttons.allComments) pump(true); }, "預設切換所有／最新留言（燈箱內按 Insert / Ctrl+Insert）/ Auto comment sort");
    const postExpandBtn = createIconButton("📖", "postExpand", () => { if (state.buttons.postExpand) { seedInteractives(); pump(true); } }, "貼文自動展開查看更多 / Auto-expand post See More");
    const expandBtn = createIconButton("💬", "otherExpand", () => { if (state.buttons.otherExpand) { seedInteractives(); pump(true); } }, "安全版自動展開留言（僅燈箱與單一貼文頁）/ Safe comment auto-expand");
    resources.expandBtn = expandBtn;
    const adHideBtn = createIconButton("🚫", "adHide", () => {
      seedInteractives();
      if (state.buttons.adHide) {
        state.adPrimed = false;
        state.lastAdHideAt = -1e9;
      }
      syncCycleTimer(true);
      pump(true);
    }, "自動隱藏廣告與推薦貼文 / Auto-hide ads every 4s");
    const likeBtn = createIconButton("❤️", "like", () => { if (!state.buttons.like) state.pendingLike = null; }, "游標自動點讚 / Hover auto-like");
    resources.likeBtn = likeBtn;
    const autoLikePostBtn = createIconButton("👍", "autoLikePost", () => {
      state.pendingLike = null;
      seedInteractives();
      syncCycleTimer(true);
      pump(true);
    }, "貼文自動點讚（每4秒，排除留言與廣告）/ Auto-like posts every 4s");
    const hoverBtn = createIconButton("🎯", "hoverPad", updatePadLabel, "游標觸發範圍（僅貼文）/ Post-only hover pad");
    resources.padBtn = hoverBtn;
    const hoverControlGroup = createControlGroup([
      createSmallButton("−", () => adjustHoverPad(-CONFIG.HOVER_PAD_STEP)),
      createSmallButton("+", () => adjustHoverPad(CONFIG.HOVER_PAD_STEP)),
    ]);
    const padLabel = document.createElement("div");
    Object.assign(padLabel.style, {
      width: "40px",
      textAlign: "center",
      fontSize: "10px",
      lineHeight: "1.1",
      fontFamily: "ui-monospace,monospace",
      fontWeight: "bold",
      color: "#6B8E9F",
    });
    resources.padLabel = padLabel;

    // === 3. 影片與媒體抽屜元件 ===
    const volumeBtn = createIconButton(
      "🔊",
      "volume",
      () => {
        if (state.buttons.volume) {
          refreshVideoList();
          syncNativeMuteButton(true);
        } else {
          syncNativeMuteButton(false);
        }
      },
      "音量控制與靜音聯動 / Volume control & mute sync",
      "ffe-btn-volume",
    );
    const volumeControlGroup = createControlGroup([
      createSmallButton("−", () => adjustVolume(-0.1)),
      createSmallButton("+", () => adjustVolume(0.1)),
    ]);
    const hoverPlayBtn = createIconButton(
      "▶️",
      "hoverPlayVideo",
      () => {
        syncHoverPlayVideos();
        syncSettingsModalValues();
      },
      "動態牆影片懸浮播放（預設暫停，滑鼠移入播放；排除 Reels/Watch）/ Feed hover-to-play video",
      "ffe-btn-hover-play",
    );

    const buildDrawer = (cat, titleText, cells) => {
      const drawer = document.createElement("div");
      drawer.id = `ffe-drawer-${cat}`;
      drawer.className = "ffe-drawer";
      const titleEl = document.createElement("div");
      titleEl.className = "ffe-drawer-title";
      titleEl.textContent = titleText;
      drawer.appendChild(titleEl);
      for (let i = 0; i < cells.length; i++) drawer.appendChild(cells[i]);
      document.body.appendChild(drawer);
      resources.drawerContainers[cat] = drawer;
      return drawer;
    };

    const isZh = typeof isZhLocale === "function" ? isZhLocale() : true;
    buildDrawer("layout", isZh ? "版面排版" : "Layout", [
      createDrawerCell([sidebarBtn]),
      createDrawerCell([columnBtn, columnControlGroup]),
      createDrawerCell([heightBtn, heightControlGroup]),
      createDrawerCell([expandWidthBtn, expandWidthControlGroup]),
    ]);
    buildDrawer("feed", isZh ? "互動淨化" : "Feed & Auto", [
      createDrawerCell([preventRefreshBtn]),
      createDrawerCell([allCommentsBtn]),
      createDrawerCell([postExpandBtn]),
      createDrawerCell([expandBtn]),
      createDrawerCell([adHideBtn]),
      createDrawerCell([likeBtn]),
      createDrawerCell([autoLikePostBtn]),
      createDrawerCell([hoverBtn, hoverControlGroup, padLabel]),
    ]);
    buildDrawer("media", isZh ? "影片媒體" : "Media", [
      createDrawerCell([volumeBtn, volumeControlGroup]),
      createDrawerCell([hoverPlayBtn]),
    ]);

    const createCategoryTrigger = (cat, icon, titleText) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = `ffe-cat-${cat}`;
      btn.className = "ffe-cat-btn";
      btn.title = titleText;
      btn.textContent = icon;
      const dot = document.createElement("span");
      dot.className = "ffe-cat-dot";
      btn.appendChild(dot);
      registerEventListener(btn, "click", (e) => {
        e.stopPropagation();
        toggleDrawer(cat);
      });
      resources.drawerTriggers[cat] = btn;
      return btn;
    };

    const layoutCatBtn = createCategoryTrigger("layout", "🗂️", "版面與多欄排版 / Layout & Columns");
    const feedCatBtn = createCategoryTrigger("feed", "⚡", "自動互動與廣告淨化 / Feed & Auto Controls");
    const mediaCatBtn = createCategoryTrigger("media", "🎬", "影片音量與懸浮播放 / Video & Media");

    const settingsBtn = document.createElement("button");
    settingsBtn.type = "button";
    settingsBtn.id = "ffe-settings-btn";
    settingsBtn.className = "ffe-cat-btn";
    settingsBtn.textContent = "⚙️";
    settingsBtn.title = "進階設定（介面淨化／Reels／登入牆／外連淨化／黑名單）/ Advanced settings";
    registerEventListener(settingsBtn, "click", (e) => {
      e.stopPropagation();
      closeAllDrawers();
      toggleSettingsModal();
    });
    resources.settingsBtn = settingsBtn;

    panel.appendChild(layoutCatBtn);
    panel.appendChild(feedCatBtn);
    panel.appendChild(mediaCatBtn);
    panel.appendChild(settingsBtn);

    // 點擊工具列與抽屜外部區域時自動收合抽屜
    registerEventListener(document, "click", (e) => {
      if (!resources.activeDrawer || suppressDrawerAutoClose) return;
      const target = e.target;
      if (panel.contains(target)) return;
      const activeEl = resources.drawerContainers?.[resources.activeDrawer];
      if (activeEl && activeEl.contains(target)) return;
      closeAllDrawers();
    });

    document.body.appendChild(panel);
    resources.panel = panel;
    state.panelCreated = true;
    updatePadLabel();
    updateModeLabels();
  }
  function setPanelVisibility(visible) {
    if (!resources.panel?.isConnected) return;
    resources.panel.style.display = visible ? "flex" : "none";
    if (!visible) closeAllDrawers();
  }
  function adjustColumnCount(change) {
    state.settings.columns = Math.max(1, state.settings.columns + change);
    GM_setValue("columnCount", state.settings.columns);
    if (state.buttons.columns) applyMultiColumnCSS();
  }
  function adjustMaxHeight(change) {
    state.settings.maxHeight = Math.max(CONFIG.HEIGHT_MIN, Math.min(CONFIG.HEIGHT_MAX, state.settings.maxHeight + change));
    GM_setValue("maxHeight", state.settings.maxHeight);
    if (state.buttons.height) applyMultiColumnCSS();
  }
  function adjustExpandWidth(change) {
    state.settings.expandWidth = Math.max(10, Math.min(100, state.settings.expandWidth + change));
    GM_setValue("expandWidth", state.settings.expandWidth);
    if (state.buttons.expandWidth) applyMultiColumnCSS();
  }
  function adjustHoverPad(change) {
    state.settings.hoverPad = Math.max(0, Math.min(CONFIG.HOVER_PAD_MAX, state.settings.hoverPad + change));
    GM_setValue("hoverPad", state.settings.hoverPad);
    updatePadLabel();
  }
  function adjustVolume(change) {
    state.settings.volume = Math.max(0, Math.min(1, Math.round((state.settings.volume + change) * 10) / 10));
    GM_setValue("volume", state.settings.volume);
    if (state.buttons.volume) processAllVideos();
  }
