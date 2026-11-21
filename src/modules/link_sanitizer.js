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
