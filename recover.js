const fs = require('fs');

const contentLines = fs.readFileSync('old-content.js', 'utf8').split('\n');

function extractLines(startStr, nextFuncStr) {
  let startIdx = contentLines.findIndex(line => line.includes(startStr));
  let endIdx = contentLines.findIndex((line, i) => i > startIdx && line.includes(nextFuncStr));
  if (endIdx === -1) endIdx = contentLines.length;
  const fnCode = contentLines.slice(startIdx, endIdx).join('\n');
  return fnCode.replace(/^(async\s+)?function\s+/, 'export $1function ');
}

// 1. hud.js additions
const hudAdditions = 
  extractLines('function setupSidebarEvents() {', 'function setupTechStack() {') + '\n\n' +
  extractLines('function loadPersistentSettings() {', 'chrome.runtime.onMessage.addListener');
fs.appendFileSync('src/ui/hud.js', '\n\n' + hudAdditions);

// 2. premium lock
const lockCode = extractLines('function showPremiumLockedDrawer(title) {', 'function setupExtractImages() {');
fs.appendFileSync('src/ui/drawer.js', '\n\n' + lockCode);

// 3. New Feature files
function writeFeature(path, imports, fnName, nextFnName) {
  let out = imports.join('\n') + '\n\n';
  out += extractLines('function ' + fnName + '(', 'function ' + nextFnName + '(');
  fs.writeFileSync(path, out);
}

writeFeature('src/features/tech-stack.js', [
  "import { state } from '../state.js';",
  "import { openDrawer } from '../ui/drawer.js';"
], 'setupTechStack', 'setupSeoMeta');

writeFeature('src/features/seo-meta.js', [
  "import { state } from '../state.js';",
  "import { openDrawer } from '../ui/drawer.js';"
], 'setupSeoMeta', 'setupA11yAudit');

writeFeature('src/features/a11y-audit.js', [
  "import { state } from '../state.js';",
  "import { openDrawer } from '../ui/drawer.js';"
], 'setupA11yAudit', 'setupCSSInspector');

writeFeature('src/features/page-outliner.js', [
  "import { state } from '../state.js';",
  "import { openDrawer } from '../ui/drawer.js';"
], 'setupPageOutliner', 'setupImageReplacer');

writeFeature('src/features/image-replacer.js', [
  "import { state } from '../state.js';",
  "import { openDrawer } from '../ui/drawer.js';"
], 'setupImageReplacer', 'setupTakeScreenshot');

writeFeature('src/features/list-fonts.js', [
  "import { state } from '../state.js';",
  "import { openDrawer } from '../ui/drawer.js';"
], 'setupListFonts', 'setupColorPalette');

writeFeature('src/features/color-palette.js', [
  "import { state } from '../state.js';",
  "import { openDrawer } from '../ui/drawer.js';"
], 'setupColorPalette', 'setupExtractImages');

console.log('Recovery complete!');
