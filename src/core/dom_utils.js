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
