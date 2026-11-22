  let ioHookInstalled = false;
  let internalIOCreating = false;
  let lastRecoveryScrollY = 0;
  let lastWakeAt = -1e9;
  let wakeTimer = 0;

  function parseVerticalMarginPx(rootMargin) {
    if (!rootMargin || typeof rootMargin !== "string") return 0;
    const parts = rootMargin.trim().split(/\s+/);
    const first = parts.length > 0 ? parts[0] : "";
    if (!first) return 0;
    const match = /^(-?\d+(?:\.\d+)?)px$/i.exec(first);
    return match ? parseFloat(match[1]) : 0;
  }

  function installVirtualBufferHook() {
    if (ioHookInstalled || !state.buttons.expandVirtualBuffer) return;
    const targetWin = pageWindow || window;
    const NativeIO = targetWin.IntersectionObserver;
    if (typeof NativeIO !== "function") return;
    ioHookInstalled = true;

    const BUFFER_PX = 2200;
    const WrappedIO = function (callback, options) {
      if (!internalIOCreating && state.buttons.expandVirtualBuffer && (!options || !options.root)) {
        const nextOpts = options ? Object.assign({}, options) : {};
        const curVertical = parseVerticalMarginPx(nextOpts.rootMargin);
        if (curVertical < BUFFER_PX) {
          nextOpts.rootMargin = `${BUFFER_PX}px 0px ${BUFFER_PX}px 0px`;
        }
        return new NativeIO(callback, nextOpts);
      }
      return new NativeIO(callback, options);
    };
    WrappedIO.prototype = NativeIO.prototype;
    try {
      Object.defineProperty(WrappedIO, "__ffeWrapped", { value: true });
      targetWin.IntersectionObserver = WrappedIO;
      if (window !== targetWin) window.IntersectionObserver = WrappedIO;
    } catch {}
  }

  function hasBlankVirtualizedCardInViewport() {
    if (!state.isActivePage || !state.buttons.columns || !document.body) return false;
    const items = document.querySelectorAll(CONFIG.FLEX_ITEM_SELECTOR);
    const vh = window.innerHeight || 900;
    for (let i = 0; i < items.length; i++) {
      const el = items[i];
      if (!el.isConnected || el.hasAttribute("data-ffe-filtered")) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= vh) continue;
      // 位於視口內但內容為空且無媒體（疑似被 FB 虛擬化卸載未重繪）
      const txtLen = (el.textContent || "").trim().length;
      if (txtLen === 0 && !el.querySelector("img, video, svg")) {
        return true;
      }
    }
    return false;
  }

  function wakeVirtualizedFeed() {
    if (!state.isActivePage || !state.buttons.columns || document.hidden) return false;
    const now = performance.now();
    if (now - lastWakeAt < 650) return false;
    if (!hasBlankVirtualizedCardInViewport()) return false;
    lastWakeAt = now;
    try {
      window.dispatchEvent(new Event("resize"));
      requestAnimationFrame(() => {
        try {
          window.dispatchEvent(new Event("scroll"));
        } catch {}
      });
    } catch {}
    return true;
  }

  function handleScrollUpRecovery() {
    if (!state.isActivePage || !state.buttons.columns) return;
    const curY = window.scrollY;
    const isScrollingUp = curY < lastRecoveryScrollY - 120;
    lastRecoveryScrollY = curY;
    if (!isScrollingUp) return;
    if (wakeTimer) clearTimeout(wakeTimer);
    wakeTimer = setTimeout(() => {
      wakeTimer = 0;
      wakeVirtualizedFeed();
    }, 260);
  }
