// ==UserScript==
// @name         Facebook Feed Enhancer (FB Cleaner, Multi-Column & Reels)
// @name:en      Facebook Feed Enhancer (FB Cleaner, Multi-Column & Reels)
// @name:zh-TW   FB 動態牆增強器 (Facebook 淨化與多欄)
// @name:zh-CN   FB 动态墙增强器 (Facebook 净化与多栏)
// @namespace    https://github.com/koeissr/fb-feed-enhancer
// @version      2.0.2
// @description  Facebook Cleaner & Feed Enhancer: Multi-column layout with virtualization scroll fix, bilingual settings modal, prevent auto-refresh, All/Newest comments + hotkeys, Reels title auto-hide, deep UI cleaner, guest login-wall bypass, link sanitizer, Meta AI / PYMK & keyword blacklist filter. Based on "Facebook Worker's Wisdom DX" by Dxzy (MIT License).
// @description:en     Facebook Cleaner & Feed Enhancer: Multi-column layout with virtualization scroll fix, bilingual settings modal, prevent auto-refresh, All/Newest comments + hotkeys, Reels title auto-hide, deep UI cleaner, guest login-wall bypass, link sanitizer, Meta AI / PYMK & keyword blacklist filter. Based on "Facebook Worker's Wisdom DX" by Dxzy (MIT License).
// @description:zh-TW  Facebook 淨化與動態牆增強器：多欄化樣式（防回捲修復）、雙語進階設定彈窗、防切分頁重整、所有/最新留言切換與快捷鍵、Reels 播放隱藏標題、介面深度淨化、訪客去登入牆與捲動解鎖、外連網址淨化、Meta AI/推薦區塊與關鍵字黑名單過濾。改編自 Dxzy 之 Facebook Worker's Wisdom DX (MIT)。
// @description:zh-CN  Facebook 净化与动态墙增强器：多栏化样式（防回滚修复）、双语高级设置弹窗、防切标签页刷新、全部/最新评论切换与快捷键、Reels 播放隐藏标题、界面深度净化、访客去登录墙与滚动解锁、外链网址净化、Meta AI/推荐区块与关键词黑名单过滤。改编自 Dxzy 之 Facebook Worker's Wisdom DX (MIT)。
// @author       koeissr (based on Dxzy)
// @icon         https://www.google.com/s2/favicons?sz=64&domain=facebook.com
// @match        https://www.facebook.com/*
// @match        https://web.facebook.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @run-at       document-start
// @license      MIT
// @homepageURL  https://github.com/koeissr/fb-feed-enhancer
// @supportURL   https://github.com/koeissr/fb-feed-enhancer/issues
// @downloadURL  https://raw.githubusercontent.com/koeissr/fb-feed-enhancer/main/fb-feed-enhancer.user.js
// @updateURL    https://raw.githubusercontent.com/koeissr/fb-feed-enhancer/main/fb-feed-enhancer.user.js
// ==/UserScript==
(function () {
  "use strict";

  /* === MODULE: src/core/config.js === */
  const CONFIG = {
    ALLOWED_PATHS: [
      /^\/$/,
      /^\/\?filter=(all|favorites|friends|groups|pages)&sk=h_chr$/,
      /^\/[^/]+\/posts\/.*$/,
      /^\/reel\/.*$/,
      /^\/search\/.*$/,
      /^\/photo.*$/,
      /^\/profile\.php.*$/,
      /^\/[^/]+\/videos\/.*$/,
      /^\/groups\/\d+(?:\/.*)?$/,
      /^\/permalink\.php\?.*$/,
      /^\/watch\/.*$/,
    ],
    AUTO_EXPAND_SELECTOR: ".x1qjc9v5.x71s49j.x1a2a7pz .xeuugli.xbelrpt",
    SEE_MORE_SELECTOR: 'div[role="button"].x1i10hfl.xzsf02u.x1sur9pj,.x126k92a div[role="button"].x1i10hfl.xzsf02u',
    COMMENT_ACTION_SELECTOR: 'div[role="button"].x1i10hfl.x6s0dn4.xi81zsa.x1q0g3np.x1iyjqo2.xs83m0k.x1icxu4v',
    REPLY_CHEVRON_SELECTOR: 'svg path[d^="M6.94 10.354"]',
    POST_LIKE_SELECTOR: ".x5ve5x3 > .x9f619",
    COMMENT_LIKE_SELECTOR: '.x1rg5ohu .x5ve5x3[role="button"]',
    POST_LIKE_ICON_SELECTOR: 'i[data-visualcompletion="css-img"]',
    POST_DATA_STORE_ID: "[data-store-id]",
    POST_ARTICLE_SELECTOR: 'div[role="article"]',
    POST_CARD_SELECTOR: "[aria-posinset]",
    POST_VIRTUAL_SELECTOR: "[data-virtualized]",
    POST_HEADER_SELECTOR: '[data-ad-rendering-role="profile_name"],h2,h3',
    AUTHOR_LINK_SELECTOR: '[data-ad-rendering-role="profile_name"] a[href],h2 a[role="link"],h3 a[role="link"]',
    PERMALINK_SELECTOR: 'a[href*="#?"]',
    META_ROW_SELECTOR: ".x6s0dn4.x17zd0t2.x78zum5.x1q0g3np.x1a02dak",
    LABEL_CHIP_SELECTOR: 'div[role="button"].x1i10hfl.x1heor9g.xkrqix3.x1sur9pj',
    FLEX_ITEM_SELECTOR: ".x6o7n8i.x1unhpq9.x1hc1fzr>div>div>*,.x1xwk8fm.x193iq5w>div",
    AD_HARD_SELECTOR: 'a[href*="/ads/about"],a[href*="utm_medium=paid"],a[href*="utm_medium%3Dpaid"]',
    AD_ROLE_SELECTOR: '[data-ad-rendering-role^="image-"],[data-ad-rendering-role^="title-"],[data-ad-rendering-role^="cta-"]',
    AD_ROLE_PATTERN: /^(image|title|cta)-\d+$/,
    SUGGEST_ITEM_SELECTOR: '.x1120s5i.xyamay9 [role="listitem"]',
    TIME_LINK_SELECTOR: 'a[aria-describedby][aria-labelledby][target="_blank"]',
    CLIPPED_LABEL_SELECTOR: 'a[style*="margin-right: -"],a[style*="margin-right:-"]',
    STORY_MSG_SELECTOR: '[data-ad-rendering-role="story_message"]',
    HIDE_SUGGESTED: true,
    HIDE_UNLABELED: true,
    HIDE_ICON_SELECTOR: 'svg path[d^="M15.543 3.043"]',
    HIDE_HOST_SELECTOR: 'a[role="link"],div[role="button"]',
    LIKED_POST_CLASS: "xq8hly8",
    UNLIKED_ICON_CLASS: "x1d69dk1",
    CYCLE_MS: 4000,
    AD_RETRY_MS: 8000,
    AD_CACHE_TTL: 700,
    AD_SETTLE_MS: 1500,
    ROOT_CACHE_TTL: 3000,
    ROOT_FALLBACK_LEVELS: 12,
    ROOT_CLIMB_LEVELS: 6,
    SEE_SCOPE_LEVELS: 10,
    SEE_ID_LEVELS: 6,
    SEE_RETRY_MS: 4000,
    EXPAND_BATCH: 6,
    COMMENT_EXPAND_COOLDOWN: 1500,
    MORE_COMMENT_COOLDOWN: 1200,
    MORE_COMMENT_MAX: 60,
    LIKE_COOLDOWN: 1000,
    PUMP_MIN_INTERVAL_MS: 120,
    SCROLL_GATE_MS: 120,
    UNLIKE_SETTLE_MS: 160,
    PRUNE_INTERVAL_MS: 2000,
    CACHE_TTL_MS: 600,
    SCAN_TTL_MS: 500,
    DEFAULT_VOLUME: 0.2,
    DEFAULT_MAX_HEIGHT: 80,
    DEFAULT_EXPAND_WIDTH: 50,
    DEFAULT_HOVER_PAD: 20,
    HOVER_PAD_STEP: 20,
    HOVER_PAD_MAX: 200,
    HOVER_PAD_NEAR: 40,
    HOVER_PAD_MID: 100,
    HOVER_CANDIDATE_LIMIT: 24,
    RECT_REFRESH_MS: 250,
    RECT_REQUEST_MS: 200,
    HEIGHT_STEP: 10,
    HEIGHT_MIN: 10,
    HEIGHT_MAX: 300,
    EXPAND_WIDTH_STEP: 10,
    COLUMN_COUNT: 4,
    COLUMN_GAP: 15,
    MAX_ID_CACHE: 500,
    MAX_PENDING_ROOTS: 200,
    MAX_OBSERVED: 2200,
    MAX_POST_ROOTS: 400,
    MAX_VIDEO_CACHE: 60,
    MAX_UNLIKE_PENDING: 40,
    MAX_EXPANDED_KEYS: 2000,
    DRAIN_CHUNK: 80,
    UNLIKE_BATCH_SIZE: 20,
    PAGE_SMOOTH_ENABLED: false,
  };
  const INTERACTIVE_SELECTOR = `${CONFIG.POST_LIKE_SELECTOR},${CONFIG.COMMENT_LIKE_SELECTOR},${CONFIG.SEE_MORE_SELECTOR},${CONFIG.AUTO_EXPAND_SELECTOR},${CONFIG.COMMENT_ACTION_SELECTOR}`;
  const LIKE_SELECTOR = `${CONFIG.POST_LIKE_SELECTOR},${CONFIG.COMMENT_LIKE_SELECTOR}`;
  const SCAN_WITH_VIDEO = `${INTERACTIVE_SELECTOR},video`;
  const CONTROL_GUARD = 'a,button,input,textarea,select,[role="button"],[role="link"],[contenteditable="true"]';
  const CAT_POST_LIKE = 1;
  const CAT_SEE = 2;
  const CAT_AUTO = 4;
  const CAT_COMMENT_LIKE = 8;
  const CAT_POST_ROOT = 16;
  const CAT_REPLY = 32;
  const CAT_MORE = 64;
  const HAS_IO = typeof IntersectionObserver === "function";
  const HAS_SCROLL_END = "onscrollend" in window;

  /* === MODULE: src/core/state.js === */
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

  /* === MODULE: src/core/dom_utils.js === */
  function cachedQuery(key, selector) {
    const c = domCache[key];
    const now = performance.now();
    if (c.els && now - c.t < CONFIG.CACHE_TTL_MS) return c.els;
    c.els = document.querySelectorAll(selector);
    c.t = now;
    return c.els;
  }
  function invalidateCache() {
    domCache.seeMore.els = null;
    domCache.autoExpand.els = null;
    domCache.commentAction.els = null;
    domCache.likeAll.els = null;
  }
  function invalidateRects() {
    rects = new WeakMap();
    containers = new WeakMap();
  }
  function isAllowedPage() {
    try {
      const path = window.location.pathname + window.location.search;
      for (let i = 0; i < CONFIG.ALLOWED_PATHS.length; i++) {
        if (CONFIG.ALLOWED_PATHS[i].test(path)) return true;
      }
      return false;
    } catch {
      return false;
    }
  }
  function inCommentScope(el) {
    return !!(el && el.closest(CONFIG.COMMENT_LIKE_SELECTOR));
  }
  function isPostLike(el) {
    return !!el && el.nodeType === 1 && el.matches(CONFIG.POST_LIKE_SELECTOR) && !inCommentScope(el);
  }
  function isPostBoundary(el) {
    return (
      el.matches(CONFIG.POST_ARTICLE_SELECTOR) ||
      el.matches(CONFIG.POST_DATA_STORE_ID) ||
      el.matches(CONFIG.POST_CARD_SELECTOR) ||
      el.matches(CONFIG.FLEX_ITEM_SELECTOR)
    );
  }
  const SEE_MORE_TEXT_RE = /^(?:[….·\s]*)(查看更多|顯示更多|展开更多|显示更多|See more|Show more)(?:[….·\s]*)$/i;
  function isPostSeeMore(el) {
    if (!el || el.nodeType !== 1 || !el.matches(CONFIG.SEE_MORE_SELECTOR)) return false;
    if (inCommentScope(el)) return false;
    if (el.closest(CONFIG.POST_HEADER_SELECTOR) || el.querySelector("a[href]")) return false;
    const txt = (el.textContent || "").trim();
    if (!txt || txt.length > 20 || !SEE_MORE_TEXT_RE.test(txt)) return false;
    if (el.closest(CONFIG.STORY_MSG_SELECTOR)) return true;
    const cached = seeScopeCache.get(el);
    if (cached !== undefined) return cached;
    let node = el.parentElement;
    let level = 0;
    let result = true;
    while (node && node !== document.body && level < CONFIG.SEE_SCOPE_LEVELS) {
      if (isPostBoundary(node) || node.querySelector(CONFIG.POST_LIKE_SELECTOR)) {
        result = true;
        break;
      }
      if (node.querySelector(CONFIG.COMMENT_LIKE_SELECTOR)) {
        result = false;
        break;
      }
      node = node.parentElement;
      level++;
    }
    seeScopeCache.set(el, result);
    return result;
  }
  function commentActionKind(el) {
    if (el.querySelector(CONFIG.REPLY_CHEVRON_SELECTOR)) return CAT_REPLY;
    if (!el.querySelector("svg")) return CAT_MORE;
    return 0;
  }
  function getPostRoot(el) {
    if (!el || el.nodeType !== 1) return null;
    const t = performance.now();
    const cached = rootCache.get(el);
    if (cached && (cached.root ? cached.root.isConnected : t - cached.t < CONFIG.ROOT_CACHE_TTL)) return cached.root;
    let root =
      el.closest(CONFIG.POST_CARD_SELECTOR) ||
      el.closest(CONFIG.POST_DATA_STORE_ID) ||
      el.closest(CONFIG.POST_ARTICLE_SELECTOR) ||
      el.closest(CONFIG.FLEX_ITEM_SELECTOR) ||
      el.closest(CONFIG.POST_VIRTUAL_SELECTOR) ||
      null;
    if (!root) {
      let node = el.parentElement;
      let level = 0;
      while (node && node !== document.body && level < CONFIG.ROOT_FALLBACK_LEVELS) {
        if (isPostBoundary(node) || node.querySelector(CONFIG.POST_HEADER_SELECTOR)) {
          root = node;
          break;
        }
        node = node.parentElement;
        level++;
      }
      if (root && !isPostBoundary(root)) {
        let up = root.parentElement;
        let n = 0;
        while (up && up !== document.body && n < CONFIG.ROOT_CLIMB_LEVELS) {
          if (up.querySelectorAll(CONFIG.POST_HEADER_SELECTOR).length > 1) break;
          root = up;
          if (isPostBoundary(up)) break;
          up = up.parentElement;
          n++;
        }
      }
    }
    rootCache.set(el, { root, t });
    return root;
  }
  function postSignature(root) {
    if (!root) return null;
    const cached = postSigCache.get(root);
    if (cached !== undefined) return cached;
    let sig = null;
    const author = root.querySelector(CONFIG.AUTHOR_LINK_SELECTOR);
    const path = author ? (author.getAttribute("href") || "").split("?")[0] : "";
    const link = root.querySelector(CONFIG.PERMALINK_SELECTOR);
    let frag = "";
    if (link) {
      const href = link.getAttribute("href") || "";
      const i = href.indexOf("#?");
      if (i >= 0) frag = href.slice(i + 2);
    }
    if (frag) {
      sig = `p:${path}#${frag}`;
    } else {
      const vid = root.querySelector("[data-video-id]")?.getAttribute("data-video-id");
      if (path && vid) sig = `v:${path}|${vid}`;
    }
    postSigCache.set(root, sig);
    return sig;
  }
  function seeLockKeys(el, root) {
    const keys = [];
    const sig = postSignature(root);
    if (sig) keys.push(sig);
    let node = el;
    let level = 0;
    while (node && node.nodeType === 1 && level < CONFIG.SEE_ID_LEVELS) {
      const id = node.getAttribute("id");
      if (id) {
        if (node.querySelectorAll(CONFIG.POST_HEADER_SELECTOR).length <= 1) keys.push(`i:${id}`);
        break;
      }
      node = node.parentElement;
      level++;
    }
    return keys;
  }
  function postKeyOf(el) {
    const root = getPostRoot(el);
    if (!root) return null;
    const known = postKeys.get(root);
    if (known) return known;
    const sig = postSignature(root);
    const store = root.getAttribute("data-store-id") || root.querySelector(CONFIG.POST_DATA_STORE_ID)?.getAttribute("data-store-id");
    const labelled = root.getAttribute("aria-labelledby");
    const key = sig || (store ? `s:${store}` : labelled ? `l:${labelled}` : `e:${++postSeq}`);
    postKeys.set(root, key);
    return key;
  }
  function postLikeOf(root) {
    if (!root || !root.isConnected) return null;
    const cached = postLikeCache.get(root);
    if (cached && cached.isConnected && root.contains(cached)) return cached;
    const list = root.querySelectorAll(CONFIG.POST_LIKE_SELECTOR);
    for (let i = 0; i < list.length; i++) {
      if (isPostLike(list[i])) {
        postLikeCache.set(root, list[i]);
        return list[i];
      }
    }
    return null;
  }
  const CLOSE_DIALOG_ARIA_RE = /^(關閉|关闭|Close)$/i;
  function findHideButton(root) {
    if (!root) return null;
    const cached = hideCache.get(root);
    if (cached && cached.isConnected && root.contains(cached)) return cached;
    const icons = root.querySelectorAll(CONFIG.HIDE_ICON_SELECTOR);
    for (let i = 0; i < icons.length; i++) {
      const host = icons[i].closest(CONFIG.HIDE_HOST_SELECTOR);
      if (host && root.contains(host)) {
        const aria = (host.getAttribute("aria-label") || "").trim();
        if (aria && CLOSE_DIALOG_ARIA_RE.test(aria)) continue;
        hideCache.set(root, host);
        return host;
      }
    }
    return null;
  }
  function hasOrganicTime(root) {
    const time = root.querySelector(CONFIG.TIME_LINK_SELECTOR);
    if (!time) return false;
    const msg = root.querySelector(CONFIG.STORY_MSG_SELECTOR);
    if (!msg) return true;
    return !!(time.compareDocumentPosition(msg) & Node.DOCUMENT_POSITION_FOLLOWING);
  }
  function hasIndexedAdRole(root) {
    const list = root.querySelectorAll(CONFIG.AD_ROLE_SELECTOR);
    for (let i = 0; i < list.length; i++) {
      const role = list[i].getAttribute("data-ad-rendering-role") || "";
      if (CONFIG.AD_ROLE_PATTERN.test(role)) return true;
    }
    return false;
  }
  function hasSponsorChip(root) {
    const meta = root.querySelector(CONFIG.META_ROW_SELECTOR);
    if (!meta) return false;
    if (!meta.querySelector(CONFIG.LABEL_CHIP_SELECTOR)) return false;
    return !!findHideButton(root);
  }
  function evalAd(root) {
    let v = !!root.querySelector(CONFIG.AD_HARD_SELECTOR);
    if (!v && !hasOrganicTime(root)) {
      v = hasIndexedAdRole(root);
      if (!v) v = hasSponsorChip(root);
      if (!v && CONFIG.HIDE_SUGGESTED) v = !!root.querySelector(CONFIG.SUGGEST_ITEM_SELECTOR);
      if (!v && CONFIG.HIDE_UNLABELED) {
        v = !!root.querySelector(CONFIG.CLIPPED_LABEL_SELECTOR) && !!findHideButton(root);
      }
    }
    return v;
  }
  function adInfo(root) {
    const t = performance.now();
    let info = adCache.get(root);
    if (!info) {
      info = { first: t, t: -1e9, v: false };
      adCache.set(root, info);
    }
    if (!info.v && t - info.t >= CONFIG.AD_CACHE_TTL) {
      info.v = evalAd(root);
      info.t = t;
    }
    return info;
  }
  function isAdRoot(root) {
    if (!root) return false;
    return adInfo(root).v;
  }
  function isOrganicReady(root) {
    if (!root || !root.isConnected) return false;
    const info = adInfo(root);
    if (info.v) return false;
    if (performance.now() - info.first < CONFIG.AD_SETTLE_MS) return false;
    if (!root.querySelector(CONFIG.POST_HEADER_SELECTOR) && !findHideButton(root)) return false;
    return true;
  }
  function isHashtagLink(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.tagName !== "A" && el.getAttribute("role") !== "link") return false;
    const txt = (el.textContent || "").trim();
    return txt.length > 0 && txt.charAt(0) === "#";
  }
  function safeClick(el) {
    if (el && el.isConnected) el.click();
  }
  function markScroll(e) {
    state.scrollT = performance.now();
    state.scrolling = true;
    const target = e ? e.target : null;
    if (!target || target === document || target === document.documentElement || target === document.body) {
      pageScroll.x = window.scrollX;
      pageScroll.y = window.scrollY;
      return;
    }
    if (target.nodeType !== 1) return;
    let rec = scrollOffsets.get(target);
    if (!rec) {
      rec = { x: 0, y: 0 };
      scrollOffsets.set(target, rec);
    }
    rec.x = target.scrollLeft;
    rec.y = target.scrollTop;
  }
  function markScrollEnd(e) {
    markScroll(e);
    state.scrolling = false;
    pump(true);
  }
  function isScrolling(t) {
    return state.scrolling && t - state.scrollT < CONFIG.SCROLL_GATE_MS;
  }
  function containerOf(el) {
    if (containers.has(el)) return containers.get(el);
    const c = state.buttons.columns ? el.closest(CONFIG.FLEX_ITEM_SELECTOR) : null;
    containers.set(el, c);
    return c;
  }
  function storeRect(el, b, t) {
    let r = rects.get(el);
    if (!r) {
      r = { left: 0, top: 0, w: 0, h: 0, px: 0, py: 0, cx: 0, cy: 0, ts: -1, req: 0 };
      rects.set(el, r);
    }
    const cont = containerOf(el);
    const s = cont ? scrollOffsets.get(cont) : null;
    r.left = b.left;
    r.top = b.top;
    r.w = b.width;
    r.h = b.height;
    r.px = pageScroll.x;
    r.py = pageScroll.y;
    r.cx = s ? s.x : 0;
    r.cy = s ? s.y : 0;
    r.ts = t;
  }
  function requestRect(el, t) {
    const io = resources.observers.interactive;
    if (!io || !el.isConnected) return;
    const r = rects.get(el);
    if (r && t - r.req < CONFIG.RECT_REQUEST_MS) return;
    io.unobserve(el);
    io.observe(el);
    if (r) {
      r.req = t;
      return;
    }
    rects.set(el, { left: 0, top: 0, w: 0, h: 0, px: 0, py: 0, cx: 0, cy: 0, ts: -1, req: t });
  }
  function pointerDistanceSq(el, x, y, t) {
    const r = rects.get(el);
    if (!r || r.ts < 0) {
      requestRect(el, t);
      return Infinity;
    }
    if (t - r.ts > CONFIG.RECT_REFRESH_MS) requestRect(el, t);
    if (r.w <= 0 || r.h <= 0) return Infinity;
    let dx = pageScroll.x - r.px;
    let dy = pageScroll.y - r.py;
    const cont = containerOf(el);
    if (cont) {
      const s = scrollOffsets.get(cont);
      if (s) {
        dx += s.x - r.cx;
        dy += s.y - r.cy;
      }
    }
    const left = r.left - dx;
    const top = r.top - dy;
    const ox = Math.max(left - x, 0, x - (left + r.w));
    const oy = Math.max(top - y, 0, y - (top + r.h));
    return ox * ox + oy * oy;
  }
  function occupiedByControl(target) {
    let node = target;
    let level = 0;
    while (node && node.nodeType === 1 && level <= 2) {
      if (node.matches(CONTROL_GUARD)) return true;
      node = node.parentElement;
      level++;
    }
    return false;
  }

  /* === MODULE: src/modules/ui_cleaner.js === */
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

  /* === MODULE: src/modules/login_wall.js === */
  const LOGIN_WALL_TEXT_RE = /(登入 Facebook|登录 Facebook|Log in to Facebook|建立新帳號|新建帐户|Create new account|查看 Facebook 上的更多內容|See more on Facebook)/i;

  function isGuestMode() {
    if (!document.body) return false;
    // 已登入狀態通常存在帳號切換選單或個人大頭貼導覽
    if (document.querySelector('div[role="banner"] a[href*="/me"], div[role="banner"] [aria-label*="帳號"], div[role="banner"] [aria-label*="Account"], div[role="banner"] [aria-label*="你的個人檔案"], div[role="banner"] [aria-label*="Your profile"]')) {
      return false;
    }
    return !!document.querySelector('form[action*="login"], input[name="email"][type="text"], a[href*="/login/"]');
  }

  function applyLoginWallRemoval() {
    if (!state.buttons.removeLoginWall || !document.body) return 0;
    if (!isGuestMode()) return 0;
    let removedCount = 0;

    // 1. 隱藏阻擋畫面的登入彈窗與底部註冊橫幅
    const dialogs = document.querySelectorAll('[role="dialog"], [data-nosnippet], #login_popup_cta_form');
    for (let i = 0; i < dialogs.length; i++) {
      const el = dialogs[i];
      if (!el.isConnected || el.id === "ffe-settings-modal") continue;
      const hasLoginForm = !!el.querySelector('input[name="email"], input[name="pass"], a[href*="/login"], a[href*="/r.php"]');
      const txt = (el.textContent || "").slice(0, 300);
      if (hasLoginForm || LOGIN_WALL_TEXT_RE.test(txt)) {
        if (el.getAttribute("data-ffe-filtered") !== "1") {
          el.setAttribute("data-ffe-filtered", "1");
          removedCount++;
        }
      }
    }

    // 2. 解鎖訪客模式常見的捲動鎖定（overflow: hidden / position: fixed）
    const htmlEl = document.documentElement;
    if (htmlEl && (htmlEl.style.overflow === "hidden" || htmlEl.style.overflowY === "hidden")) {
      htmlEl.style.overflow = "auto";
      htmlEl.style.overflowY = "auto";
      removedCount++;
    }
    if (document.body.style.overflow === "hidden" || document.body.style.overflowY === "hidden") {
      document.body.style.overflow = "auto";
      document.body.style.overflowY = "auto";
      removedCount++;
    }
    return removedCount;
  }

  /* === MODULE: src/modules/link_sanitizer.js === */
  const TRACKING_PARAMS = new Set([
    "fbclid",
    "mibextid",
    "ref",
    "__tn__",
    "__cft__[0]",
    "__cft__[1]",
    "h",
    "__eep__",
  ]);

  function cleanFacebookUrl(rawHref) {
    if (!rawHref || typeof rawHref !== "string") return rawHref;
    let urlObj;
    try {
      urlObj = new URL(rawHref, window.location.origin);
    } catch {
      return rawHref;
    }

    // 1. 解開 Facebook 外連跳轉包裝 (l.facebook.com / lm.facebook.com / l.instagram.com)
    if (/^(?:l|lm)\.facebook\.com$/i.test(urlObj.hostname) && urlObj.pathname === "/l.php") {
      const target = urlObj.searchParams.get("u");
      if (target) {
        try {
          urlObj = new URL(target);
        } catch {
          return rawHref;
        }
      }
    }

    // 2. 清除追蹤查詢參數
    let mutated = false;
    const keysToDelete = [];
    for (const key of urlObj.searchParams.keys()) {
      if (TRACKING_PARAMS.has(key) || key.startsWith("__cft__")) {
        keysToDelete.push(key);
      }
    }
    for (let i = 0; i < keysToDelete.length; i++) {
      urlObj.searchParams.delete(keysToDelete[i]);
      mutated = true;
    }

    const cleaned = urlObj.toString();
    if (cleaned !== rawHref || mutated) return cleaned;
    return rawHref;
  }

  function sanitizeLinkElement(a) {
    if (!state.buttons.sanitizeLinks || !a || a.tagName !== "A") return false;
    const raw = a.getAttribute("href");
    if (!raw || raw.startsWith("#") || raw.startsWith("javascript:")) return false;
    const cleaned = cleanFacebookUrl(raw);
    if (cleaned && cleaned !== raw) {
      a.setAttribute("href", cleaned);
      a.setAttribute("data-ffe-sanitized", "1");
      if (a.hasAttribute("data-lynx-uri")) a.removeAttribute("data-lynx-uri");
      return true;
    }
    return false;
  }

  function sanitizeLinksInRoot(root) {
    if (!state.buttons.sanitizeLinks || !root || !root.querySelectorAll) return 0;
    const links = root.querySelectorAll('a[href*="l.facebook.com"], a[href*="lm.facebook.com"], a[href*="fbclid="], a[href*="__cft__"]');
    let count = 0;
    for (let i = 0; i < links.length; i++) {
      if (sanitizeLinkElement(links[i])) count++;
    }
    return count;
  }

  function handleLinkClickSanitize(e) {
    if (!state.buttons.sanitizeLinks) return;
    const a = e.target?.closest?.("a[href]");
    if (a) sanitizeLinkElement(a);
  }

  /* === MODULE: src/modules/reels_title_hide.js === */
  function isReelContext(video) {
    if (!video) return false;
    if (/^\/reel\//i.test(window.location.pathname)) return true;
    return !!video.closest('[data-pagelet*="Reel"], [aria-label*="Reels"], [aria-label*="連續短片"]');
  }

  function findReelContainer(video) {
    if (!video) return null;
    return (
      video.closest('[data-pagelet*="Reel"]') ||
      video.closest('div[role="main"]') ||
      video.closest('div[role="dialog"]') ||
      video.parentElement
    );
  }

  function markReelTitleOverlay(container, video) {
    if (!container || !video) return;
    const candidates = container.querySelectorAll('[data-ad-rendering-role="story_message"], h2, [dir="auto"]');
    for (let i = 0; i < candidates.length; i++) {
      const el = candidates[i];
      if (!el.isConnected || el.contains(video)) continue;
      if (el.closest('div[role="button"], button, input, textarea')) continue;
      const overlayBox = el.closest('[data-ad-rendering-role="story_message"]') || el.parentElement;
      if (overlayBox && !overlayBox.contains(video) && overlayBox !== container) {
        overlayBox.setAttribute("data-ffe-reel-overlay", "1");
      }
    }
  }

  function syncReelPlayingState(video, isPlaying) {
    if (!video || !isReelContext(video)) return;
    const container = findReelContainer(video);
    if (!container) return;
    if (!state.buttons.reelsTitleHide || !isPlaying) {
      container.removeAttribute("data-ffe-reel-playing");
      return;
    }
    markReelTitleOverlay(container, video);
    container.setAttribute("data-ffe-reel-playing", "1");
  }

  function clearAllReelPlayingStates() {
    if (!document.body) return;
    const active = document.querySelectorAll('[data-ffe-reel-playing="1"]');
    for (let i = 0; i < active.length; i++) {
      active[i].removeAttribute("data-ffe-reel-playing");
    }
  }

  function handleReelVideoEvent(e) {
    const v = e.target;
    if (!v || v.tagName !== "VIDEO") return;
    if (e.type === "play") {
      syncReelPlayingState(v, true);
    } else if (e.type === "pause" || e.type === "ended") {
      syncReelPlayingState(v, false);
    }
  }

  /* === MODULE: src/modules/content_filter.js === */
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

  /* === MODULE: src/modules/comments_control.js === */
  const commentExpandCount = new WeakMap();
  const COMMENT_EXPAND_MAX = 3;
  const switchedCommentScopes = new WeakSet();
  const switchedCommentPaths = new Set();
  const COMMENT_SORT_TRIGGER_RE = /^(最相關|最相關留言|熱門留言|最相关|最相关评论|热门评论|所有留言|全部留言|最新留言|由新到舊|Most relevant|Most relevant comments|Top comments|All comments|Newest|Most recent)$/i;
  const COMMENT_SORT_DEFAULT_RE = /^(最相關|最相關留言|熱門留言|最相关|最相关评论|热门评论|Most relevant|Most relevant comments|Top comments)$/i;
  const ALL_COMMENTS_OPTION_RE = /^(所有留言|全部留言|全部评论|所有评论|All comments)$/i;
  const NEWEST_COMMENTS_OPTION_RE = /^(最新留言|由新到舊|最新评论|由新到旧|Newest|Most recent)$/i;
  const MORE_COMMENT_TEXT_RE = /(查看更多留言|查看先前的留言|檢視更多留言|查看全部|檢視全部|則回覆|查看更多评论|查看之前的评论|条回复|View more comments|View previous comments|View all \d+ comments|more replies|View \d+ more)/i;
  const LIKE_ARIA_ALLOW_RE = /(讚|赞|Like)/i;
  const LIKE_ARIA_DENY_RE = /(取消|移除|Unlike|Remove)/i;
  let allCommentsLastAt = -1e9;
  let allCommentsHoldUntil = -1e9;
  let preventRefreshBound = false;

  function isHomeFeedPath() {
    const p = window.location.pathname;
    return p === "/" || p === "";
  }

  function setupPreventRefresh() {
    if (preventRefreshBound) return;
    preventRefreshBound = true;
    const blockVisibility = (e) => {
      if (!state.buttons.preventRefresh || !isHomeFeedPath()) return;
      e.stopImmediatePropagation();
      if (!document.hidden && state.initialized) {
        onVisibility();
      }
    };
    document.addEventListener("visibilitychange", blockVisibility, true);
    document.addEventListener("webkitvisibilitychange", blockVisibility, true);
  }

  function switchToAllComments(forceMode = null) {
    const isForced = forceMode === "all" || forceMode === "newest";
    if (!isForced && !state.buttons.allComments) return 0;
    const targetMode = isForced ? forceMode : (state.settings.commentSortMode === "newest" ? "newest" : "all");
    const targetOptionRe = targetMode === "newest" ? NEWEST_COMMENTS_OPTION_RE : ALL_COMMENTS_OPTION_RE;
    const triggerRe = isForced ? COMMENT_SORT_TRIGGER_RE : COMMENT_SORT_DEFAULT_RE;

    const t = performance.now();
    if (!isForced && t - allCommentsLastAt < 1200) return 0;
    const scopes = [];
    const dialogs = document.querySelectorAll('[role="dialog"]');
    for (let i = 0; i < dialogs.length; i++) {
      if (dialogs[i].isConnected && dialogs[i].id !== "ffe-settings-modal") {
        if (isForced || !switchedCommentScopes.has(dialogs[i])) {
          scopes.push({ el: dialogs[i], path: null });
        }
      }
    }
    const curPath = window.location.pathname;
    if (!scopes.length && isSinglePostOrDialog(document.body)) {
      if (isForced || !switchedCommentPaths.has(curPath)) {
        scopes.push({ el: document.body, path: curPath });
      }
    }
    for (let s = 0; s < scopes.length; s++) {
      const { el: scope, path } = scopes[s];
      const buttons = scope.querySelectorAll('div[role="button"]');
      for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        if (!btn.isConnected) continue;
        const txt = (btn.textContent || "").trim();
        if (!txt || txt.length > 24 || !triggerRe.test(txt)) continue;
        if (path) {
          switchedCommentPaths.add(path);
          trimSet(switchedCommentPaths, 200);
        } else {
          switchedCommentScopes.add(scope);
        }
        allCommentsLastAt = t;
        allCommentsHoldUntil = t + 350;
        safeClick(btn);
        setTimeout(() => {
          const menuItems = document.querySelectorAll('[role="menuitem"],[role="menuitemradio"]');
          for (let j = 0; j < menuItems.length; j++) {
            const item = menuItems[j];
            if (!item.isConnected) continue;
            const firstLine = ((item.innerText || item.textContent || "").split("\n")[0] || "").trim();
            if (targetOptionRe.test(firstLine)) {
              safeClick(item);
              break;
            }
          }
        }, 180);
        return 1;
      }
    }
    return 0;
  }

  function handleCommentSortHotkey(e) {
    if (!e || e.key !== "Insert") return;
    const activeTag = document.activeElement?.tagName;
    if (activeTag === "INPUT" || activeTag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
    const baseMode = state.settings.commentSortMode === "newest" ? "newest" : "all";
    const targetMode = e.ctrlKey ? (baseMode === "all" ? "newest" : "all") : baseMode;
    if (switchToAllComments(targetMode)) {
      e.preventDefault();
    }
  }

  /* === MODULE: src/modules/feed_engine.js === */
  function scanBucket(node, t, wantSee, wantLike) {
    let b = scanCache.get(node);
    if (!b) {
      b = { lt: -1, st: -1, ct: -1, likes: null, sees: null, comment: false };
      scanCache.set(node, b);
    }
    if (wantLike && t - b.lt > CONFIG.SCAN_TTL_MS) {
      b.likes = node.querySelectorAll(CONFIG.POST_LIKE_SELECTOR);
      b.lt = t;
    }
    if (wantSee && t - b.st > CONFIG.SCAN_TTL_MS) {
      b.sees = node.querySelectorAll(CONFIG.SEE_MORE_SELECTOR);
      b.st = t;
    }
    if (t - b.ct > CONFIG.SCAN_TTL_MS) {
      b.comment = !!node.querySelector(CONFIG.COMMENT_LIKE_SELECTOR);
      b.ct = t;
    }
    return b;
  }
  function registerPostRoot(el) {
    if (rootedEls.has(el)) return;
    rootedEls.add(el);
    const io = resources.observers.interactive;
    if (!io) return;
    const root = getPostRoot(el);
    if (!root || postRoots.has(root)) return;
    postRoots.add(root);
    trimSet(postRoots, CONFIG.MAX_POST_ROOTS);
    categories.set(root, (categories.get(root) || 0) | CAT_POST_ROOT);
    observedInteractives.add(root);
    io.observe(root);
  }
  function categoryOf(el) {
    let c = 0;
    const comment = inCommentScope(el);
    if (!comment && el.matches(CONFIG.POST_LIKE_SELECTOR)) c |= CAT_POST_LIKE;
    if (el.matches(CONFIG.COMMENT_LIKE_SELECTOR)) c |= CAT_COMMENT_LIKE;
    if (!comment && el.matches(CONFIG.SEE_MORE_SELECTOR)) c |= CAT_SEE;
    if (el.matches(CONFIG.AUTO_EXPAND_SELECTOR)) c |= CAT_AUTO;
    if (el.matches(CONFIG.COMMENT_ACTION_SELECTOR)) c |= commentActionKind(el);
    return c;
  }
  function observeInteractive(el) {
    const io = resources.observers.interactive;
    if (!io || !el || !el.isConnected) return;
    registerPostRoot(el);
    if (observedInteractives.has(el)) return;
    const c = categoryOf(el);
    if (!c) return;
    categories.set(el, c);
    observedInteractives.add(el);
    io.observe(el);
  }
  function onIntersect(entries) {
    const t = performance.now();
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const el = entry.target;
      const c = categories.get(el) || 0;
      const on = entry.isIntersecting;
      storeRect(el, entry.boundingClientRect, t);
      if (c & CAT_POST_ROOT) {
        if (on) visiblePosts.add(el);
        else visiblePosts.delete(el);
      }
      if (c & (CAT_POST_LIKE | CAT_COMMENT_LIKE)) {
        if (on) visibleLikes.add(el);
        else visibleLikes.delete(el);
      }
      if (c & CAT_POST_LIKE) {
        if (on) visiblePostLikes.add(el);
        else visiblePostLikes.delete(el);
      }
      if (c & CAT_SEE) {
        if (on) visibleSeeMore.add(el);
        else visibleSeeMore.delete(el);
      }
      if (c & CAT_AUTO) {
        if (on) visibleAutoExpand.add(el);
        else visibleAutoExpand.delete(el);
      }
      if (c & CAT_REPLY) {
        if (on) visibleReplies.add(el);
        else visibleReplies.delete(el);
      }
      if (c & CAT_MORE) {
        if (on) visibleMore.add(el);
        else visibleMore.delete(el);
      }
    }
    pump(false);
  }
  function setupInteractiveObserver() {
    if (!HAS_IO || resources.observers.interactive) return;
    resources.observers.interactive = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: "150px",
      threshold: 0,
    });
  }
  function handleScanHit(el) {
    if (el.tagName === "VIDEO") {
      adoptVideo(el);
      return;
    }
    observeInteractive(el);
  }
  function registerRoot(root) {
    if (!root || root.nodeType !== 1 || !root.isConnected) return;
    const selector = state.buttons.volume ? SCAN_WITH_VIDEO : INTERACTIVE_SELECTOR;
    if (root.matches(selector)) handleScanHit(root);
    const list = root.querySelectorAll(selector);
    for (let i = 0; i < list.length; i++) handleScanHit(list[i]);
    const anc = root.closest(INTERACTIVE_SELECTOR);
    if (anc) observeInteractive(anc);
  }
  function seedInteractives() {
    if (!state.isActivePage) return;
    setupInteractiveObserver();
    const list = document.querySelectorAll(state.buttons.volume ? SCAN_WITH_VIDEO : INTERACTIVE_SELECTOR);
    for (let i = 0; i < list.length; i++) handleScanHit(list[i]);
  }
  function drainRoots() {
    if (state.fullSeedPending) {
      state.fullSeedPending = false;
      pendingRoots.clear();
      seedInteractives();
      return;
    }
    let n = 0;
    for (const root of pendingRoots) {
      pendingRoots.delete(root);
      registerRoot(root);
      if (++n >= CONFIG.DRAIN_CHUNK) break;
    }
  }
  function maybePrune(t) {
    if (observedInteractives.size <= CONFIG.MAX_OBSERVED && t - state.lastPruneTime < CONFIG.PRUNE_INTERVAL_MS) return;
    state.lastPruneTime = t;
    const io = resources.observers.interactive;
    for (const el of observedInteractives) {
      if (el.isConnected) continue;
      io?.unobserve(el);
      observedInteractives.delete(el);
      visibleLikes.delete(el);
      visiblePostLikes.delete(el);
      visibleSeeMore.delete(el);
      visibleAutoExpand.delete(el);
      visibleReplies.delete(el);
      visibleMore.delete(el);
      visiblePosts.delete(el);
      postRoots.delete(el);
      pendingUnlike.delete(el);
    }
    for (const root of postRoots) {
      if (!root.isConnected) {
        postRoots.delete(root);
        visiblePosts.delete(root);
      }
    }
    for (const v of resources.videos) {
      if (!v.isConnected) resources.videos.delete(v);
    }
    trimSet(resources.videos, CONFIG.MAX_VIDEO_CACHE);
    trimSet(expandedPostKeys, CONFIG.MAX_EXPANDED_KEYS);
    trimSet(postRoots, CONFIG.MAX_POST_ROOTS);
  }
  function applyVolumeTo(v) {
    const vol = state.settings.volume;
    if (v.volume !== vol) v.volume = vol;
    if (v.muted) v.muted = false;
  }
  function adoptVideo(v) {
    if (!state.buttons.volume || !v || !v.isConnected) return;
    resources.videos.add(v);
    if (resources.videos.size > CONFIG.MAX_VIDEO_CACHE) {
      for (const item of resources.videos) {
        if (!item.isConnected) resources.videos.delete(item);
        if (resources.videos.size <= CONFIG.MAX_VIDEO_CACHE) break;
      }
      trimSet(resources.videos, CONFIG.MAX_VIDEO_CACHE);
    }
    applyVolumeTo(v);
  }
  function refreshVideoList() {
    if (!state.isActivePage || !state.buttons.volume) return;
    const list = document.querySelectorAll("video");
    for (let i = 0; i < list.length; i++) adoptVideo(list[i]);
  }
  function processAllVideos() {
    for (const v of resources.videos) {
      if (v.isConnected) applyVolumeTo(v);
    }
  }
  function handleVideoPlay(e) {
    if (!state.isActivePage || !state.buttons.volume) return;
    const v = e.target;
    if (!v || v.tagName !== "VIDEO") return;
    adoptVideo(v);
  }
  function getLikeButtonId(button) {
    if (!button) return null;
    const rawKey = postKeyOf(button);
    const key = rawKey ? rawKey : "p";
    if (button.matches(CONFIG.COMMENT_LIKE_SELECTOR) || inCommentScope(button)) {
      const cc = button.closest(".x1rg5ohu");
      const parent = cc?.parentElement;
      const idx = parent && cc ? Array.prototype.indexOf.call(parent.children, cc) : 0;
      return `c:${key}:${idx}`;
    }
    return `p:${key}`;
  }
  function isLiked(button) {
    if (!button) return false;
    if (button.matches(CONFIG.COMMENT_LIKE_SELECTOR)) {
      const container = button.closest(".x1rg5ohu");
      const icon = container?.querySelector(CONFIG.POST_LIKE_ICON_SELECTOR);
      if (icon) return icon.classList.contains(CONFIG.LIKED_POST_CLASS);
      return button.getAttribute("aria-pressed") === "true";
    }
    const host = button.matches(CONFIG.POST_LIKE_SELECTOR) ? button : button.closest(CONFIG.POST_LIKE_SELECTOR);
    const scope = host || button;
    if (scope.querySelector(`.${CONFIG.LIKED_POST_CLASS}`)) return true;
    const icon = scope.querySelector(CONFIG.POST_LIKE_ICON_SELECTOR);
    if (icon) {
      if (icon.classList.contains(CONFIG.UNLIKED_ICON_CLASS)) return false;
      return scope.getAttribute("aria-pressed") === "true" || scope.parentElement?.getAttribute("aria-pressed") === "true";
    }
    return scope.getAttribute("aria-pressed") === "true" || scope.parentElement?.getAttribute("aria-pressed") === "true";
  }
  function trySeeMore(el) {
    if (!el || !el.isConnected) return false;
    if (expandedSeeMore.has(el)) return false;
    if (isHashtagLink(el)) return false;
    if (el.getAttribute("aria-expanded") === "true") return false;
    const root = getPostRoot(el);
    if (root && expandedRoots.has(root)) return false;
    const keys = seeLockKeys(el, root);
    if (!keys.length) return false;
    for (let i = 0; i < keys.length; i++) {
      if (expandedPostKeys.has(keys[i])) return false;
    }
    const t = performance.now();
    if (root) {
      const last = seeClickAt.get(root);
      if (last !== undefined && t - last < CONFIG.SEE_RETRY_MS) return false;
      seeClickAt.set(root, t);
      expandedRoots.add(root);
    }
    expandedSeeMore.add(el);
    for (let i = 0; i < keys.length; i++) expandedPostKeys.add(keys[i]);
    trimSet(expandedPostKeys, CONFIG.MAX_EXPANDED_KEYS);
    safeClick(el);
    return true;
  }
  function expandNextPost() {
    const list = resources.observers.interactive ? visibleSeeMore : cachedQuery("seeMore", CONFIG.SEE_MORE_SELECTOR);
    let n = 0;
    for (const el of list) {
      if (!isPostSeeMore(el)) continue;
      if (isAdRoot(getPostRoot(el))) continue;
      if (!trySeeMore(el)) continue;
      if (++n >= CONFIG.EXPAND_BATCH) break;
    }
    return n;
  }

  function isSinglePostOrDialog(el) {
    if (!el || !el.isConnected) return false;
    if (el.closest('[role="dialog"]')) return true;
    const p = window.location.pathname;
    return (
      /^\/[^/]+\/posts\//.test(p) ||
      /^\/permalink\.php$/.test(p) ||
      /^\/photo/.test(p) ||
      /^\/groups\/\d+\/(?:posts|permalink)\//.test(p)
    );
  }
  function expandComments() {
    const t = performance.now();
    const list = resources.observers.interactive ? visibleAutoExpand : cachedQuery("autoExpand", CONFIG.AUTO_EXPAND_SELECTOR);
    let n = 0;
    for (const btn of list) {
      if (!btn.isConnected) continue;
      if (!isSinglePostOrDialog(btn)) continue;
      if (btn.getAttribute("aria-expanded") === "true") continue;
      if (isHashtagLink(btn)) continue;
      if (isAdRoot(getPostRoot(btn))) continue;
      const cnt = commentExpandCount.get(btn) || 0;
      if (cnt >= COMMENT_EXPAND_MAX) continue;
      const last = commentExpandAt.get(btn);
      if (last !== undefined && t - last < CONFIG.COMMENT_EXPAND_COOLDOWN) continue;
      commentExpandAt.set(btn, t);
      commentExpandCount.set(btn, cnt + 1);
      safeClick(btn);
      if (++n >= CONFIG.EXPAND_BATCH) break;
    }
    return n;
  }
  function expandReplies() {
    const list = resources.observers.interactive ? visibleReplies : cachedQuery("commentAction", CONFIG.COMMENT_ACTION_SELECTOR);
    let n = 0;
    for (const el of list) {
      if (!el.isConnected || replyExpanded.has(el)) continue;
      if (!isSinglePostOrDialog(el)) continue;
      if (!el.querySelector(CONFIG.REPLY_CHEVRON_SELECTOR)) continue;
      if (isAdRoot(getPostRoot(el))) continue;
      replyExpanded.add(el);
      safeClick(el);
      if (++n >= CONFIG.EXPAND_BATCH) break;
    }
    return n;
  }
  function expandMoreComments() {
    const t = performance.now();
    const list = resources.observers.interactive ? visibleMore : cachedQuery("commentAction", CONFIG.COMMENT_ACTION_SELECTOR);
    let n = 0;
    for (const el of list) {
      if (!el.isConnected) continue;
      if (!isSinglePostOrDialog(el)) continue;
      if (el.querySelector("svg")) continue;
      const txt = (el.textContent || "").trim();
      if (!txt || !MORE_COMMENT_TEXT_RE.test(txt)) continue;
      if (isAdRoot(getPostRoot(el))) continue;
      let rec = moreClicks.get(el);
      if (!rec) {
        rec = { n: 0, t: -1e9 };
        moreClicks.set(el, rec);
      }
      if (rec.n >= CONFIG.MORE_COMMENT_MAX) continue;
      if (t - rec.t < CONFIG.MORE_COMMENT_COOLDOWN) continue;
      rec.n++;
      rec.t = t;
      safeClick(el);
      if (++n >= CONFIG.EXPAND_BATCH) break;
    }
    return n;
  }
  function likeEligible(el) {
    if (!el || !el.isConnected || isLiked(el)) return false;
    const aria = (el.getAttribute("aria-label") || el.parentElement?.getAttribute("aria-label") || "").trim();
    if (aria && (!LIKE_ARIA_ALLOW_RE.test(aria) || LIKE_ARIA_DENY_RE.test(aria))) return false;
    const id = getLikeButtonId(el);
    if (userUnlikedIds.has(id) || autoClickedLikeIds.has(id) || recentlyClicked.has(el)) return false;
    if (isPostLike(el) && !isOrganicReady(getPostRoot(el))) return false;
    return true;
  }
  function executeLike(button, id, t) {
    if (!button.isConnected || !state.isActivePage) return;
    recentlyClicked.add(button);
    safeClick(button);
    if (id) {
      autoClickedLikeIds.add(id);
      trimSet(autoClickedLikeIds, CONFIG.MAX_ID_CACHE);
    }
    state.likeReadyAt = t + CONFIG.LIKE_COOLDOWN;
    state.pendingLike = null;
  }
  function tryLike(el, t) {
    if (!likeEligible(el)) return false;
    const id = getLikeButtonId(el);
    if (t < state.likeReadyAt) {
      state.pendingLike = { button: el, id };
      return true;
    }
    executeLike(el, id, t);
    return true;
  }
  function flushPendingLike(t) {
    const p = state.pendingLike;
    if (!p) return;
    if (t < state.likeReadyAt) return;
    state.pendingLike = null;
    const btn = p.button;
    if (!likeEligible(btn)) return;
    if (state.buttons.autoLikePost && isPostLike(btn)) return;
    executeLike(btn, p.id, t);
  }
  function likeNextPost(t) {
    if (state.buttons.adHide && !state.adPrimed) return false;
    for (const root of visiblePosts) {
      if (!root.isConnected) continue;
      if (!isOrganicReady(root)) continue;
      const btn = postLikeOf(root);
      if (!btn || !likeEligible(btn)) continue;
      executeLike(btn, getLikeButtonId(btn), t);
      return true;
    }
    for (const btn of visiblePostLikes) {
      if (!likeEligible(btn)) continue;
      executeLike(btn, getLikeButtonId(btn), t);
      return true;
    }
    return false;
  }
  function hideNextAd(t) {
    for (const root of visiblePosts) {
      if (!root.isConnected) continue;
      if (root.closest('[role="dialog"]')) continue;
      if (!isAdRoot(root)) continue;
      const last = adAttempts.get(root);
      if (last !== undefined && t - last < CONFIG.AD_RETRY_MS) continue;
      adAttempts.set(root, t);
      const btn = findHideButton(root);
      if (!btn) continue;
      safeClick(btn);
      return true;
    }
    return false;
  }
  function runCycle() {
    if (!state.isActivePage || document.hidden) return;
    const t = performance.now();
    if (state.buttons.adHide) {
      if (visiblePosts.size) state.adPrimed = true;
      if (hideNextAd(t)) state.lastAdHideAt = t;
    }
    if (state.buttons.autoLikePost) likeNextPost(t);
    pump(true);
  }
  function syncCycleTimer(runNow) {
    const need = state.isActivePage && (state.buttons.autoLikePost || state.buttons.adHide);
    if (need) {
      if (!resources.cycleTimer) resources.cycleTimer = setInterval(runCycle, CONFIG.CYCLE_MS);
      if (runNow) runCycle();
    } else if (resources.cycleTimer) {
      clearInterval(resources.cycleTimer);
      resources.cycleTimer = 0;
    }
  }
  function onClick(e) {
    if (!state.isActivePage) return;
    const target = e.target;
    if (!target || target.nodeType !== 1) return;
    const btn = target.closest(LIKE_SELECTOR);
    if (!btn || recentlyClicked.has(btn)) return;
    pendingUnlike.set(btn, performance.now());
    trimMap(pendingUnlike, CONFIG.MAX_UNLIKE_PENDING);
  }
  function resolveUnlikeChecks(t) {
    if (!pendingUnlike.size) return;
    let n = 0;
    for (const btn of pendingUnlike.keys()) {
      const stamp = pendingUnlike.get(btn);
      if (t - stamp < CONFIG.UNLIKE_SETTLE_MS) continue;
      pendingUnlike.delete(btn);
      if (btn.isConnected && !isLiked(btn)) {
        const id = getLikeButtonId(btn);
        if (id) {
          userUnlikedIds.add(id);
          trimSet(userUnlikedIds, CONFIG.MAX_ID_CACHE);
        }
      }
      if (++n >= CONFIG.UNLIKE_BATCH_SIZE) break;
    }
  }
  function proximityHit(e, t, wantSee, wantLike) {
    if (!state.buttons.hoverPad) return false;
    const pad = state.settings.hoverPad;
    if (pad <= 0 || !resources.observers.interactive) return false;
    if (!wantSee && !wantLike) return false;
    const target = e.target;
    if (!target || target.nodeType !== 1) return false;
    if (inCommentScope(target)) return false;
    if (occupiedByControl(target)) return false;
    const levels = pad <= CONFIG.HOVER_PAD_NEAR ? 2 : pad <= CONFIG.HOVER_PAD_MID ? 3 : 4;
    const maxChildren = pad <= CONFIG.HOVER_PAD_NEAR ? 6 : pad <= CONFIG.HOVER_PAD_MID ? 10 : 16;
    const padSq = pad * pad;
    const x = e.clientX;
    const y = e.clientY;
    let bestSee = null;
    let bestSeeD = Infinity;
    let bestLike = null;
    let bestLikeD = Infinity;
    let node = target.parentElement;
    let level = 0;
    while (node && node !== document.body && level < levels) {
      level++;
      const boundary = isPostBoundary(node);
      if (boundary || node.childElementCount <= maxChildren) {
        const bucket = scanBucket(node, t, wantSee, wantLike);
        if (boundary || !bucket.comment) {
          if (wantSee && bucket.sees) {
            const max = Math.min(bucket.sees.length, CONFIG.HOVER_CANDIDATE_LIMIT);
            for (let i = 0; i < max; i++) {
              const el = bucket.sees[i];
              if (!visibleSeeMore.has(el) || !isPostSeeMore(el)) continue;
              if (expandedSeeMore.has(el) || isHashtagLink(el)) continue;
              if (isAdRoot(getPostRoot(el))) continue;
              const d = pointerDistanceSq(el, x, y, t);
              if (d <= padSq && d < bestSeeD) {
                bestSeeD = d;
                bestSee = el;
              }
            }
          }
          if (wantLike && bucket.likes) {
            const max = Math.min(bucket.likes.length, CONFIG.HOVER_CANDIDATE_LIMIT);
            for (let i = 0; i < max; i++) {
              const el = bucket.likes[i];
              if (!visiblePostLikes.has(el) || !isPostLike(el) || !likeEligible(el)) continue;
              const d = pointerDistanceSq(el, x, y, t);
              if (d <= padSq && d < bestLikeD) {
                bestLikeD = d;
                bestLike = el;
              }
            }
          }
        }
      }
      if (boundary) break;
      node = node.parentElement;
    }
    if (bestSee && bestSeeD <= bestLikeD) {
      if (trySeeMore(bestSee)) return true;
      if (bestLike) return tryLike(bestLike, t);
      return false;
    }
    if (bestLike) return tryLike(bestLike, t);
    return false;
  }
  function hoverAct(e, t) {
    const wantSee = state.buttons.otherExpand && !state.buttons.postExpand;
    const wantLike = state.buttons.like;
    const wantPostLike = wantLike && !state.buttons.autoLikePost;
    const path = e.composedPath();
    const len = path.length;
    if (wantSee) {
      for (let i = 0; i < len; i++) {
        const el = path[i];
        if (el.nodeType === 1 && isPostSeeMore(el)) {
          if (!isAdRoot(getPostRoot(el))) trySeeMore(el);
          return;
        }
      }
    }
    if (wantLike) {
      for (let i = 0; i < len; i++) {
        const el = path[i];
        if (el.nodeType !== 1) continue;
        if (el.matches(CONFIG.COMMENT_LIKE_SELECTOR)) {
          tryLike(el, t);
          return;
        }
        if (el.matches(CONFIG.POST_LIKE_SELECTOR)) {
          if (wantPostLike) tryLike(el, t);
          return;
        }
      }
    }
    proximityHit(e, t, wantSee, wantPostLike);
  }
  function handleMouseOver(e) {
    if (!state.isActivePage || document.hidden) return;
    const t = performance.now();
    if ((state.buttons.like || state.buttons.otherExpand) && !isScrolling(t)) hoverAct(e, t);
    pump(false);
  }
  function pump(force) {
    if (!state.isActivePage || document.hidden) return;
    const t = performance.now();
    if (!force && t - state.lastPumpTime < CONFIG.PUMP_MIN_INTERVAL_MS) return;
    state.lastPumpTime = t;
    if (state.fullSeedPending || pendingRoots.size) drainRoots();
    applyLoginWallRemoval();
    applyExtraContentFilters();
    markStoriesReelsBlocks();
    if (state.buttons.sanitizeLinks && document.body) sanitizeLinksInRoot(document.body);
    if (state.buttons.adHide) {
      if (visiblePosts.size) state.adPrimed = true;
      if (t - state.lastAdHideAt >= CONFIG.CYCLE_MS && hideNextAd(t)) state.lastAdHideAt = t;
    }
    resolveUnlikeChecks(t);
    if (!isScrolling(t)) {
      flushPendingLike(t);
      if (state.buttons.allComments) switchToAllComments();
      if ((state.buttons.postExpand || state.buttons.otherExpand) && (!state.buttons.adHide || state.adPrimed)) {
        if (state.buttons.postExpand) expandNextPost();
        if (state.buttons.otherExpand && t >= allCommentsHoldUntil) {
          expandComments();
          expandReplies();
          expandMoreComments();
        }
      }
    }
    maybePrune(t);
  }

  /* === MODULE: src/modules/styles_layout.js === */
  function initStyleTag() {
    if (state.styleInjected) return;
    const style = document.createElement("style");
    style.id = "fb-worker-wisdom-multicolumn";
    style.textContent = "";
    (document.head || document.documentElement).appendChild(style);
    resources.styleTag = style;
    const ui = document.createElement("style");
    ui.id = "fb-worker-wisdom-ui";
    ui.textContent = [
      ".ww-rail{scrollbar-width:thin;scrollbar-color:#6B8E9F #EAEBED}",
      ".ww-rail::-webkit-scrollbar{width:6px}",
      ".ww-rail::-webkit-scrollbar-track{background:#EAEBED;border-radius:3px}",
      ".ww-rail::-webkit-scrollbar-thumb{background:#6B8E9F;border-radius:3px}",
      ".ww-rail::-webkit-scrollbar-thumb:hover{background:#5A7C8D}",
      ".ffe-modal-backdrop{position:fixed;inset:0;z-index:10050;background:rgba(234,235,237,0.74);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans TC',sans-serif}",
      ".ffe-modal-card{width:100%;max-width:560px;max-height:86vh;background:#F7F8FA;color:#2D3748;border:1px solid #E2E8F0;border-radius:14px;box-shadow:0 14px 36px rgba(45,55,72,0.14);display:flex;flex-direction:column;overflow:hidden}",
      ".ffe-modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:#FFFFFF;border-bottom:1px solid #E2E8F0}",
      ".ffe-modal-title{margin:0;font-size:16px;font-weight:700;color:#2D3748}",
      ".ffe-modal-subtitle{margin-top:3px;font-size:12px;color:#718096}",
      ".ffe-btn-icon{background:#F2F4F7;color:#2D3748;border:1px solid #E2E8F0;border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center}",
      ".ffe-btn-icon:hover{background:#E2E8F0}",
      ".ffe-modal-body{padding:16px 20px;overflow-y:auto;display:flex;flex-direction:column;gap:14px}",
      ".ffe-section{background:#FFFFFF;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:10px}",
      ".ffe-section-title{font-size:13px;font-weight:700;color:#6B8E9F;border-bottom:1px solid #F2F4F7;padding-bottom:6px}",
      ".ffe-setting-row{display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer}",
      ".ffe-setting-info{display:flex;flex-direction:column;gap:2px;flex:1}",
      ".ffe-setting-label{font-size:13px;font-weight:600;color:#2D3748}",
      ".ffe-setting-desc{font-size:11.5px;color:#718096;line-height:1.4}",
      ".ffe-checkbox{width:18px;height:18px;accent-color:#7D9D8B;cursor:pointer;flex:0 0 auto}",
      ".ffe-select{background:#F7F8FA;color:#2D3748;border:1px solid #CBD5E0;border-radius:6px;padding:6px 10px;font-size:12.5px;font-weight:600;cursor:pointer}",
      ".ffe-textarea{width:100%;box-sizing:border-box;background:#F7F8FA;color:#2D3748;border:1px solid #CBD5E0;border-radius:8px;padding:8px 10px;font-size:12.5px;resize:vertical;font-family:inherit}",
      ".ffe-inline-actions{display:flex;align-items:center;justify-content:space-between;gap:10px}",
      ".ffe-status-badge{font-size:12px;color:#718096;background:#F2F4F7;padding:4px 8px;border-radius:6px}",
      ".ffe-modal-footer{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#FFFFFF;border-top:1px solid #E2E8F0}",
      ".ffe-btn-primary{background:#6B8E9F;color:#FFFFFF;border:none;border-radius:8px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer}",
      ".ffe-btn-primary:hover{background:#5A7C8D}",
      ".ffe-btn-secondary{background:#F2F4F7;color:#2D3748;border:1px solid #CBD5E0;border-radius:8px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer}",
      ".ffe-btn-secondary:hover{background:#E2E8F0}",
    ].join("");
    (document.head || document.documentElement).appendChild(ui);
    resources.uiStyleTag = ui;
    state.styleInjected = true;
  }
  function generateMultiColumnCSS() {
    const sidebarActiveCSS =
      ".xxzkxad.x9e5oc1,.xh78kpn.xcoz2nd.x2bj2ny,.x1vjfegm.x2lah0s.xeuugli{max-width:var(--sidebar-width);min-width:var(--sidebar-width);position:absolute;z-index:1}" +
      ".x1v0nzow.x1ceravr.x17zi3g0.xvue9z.x193iq5w,.x1xwk8fm.x193iq5w,.xsfy40s.x1miatn0.x9f619{width:calc(110% - var(--sidebar-width));margin-right:-60px}";
    const sidebarInactiveCSS =
      ".xxzkxad.x9e5oc1,.xh78kpn.xcoz2nd.x2bj2ny,.x1vjfegm.x2lah0s.xeuugli{max-width:none;min-width:0;position:static;z-index:auto}" +
      ".x1v0nzow.x1ceravr.x17zi3g0.xvue9z.x193iq5w,.x1xwk8fm.x193iq5w,.xsfy40s.x1miatn0.x9f619{width:auto;margin-right:0}";
    const sidebarCSS = state.buttons.sidebar ? sidebarActiveCSS : sidebarInactiveCSS;
    const heightVal = state.buttons.height ? state.settings.maxHeight : CONFIG.DEFAULT_MAX_HEIGHT;
    const ew = state.settings.expandWidth;
    const em = (100 - ew) / 2;
    const expandWidthCSS = state.buttons.expandWidth
      ? `.x1qjc9v5.x71s49j.x1a2a7pz{width:${ew}%;max-width:none;margin:0 ${em}%;flex:0 0 auto}`
      : "";
    const root = `:root{--column-count:${state.settings.columns};--column-gap:${CONFIG.COLUMN_GAP}px;--max-post-height:${heightVal}vh;--sidebar-width:60px}`;
    const pageSmoothCSS = CONFIG.PAGE_SMOOTH_ENABLED ? ":root{scroll-behavior:smooth}" : "";
    const containerMaxWidth =
      ".xornbnt.x1t2pt76.xylbxtu.x1q0g3np.xozqiw3.x1cy8zhl.x1qughib.xeuugli.xs83m0k.x1iyjqo2.x1r8uery.x1n2onr6.x78zum5.x1ja2u2z.x9f619," +
      ".x1t2pt76.x78zum5.xs83m0k.x1iyjqo2.x1r8uery.xeuugli.x193iq5w.xdt5ytf.x1ja2u2z.x1n2onr6.x9f619{max-width:100%}";
    const flexContainer =
      ".x6o7n8i.x1unhpq9.x1hc1fzr>div>div,.x1xwk8fm.x193iq5w{display:flex;flex-wrap:wrap;gap:var(--column-gap);justify-content:flex-start;align-content:flex-start;overflow-anchor:auto}";
    const flexItem = `${CONFIG.FLEX_ITEM_SELECTOR}{width:calc((100% - (var(--column-gap)*(var(--column-count) - 1)))/var(--column-count));max-height:var(--max-post-height);overflow-y:auto;overflow-x:hidden;overflow-anchor:auto;scrollbar-width:thin;scrollbar-color:#1877f2 rgba(120,130,150,.25)}`;
    const hideElements =
      ".x1daaz14.x1t2pt76,.xwib8y2.x1y1aw1k.xwya9rg,.xq1tmr.xvue9z>.x1yztbdb,footer{display:none}";
    return root + pageSmoothCSS + sidebarCSS + containerMaxWidth + flexContainer + flexItem + expandWidthCSS + hideElements;
  }
  function applyMultiColumnCSS() {
    initStyleTag();
    if (state.isActivePage && state.buttons.columns) {
      resources.styleTag.disabled = false;
      const css = generateMultiColumnCSS();
      if (resources.styleTag.textContent !== css) resources.styleTag.textContent = css;
    } else {
      resources.styleTag.disabled = true;
    }
    invalidateRects();
  }

  /* === MODULE: src/ui/settings_modal.js === */
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
        subtitle: "v2.0.2 控制中心｜所有設定即時生效並自動儲存",
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
      subtitle: "v2.0.2 Control Center | Changes apply immediately and auto-save",
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

  /* === MODULE: src/ui/control_panel.js === */
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

  /* === MODULE: src/main.js === */
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
})();
