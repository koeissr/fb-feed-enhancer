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
      resources.padLabel.style.color = state.buttons.hoverPad ? "#4c9bff" : "#8a93a5";
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
  }
  function createSmallButton(text, action) {
    const btn = document.createElement("button");
    Object.assign(btn.style, {
      padding: "2px 0",
      border: "1px solid #CBD5E0",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
      width: "20px",
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
      marginTop: "-5px",
    });
    for (let i = 0; i < buttons.length; i++) group.append(buttons[i]);
    return group;
  }
  function createControlPanel() {
    if (!state.isActivePage || !document.body) return;
    if (state.panelCreated && resources.panel?.isConnected) return;
    if (resources.panel && !resources.panel.isConnected) {
      resources.panel = null;
      resources.padBtn = null;
      resources.padLabel = null;
      resources.likeBtn = null;
      resources.expandBtn = null;
      state.panelCreated = false;
    }
    const panel = document.createElement("div");
    panel.className = "ww-rail";
    Object.assign(panel.style, {
      position: "fixed",
      left: "0px",
      bottom: "30px",
      zIndex: "9999",
      display: "flex",
      flexDirection: "column",
      gap: "5px",
      backgroundColor: "rgba(247,248,250,0.94)",
      border: "1px solid #CBD5E0",
      boxShadow: "0 6px 20px rgba(45,55,72,0.14)",
      backdropFilter: "blur(6px)",
      maxHeight: "calc(100vh - 60px)",
      overflowY: "auto",
      overflowX: "hidden",
      padding: "10px",
      borderRadius: "10px",
    });
    const createIconButton = (icon, key, action, title = "") => {
      const btn = document.createElement("button");
      Object.assign(btn.style, {
        padding: "8px 12px",
        border: "none",
        borderRadius: "4px",
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
    const sidebarBtn = createIconButton("📐", "sidebar", applyMultiColumnCSS, "側欄收縮 / Toggle sidebar");
    const likeBtn = createIconButton(
      "❤️",
      "like",
      () => {
        if (!state.buttons.like) state.pendingLike = null;
      },
      "游標自動點讚 / Hover auto-like",
    );
    resources.likeBtn = likeBtn;
    const autoLikePostBtn = createIconButton(
      "👍",
      "autoLikePost",
      () => {
        state.pendingLike = null;
        seedInteractives();
        syncCycleTimer(true);
        pump(true);
      },
      "貼文自動點讚（每4秒，排除留言與廣告）/ Auto-like posts every 4s",
    );
    const adHideBtn = createIconButton(
      "🚫",
      "adHide",
      () => {
        seedInteractives();
        if (state.buttons.adHide) {
          state.adPrimed = false;
          state.lastAdHideAt = -1e9;
        }
        syncCycleTimer(true);
        pump(true);
      },
      "自動隱藏廣告與推薦貼文（每4秒，最優先）/ Auto-hide ads every 4s",
    );
    const postExpandBtn = createIconButton(
      "📖",
      "postExpand",
      () => {
        if (state.buttons.postExpand) {
          seedInteractives();
          pump(true);
        }
      },
      "貼文自動展開查看更多（單次點擊不摺疊）/ Auto-expand post See More",
    );
    const expandBtn = createIconButton(
      "💬",
      "otherExpand",
      () => {
        if (state.buttons.otherExpand) {
          seedInteractives();
          pump(true);
        }
      },
      "自動展開留言／摺疊回覆／查看更多留言（僅燈箱與單一貼文頁）/ Safe comment auto-expand",
    );
    resources.expandBtn = expandBtn;
    const preventRefreshBtn = createIconButton(
      "🔒",
      "preventRefresh",
      null,
      "防止切換分頁自動重新整理 / Prevent auto-refresh on tab switch",
    );
    const allCommentsBtn = createIconButton(
      "📋",
      "allComments",
      () => {
        if (state.buttons.allComments) pump(true);
      },
      "預設切換所有留言（僅燈箱與單一貼文頁）/ Default to All comments",
    );
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
      lineHeight: "1.2",
      marginTop: "-4px",
      fontFamily: "ui-monospace,monospace",
      fontWeight: "bold",
      color: "#4c9bff",
      flex: "0 0 auto",
    });
    resources.padLabel = padLabel;
    const volumeBtn = createIconButton(
      "🔊",
      "volume",
      () => {
        if (state.buttons.volume) refreshVideoList();
      },
      "音量控制 / Volume control",
    );
    const volumeControlGroup = createControlGroup([
      createSmallButton("−", () => adjustVolume(-0.1)),
      createSmallButton("+", () => adjustVolume(0.1)),
    ]);
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
    const settingsBtn = document.createElement("button");
    settingsBtn.id = "ffe-settings-btn";
    Object.assign(settingsBtn.style, {
      padding: "8px 12px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "bold",
      width: "40px",
      textAlign: "center",
      fontSize: "16px",
      lineHeight: "1",
      flex: "0 0 auto",
    });
    settingsBtn.textContent = "⚙️";
    settingsBtn.title = "進階設定（介面淨化／Reels／登入牆／外連淨化／黑名單）/ Advanced settings";
    registerEventListener(settingsBtn, "click", () => toggleSettingsModal());
    updateButtonStyle(settingsBtn, false);
    resources.settingsBtn = settingsBtn;

    const items = [
      settingsBtn,
      sidebarBtn, preventRefreshBtn, allCommentsBtn, likeBtn, autoLikePostBtn, adHideBtn,
      postExpandBtn, expandBtn,
      hoverBtn, hoverControlGroup, padLabel,
      volumeBtn, volumeControlGroup,
      columnBtn, columnControlGroup, heightBtn, heightControlGroup,
      expandWidthBtn, expandWidthControlGroup,
    ];
    for (let i = 0; i < items.length; i++) panel.appendChild(items[i]);
    document.body.appendChild(panel);
    resources.panel = panel;
    state.panelCreated = true;
    updatePadLabel();
    updateModeLabels();
  }
  function setPanelVisibility(visible) {
    if (!resources.panel?.isConnected) return;
    resources.panel.style.display = visible ? "flex" : "none";
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
    state.settings.expandWidth = Math.max(20, Math.min(100, state.settings.expandWidth + change));
    GM_setValue("expandWidth", state.settings.expandWidth);
    if (state.buttons.expandWidth) applyMultiColumnCSS();
  }
  function adjustHoverPad(change) {
    state.settings.hoverPad = Math.max(0, Math.min(CONFIG.HOVER_PAD_MAX, state.settings.hoverPad + change));
    GM_setValue("hoverPad", state.settings.hoverPad);
    updatePadLabel();
  }
  function adjustVolume(change) {
    state.settings.volume = Math.round(Math.min(1, Math.max(0, state.settings.volume + change)) * 100) / 100;
    GM_setValue("volume", state.settings.volume);
    if (state.isActivePage && state.buttons.volume) processAllVideos();
  }
