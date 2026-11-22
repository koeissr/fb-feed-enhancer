  const SPEED_MIN = 0.5;
  const SPEED_MAX = 3.0;
  const SPEED_STEP = 0.25;
  const SEEK_SECONDS = 5;

  function clampSpeed(val) {
    const stepped = Math.round(val / SPEED_STEP) * SPEED_STEP;
    return Math.max(SPEED_MIN, Math.min(SPEED_MAX, Number(stepped.toFixed(2))));
  }

  function applySpeedTo(v) {
    if (!v || v.tagName !== "VIDEO" || !v.isConnected) return;
    const target = state.buttons.speed ? clampSpeed(state.settings.playbackRate) : 1.0;
    if (Math.abs(v.playbackRate - target) > 0.01) {
      try {
        v.playbackRate = target;
      } catch {}
    }
  }

  function applySpeedToAllVideos() {
    if (!document.body) return;
    const list = document.querySelectorAll("video");
    for (let i = 0; i < list.length; i++) {
      applySpeedTo(list[i]);
    }
  }

  function adjustPlaybackSpeed(delta) {
    state.settings.playbackRate = clampSpeed(state.settings.playbackRate + delta);
    GM_setValue("playbackRate", state.settings.playbackRate);
    if (!state.buttons.speed) {
      state.buttons.speed = true;
      GM_setValue("speedEnabled", true);
      const speedBtn = document.getElementById("ffe-btn-speed");
      if (speedBtn) updateButtonStyle(speedBtn, true);
      updateCategoryDots();
    }
    applySpeedToAllVideos();
    updateNumericLabels();
  }

  function findPrimaryVideo() {
    if (!document.body) return null;
    const list = Array.from(document.querySelectorAll("video")).filter((v) => v.isConnected);
    if (!list.length) return null;
    const vh = window.innerHeight || 900;
    const vw = window.innerWidth || 1440;
    // 1. 優先挑選視口內正在播放的影片
    for (let i = 0; i < list.length; i++) {
      const v = list[i];
      const r = v.getBoundingClientRect();
      if (!v.paused && r.width > 40 && r.height > 40 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw) {
        return v;
      }
    }
    // 2. 退而求其次挑選視口內面積最大的可見影片
    let best = null;
    let bestArea = 0;
    for (let i = 0; i < list.length; i++) {
      const v = list[i];
      const r = v.getBoundingClientRect();
      if (r.width <= 40 || r.height <= 40 || r.bottom <= 0 || r.top >= vh) continue;
      const area = r.width * r.height;
      if (area > bestArea) {
        bestArea = area;
        best = v;
      }
    }
    return best || list[0];
  }

  function togglePictureInPicture() {
    if (typeof document.exitPictureInPicture === "function" && document.pictureInPictureElement) {
      try {
        const p = document.exitPictureInPicture();
        if (p && typeof p.catch === "function") p.catch(() => {});
        return true;
      } catch {
        return false;
      }
    }
    const v = findPrimaryVideo();
    if (!v || typeof v.requestPictureInPicture !== "function") return false;
    try {
      if (v.disablePictureInPicture) v.disablePictureInPicture = false;
      const p = v.requestPictureInPicture();
      if (p && typeof p.catch === "function") p.catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  function applyReelLoopPolicyTo(v) {
    if (!v || v.tagName !== "VIDEO" || !v.isConnected) return;
    if (!isReelContext(v)) return;
    if (state.buttons.reelPauseOnEnd) {
      if (v.loop) v.loop = false;
    }
  }

  function handleReelTimeUpdateForPause(e) {
    if (!state.buttons.reelPauseOnEnd) return;
    const v = e.target;
    if (!v || v.tagName !== "VIDEO" || !isReelContext(v)) return;
    if (v.loop) v.loop = false;
    // 部分 FB Reels 會透過 JS 自行在結尾前跳回 0，於最後 0.25s 提前安全暫停
    if (Number.isFinite(v.duration) && v.duration > 1 && v.currentTime >= v.duration - 0.25 && !v.paused) {
      try {
        v.pause();
      } catch {}
    }
  }

  function handleMediaPlayEvent(e) {
    const v = e.target;
    if (!v || v.tagName !== "VIDEO") return;
    applySpeedTo(v);
    applyReelLoopPolicyTo(v);
  }

  function handleMediaHotkeys(e) {
    if (!state.buttons.videoHotkeys || !state.isActivePage) return;
    if (!e || e.ctrlKey || e.altKey || e.metaKey) return;
    const active = document.activeElement;
    if (active) {
      const tag = active.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || active.isContentEditable) return;
    }
    if (e.key === "[" || e.key === "]") {
      adjustPlaybackSpeed(e.key === "]" ? SPEED_STEP : -SPEED_STEP);
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const v = findPrimaryVideo();
      if (!v) return;
      const delta = e.key === "ArrowRight" ? SEEK_SECONDS : -SEEK_SECONDS;
      const dur = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : Infinity;
      const nextTime = Math.max(0, Math.min(dur, (v.currentTime || 0) + delta));
      try {
        v.currentTime = nextTime;
      } catch {}
      e.preventDefault();
    }
  }
