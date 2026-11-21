  function initStyleTag() {
    if (state.styleInjected) return;
    const style = document.createElement("style");
    style.id = "fb-worker-wisdom-multicolumn";
    style.textContent = "";
    (document.head || document.documentElement).appendChild(style);
    resources.styleTag = style;
    const ui = document.createElement("style");
    ui.id = "fb-worker-wisdom-ui";
    ui.textContent = [
      ".ww-rail{scrollbar-width:thin;scrollbar-color:#6B8E9F #EAEBED}",
      ".ww-rail::-webkit-scrollbar{width:6px}",
      ".ww-rail::-webkit-scrollbar-track{background:#EAEBED;border-radius:3px}",
      ".ww-rail::-webkit-scrollbar-thumb{background:#6B8E9F;border-radius:3px}",
      ".ww-rail::-webkit-scrollbar-thumb:hover{background:#5A7C8D}",
      ".ffe-modal-backdrop{position:fixed;inset:0;z-index:10050;background:rgba(234,235,237,0.74);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans TC',sans-serif}",
      ".ffe-modal-card{width:100%;max-width:560px;max-height:86vh;background:#F7F8FA;color:#2D3748;border:1px solid #E2E8F0;border-radius:14px;box-shadow:0 14px 36px rgba(45,55,72,0.14);display:flex;flex-direction:column;overflow:hidden}",
      ".ffe-modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:#FFFFFF;border-bottom:1px solid #E2E8F0}",
      ".ffe-modal-title{margin:0;font-size:16px;font-weight:700;color:#2D3748}",
      ".ffe-modal-subtitle{margin-top:3px;font-size:12px;color:#718096}",
      ".ffe-btn-icon{background:#F2F4F7;color:#2D3748;border:1px solid #E2E8F0;border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center}",
      ".ffe-btn-icon:hover{background:#E2E8F0}",
      ".ffe-modal-body{padding:16px 20px;overflow-y:auto;display:flex;flex-direction:column;gap:14px}",
      ".ffe-section{background:#FFFFFF;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:10px}",
      ".ffe-section-title{font-size:13px;font-weight:700;color:#6B8E9F;border-bottom:1px solid #F2F4F7;padding-bottom:6px}",
      ".ffe-setting-row{display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer}",
      ".ffe-setting-info{display:flex;flex-direction:column;gap:2px;flex:1}",
      ".ffe-setting-label{font-size:13px;font-weight:600;color:#2D3748}",
      ".ffe-setting-desc{font-size:11.5px;color:#718096;line-height:1.4}",
      ".ffe-checkbox{width:18px;height:18px;accent-color:#7D9D8B;cursor:pointer;flex:0 0 auto}",
      ".ffe-select{background:#F7F8FA;color:#2D3748;border:1px solid #CBD5E0;border-radius:6px;padding:6px 10px;font-size:12.5px;font-weight:600;cursor:pointer}",
      ".ffe-textarea{width:100%;box-sizing:border-box;background:#F7F8FA;color:#2D3748;border:1px solid #CBD5E0;border-radius:8px;padding:8px 10px;font-size:12.5px;resize:vertical;font-family:inherit}",
      ".ffe-inline-actions{display:flex;align-items:center;justify-content:space-between;gap:10px}",
      ".ffe-status-badge{font-size:12px;color:#718096;background:#F2F4F7;padding:4px 8px;border-radius:6px}",
      ".ffe-modal-footer{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#FFFFFF;border-top:1px solid #E2E8F0}",
      ".ffe-btn-primary{background:#6B8E9F;color:#FFFFFF;border:none;border-radius:8px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer}",
      ".ffe-btn-primary:hover{background:#5A7C8D}",
      ".ffe-btn-secondary{background:#F2F4F7;color:#2D3748;border:1px solid #CBD5E0;border-radius:8px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer}",
      ".ffe-btn-secondary:hover{background:#E2E8F0}",
    ].join("");
    (document.head || document.documentElement).appendChild(ui);
    resources.uiStyleTag = ui;
    state.styleInjected = true;
  }
  function generateMultiColumnCSS() {
    const sidebarActiveCSS =
      ".xxzkxad.x9e5oc1,.xh78kpn.xcoz2nd.x2bj2ny,.x1vjfegm.x2lah0s.xeuugli{max-width:var(--sidebar-width);min-width:var(--sidebar-width);position:absolute;z-index:1}" +
      ".x1v0nzow.x1ceravr.x17zi3g0.xvue9z.x193iq5w,.x1xwk8fm.x193iq5w,.xsfy40s.x1miatn0.x9f619{width:calc(110% - var(--sidebar-width));margin-right:-60px}";
    const sidebarInactiveCSS =
      ".xxzkxad.x9e5oc1,.xh78kpn.xcoz2nd.x2bj2ny,.x1vjfegm.x2lah0s.xeuugli{max-width:none;min-width:0;position:static;z-index:auto}" +
      ".x1v0nzow.x1ceravr.x17zi3g0.xvue9z.x193iq5w,.x1xwk8fm.x193iq5w,.xsfy40s.x1miatn0.x9f619{width:auto;margin-right:0}";
    const sidebarCSS = state.buttons.sidebar ? sidebarActiveCSS : sidebarInactiveCSS;
    const heightVal = state.buttons.height ? state.settings.maxHeight : CONFIG.DEFAULT_MAX_HEIGHT;
    const ew = state.settings.expandWidth;
    const em = (100 - ew) / 2;
    const expandWidthCSS = state.buttons.expandWidth
      ? `.x1qjc9v5.x71s49j.x1a2a7pz{width:${ew}%;max-width:none;margin:0 ${em}%;flex:0 0 auto}`
      : "";
    const root = `:root{--column-count:${state.settings.columns};--column-gap:${CONFIG.COLUMN_GAP}px;--max-post-height:${heightVal}vh;--sidebar-width:60px}`;
    const pageSmoothCSS = CONFIG.PAGE_SMOOTH_ENABLED ? ":root{scroll-behavior:smooth}" : "";
    const containerMaxWidth =
      ".xornbnt.x1t2pt76.xylbxtu.x1q0g3np.xozqiw3.x1cy8zhl.x1qughib.xeuugli.xs83m0k.x1iyjqo2.x1r8uery.x1n2onr6.x78zum5.x1ja2u2z.x9f619," +
      ".x1t2pt76.x78zum5.xs83m0k.x1iyjqo2.x1r8uery.xeuugli.x193iq5w.xdt5ytf.x1ja2u2z.x1n2onr6.x9f619{max-width:100%}";
    const flexContainer =
      ".x6o7n8i.x1unhpq9.x1hc1fzr>div>div,.x1xwk8fm.x193iq5w{display:flex;flex-wrap:wrap;gap:var(--column-gap);justify-content:flex-start;align-content:flex-start;overflow-anchor:auto}";
    const flexItem = `${CONFIG.FLEX_ITEM_SELECTOR}{width:calc((100% - (var(--column-gap)*(var(--column-count) - 1)))/var(--column-count));max-height:var(--max-post-height);overflow-y:auto;overflow-x:hidden;overflow-anchor:auto;scrollbar-width:thin;scrollbar-color:#1877f2 rgba(120,130,150,.25)}`;
    const hideElements =
      ".x1daaz14.x1t2pt76,.xwib8y2.x1y1aw1k.xwya9rg,.xq1tmr.xvue9z>.x1yztbdb,footer{display:none}";
    return root + pageSmoothCSS + sidebarCSS + containerMaxWidth + flexContainer + flexItem + expandWidthCSS + hideElements;
  }
  function applyMultiColumnCSS() {
    initStyleTag();
    if (state.isActivePage && state.buttons.columns) {
      resources.styleTag.disabled = false;
      const css = generateMultiColumnCSS();
      if (resources.styleTag.textContent !== css) resources.styleTag.textContent = css;
    } else {
      resources.styleTag.disabled = true;
    }
    invalidateRects();
  }
