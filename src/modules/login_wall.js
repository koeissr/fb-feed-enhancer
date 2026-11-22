  const LOGIN_WALL_TEXT_RE = /(登入 Facebook|登录 Facebook|Log in to Facebook|建立新帳號|新建帐户|Create new account|查看 Facebook 上的更多內容|See more on Facebook)/i;

  function isGuestMode() {
    if (!document.body) return false;
    if (document.querySelector('div[role="banner"] a[href*="/me"], div[role="banner"] [aria-label*="帳號"], div[role="banner"] [aria-label*="Account"], div[role="banner"] [aria-label*="你的個人檔案"], div[role="banner"] [aria-label*="Your profile"]')) {
      return false;
    }
    return !!document.querySelector('form[action*="login"], input[name="email"][type="text"], a[href*="/login/"]');
  }

  function isSafeOverlayContainer(node) {
    if (!node || node.nodeType !== 1) return false;
    if (node === document.body || node === document.documentElement) return false;
    if (node.id === "ffe-settings-modal" || node === resources.panel) return false;
    if (node.id && node.id.startsWith("mount_")) return false;
    if (node.querySelector('div[role="main"], div[role="banner"], video, #ffe-settings-modal, .ww-rail')) return false;
    return true;
  }

  function isFullViewportBackdrop(node) {
    if (!isSafeOverlayContainer(node)) return false;
    let cs;
    try {
      cs = window.getComputedStyle(node);
    } catch {
      return false;
    }
    if (!cs || cs.display === "none") return false;
    const rect = node.getBoundingClientRect();
    return rect.width >= window.innerWidth * 0.85 && rect.height >= window.innerHeight * 0.85;
  }

  function hideLoginNode(node) {
    if (!node || node.getAttribute("data-ffe-filtered") === "1") return 0;
    node.setAttribute("data-ffe-filtered", "1");
    node.setAttribute("data-ffe-login-wall", "1");
    return 1;
  }

  function applyLoginWallRemoval() {
    if (!state.buttons.removeLoginWall || !document.body) return 0;
    if (!isGuestMode()) return 0;
    let removedCount = 0;
    let foundLoginWall = false;

    // 1. 偵測登入彈窗與註冊橫幅，並向上追溯隱藏專屬外層白霧與透明 Portal 遮罩（含 position: static 全螢幕外殼）
    const dialogs = document.querySelectorAll('[role="dialog"], [data-nosnippet], #login_popup_cta_form');
    for (let i = 0; i < dialogs.length; i++) {
      const el = dialogs[i];
      if (!el.isConnected || el.id === "ffe-settings-modal") continue;
      if (!isSafeOverlayContainer(el)) continue;
      const hasLoginForm = !!el.querySelector('input[name="email"], input[name="pass"], a[href*="/login"], a[href*="/r.php"]');
      const txt = (el.textContent || "").slice(0, 300);
      if (!hasLoginForm && !LOGIN_WALL_TEXT_RE.test(txt)) continue;

      foundLoginWall = true;
      let hideTarget = el;
      let cur = el;
      for (let depth = 0; depth < 12; depth++) {
        const parent = cur.parentElement;
        if (!parent || !isSafeOverlayContainer(parent)) break;
        // 同步隱藏同層的無文字全螢幕遮罩兄弟節點
        const siblings = parent.children;
        for (let s = 0; s < siblings.length; s++) {
          const sib = siblings[s];
          if (sib === cur) continue;
          if ((sib.textContent || "").trim().length === 0 && isFullViewportBackdrop(sib)) {
            removedCount += hideLoginNode(sib);
          }
        }
        if (isFullViewportBackdrop(parent)) {
          hideTarget = parent;
        }
        cur = parent;
      }
      removedCount += hideLoginNode(hideTarget);
      if (hideTarget !== el) {
        removedCount += hideLoginNode(el);
      }
    }

    // 2. 解除底層主容器可能被附加的 aria-hidden / inert 互動鎖定
    if (foundLoginWall || document.querySelector('[data-ffe-login-wall="1"]')) {
      const lockedNodes = document.querySelectorAll('[aria-hidden="true"], [inert]');
      for (let i = 0; i < lockedNodes.length; i++) {
        const ln = lockedNodes[i];
        if (ln.querySelector('div[role="main"], video')) {
          if (ln.getAttribute("aria-hidden") === "true") ln.removeAttribute("aria-hidden");
          if (ln.hasAttribute("inert")) ln.removeAttribute("inert");
          removedCount++;
        }
      }
    }

    // 3. 解鎖訪客模式常見的捲動鎖定（overflow: hidden）
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
