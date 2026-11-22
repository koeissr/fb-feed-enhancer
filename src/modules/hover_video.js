  const hoveredVideos = new WeakSet();
  const manualPlayingVideos = new WeakSet();

  function isFeedHoverVideoTarget(v) {
    if (!state.buttons.hoverPlayVideo || !v || v.tagName !== "VIDEO" || !v.isConnected) return false;
    // 自動排除 Reels、Watch 獨立影片頁與貼文燈箱
    if (/^\/(reel|watch)\//i.test(window.location.pathname)) return false;
    if (v.closest('[role="dialog"]')) return false;
    return true;
  }

  function findVideoForPointerTarget(target) {
    if (!target || target.nodeType !== 1) return null;
    if (target.tagName === "VIDEO") return target;
    const direct = target.closest("video");
    if (direct) return direct;
    // Facebook 影片外層常有一層透明點擊覆蓋層，往上找 5 層內的專屬影片容器
    let node = target;
    for (let i = 0; i < 5 && node && node !== document.body; i++) {
      if (node.matches && node.matches('[role="article"], [aria-posinset]')) break;
      const vids = node.querySelectorAll ? node.querySelectorAll("video") : null;
      if (vids && vids.length === 1) return vids[0];
      node = node.parentElement;
    }
    return null;
  }

  let activeHoverVideo = null;

  function handleHoverVideoPlay(e) {
    const v = e.target;
    if (!isFeedHoverVideoTarget(v)) return;
    if (!hoveredVideos.has(v) && !manualPlayingVideos.has(v)) {
      try {
        v.pause();
      } catch {}
    }
  }

  function handleHoverVideoPointerMove(e) {
    if (!state.buttons.hoverPlayVideo || !state.isActivePage) return;
    const hitVideo = findVideoForPointerTarget(e.target);
    const validVideo = hitVideo && isFeedHoverVideoTarget(hitVideo) ? hitVideo : null;
    if (validVideo === activeHoverVideo) return;

    // 離開前一支懸浮影片
    if (activeHoverVideo) {
      hoveredVideos.delete(activeHoverVideo);
      if (!manualPlayingVideos.has(activeHoverVideo) && !activeHoverVideo.paused) {
        try {
          activeHoverVideo.pause();
        } catch {}
      }
      activeHoverVideo = null;
    }

    // 進入新懸浮影片
    if (validVideo) {
      activeHoverVideo = validVideo;
      hoveredVideos.add(validVideo);
      if (validVideo.paused) {
        try {
          const p = validVideo.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } catch {}
      }
    }
  }

  function handleHoverVideoClick(e) {
    if (!state.buttons.hoverPlayVideo || !state.isActivePage) return;
    const v = findVideoForPointerTarget(e.target);
    if (!v || !isFeedHoverVideoTarget(v)) return;
    if (manualPlayingVideos.has(v)) {
      manualPlayingVideos.delete(v);
    } else {
      manualPlayingVideos.add(v);
    }
  }

  function syncHoverPlayVideos() {
    if (!document.body) return;
    if (!state.buttons.hoverPlayVideo) {
      activeHoverVideo = null;
      return;
    }
    const videos = document.querySelectorAll("video");
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      if (!isFeedHoverVideoTarget(v)) continue;
      if (!hoveredVideos.has(v) && !manualPlayingVideos.has(v) && !v.paused) {
        try {
          v.pause();
        } catch {}
      }
    }
  }
