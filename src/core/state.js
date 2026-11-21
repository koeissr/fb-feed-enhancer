  function migrateLegacySettings() {
    const legacyVolume = GM_getValue("DEFAULT_VOLUME", null);
    if (legacyVolume !== null && GM_getValue("volume", null) === null) GM_setValue("volume", legacyVolume);
    const legacyColumns = GM_getValue("COLUMN_COUNT", null);
    if (legacyColumns !== null && GM_getValue("columnCount", null) === null) GM_setValue("columnCount", legacyColumns);
    const legacyPad = GM_getValue("hoverPad", null);
    if (legacyPad !== null) {
      let pad = Math.round(legacyPad / CONFIG.HOVER_PAD_STEP) * CONFIG.HOVER_PAD_STEP;
      if (legacyPad > 0 && pad === 0) pad = CONFIG.HOVER_PAD_STEP;
      pad = Math.max(0, Math.min(CONFIG.HOVER_PAD_MAX, pad));
      if (pad !== legacyPad) GM_setValue("hoverPad", pad);
    }
    const legacyHeight = GM_getValue("maxHeight", null);
    if (legacyHeight !== null) {
      const clamped = Math.max(CONFIG.HEIGHT_MIN, Math.min(CONFIG.HEIGHT_MAX, legacyHeight));
      if (clamped !== legacyHeight) GM_setValue("maxHeight", clamped);
    }
  }
  migrateLegacySettings();
  const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
  const state = {
    buttons: {
      sidebar: GM_getValue("sidebarEnabled", true),
      like: GM_getValue("likeEnabled", false),
      autoLikePost: GM_getValue("autoLikePostEnabled", false),
      postExpand: GM_getValue("postExpandEnabled", false),
      adHide: GM_getValue("adHideEnabled", false),
      otherExpand: GM_getValue("otherExpandEnabled", false),
      preventRefresh: GM_getValue("preventRefreshEnabled", true),
      allComments: GM_getValue("allCommentsEnabled", true),
      volume: GM_getValue("volumeEnabled", false),
      columns: GM_getValue("columnsEnabled", false),
      height: GM_getValue("heightEnabled", false),
      expandWidth: GM_getValue("expandWidthEnabled", false),
      hoverPad: GM_getValue("hoverPadEnabled", true),
      reelsTitleHide: GM_getValue("reelsTitleHideEnabled", true),
      cleanRightRail: GM_getValue("cleanRightRailEnabled", false),
      cleanMarketplaceTab: GM_getValue("cleanMarketplaceTabEnabled", false),
      cleanLeftFooter: GM_getValue("cleanLeftFooterEnabled", true),
      hideStoriesReels: GM_getValue("hideStoriesReelsEnabled", false),
      removeLoginWall: GM_getValue("removeLoginWallEnabled", true),
      sanitizeLinks: GM_getValue("sanitizeLinksEnabled", true),
      hideMetaAI: GM_getValue("hideMetaAIEnabled", false),
      hidePYMK: GM_getValue("hidePYMKEnabled", false),
      keywordFilter: GM_getValue("keywordFilterEnabled", false),
    },
    settings: {
      volume: GM_getValue("volume", CONFIG.DEFAULT_VOLUME),
      columns: GM_getValue("columnCount", CONFIG.COLUMN_COUNT),
      maxHeight: GM_getValue("maxHeight", CONFIG.DEFAULT_MAX_HEIGHT),
      expandWidth: GM_getValue("expandWidth", CONFIG.DEFAULT_EXPAND_WIDTH),
      hoverPad: GM_getValue("hoverPad", CONFIG.DEFAULT_HOVER_PAD),
      commentSortMode: GM_getValue("commentSortMode", "all"),
      keywordBlacklist: GM_getValue("keywordBlacklist", ""),
    },
    initialized: false,
    isActivePage: false,
    lastHref: "",
    lastPath: "",
    panelCreated: false,
    styleInjected: false,
    likeReadyAt: 0,
    pendingLike: null,
    lastPumpTime: 0,
    lastPruneTime: 0,
    lastAdHideAt: -1e9,
    adPrimed: false,
    scrollT: -1e9,
    scrolling: false,
    fullSeedPending: false,
  };
  const resources = {
    styleTag: null,
    uiStyleTag: null,
    cleanerStyleTag: null,
    observers: { dom: null, interactive: null, nav: null },
    historyHooks: [],
    eventHandlers: [],
    cycleTimer: 0,
    panel: null,
    settingsModal: null,
    settingsBtn: null,
    padBtn: null,
    padLabel: null,
    likeBtn: null,
    expandBtn: null,
    videos: new Set(),
  };
  const domCache = {
    seeMore: { els: null, t: 0 },
    autoExpand: { els: null, t: 0 },
    commentAction: { els: null, t: 0 },
    likeAll: { els: null, t: 0 },
  };
  const autoClickedLikeIds = new Set();
  const userUnlikedIds = new Set();
  const expandedPostKeys = new Set();
  const recentlyClicked = new WeakSet();
  const expandedSeeMore = new WeakSet();
  const replyExpanded = new WeakSet();
  const moreClicks = new WeakMap();
  const commentExpandAt = new WeakMap();
  const rootedEls = new WeakSet();
  const seeScopeCache = new WeakMap();
  const rootCache = new WeakMap();
  const postSigCache = new WeakMap();
  const seeClickAt = new WeakMap();
  const pendingRoots = new Set();
  const pendingUnlike = new Map();
  const observedInteractives = new Set();
  const postRoots = new Set();
  const visiblePosts = new Set();
  const categories = new WeakMap();
  const postLikeCache = new WeakMap();
  const hideCache = new WeakMap();
  const adAttempts = new WeakMap();
  const visibleLikes = new Set();
  const visiblePostLikes = new Set();
  const visibleSeeMore = new Set();
  const visibleAutoExpand = new Set();
  const visibleReplies = new Set();
  const visibleMore = new Set();
  const scrollOffsets = new WeakMap();
  const scanCache = new WeakMap();
  const postKeys = new WeakMap();
  const adCache = new WeakMap();
  const pageScroll = { x: 0, y: 0 };
  let expandedRoots = new WeakSet();
  let rects = new WeakMap();
  let containers = new WeakMap();
  let postSeq = 0;
  function trimSet(set, max) {
    if (set.size <= max) return;
    let excess = set.size - max;
    for (const value of set.values()) {
      set.delete(value);
      if (--excess <= 0) break;
    }
  }
  function trimMap(map, max) {
    if (map.size <= max) return;
    let excess = map.size - max;
    for (const key of map.keys()) {
      map.delete(key);
      if (--excess <= 0) break;
    }
  }

  function registerEventListener(element, type, handler, options = undefined) {
    element?.addEventListener?.(type, handler, options);
    resources.eventHandlers.push({ element, type, handler, options });
  }
