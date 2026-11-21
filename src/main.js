  function hookHistory() {
    if (resources.historyHooks.length) return;
    const methods = ["pushState", "replaceState"];
    for (let i = 0; i < methods.length; i++) {
      const method = methods[i];
      const original = pageWindow.history?.[method];
      if (typeof original !== "function") continue;
      const wrapped = function (...args) {
        const result = original.apply(this, args);
        handleNavigation();
        return result;
      };
      try {
        pageWindow.history[method] = wrapped;
        resources.historyHooks.push({ method, original });
      } catch { }
    }
  }
  function restoreHistory() {
    for (let i = 0; i < resources.historyHooks.length; i++) {
      const { method, original } = resources.historyHooks[i];
      try {
        pageWindow.history[method] = original;
      } catch { }
    }
    resources.historyHooks.length = 0;
  }

  function onMutations(mutations) {
    if (window.location.href !== state.lastHref) {
      handleNavigation();
      return;
    }
    if (!state.isActivePage || document.hidden) return;
    for (let i = 0; i < mutations.length; i++) {
      const added = mutations[i].addedNodes;
      for (let j = 0; j < added.length; j++) {
        const node = added[j];
        if (node.nodeType !== 1) continue;
        if (node.tagName === "VIDEO") {
          adoptVideo(node);
          continue;
        }
        pendingRoots.add(node);
      }
    }
    if (pendingRoots.size > CONFIG.MAX_PENDING_ROOTS) {
      pendingRoots.clear();
      state.fullSeedPending = true;
    }
    pump(false);
  }
  function setupObservers() {
    if (!document.body) return;
    resources.observers.dom?.disconnect?.();
    resources.observers.dom = new MutationObserver(onMutations);
    resources.observers.dom.observe(document.body, { childList: true, subtree: true });
    setupInteractiveObserver();
  }
  function onHeadMutation() {
    if (window.location.href !== state.lastHref) handleNavigation();
  }
  function setupNavObserver() {
    if (resources.observers.nav || !document.head) return;
    resources.observers.nav = new MutationObserver(onHeadMutation);
    resources.observers.nav.observe(document.head, { childList: true, subtree: true, characterData: true });
  }
  function setupNavigationHandler() {
    registerEventListener(window, "popstate", handleNavigation);
    registerEventListener(window, "hashchange", handleNavigation);
    registerEventListener(window, "facebook:navigate", handleNavigation);
  }
  function teardownActivePage() {
    if (resources.cycleTimer) {
      clearInterval(resources.cycleTimer);
      resources.cycleTimer = 0;
    }
    resources.observers.dom?.disconnect?.();
    resources.observers.dom = null;
    resources.observers.interactive?.disconnect?.();
    resources.observers.interactive = null;
    observedInteractives.clear();
    postRoots.clear();
    visiblePosts.clear();
    visibleLikes.clear();
    visiblePostLikes.clear();
    visibleSeeMore.clear();
    visibleAutoExpand.clear();
    visibleReplies.clear();
    visibleMore.clear();
    pendingRoots.clear();
    pendingUnlike.clear();
    state.fullSeedPending = false;
    state.pendingLike = null;
    state.scrolling = false;
    state.adPrimed = false;
    state.lastAdHideAt = -1e9;
    invalidateRects();
    if (resources.styleTag) resources.styleTag.disabled = true;
    setPanelVisibility(false);
    invalidateCache();
  }
  function handleNavigation() {
    if (!document.body) return;
    const href = window.location.href;
    if (href === state.lastHref) return;
    state.lastHref = href;
    const path = window.location.pathname;
    const pathChanged = path !== state.lastPath;
    state.lastPath = path;
    const wasActive = state.isActivePage;
    state.isActivePage = isAllowedPage();
    invalidateCache();
    invalidateRects();
    state.pendingLike = null;
    state.scrolling = false;
    state.adPrimed = false;
    state.lastAdHideAt = -1e9;
    if (state.isActivePage) {
      if (!wasActive) setupObservers();
      createControlPanel();
      setPanelVisibility(true);
      applyMultiColumnCSS();
      applyCleanerCSS();
      clearAllReelPlayingStates();
      applyLoginWallRemoval();
      if (!wasActive || pathChanged) state.fullSeedPending = true;
      if (!wasActive) refreshVideoList();
      syncCycleTimer(false);
      pump(true);
    } else if (wasActive) {
      teardownActivePage();
    }
  }
  function onVisibility() {
    if (document.hidden) return;
    if (window.location.href !== state.lastHref) {
      handleNavigation();
      return;
    }
    pump(true);
    syncCycleTimer(false);
  }
  function cleanupResources() {
    teardownActivePage();
    for (let i = 0; i < resources.eventHandlers.length; i++) {
      const { element, type, handler, options } = resources.eventHandlers[i];
      try {
        element?.removeEventListener?.(type, handler, options);
      } catch { }
    }
    resources.eventHandlers.length = 0;
    restoreHistory();
    resources.observers.nav?.disconnect?.();
    resources.observers.nav = null;
    if (resources.panel?.isConnected) resources.panel.remove();
    resources.panel = null;
    if (resources.settingsModal?.isConnected) resources.settingsModal.remove();
    resources.settingsModal = null;
    resources.settingsBtn = null;
    resources.padBtn = null;
    resources.padLabel = null;
    resources.likeBtn = null;
    resources.expandBtn = null;
    state.panelCreated = false;
    state.isActivePage = false;
    state.lastHref = "";
    state.lastPath = "";
    userUnlikedIds.clear();
    autoClickedLikeIds.clear();
    expandedPostKeys.clear();
    expandedRoots = new WeakSet();
    resources.videos.clear();
  }
  function handlePageHide(event) {
    if (!event.persisted) cleanupResources();
  }
  function handlePageShow(event) {
    if (!event.persisted) return;
    pageScroll.x = window.scrollX;
    pageScroll.y = window.scrollY;
    state.lastHref = "";
    state.scrolling = false;
    setupNavObserver();
    handleNavigation();
    if (state.isActivePage) {
      setupObservers();
      state.fullSeedPending = true;
      refreshVideoList();
      syncCycleTimer(false);
      pump(true);
    }
  }
  function init() {
    if (state.initialized) return;
    state.initialized = true;
    pageScroll.x = window.scrollX;
    pageScroll.y = window.scrollY;
    initStyleTag();
    applyCleanerCSS();
    setupNavigationHandler();
    setupNavObserver();
    registerEventListener(window, "scroll", markScroll, { passive: true, capture: true });
    if (HAS_SCROLL_END) registerEventListener(window, "scrollend", markScrollEnd, { passive: true, capture: true });
    registerEventListener(document, "mouseover", handleMouseOver, { passive: true });
    registerEventListener(document, "click", onClick, { passive: true });
    registerEventListener(document, "click", handleLinkClickSanitize, { capture: true });
    registerEventListener(document, "keydown", handleCommentSortHotkey);
    registerEventListener(document, "play", handleVideoPlay, { passive: true, capture: true });
    registerEventListener(document, "play", handleReelVideoEvent, { passive: true, capture: true });
    registerEventListener(document, "pause", handleReelVideoEvent, { passive: true, capture: true });
    registerEventListener(document, "ended", handleReelVideoEvent, { passive: true, capture: true });
    registerEventListener(document, "visibilitychange", onVisibility);
    registerEventListener(window, "pagehide", handlePageHide);
    registerEventListener(window, "pageshow", handlePageShow);
    state.lastHref = "";
    handleNavigation();
  }
  setupPreventRefresh();
  hookHistory();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
