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
  const dialogs = getActiveFbDialogs();
  for (let i = 0; i < dialogs.length; i++) {
    if (isForced || !switchedCommentScopes.has(dialogs[i])) {
      scopes.push({ el: dialogs[i], path: null });
    }
  }
  const curPath = window.location.pathname + window.location.search;
  if (!scopes.length && dialogs.length === 0 && isSinglePostOrDialog(document.body)) {
    if (isForced || !switchedCommentPaths.has(curPath)) {
      scopes.push({ el: document.body, path: curPath });
    }
  }
  for (let s = 0; s < scopes.length; s++) {
    const { el: scope, path } = scopes[s];
    const buttons = scope.querySelectorAll('div[role="button"]');
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      if (!btn.isConnected || isHiddenOrInert(btn) || isNavigationLinkElement(btn)) continue;
      if (path && isBackgroundFeedElement(btn)) continue;
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
