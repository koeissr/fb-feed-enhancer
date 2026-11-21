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
