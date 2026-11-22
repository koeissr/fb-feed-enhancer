#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const OUT_FILE = path.join(ROOT, "fb-feed-enhancer.user.js");

const MODULE_ORDER = [
  "core/config.js",
  "core/state.js",
  "core/dom_utils.js",
  "modules/scroll_recovery.js",
  "modules/ui_cleaner.js",
  "modules/login_wall.js",
  "modules/link_sanitizer.js",
  "modules/reels_title_hide.js",
  "modules/hover_video.js",
  "modules/media_controls.js",
  "modules/content_filter.js",
  "modules/comments_control.js",
  "modules/feed_engine.js",
  "modules/styles_layout.js",
  "ui/settings_modal.js",
  "ui/control_panel.js",
  "main.js",
];

function build() {
  const metaPath = path.join(SRC, "meta.js");
  if (!fs.existsSync(metaPath)) {
    throw new Error(`Missing metadata file: ${metaPath}`);
  }
  const meta = fs.readFileSync(metaPath, "utf8").trimEnd();

  const chunks = [];
  for (const rel of MODULE_ORDER) {
    const abs = path.join(SRC, rel);
    if (!fs.existsSync(abs)) {
      throw new Error(`Missing module file: ${abs}`);
    }
    const content = fs.readFileSync(abs, "utf8").replace(/\r\n/g, "\n").trimEnd();
    chunks.push(`  /* === MODULE: src/${rel} === */\n${content}`);
  }

  const output = `${meta}\n(function () {\n  "use strict";\n\n${chunks.join("\n\n")}\n})();\n`;

  // AST / 語法編譯驗證門禁（零外部相依）
  new vm.Script(output, { filename: "fb-feed-enhancer.user.js" });

  fs.writeFileSync(OUT_FILE, output, "utf8");
  const lines = output.split("\n").length;
  const kb = (Buffer.byteLength(output, "utf8") / 1024).toFixed(2);
  console.log(`[BUILD OK] ${OUT_FILE}`);
  console.log(`           Modules: ${MODULE_ORDER.length} | Lines: ${lines} | Size: ${kb} KB`);
}

try {
  build();
} catch (err) {
  console.error("[BUILD FAILED]", err);
  process.exit(1);
}
