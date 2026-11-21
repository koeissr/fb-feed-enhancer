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
