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
