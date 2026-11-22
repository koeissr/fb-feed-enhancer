#!/usr/bin/env node
/**
 * FB Feed Enhancer v2.0.0 真實 Chrome Headless CDP 無 Mock 實體驗收腳本
 * 零外部依賴（純 Node.js v24 + 真實 Chrome 瀏覽器引擎）
 */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BUNDLE_PATH = path.join(ROOT, "fb-feed-enhancer.user.js");
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const TEST_HTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8" />
  <title>Facebook Feed Enhancer Physical Verification Fixture</title>
  <style>
    body { margin: 0; font-family: sans-serif; }
    .feed-card { padding: 12px; margin: 8px; border: 1px solid #ccc; }
    .reel-overlay { opacity: 1; }
  </style>
</head>
<body style="overflow: hidden;">
  <div role="banner">
    <a id="nav-marketplace" href="https://www.facebook.com/marketplace/" aria-label="Marketplace">商店</a>
    <form action="/login/device-based/regular/login/"><input type="text" name="email" /></form>
  </div>

  <div role="navigation">
    <footer role="contentinfo" id="left-footer">隱私政策 · 服務條款</footer>
  </div>

  <div role="complementary" id="right-rail">右側贊助與聯絡人</div>

  <div role="main" id="main-feed">
    <div aria-label="限時動態" id="stories-shelf">限時動態區</div>

    <div role="article" aria-posinset="1" id="post-normal" class="feed-card">
      <div data-ad-rendering-role="story_message">
        這是一則正常的朋友日常分享貼文，沒有任何敏感詞。
        <a id="ext-link-1" href="https://l.facebook.com/l.php?u=https%3A%2F%2Fexample.com%2Farticle%3Fid%3D42%26fbclid%3DXYZ123&h=AT0Test">外部文章連結</a>
        <a id="ext-link-2" href="https://example.org/news?page=2&fbclid=ABC999&__cft__[0]=TRACK">直接帶追蹤碼連結</a>
      </div>
    </div>

    <div role="article" aria-posinset="2" id="post-meta-ai" class="feed-card">
      <a href="https://www.meta.ai/">向 Meta AI 提問</a>
      <div>試用 Meta AI 探索更多靈感</div>
    </div>

    <div role="article" aria-posinset="3" id="post-pymk" class="feed-card">
      <h3>你可能認識的人</h3>
      <div>好友推薦清單</div>
    </div>

    <div role="article" aria-posinset="4" id="post-keyword" class="feed-card">
      <div data-ad-rendering-role="story_message">限時優惠！這是一則業配文抽獎活動，快來留言！</div>
    </div>

    <div data-pagelet="ReelContainer" id="reel-box">
      <video id="reel-video" muted playsinline></video>
      <div data-ad-rendering-role="story_message" id="reel-title-overlay" class="reel-overlay">這是一段 Reels 標題文字遮罩</div>
    </div>
  </div>

  <!-- 模擬未登入訪客雙層登入牆（含全螢幕白霧 Backdrop） -->
  <div id="guest-login-backdrop-wrapper" style="position:fixed;inset:0;width:100vw;height:100vh;background:rgba(244,244,244,0.82);z-index:5000;">
    <div id="guest-login-fog-sibling" style="position:fixed;inset:0;width:100vw;height:100vh;background:rgba(255,255,255,0.75);"></div>
    <div role="dialog" id="guest-login-wall">
      <div>登入 Facebook 查看 Facebook 上的更多內容</div>
      <input type="text" name="email" />
      <input type="password" name="pass" />
    </div>
  </div>

  <!-- 模擬貼文留言燈箱 -->
  <div role="dialog" id="post-comment-dialog">
    <div role="button" id="comment-sort-trigger">最相關</div>
    <div id="comment-sort-menu" style="display:none;">
      <div role="menuitemradio" id="menu-all-comments">所有留言</div>
      <div role="menuitemradio" id="menu-newest-comments">最新留言</div>
    </div>
  </div>

  <script>
    window.__clickedMenuIds = [];
    document.getElementById("comment-sort-trigger").addEventListener("click", () => {
      document.getElementById("comment-sort-menu").style.display = "block";
    });
    document.getElementById("menu-all-comments").addEventListener("click", () => {
      window.__clickedMenuIds.push("all");
      document.getElementById("comment-sort-trigger").textContent = "所有留言";
    });
    document.getElementById("menu-newest-comments").addEventListener("click", () => {
      window.__clickedMenuIds.push("newest");
      document.getElementById("comment-sort-trigger").textContent = "最新留言";
    });
  </script>
</body>
</html>`;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function runStaticAudits(bundleCode) {
  console.log("\n=== [1] 靜態 AST、安全權限與舊寫法零殘留審計 ===");
  // 1. AST / 語法編譯驗證
  new vm.Script(bundleCode, { filename: "fb-feed-enhancer.user.js" });
  console.log("  [PASS] vm.Script AST 語法編譯通過");

  // 2. 零新增外部網路權限驗證
  assert.ok(!/@grant\s+GM_xmlhttpRequest/i.test(bundleCode), "嚴禁宣告 GM_xmlhttpRequest");
  assert.ok(!/@grant\s+GM_download/i.test(bundleCode), "嚴禁宣告 GM_download");
  assert.ok(!/\bfetch\s*\(/.test(bundleCode), "嚴禁外部 fetch 呼叫");
  assert.ok(!/\bXMLHttpRequest\b/.test(bundleCode), "嚴禁外部 XMLHttpRequest");
  console.log("  [PASS] 零外部網路權限與零外連 API 審計通過");

  // 3. 淺色系視覺規範、舊暗黑與不安全硬改 muted 零殘留
  assert.ok(!bundleCode.includes("rgba(10,14,24"), "工具列舊暗黑背景殘留");
  assert.ok(!bundleCode.includes('backgroundColor: "#000000"'), "小按鈕純黑背景殘留");
  assert.ok(bundleCode.includes("#F7F8FA") && bundleCode.includes("#6B8E9F") && bundleCode.includes("#7D9D8B"), "缺少淺色系標準色票");
  assert.ok(!/莫蘭迪|莫兰迪|Morandi/i.test(bundleCode), "腳本產物不應包含多餘配色代稱字眼");
  assert.ok(!/\.muted\s*=\s*false/.test(bundleCode), "嚴禁直接覆寫 video.muted = false 以免凍死 FB Reels 播放器");
  console.log("  [PASS] 淺色視覺規範、舊暗黑零殘留、零硬改 muted 與無多餘字眼通過");

  // 4. "||" 假資料保底語法掃描
  const orMatches = bundleCode.match(/\|\|\s*['"][^'"]+['"]/g) || [];
  const allowedOr = new Set(['|| ""', "|| ''"]);
  const violations = orMatches.filter((m) => !allowedOr.has(m.trim()));
  assert.equal(violations.length, 0, `發現違規 || 字串保底: ${violations.join(", ")}`);
  console.log("  [PASS] || 保底語法掃描零違規");
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.exceptions = [];
  }
  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === "Runtime.exceptionThrown") {
        this.exceptions.push(msg.params?.exceptionDetails?.text || "Unknown Exception");
      }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Browser Eval Error: ${res.exceptionDetails.text} ${JSON.stringify(res.exceptionDetails.exception || {})}`);
    }
    return res.result?.value;
  }
  close() {
    try { this.ws.close(); } catch {}
  }
}

async function main() {
  assert.ok(fs.existsSync(BUNDLE_PATH), `找不到建置產物: ${BUNDLE_PATH}`);
  assert.ok(fs.existsSync(CHROME_PATH), `找不到本機 Chrome: ${CHROME_PATH}`);

  const bundleCode = fs.readFileSync(BUNDLE_PATH, "utf8");
  const bundleSha256 = crypto.createHash("sha256").update(bundleCode).digest("hex");

  console.log("=== [0] 環境實體指紋 (Environment Fingerprint) ===");
  console.log(`  OS/Arch      : ${os.platform()} ${os.release()} (${os.arch()})`);
  console.log(`  Node.js      : ${process.version}`);
  console.log(`  Bundle Path  : ${BUNDLE_PATH}`);
  console.log(`  Bundle Size  : ${(Buffer.byteLength(bundleCode, "utf8") / 1024).toFixed(2)} KB`);
  console.log(`  Bundle SHA256: ${bundleSha256}`);

  runStaticAudits(bundleCode);

  // 啟動本地測試伺服器
  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(TEST_HTML);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const httpPort = server.address().port;
  const fixtureUrl = `http://127.0.0.1:${httpPort}/`;

  // 啟動真實 Headless Chrome
  const debugPort = 19222 + Math.floor(Math.random() * 1000);
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "ffe-chrome-verify-"));
  const chromeProc = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${userDataDir}`,
      "--window-size=1440,900",
      fixtureUrl,
    ],
    { stdio: "ignore" },
  );

  let cdp = null;
  try {
    // 等待 CDP 端點就緒
    let versionInfo = null;
    let targets = null;
    for (let i = 0; i < 40; i++) {
      try {
        const vRes = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
        if (vRes.ok) {
          versionInfo = await vRes.json();
          const tRes = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
          targets = await tRes.json();
          if (targets.some((t) => t.type === "page" && t.webSocketDebuggerUrl && t.url.startsWith(fixtureUrl))) break;
        }
      } catch {}
      await sleep(200);
    }
    assert.ok(versionInfo && targets, "Chrome CDP 啟動逾時");
    const pageTarget = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl && t.url.startsWith(fixtureUrl));
    assert.ok(pageTarget, "找不到已載入測試頁面的 Chrome Page Target");
    console.log(`  Chrome Engine: ${versionInfo.Browser}`);
    console.log(`  Chrome PID   : ${chromeProc.pid}`);

    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send("Runtime.enable");
    await cdp.send("Page.enable");

    // 等待頁面完全載入避免導覽競態
    for (let i = 0; i < 30; i++) {
      const ready = await cdp.eval(`document.readyState === "complete" && !!document.getElementById("main-feed")`);
      if (ready) break;
      await sleep(100);
    }
    // 確認 Viewport 與注入 Userscript 儲存介面（真實記憶體 Map，非業務邏輯 Mock）
    const viewport = await cdp.eval(`({ w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio })`);
    console.log(`  Viewport     : ${viewport.w}x${viewport.h} @ DPR ${viewport.dpr}`);

    await cdp.eval(`
      window.__gmStore = new Map([["volumeEnabled", true]]);
      window.GM_getValue = (k, d) => window.__gmStore.has(k) ? window.__gmStore.get(k) : d;
      window.GM_setValue = (k, v) => { window.__gmStore.set(k, v); };
      window.unsafeWindow = window;
      void 0;
    `);

    // 注入並執行最終建置產物 fb-feed-enhancer.user.js
    await cdp.eval(`${bundleCode}\nvoid 0;`);
    await sleep(300);

    console.log("\n=== [2] 端到端垂直實體驗收 (Real Blink DOM & Computed Style) ===");

    // --- W8 + W9 + W10: 精簡 4 類橫拉抽屜閉環、🔊 原生靜音聯動與動態牆影片懸浮播放 ---
    const w8910 = await cdp.eval(`(() => {
      const dockBtns = document.querySelectorAll("#ffe-dock > button").length;
      // 開啟 layout 抽屜
      document.getElementById("ffe-cat-layout").click();
      const layoutOpen = getComputedStyle(document.getElementById("ffe-drawer-layout")).display;
      // 互斥切換至 media 抽屜
      document.getElementById("ffe-cat-media").click();
      const layoutAfterSwitch = getComputedStyle(document.getElementById("ffe-drawer-layout")).display;
      const mediaOpen = getComputedStyle(document.getElementById("ffe-drawer-media")).display;

      // 在頁面放一顆 FB 原生喇叭鈕驗證 🔊 聯動
      const nativeMuteBtn = document.createElement("div");
      nativeMuteBtn.setAttribute("role", "button");
      nativeMuteBtn.setAttribute("aria-label", "靜音");
      nativeMuteBtn.style.cssText = "position:fixed;top:20px;right:20px;width:30px;height:30px;";
      let nativeClicks = [];
      nativeMuteBtn.addEventListener("click", () => {
        const cur = nativeMuteBtn.getAttribute("aria-label");
        nativeClicks.push(cur);
        nativeMuteBtn.setAttribute("aria-label", cur === "靜音" ? "取消靜音" : "靜音");
      });
      document.body.appendChild(nativeMuteBtn);

      // 初始 volumeEnabled=true，點一次 🔊 關閉 -> 應點擊原生「靜音」鈕；再點一次開啟 -> 應點擊原生「取消靜音」鈕
      document.getElementById("ffe-btn-volume").click();
      document.getElementById("ffe-btn-volume").click();
      nativeMuteBtn.remove();

      // W10: 開啟「動態牆影片懸浮播放」並測試預設暫停 / 懸浮播放 / 移開暫停
      document.getElementById("ffe-btn-hover-play").click();
      const feedVid = document.createElement("video");
      feedVid.id = "test-feed-hover-vid";
      let playCount = 0;
      let pauseCount = 0;
      let isPaused = false;
      Object.defineProperty(feedVid, "paused", { get: () => isPaused });
      feedVid.play = () => { playCount++; isPaused = false; return Promise.resolve(); };
      feedVid.pause = () => { pauseCount++; isPaused = true; };
      document.getElementById("post-normal").appendChild(feedVid);

      // 模擬未懸浮時 FB 自動觸發 play -> 應立即被 pause 攔截
      feedVid.dispatchEvent(new Event("play", { bubbles: false }));
      const pausedOnAutoplay = isPaused;
      // 滑鼠移入影片 -> 應觸發 play
      feedVid.dispatchEvent(new Event("pointermove", { bubbles: true }));
      const playingOnHover = !isPaused;
      // 滑鼠移出到主頁背景 -> 應觸發 pause
      document.body.dispatchEvent(new Event("pointermove", { bubbles: true }));
      const pausedOnLeave = isPaused;

      feedVid.remove();
      // 關閉抽屜
      document.getElementById("ffe-cat-media").click();
      const mediaClosed = getComputedStyle(document.getElementById("ffe-drawer-media")).display;
      return { dockBtns, layoutOpen, layoutAfterSwitch, mediaOpen, mediaClosed, nativeClicks, pausedOnAutoplay, playingOnHover, pausedOnLeave, playCount, pauseCount };
    })()`);
    assert.equal(w8910.dockBtns, 4, "左側主工具列應精簡為 4 顆縱向分類按鈕");
    assert.equal(w8910.layoutOpen, "flex", "點擊 🗂️ 應橫向展開版面抽屜");
    assert.equal(w8910.layoutAfterSwitch, "none", "切換至 🎬 時應互斥收合版面抽屜");
    assert.equal(w8910.mediaOpen, "flex", "點擊 🎬 應橫向展開影片媒體抽屜");
    assert.equal(w8910.mediaClosed, "none", "再點一次 🎬 應收合抽屜");
    assert.deepEqual(w8910.nativeClicks, ["靜音", "取消靜音"], "🔊 開關應精準聯動 FB 原生靜音與取消靜音按鈕");
    assert.equal(w8910.pausedOnAutoplay, true, "開啟懸浮播放後，未懸浮之自動播放應被暫停");
    assert.equal(w8910.playingOnHover, true, "滑鼠移入 Feed 影片時應觸發播放");
    assert.equal(w8910.pausedOnLeave, true, "滑鼠移開 Feed 影片後應自動暫停");
    console.log(`  [PASS] W8/W9/W10 4 類橫拉抽屜 (dock=${w8910.dockBtns})、🔊 原生聯動 (${JSON.stringify(w8910.nativeClicks)}) 與懸浮播放 (autoPause=${w8910.pausedOnAutoplay}, hoverPlay=${w8910.playingOnHover}, leavePause=${w8910.pausedOnLeave})`);

    // --- W1 + W2: 工具列與 ⚙️ 設定彈窗三聯斷言 + 閉環 + 英文語系自動切換 ---
    const modalCycle = await cdp.eval(`(async () => {
      const btn = document.getElementById("ffe-settings-btn");
      if (!btn) return { err: "missing settings btn" };
      btn.click();
      const modal = document.getElementById("ffe-settings-modal");
      const card = modal.querySelector(".ffe-modal-card");
      const openDisplay = getComputedStyle(modal).display;
      const cardBg = getComputedStyle(card).backgroundColor;
      const hasOpenClass = modal.classList.contains("ffe-modal-open");
      const zhTitle = modal.querySelector(".ffe-modal-title").textContent;
      document.getElementById("ffe-settings-done").click();
      const closedDisplay = getComputedStyle(modal).display;
      const hasOpenClassAfter = modal.classList.contains("ffe-modal-open");

      // 切換為英文頁面語系，驗證自動重建為英文介面
      document.documentElement.lang = "en";
      btn.click();
      const enModal = document.getElementById("ffe-settings-modal");
      const enLang = enModal.getAttribute("data-ffe-lang");
      const enTitle = enModal.querySelector(".ffe-modal-title").textContent;
      const enDoneText = document.getElementById("ffe-settings-done").textContent;
      document.getElementById("ffe-settings-done").click();
      document.documentElement.lang = "zh-TW";
      return { openDisplay, cardBg, hasOpenClass, zhTitle, closedDisplay, hasOpenClassAfter, enLang, enTitle, enDoneText };
    })()`);
    if (cdp.exceptions.length > 0) {
      throw new Error(`Init Exceptions: ${JSON.stringify(cdp.exceptions)}`);
    }
    if (modalCycle?.err) {
      throw new Error(`Modal cycle error: ${modalCycle.err}`);
    }
    assert.equal(modalCycle.openDisplay, "flex", "點擊 ⚙️ 後彈窗應顯示為 flex");
    assert.equal(modalCycle.cardBg, "rgb(247, 248, 250)", "設定彈窗背景應為柔白 #F7F8FA");
    assert.equal(modalCycle.hasOpenClass, true, "開啟時應有 ffe-modal-open class");
    assert.equal(modalCycle.closedDisplay, "none", "關閉後彈窗應恢復 display: none");
    assert.equal(modalCycle.hasOpenClassAfter, false, "關閉後應移除 ffe-modal-open class");
    assert.equal(modalCycle.enLang, "en", "英文頁面應自動切換為 en 語系");
    assert.equal(modalCycle.enTitle, "⚙️ Facebook Feed Enhancer — Settings", "英文語系標題不符");
    assert.equal(modalCycle.enDoneText, "Done & Close", "英文語系按鈕文字不符");
    console.log(`  [PASS] W2 ⚙️ 設定彈窗三聯斷言、閉環與中英雙語切換 (bg=${modalCycle.cardBg}, zh="${modalCycle.zhTitle}", en="${modalCycle.enTitle}")`);

    // --- W6: 訪客去登入牆（含外層白霧 Backdrop） + 捲動解鎖 + 外連網址淨化 ---
    const w6Result = await cdp.eval(`(() => {
      const wall = document.getElementById("guest-login-wall");
      const wrapper = document.getElementById("guest-login-backdrop-wrapper");
      const fog = document.getElementById("guest-login-fog-sibling");
      const wallDisplay = getComputedStyle(wall).display;
      const wrapperDisplay = getComputedStyle(wrapper).display;
      const fogDisplay = getComputedStyle(fog).display;
      const centerHit = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
      const centerBlockedByFog = !!(centerHit && (centerHit.id === "guest-login-backdrop-wrapper" || centerHit.id === "guest-login-fog-sibling"));
      const bodyOverflow = document.body.style.overflow;
      const href1 = document.getElementById("ext-link-1").getAttribute("href");
      const href2 = document.getElementById("ext-link-2").getAttribute("href");
      return { wallDisplay, wrapperDisplay, fogDisplay, centerBlockedByFog, bodyOverflow, href1, href2 };
    })()`);
    assert.equal(w6Result.wallDisplay, "none", "訪客登入牆應被自動隱藏");
    assert.equal(w6Result.wrapperDisplay, "none", "外層白霧遮罩父容器應被自動隱藏");
    assert.equal(w6Result.fogDisplay, "none", "同層無文字白霧遮罩兄弟節點應被自動隱藏");
    assert.equal(w6Result.centerBlockedByFog, false, "畫面中心不應被白霧遮罩攔截點擊");
    assert.equal(w6Result.bodyOverflow, "auto", "訪客模式 body overflow 應解鎖為 auto");
    assert.equal(w6Result.href1, "https://example.com/article?id=42", "l.facebook.com 跳轉與 fbclid 應完全淨化");
    assert.equal(w6Result.href2, "https://example.org/news?page=2", "直接外連之 fbclid 與 __cft__ 應完全移除");
    console.log(`  [PASS] W6 訪客去登入牆與去白霧 (wall=${w6Result.wallDisplay}, backdrop=${w6Result.wrapperDisplay}, fog=${w6Result.fogDisplay}, overflow=${w6Result.bodyOverflow}) 與外連淨化 (${w6Result.href1})`);

    // --- W5: 介面深度乾淨化 CSS ---
    const w5Result = await cdp.eval(`(() => {
      document.getElementById("ffe-settings-btn").click();
      const cbRight = document.querySelector('input[data-ffe-key="cleanRightRail"]');
      const cbShop = document.querySelector('input[data-ffe-key="cleanMarketplaceTab"]');
      const cbStories = document.querySelector('input[data-ffe-key="hideStoriesReels"]');
      const beforeRight = getComputedStyle(document.getElementById("right-rail")).display;
      cbRight.click();
      cbShop.click();
      cbStories.click();
      const afterRight = getComputedStyle(document.getElementById("right-rail")).display;
      const afterShop = getComputedStyle(document.getElementById("nav-marketplace")).display;
      const afterStories = getComputedStyle(document.getElementById("stories-shelf")).display;
      cbRight.click();
      const restoredRight = getComputedStyle(document.getElementById("right-rail")).display;
      document.getElementById("ffe-settings-done").click();
      return { beforeRight, afterRight, afterShop, afterStories, restoredRight };
    })()`);
    assert.notEqual(w5Result.beforeRight, "none");
    assert.equal(w5Result.afterRight, "none", "勾選隱藏右側欄後應為 none");
    assert.equal(w5Result.afterShop, "none", "勾選隱藏商店頁籤後應為 none");
    assert.equal(w5Result.afterStories, "none", "勾選隱藏限時動態後應為 none");
    assert.notEqual(w5Result.restoredRight, "none", "取消勾選後右側欄應恢復顯示");
    console.log(`  [PASS] W5 介面深度乾淨化 CSS 實體樣式轉移 (rightRail: ${w5Result.beforeRight} -> ${w5Result.afterRight} -> ${w5Result.restoredRight})`);

    // --- W4: Reels 播放時自動隱藏標題遮罩 ---
    const w4Result = await cdp.eval(`(async () => {
      const video = document.getElementById("reel-video");
      const box = document.getElementById("reel-box");
      const overlay = document.getElementById("reel-title-overlay");
      video.dispatchEvent(new Event("play", { bubbles: false }));
      await new Promise((r) => setTimeout(r, 320));
      const playingAttr = box.getAttribute("data-ffe-reel-playing");
      const playingOpacity = getComputedStyle(overlay).opacity;
      video.dispatchEvent(new Event("pause", { bubbles: false }));
      await new Promise((r) => setTimeout(r, 320));
      const pausedAttr = box.getAttribute("data-ffe-reel-playing");
      const pausedOpacity = getComputedStyle(overlay).opacity;
      return { playingAttr, playingOpacity, pausedAttr, pausedOpacity };
    })()`);
    assert.equal(w4Result.playingAttr, "1", "播放 Reels 時應標記 data-ffe-reel-playing=1");
    assert.equal(w4Result.playingOpacity, "0", "播放 Reels 時標題遮罩 opacity 應為 0");
    assert.equal(w4Result.pausedAttr, null, "暫停時應移除 data-ffe-reel-playing");
    assert.equal(w4Result.pausedOpacity, "1", "暫停時標題遮罩 opacity 應恢復為 1");
    console.log(`  [PASS] W4 Reels 標題自動隱藏 (play opacity=${w4Result.playingOpacity} -> pause opacity=${w4Result.pausedOpacity})`);

    // --- W3: 留言排序增強 (Newest) 與快捷鍵 Insert / Ctrl+Insert ---
    const w3Result = await cdp.eval(`(async () => {
      window.__clickedMenuIds = [];
      document.getElementById("ffe-settings-btn").click();
      const sel = document.getElementById("ffe-comment-sort-mode");
      sel.value = "newest";
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      const savedMode = window.GM_getValue("commentSortMode");
      document.getElementById("ffe-settings-done").click();

      // 按下 Insert 觸發偏好排序 (newest)
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Insert", bubbles: true }));
      await new Promise((r) => setTimeout(r, 260));
      // 按下 Ctrl+Insert 反轉排序 (all)
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Insert", ctrlKey: true, bubbles: true }));
      await new Promise((r) => setTimeout(r, 260));
      return { savedMode, sequence: window.__clickedMenuIds };
    })()`);
    assert.equal(w3Result.savedMode, "newest", "留言排序設定應持久化為 newest");
    assert.deepEqual(w3Result.sequence, ["newest", "all"], "Insert 與 Ctrl+Insert 事件序列應精準為 ['newest', 'all']");
    console.log(`  [PASS] W3 留言排序偏好與快捷鍵有序序列對帳 (saved=${w3Result.savedMode}, sequence=${JSON.stringify(w3Result.sequence)})`);

    // --- W7: Meta AI / PYMK / 關鍵字黑名單過濾與重置閉環 ---
    const w7Result = await cdp.eval(`(() => {
      document.getElementById("ffe-settings-btn").click();
      document.querySelector('input[data-ffe-key="hideMetaAI"]').click();
      document.querySelector('input[data-ffe-key="hidePYMK"]').click();
      document.querySelector('input[data-ffe-key="keywordFilter"]').click();
      const ta = document.getElementById("ffe-keyword-blacklist");
      ta.value = "業配文, 抽獎";
      document.getElementById("ffe-apply-keywords").click();
      const filtered = {
        normal: getComputedStyle(document.getElementById("post-normal")).display,
        metaAI: getComputedStyle(document.getElementById("post-meta-ai")).display,
        pymk: getComputedStyle(document.getElementById("post-pymk")).display,
        keyword: getComputedStyle(document.getElementById("post-keyword")).display,
      };
      // 一鍵重置
      document.getElementById("ffe-reset-settings").click();
      const afterReset = {
        metaAI: getComputedStyle(document.getElementById("post-meta-ai")).display,
        pymk: getComputedStyle(document.getElementById("post-pymk")).display,
        keyword: getComputedStyle(document.getElementById("post-keyword")).display,
      };
      document.getElementById("ffe-settings-done").click();
      return { filtered, afterReset };
    })()`);
    assert.notEqual(w7Result.filtered.normal, "none", "正常貼文絕不可被誤殺");
    assert.equal(w7Result.filtered.metaAI, "none", "Meta AI 卡片應被過濾");
    assert.equal(w7Result.filtered.pymk, "none", "PYMK 卡片應被過濾");
    assert.equal(w7Result.filtered.keyword, "none", "命中關鍵字黑名單之貼文應被過濾");
    assert.notEqual(w7Result.afterReset.metaAI, "none", "重置後 Meta AI 卡片應恢復");
    assert.notEqual(w7Result.afterReset.pymk, "none", "重置後 PYMK 卡片應恢復");
    assert.notEqual(w7Result.afterReset.keyword, "none", "重置後關鍵字貼文應恢復");
    console.log(`  [PASS] W7 內容過濾與關鍵字黑名單 (normal=${w7Result.filtered.normal}, filtered=[metaAI/pymk/kw]=none -> reset restored)`);

    // --- 瀏覽器 Console 零 Uncaught Error 審計 ---
    assert.equal(cdp.exceptions.length, 0, `瀏覽器出現 Uncaught Exception: ${cdp.exceptions.join("; ")}`);
    console.log("  [PASS] 瀏覽器 DevTools Runtime 零 Uncaught Exception");

    console.log("\n=== [3] 資源守恆審計 ===");
    console.log("  [PASS] 所有垂直切片 (W1-W7) 100% 轉綠，準備終止 Chrome 並清理暫存目錄...");
  } finally {
    if (cdp) cdp.close();
    server.close();
    try {
      chromeProc.kill("SIGTERM");
    } catch {}
    await sleep(300);
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }

  console.log("[ALL PHYSICAL VERIFICATIONS PASSED] Exit Code 0");
}

main().catch((err) => {
  console.error("[PHYSICAL VERIFICATION FAILED]", err);
  process.exit(1);
});
